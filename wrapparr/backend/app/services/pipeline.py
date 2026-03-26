import logging
from dataclasses import asdict
from datetime import datetime, timezone
from typing import Any

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.collectors.audiobookshelf import AudiobookshelfCollector
from app.collectors.booklore import BookloreCollector
from app.collectors.jellyfin import JellyfinCollector
from app.collectors.komga import KomgaCollector
from app.collectors.romm import ROMMCollector
from app.collectors.tautulli import TautulliCollector
from app.core.encryption import decrypt
from app.models.mapping import UserServiceMapping
from app.models.recap import HistorySnapshot, YearlyRecap
from app.models.service import ServiceConnector

logger = logging.getLogger("wrapparr.pipeline")

COLLECTOR_MAP = {
    "tautulli": TautulliCollector,
    "jellyfin": JellyfinCollector,
    "romm": ROMMCollector,
    "audiobookshelf": AudiobookshelfCollector,
    "komga": KomgaCollector,
    "booklore": BookloreCollector,
}


class RecapPipeline:
    def __init__(self, db: AsyncSession, progress_callback=None):
        self.db = db
        self.progress_callback = progress_callback

    async def _update_progress(self, recap: YearlyRecap, status: str, progress: int, msg: str):
        recap.status = status
        recap.progress = progress
        recap.progress_msg = msg
        await self.db.commit()
        if self.progress_callback:
            await self.progress_callback(str(recap.id), status, progress, msg)

    async def run(self, user_id, year: int) -> YearlyRecap:
        from app.models.user import User

        # Get or create recap (one per year, owned by admin who triggers it)
        result = await self.db.execute(
            select(YearlyRecap).where(YearlyRecap.year == year)
        )
        recap = result.scalar_one_or_none()
        if recap:
            recap.data = None
            recap.error_message = None
            recap.progress = 0
            recap.progress_msg = None
            recap.completed_at = None
            old_snap = await self.db.execute(
                select(HistorySnapshot).where(HistorySnapshot.recap_id == recap.id)
            )
            old = old_snap.scalar_one_or_none()
            if old:
                await self.db.delete(old)
            await self.db.flush()
        else:
            recap = YearlyRecap(user_id=user_id, year=year)
            self.db.add(recap)
            await self.db.flush()

        recap.started_at = datetime.now(timezone.utc)
        recap.error_message = None

        try:
            # Get all users that have at least one mapping
            all_users_result = await self.db.execute(select(User).where(User.is_active.is_(True)))
            all_users = all_users_result.scalars().all()

            # Filter to only users with mappings
            all_mappings_result = await self.db.execute(select(UserServiceMapping))
            mapped_user_ids = {str(m.user_id) for m in all_mappings_result.scalars().all()}
            users_to_collect = [u for u in all_users if str(u.id) in mapped_user_ids]

            if not users_to_collect:
                logger.warning("No users with mappings found — collecting for admin only")
                users_to_collect = [u for u in all_users if str(u.id) == str(user_id)]

            # Step 1: Collect data for each mapped user
            await self._update_progress(recap, "collecting", 10, "Collecte des données en cours...")

            users_data = {}
            for i, u in enumerate(users_to_collect):
                pct = 10 + int((i / max(1, len(users_to_collect))) * 30)
                await self._update_progress(recap, "collecting", pct, f"Collecte pour {u.display_name or u.email}...")
                try:
                    collected = await self._collect(u.id, year)
                    if collected:
                        processed = self._process(collected)
                        users_data[str(u.id)] = {
                            "name": u.display_name or u.email,
                            **processed,
                        }
                except Exception as e:
                    logger.warning("Collecte echouee pour %s: %s", u.display_name, e)

            # Step 2: Build global recap with all users' data
            await self._update_progress(recap, "processing", 50, "Calcul des statistiques...")

            # Previous year data for comparison
            prev_year_data = None
            prev_recap = await self.db.execute(
                select(YearlyRecap).where(YearlyRecap.year == year - 1, YearlyRecap.status == "completed")
            )
            prev = prev_recap.scalar_one_or_none()
            if prev and prev.data:
                prev_year_data = prev.data

            # Build final data structure: { global, users: { uid: {...} } }
            # The "default" user data (for admin / single-user display) is the admin's
            admin_uid = str(user_id)
            admin_data = users_data.get(admin_uid, next(iter(users_data.values()), {}))

            # Merge admin data at root level for backward compatibility
            recap_data = {k: v for k, v in admin_data.items() if k != "name"}
            recap_data["users"] = users_data

            # Add per-user comparison + root comparison if previous year exists
            if prev_year_data:
                prev_users = prev_year_data.get("users", {})
                root_comparison = {}
                for uid, udata in users_data.items():
                    prev_udata = prev_users.get(uid, prev_year_data if uid == admin_uid else {})
                    if prev_udata:
                        comparison = {}
                        for svc_key in [k for k in udata if k not in ("global", "comparison", "users", "name")]:
                            svc_cur = udata.get(svc_key, {})
                            svc_prev = prev_udata.get(svc_key, {})
                            if svc_cur and svc_prev:
                                comparison[svc_key] = self._build_year_comparison(svc_cur, svc_prev)
                        if comparison:
                            users_data[uid]["comparison"] = comparison
                            # Merge into root comparison (use admin's or first user's)
                            if uid == admin_uid or not root_comparison:
                                root_comparison.update(comparison)
                if root_comparison:
                    # Aggregate community top films/series for both years
                    for svc_key in root_comparison:
                        if svc_key in ("global",):
                            continue
                        root_comparison[svc_key]["top_films"] = self._aggregate_community_top(
                            users_data, prev_users, prev_year_data, admin_uid, svc_key, "films"
                        )
                        root_comparison[svc_key]["top_series"] = self._aggregate_community_top(
                            users_data, prev_users, prev_year_data, admin_uid, svc_key, "series"
                        )
                    recap_data["comparison"] = root_comparison

            # Step 3: Posters
            await self._update_progress(recap, "fetching_posters", 70, "Recuperation des affiches...")

            recap.data = recap_data
            recap.status = "completed"
            recap.progress = 100
            recap.progress_msg = "Recap terminé"
            recap.completed_at = datetime.now(timezone.utc)

            # Create immutable snapshot
            snapshot = HistorySnapshot(
                recap_id=recap.id,
                user_id=user_id,
                year=year,
                recap_data=processed,
                slide_config={},  # Will be populated once SlideConfig exists
                theme_pack={},    # Will be populated once ThemePack is selected
            )
            self.db.add(snapshot)
            await self.db.commit()

            await self._update_progress(recap, "completed", 100, "Recap terminé")
            logger.info("Recap %d terminé pour user %s", year, user_id)

        except Exception as e:
            logger.exception("Erreur pipeline pour user %s, année %d", user_id, year)
            recap.status = "failed"
            recap.error_message = str(e)
            recap.progress_msg = f"Erreur: {e}"
            await self.db.commit()
            if self.progress_callback:
                await self.progress_callback(str(recap.id), "failed", recap.progress, str(e))

        return recap

    async def _collect(self, user_id, year: int) -> dict[str, Any]:
        # Get all service connectors
        result = await self.db.execute(
            select(ServiceConnector).where(ServiceConnector.is_active.is_(True))
        )
        services = result.scalars().all()

        # Get user mappings
        result = await self.db.execute(
            select(UserServiceMapping).where(UserServiceMapping.user_id == user_id)
        )
        mappings = {m.service_type: m.service_username for m in result.scalars().all()}

        # Extract TMDB API key if configured as a service
        tmdb_key = None
        for svc in services:
            if svc.service_type == "tmdb":
                tmdb_key = decrypt(svc.api_key_enc)
                break

        collected = {}

        for svc in services:
            # Skip TMDB — it's not a data collector, just a key provider
            if svc.service_type == "tmdb":
                continue
            cls = COLLECTOR_MAP.get(svc.service_type)
            if not cls:
                continue
            service_username = mappings.get(svc.service_type)
            collector = cls(base_url=svc.base_url, api_key=decrypt(svc.api_key_enc))
            collector.target_user = service_username
            collector.tmdb_api_key = tmdb_key  # Pass TMDB key to all collectors
            try:
                data = await collector.run(year)
                collected[svc.service_type] = asdict(data)
                logger.info("Collecte %s OK (user=%s)", svc.service_type, service_username or "all")
            except Exception:
                logger.exception("Collecte %s échouée — service ignoré", svc.service_type)
            finally:
                await collector.close()

        return collected

    def _process(self, collected: dict[str, Any], prev_year_data: dict | None = None, other_users: list[dict] | None = None) -> dict[str, Any]:
        # Aggregate all service data into the recap structure
        recap_data = {}
        for service_type, data in collected.items():
            recap_data[service_type] = data

        # Compute global stats
        total_hours = sum(d.get("total_hours", 0) for d in collected.values())
        total_items = sum(d.get("total_items", 0) for d in collected.values())
        recap_data["global"] = {
            "total_hours": round(total_hours, 1),
            "total_items": total_items,
            "services_count": len(collected),
        }

        # ── Build per-service comparison data ──
        comparison = {}
        for service_type, data in collected.items():
            comp = {}

            # Year vs year
            if prev_year_data:
                prev_svc = prev_year_data.get(service_type)
                if prev_svc:
                    comp["year_vs_year"] = self._build_year_comparison(data, prev_svc)

            # User vs users
            if other_users:
                others_svc = []
                for ou in other_users:
                    ou_svc = ou.get("data", {}).get(service_type)
                    if ou_svc:
                        others_svc.append({"name": ou.get("name", "?"), **self._extract_user_metrics(ou_svc)})
                if others_svc:
                    comp["user_vs_users"] = {
                        "me": self._extract_user_metrics(data),
                        "others": others_svc,
                    }

            if comp:
                comparison[service_type] = comp

        # Global comparison
        if prev_year_data:
            prev_global = prev_year_data.get("global", {})
            cur_global = recap_data["global"]
            comparison["global"] = {
                "year_vs_year": {
                    "total_items": {"current": cur_global.get("total_items", 0), "previous": prev_global.get("total_items", 0)},
                    "total_hours": {"current": cur_global.get("total_hours", 0), "previous": prev_global.get("total_hours", 0)},
                },
            }

        if comparison:
            recap_data["comparison"] = comparison

        return recap_data

    @staticmethod
    def _build_year_comparison(current: dict, previous: dict) -> dict:
        """Build year-vs-year comparison metrics for a service."""
        cur_extra = current.get("extra", {})
        prev_extra = previous.get("extra", {})

        comp = {
            "total_items": {"current": current.get("total_items", 0), "previous": previous.get("total_items", 0)},
            "total_hours": {"current": current.get("total_hours", 0), "previous": previous.get("total_hours", 0)},
        }

        # Genres comparison
        cur_genres = {g["n"]: g["v"] for g in current.get("genres", [])}
        prev_genres = {g["n"]: g["v"] for g in previous.get("genres", [])}
        all_genre_names = sorted(set(list(cur_genres.keys()) + list(prev_genres.keys())), key=lambda n: -(cur_genres.get(n, 0) + prev_genres.get(n, 0)))
        comp["genres"] = [{"n": n, "current": cur_genres.get(n, 0), "previous": prev_genres.get(n, 0)} for n in all_genre_names[:8]]

        # Monthly comparison
        cur_monthly = current.get("monthly", [])
        prev_monthly = previous.get("monthly", [])
        if cur_monthly and prev_monthly:
            comp["monthly"] = []
            for i in range(min(len(cur_monthly), len(prev_monthly))):
                comp["monthly"].append({
                    "m": cur_monthly[i].get("m", ""),
                    "current": cur_monthly[i].get("v", 0),
                    "previous": prev_monthly[i].get("v", 0),
                })

        # Films/series specific (count + per-media monthly, genres, hours)
        for mtype in ("films", "series"):
            cur_m = cur_extra.get(mtype, {})
            prev_m = prev_extra.get(mtype, {})
            if not cur_m:
                continue
            count_key = "total" if mtype == "films" else "episodes"
            entry = {
                "current": cur_m.get(count_key, 0),
                "previous": prev_m.get(count_key, 0),
            }
            # Per-media hours
            entry["hours"] = {
                "current": cur_m.get("hours", 0),
                "previous": prev_m.get("hours", 0),
            }
            # Per-media monthly
            cm = cur_m.get("monthly", [])
            pm = prev_m.get("monthly", [])
            if cm and pm:
                entry["monthly"] = []
                for i in range(min(len(cm), len(pm))):
                    entry["monthly"].append({
                        "m": cm[i].get("m", ""),
                        "current": cm[i].get("v", 0),
                        "previous": pm[i].get("v", 0),
                    })
            # Per-media genres
            cur_g_list = cur_m.get("genres", current.get("genres", []))
            prev_g_list = prev_m.get("genres", previous.get("genres", []))
            cur_g = {g["n"]: g["v"] for g in cur_g_list}
            prev_g = {g["n"]: g["v"] for g in prev_g_list}
            all_g = sorted(
                set(list(cur_g.keys()) + list(prev_g.keys())),
                key=lambda n: -(cur_g.get(n, 0) + prev_g.get(n, 0)),
            )
            entry["genres"] = [
                {"n": n, "current": cur_g.get(n, 0), "previous": prev_g.get(n, 0)}
                for n in all_g[:8]
            ]
            comp[mtype] = entry

        return comp

    @staticmethod
    def _aggregate_community_top(
        users_data: dict, prev_users: dict, prev_year_data: dict,
        admin_uid: str, svc_key: str, media_type: str,
    ) -> dict:
        """Aggregate top films/series across all users for current and previous year.

        Returns {
            "current": {"by_views": [...top3], "by_users": [...top3]},
            "previous": {"by_views": [...top3], "by_users": [...top3]},
        }
        """
        def _collect(all_users_data: dict, svc: str, mtype: str) -> dict:
            """Collect items across users, return {by_views: [...], by_users: [...]}."""
            item_map: dict[str, dict] = {}
            extra_key = "films" if mtype == "films" else "series"
            for uid, udata in all_users_data.items():
                svc_data = udata.get(svc, {})
                extra = svc_data.get("extra", {}).get(extra_key, {})
                top = extra.get("top", [])
                if not top and mtype == "films":
                    top = svc_data.get("top", [])
                for item in top:
                    key = (item.get("t") or "").lower().strip()
                    if not key:
                        continue
                    if key not in item_map:
                        item_map[key] = {
                            "t": item.get("t", ""),
                            "thumb": item.get("thumb", ""),
                            "y": item.get("y", 0),
                            "total_views": 0,
                            "users": set(),
                        }
                    views = item.get("ep") or item.get("plays") or item.get("v") or 1
                    item_map[key]["total_views"] += views
                    item_map[key]["users"].add(uid)
                    if not item_map[key]["thumb"] and item.get("thumb"):
                        item_map[key]["thumb"] = item["thumb"]

            items = list(item_map.values())
            for it in items:
                it["user_count"] = len(it["users"])
                del it["users"]

            by_views = sorted(items, key=lambda x: -x["total_views"])[:3]
            by_users = sorted(items, key=lambda x: (-x["user_count"], -x["total_views"]))[:3]
            return {"by_views": by_views, "by_users": by_users}

        current = _collect(users_data, svc_key, media_type)

        # Previous year: try per-user data first, fallback to root-level
        prev_all = prev_users if prev_users else {}
        if not prev_all and prev_year_data:
            prev_all = {admin_uid: prev_year_data}
        previous = _collect(prev_all, svc_key, media_type)

        return {"current": current, "previous": previous}

    @staticmethod
    def _extract_user_metrics(svc_data: dict) -> dict:
        """Extract summary metrics from a service data block for user comparison."""
        top_genre = ""
        genres = svc_data.get("genres", [])
        if genres:
            top_genre = genres[0].get("n", "")
        return {
            "total_items": svc_data.get("total_items", 0),
            "total_hours": round(svc_data.get("total_hours", 0), 1),
            "top_genre": top_genre,
        }
