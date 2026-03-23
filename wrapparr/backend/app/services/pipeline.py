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
        # Get or create recap
        result = await self.db.execute(
            select(YearlyRecap).where(YearlyRecap.user_id == user_id, YearlyRecap.year == year)
        )
        recap = result.scalar_one_or_none()
        if recap:
            # Reset for regeneration
            recap.data = None
            recap.error_message = None
            recap.progress = 0
            recap.progress_msg = None
            recap.completed_at = None
            # Delete old snapshot
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
            # Step 1: Collect data from all active services
            await self._update_progress(recap, "collecting", 10, "Collecte des données en cours...")
            collected = await self._collect(user_id, year)

            # Step 2: Process and normalize
            await self._update_progress(recap, "processing", 40, "Calcul des statistiques...")
            processed = self._process(collected)

            # Step 3: Fetch posters
            await self._update_progress(recap, "fetching_posters", 70, "Récupération des affiches...")
            # Poster fetching is a pass-through for now — URLs are stored in data
            # Real TMDB/OpenLibrary proxy calls will enrich the data

            # Step 4: Complete
            recap.data = processed
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

    def _process(self, collected: dict[str, Any]) -> dict[str, Any]:
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

        return recap_data
