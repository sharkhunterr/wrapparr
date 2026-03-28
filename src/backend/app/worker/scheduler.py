import asyncio
import logging

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy import select

from app.core.database import async_session
from app.models.user import User

logger = logging.getLogger("wrapparr.worker")


async def annual_recap_job():
    """Generate recaps for all active users."""
    logger.info("Lancement de la génération annuelle des recaps")
    async with async_session() as db:
        result = await db.execute(select(User).where(User.is_active.is_(True)))
        users = result.scalars().all()
        logger.info("Génération pour %d utilisateurs", len(users))
        for user in users:
            try:
                # Pipeline will be implemented in Phase 6 (US4)
                logger.info("Recap pour %s — à implémenter", user.email)
            except Exception:
                logger.exception("Erreur recap pour %s", user.email)


def main():
    logging.basicConfig(level=logging.INFO)
    logger.info("Wrapparr Worker démarré")

    scheduler = AsyncIOScheduler()

    # Default: January 1st at 02:00
    scheduler.add_job(
        annual_recap_job,
        trigger=CronTrigger(month=1, day=1, hour=2, minute=0),
        id="annual_recap",
        name="Génération annuelle des recaps",
        replace_existing=True,
    )

    scheduler.start()
    logger.info("Job planifié : recap annuel le 1er janvier à 2h00")

    try:
        asyncio.get_event_loop().run_forever()
    except (KeyboardInterrupt, SystemExit):
        scheduler.shutdown()
        logger.info("Wrapparr Worker arrêté")


if __name__ == "__main__":
    main()
