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

            logger.info("Users to collect: %s", [(u.display_name, str(u.id)) for u in users_to_collect])
            users_data = {}
            for i, u in enumerate(users_to_collect):
                pct = 10 + int((i / max(1, len(users_to_collect))) * 30)
                await self._update_progress(recap, "collecting", pct, f"Collecte pour {u.display_name or u.email}...")
                try:
                    collected = await self._collect(u.id, year)
                    logger.info("Collected for %s: %s services (%s)", u.display_name, len(collected) if collected else 0, list(collected.keys()) if collected else [])
                    if collected:
                        processed = self._process(collected)
                        users_data[str(u.id)] = {
                            "name": u.display_name or u.email,
                            **processed,
                        }
                except Exception as e:
                    import traceback
                    logger.error("Collecte echouee pour %s: %s\n%s", u.display_name, e, traceback.format_exc())

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

            # Step 3: Server ranking — cumulative across all years up to current
            await self._update_progress(recap, "processing", 65, "Calcul du classement serveur...")
            try:
                server_ranking = await self._build_server_ranking(year, users_data)
                recap_data["server_ranking"] = server_ranking
            except Exception as e:
                logger.warning("Server ranking failed: %s", e)

            # Step 4: Posters
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
                recap_data=recap_data,
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

    async def _build_server_ranking(self, current_year: int, current_users_data: dict) -> dict:
        """Build cumulative server ranking across all years up to current_year."""
        from app.models.recap import YearlyRecap

        # Get all completed recaps up to current year (excluding current which is in progress)
        result = await self.db.execute(
            select(YearlyRecap).where(
                YearlyRecap.status == "completed",
                YearlyRecap.year < current_year,
            )
        )
        past_recaps = result.scalars().all()

        # Accumulate per user: {uid: {name, views, hours}}
        cumulative = {}

        # Add past years
        for recap in past_recaps:
            if not recap.data or "users" not in recap.data:
                continue
            for uid, udata in recap.data["users"].items():
                if uid not in cumulative:
                    cumulative[uid] = {"name": udata.get("name", uid), "views": 0, "hours": 0}
                svc = udata.get("tautulli") or udata.get("plex") or udata.get("jellyfin") or {}
                films_views = svc.get("extra", {}).get("films", {}).get("total", 0) or svc.get("total_items", 0)
                series_views = svc.get("extra", {}).get("series", {}).get("episodes", 0)
                films_hours = svc.get("extra", {}).get("films", {}).get("hours", 0) or svc.get("total_hours", 0)
                series_hours = svc.get("extra", {}).get("series", {}).get("hours", 0)
                cumulative[uid]["views"] += films_views + series_views
                cumulative[uid]["hours"] += round(films_hours + series_hours, 1)

        # Add current year
        for uid, udata in current_users_data.items():
            if uid not in cumulative:
                cumulative[uid] = {"name": udata.get("name", uid), "views": 0, "hours": 0}
            svc = udata.get("tautulli") or udata.get("plex") or udata.get("jellyfin") or {}
            films_views = svc.get("extra", {}).get("films", {}).get("total", 0) or svc.get("total_items", 0)
            series_views = svc.get("extra", {}).get("series", {}).get("episodes", 0)
            films_hours = svc.get("extra", {}).get("films", {}).get("hours", 0) or svc.get("total_hours", 0)
            series_hours = svc.get("extra", {}).get("series", {}).get("hours", 0)
            cumulative[uid]["views"] += films_views + series_views
            cumulative[uid]["hours"] += round(films_hours + series_hours, 1)

        # Build previous year cumulative (for comparison badges)
        prev_cumulative = {}
        for uid, data in cumulative.items():
            prev_cumulative[uid] = {"name": data["name"], "views": 0, "hours": 0}
        for recap in past_recaps:
            if not recap.data or "users" not in recap.data:
                continue
            for uid, udata in recap.data["users"].items():
                if uid not in prev_cumulative:
                    prev_cumulative[uid] = {"name": udata.get("name", uid), "views": 0, "hours": 0}
                svc = udata.get("tautulli") or udata.get("plex") or udata.get("jellyfin") or {}
                films_views = svc.get("extra", {}).get("films", {}).get("total", 0) or svc.get("total_items", 0)
                series_views = svc.get("extra", {}).get("series", {}).get("episodes", 0)
                films_hours = svc.get("extra", {}).get("films", {}).get("hours", 0) or svc.get("total_hours", 0)
                series_hours = svc.get("extra", {}).get("series", {}).get("hours", 0)
                prev_cumulative[uid]["views"] += films_views + series_views
                prev_cumulative[uid]["hours"] += round(films_hours + series_hours, 1)

        by_views = sorted(cumulative.values(), key=lambda x: x["views"], reverse=True)
        by_hours = sorted(cumulative.values(), key=lambda x: x["hours"], reverse=True)
        prev_by_views = sorted(prev_cumulative.values(), key=lambda x: x["views"], reverse=True)
        prev_by_hours = sorted(prev_cumulative.values(), key=lambda x: x["hours"], reverse=True)

        return {
            "by_views": by_views,
            "by_hours": by_hours,
            "prev_by_views": prev_by_views,
            "prev_by_hours": prev_by_hours,
        }

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
        logger.info("User %s mappings: %s", user_id, mappings)

        # Extract TMDB API key if configured as a service
        tmdb_key = None
        overseerr_url = None
        overseerr_key = None
        for svc in services:
            if svc.service_type == "tmdb":
                try:
                    tmdb_key = decrypt(svc.api_key_enc)
                except Exception:
                    logger.warning("Impossible de dechiffrer la cle TMDB — enrichissement desactive")
            elif svc.service_type == "overseerr":
                try:
                    overseerr_url = svc.base_url
                    overseerr_key = decrypt(svc.api_key_enc)
                except Exception:
                    logger.warning("Impossible de dechiffrer la cle Overseerr — enrichissement desactive")

        collected = {}

        for svc in services:
            if svc.service_type in ("tmdb", "overseerr"):
                continue
            cls = COLLECTOR_MAP.get(svc.service_type)
            if not cls:
                continue
            service_username = mappings.get(svc.service_type)
            try:
                api_key = decrypt(svc.api_key_enc)
            except Exception:
                logger.error("Impossible de dechiffrer la cle pour %s — service ignore", svc.service_type)
                continue
            collector = cls(base_url=svc.base_url, api_key=api_key)
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

        # Overseerr enrichment — fetch requests for this user
        if overseerr_url and overseerr_key:
            try:
                from app.services.overseerr import OverseerrClient
                ov_client = OverseerrClient(overseerr_url, overseerr_key)

                # Find Overseerr user ID
                ov_user_id = None
                ov_users = await ov_client.get_users()
                overseerr_mapping = mappings.get("overseerr")
                plex_username = mappings.get("tautulli") or mappings.get("plex") or mappings.get("jellyfin")
                for ou in ov_users:
                    if overseerr_mapping and (ou["name"] == overseerr_mapping or ou.get("plex_username") == overseerr_mapping):
                        ov_user_id = int(ou["id"])
                        break
                    if not overseerr_mapping and plex_username and (ou.get("plex_username") == plex_username or ou["name"].lower() == plex_username.lower()):
                        ov_user_id = int(ou["id"])
                        break

                # Current year requests
                requests_data = await ov_client.get_requests_for_year(year, ov_user_id)

                # Previous year for comparison
                prev_requests = await ov_client.get_requests_for_year(year - 1, ov_user_id)

                # Collect watched items for matching (with tmdb_ids)
                watched_items = []
                for svc_data in collected.values():
                    for item in svc_data.get("top", []):
                        watched_items.append(item)
                    for section in ("films", "series"):
                        for item in svc_data.get("extra", {}).get(section, {}).get("top", []):
                            watched_items.append(item)

                match_data = ov_client.match_requests_with_watched(requests_data, watched_items)

                # Community-level: all requests + popularity
                all_requests_data = await ov_client.get_requests_for_year(year)

                collected["overseerr"] = {
                    **requests_data,
                    **match_data,
                    "prev_year": {
                        "total": prev_requests.get("total", 0),
                        "movies": prev_requests.get("movies", 0),
                        "series": prev_requests.get("series", 0),
                        "approved": prev_requests.get("approved", 0),
                        "monthly": prev_requests.get("monthly", []),
                    },
                    "community": {
                        "total": all_requests_data.get("total", 0),
                        "top_requesters": all_requests_data.get("top_requesters", []),
                        "top": all_requests_data.get("top", []),
                    },
                }
                # Remove all_requests to save space
                collected["overseerr"].pop("all_requests", None)

                logger.info("Enrichissement Overseerr OK: %d demandes (%d communaute)", requests_data.get("total", 0), all_requests_data.get("total", 0))
            except Exception:
                logger.exception("Enrichissement Overseerr echoue")

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

            # Top 3 most watched
            cur_top = cur_m.get("top", [])[:3]
            prev_top = prev_m.get("top", [])[:3]
            if cur_top or prev_top:
                entry["top"] = {
                    "current": [{"t": f.get("t", ""), "thumb": f.get("thumb", ""), "plays": f.get("plays") or f.get("ep") or f.get("v", 0)} for f in cur_top],
                    "previous": [{"t": f.get("t", ""), "thumb": f.get("thumb", ""), "plays": f.get("plays") or f.get("ep") or f.get("v", 0)} for f in prev_top],
                }

            # Year distribution (for timeline/profile slide) — per individual year
            def _build_year_dist(top_list):
                buckets = {}
                total_w, total_c = 0, 0
                for f in top_list:
                    y = f.get("y") or f.get("year", 0)
                    if y and y > 1890:
                        plays = f.get("plays", 1) or 1
                        buckets[y] = buckets.get(y, 0) + plays
                        total_w += y * plays
                        total_c += plays
                avg = round(total_w / total_c) if total_c > 0 else 0
                return {"years": {str(k): v for k, v in sorted(buckets.items())}, "avg_year": avg, "count": total_c}

            cur_year_dist = _build_year_dist(cur_m.get("top", []))
            prev_year_dist = _build_year_dist(prev_m.get("top", []))
            if cur_year_dist["count"] > 0 or prev_year_dist["count"] > 0:
                entry["year_dist"] = {"current": cur_year_dist, "previous": prev_year_dist}

            # Peak stats
            cur_peak = cur_m.get("peak_stats", {})
            prev_peak = prev_m.get("peak_stats", {})
            if cur_peak or prev_peak:
                entry["peak"] = {"current": cur_peak, "previous": prev_peak}

            # Day of week comparison
            cur_dow = cur_m.get("day_of_week", [])
            prev_dow = prev_m.get("day_of_week", [])
            if cur_dow and prev_dow:
                entry["day_of_week"] = []
                for i in range(min(len(cur_dow), len(prev_dow))):
                    entry["day_of_week"].append({
                        "d": cur_dow[i].get("d", ""),
                        "current": cur_dow[i].get("v", 0),
                        "previous": prev_dow[i].get("v", 0),
                    })

            # Time of day comparison
            cur_tod = cur_m.get("time_of_day", [])
            prev_tod = prev_m.get("time_of_day", [])
            if cur_tod and prev_tod:
                entry["time_of_day"] = []
                for i in range(min(len(cur_tod), len(prev_tod))):
                    entry["time_of_day"].append({
                        "h": cur_tod[i].get("h", ""),
                        "current": cur_tod[i].get("v", 0),
                        "previous": prev_tod[i].get("v", 0),
                    })

            comp[mtype] = entry

        # Helper to enrich ratings with thumbs from top lists
        def _enrich_ratings(ratings: list, extra: dict) -> list:
            thumb_map = {}
            for mtype in ("films", "series"):
                for item in extra.get(mtype, {}).get("top", []):
                    thumb_map[item.get("t", "").lower()] = item.get("thumb", "")
            for item in extra.get("top", []):
                thumb_map[item.get("t", "").lower()] = item.get("thumb", "")
            return [{"t": r.get("t", ""), "r": r.get("r", 0), "thumb": thumb_map.get(r.get("t", "").lower(), "")} for r in ratings]

        def _extract_people(extra: dict, key: str) -> list:
            return [{"n": a.get("name", ""), "count": a.get("count", 0), "photo": a.get("photo", "")} for a in extra.get(key, [])[:5]]

        # Per-media actors, directors, ratings (films from root extra, series from extra.series)
        for mtype in ("films", "series"):
            if mtype not in comp:
                continue
            if mtype == "films":
                src_cur, src_prev = cur_extra, prev_extra
            else:
                src_cur = cur_extra.get("series", {})
                src_prev = prev_extra.get("series", {})

            # Actors & directors (films only)
            if mtype == "films":
                for key in ("actors", "directors"):
                    cur_list = _extract_people(cur_extra, key)
                    prev_list = _extract_people(prev_extra, key)
                    if cur_list or prev_list:
                        comp[mtype][key] = {"current": cur_list, "previous": prev_list}

            # Ratings (per-media) — top rated + average + distribution
            cur_all_r = src_cur.get("ratings", [])
            prev_all_r = src_prev.get("ratings", [])
            cur_ratings = cur_all_r[:3]
            prev_ratings = prev_all_r[:3]
            if cur_ratings or prev_ratings:
                comp[mtype]["top_rated"] = {
                    "current": _enrich_ratings(cur_ratings, cur_extra),
                    "previous": _enrich_ratings(prev_ratings, prev_extra),
                }

            # Worst rated
            cur_worst = [r for r in cur_all_r if (r.get("r") or 0) > 0][-1:] if cur_all_r else []
            prev_worst = [r for r in prev_all_r if (r.get("r") or 0) > 0][-1:] if prev_all_r else []
            if cur_worst or prev_worst:
                comp[mtype]["worst_rated"] = {
                    "current": _enrich_ratings(cur_worst, cur_extra),
                    "previous": _enrich_ratings(prev_worst, prev_extra),
                }

            # Ratings stats: average + bracket distribution
            def _ratings_stats(all_ratings):
                valid = [r for r in all_ratings if (r.get("r") or 0) > 0]
                if not valid:
                    return None
                avg = round(sum(r["r"] for r in valid) / len(valid), 2)
                # Distribution by bracket
                BRACKETS = [(0, 4), (4, 6), (6, 7), (7, 8), (8, 10.1)]
                dist = []
                for bmin, bmax in BRACKETS:
                    dist.append(sum(1 for r in valid if r["r"] >= bmin and r["r"] < bmax))
                return {"avg": avg, "count": len(valid), "distribution": dist}

            cur_stats = _ratings_stats(cur_all_r)
            prev_stats = _ratings_stats(prev_all_r)
            if cur_stats or prev_stats:
                comp[mtype]["ratings_stats"] = {"current": cur_stats, "previous": prev_stats}

        # Keep root-level for backward compat
        if "films" in comp and "actors" in comp["films"]:
            comp["actors"] = comp["films"]["actors"]
            comp["directors"] = comp["films"].get("directors", {})
        if "films" in comp and "top_rated" in comp["films"]:
            comp["top_rated"] = comp["films"]["top_rated"]
            comp["worst_rated"] = comp["films"].get("worst_rated", {})

        # Budget comparison (films only)
        cur_budgets = cur_extra.get("budgets", {})
        prev_budgets = prev_extra.get("budgets", {})
        if cur_budgets or prev_budgets:
            comp["budgets"] = {
                "current": {
                    "average": cur_budgets.get("average", 0),
                    "count": cur_budgets.get("count", 0),
                    "total": cur_budgets.get("total", 0),
                    "distribution": cur_budgets.get("distribution", []),
                },
                "previous": {
                    "average": prev_budgets.get("average", 0),
                    "count": prev_budgets.get("count", 0),
                    "total": prev_budgets.get("total", 0),
                    "distribution": prev_budgets.get("distribution", []),
                },
            }

        # Countries comparison (top 3)
        cur_countries = cur_extra.get("countries", [])[:3]
        prev_countries = prev_extra.get("countries", [])[:3]
        # Also check series-specific countries
        for mtype in ("films", "series"):
            mt_countries = cur_extra.get(mtype, {}).get("countries", [])[:3]
            if mt_countries and not cur_countries:
                cur_countries = mt_countries
            mt_countries_prev = prev_extra.get(mtype, {}).get("countries", [])[:3]
            if mt_countries_prev and not prev_countries:
                prev_countries = mt_countries_prev
        if cur_countries or prev_countries:
            comp["countries"] = {
                "current": [{"n": c.get("name", c.get("code", "")), "c": c.get("code", ""), "v": c.get("count", 0)} for c in cur_countries],
                "previous": [{"n": c.get("name", c.get("code", "")), "c": c.get("code", ""), "v": c.get("count", 0)} for c in prev_countries],
            }

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
