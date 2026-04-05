"""Integrated scheduler — runs inside the FastAPI lifespan, reads config from DB."""
import asyncio
import logging
from datetime import datetime

from sqlalchemy import select

from app.core.database import async_session
from app.models.share import GlobalConfig
from app.models.user import User
from app.services.pipeline import RecapPipeline
from app.models.recap import YearlyRecap

logger = logging.getLogger("wrapparr.scheduler")

_task = None
_stop = False


async def _scheduled_generate():
    """Generate recap for the current year for all users, then auto-activate."""
    year = datetime.now().year
    logger.info("Génération planifiée du recap %d", year)
    async with async_session() as db:
        result = await db.execute(select(User).where(User.is_active.is_(True)))
        users = result.scalars().all()
        if not users:
            logger.warning("Aucun utilisateur actif — génération annulée")
            return

        # Use first admin as pipeline runner
        admin = next((u for u in users if u.role == "admin"), users[0])
        logger.info("Génération pour %d utilisateurs (runner: %s)", len(users), admin.display_name)

        try:
            pipeline = RecapPipeline(db)
            await pipeline.run(admin.id, year)

            # Auto-activate
            result = await db.execute(
                select(YearlyRecap).where(YearlyRecap.year == year, YearlyRecap.status == "completed")
            )
            for recap in result.scalars().all():
                if not recap.is_active:
                    recap.is_active = True
                    logger.info("Recap %d activé automatiquement", year)
            await db.commit()
        except Exception:
            logger.exception("Erreur lors de la génération planifiée du recap %d", year)


async def _check_schedule():
    """Check every 60s if it's time to run the scheduled generation."""
    global _stop
    last_run_key = None

    while not _stop:
        try:
            async with async_session() as db:
                # Read schedule config
                configs = {}
                result = await db.execute(
                    select(GlobalConfig).where(
                        GlobalConfig.key.in_([
                            "recap_schedule_enabled", "recap_schedule_mode",
                            "recap_schedule_month", "recap_schedule_day",
                            "recap_schedule_hour", "recap_schedule_cron",
                        ])
                    )
                )
                for row in result.scalars().all():
                    configs[row.key] = row.value

                enabled = configs.get("recap_schedule_enabled", False)
                if not enabled:
                    await asyncio.sleep(60)
                    continue

                now = datetime.now()
                mode = configs.get("recap_schedule_mode", "simple")

                should_run = False
                if mode == "simple":
                    month = int(configs.get("recap_schedule_month", 12))
                    day = int(configs.get("recap_schedule_day", 1))
                    hour = int(configs.get("recap_schedule_hour", 9))
                    if now.month == month and now.day == day and now.hour == hour:
                        should_run = True
                else:
                    # Parse cron: "min hour day month dow"
                    cron = configs.get("recap_schedule_cron", "0 9 1 12 *")
                    try:
                        parts = cron.strip().split()
                        if len(parts) >= 5:
                            c_min, c_hour, c_day, c_month, c_dow = parts[:5]
                            if _cron_match(c_min, now.minute) and _cron_match(c_hour, now.hour) and \
                               _cron_match(c_day, now.day) and _cron_match(c_month, now.month) and \
                               _cron_match(c_dow, now.weekday()):
                                should_run = True
                    except Exception:
                        pass

                # Avoid running multiple times in the same hour
                run_key = f"{now.year}-{now.month}-{now.day}-{now.hour}"
                if should_run and run_key != last_run_key:
                    last_run_key = run_key
                    logger.info("Planification déclenchée — lancement de la génération")
                    await _scheduled_generate()

        except Exception:
            logger.exception("Erreur dans le scheduler")

        await asyncio.sleep(60)


def _cron_match(pattern, value):
    """Check if a cron field pattern matches a value."""
    if pattern == "*":
        return True
    for part in pattern.split(","):
        if "/" in part:
            base, step = part.split("/")
            step = int(step)
            if base == "*":
                if value % step == 0:
                    return True
            continue
        if "-" in part:
            low, high = part.split("-")
            if int(low) <= value <= int(high):
                return True
            continue
        if int(part) == value:
            return True
    return False


async def start_scheduler():
    """Start the scheduler background task."""
    global _task, _stop
    _stop = False
    _task = asyncio.create_task(_check_schedule())
    logger.info("Scheduler démarré — vérification toutes les 60s")


async def stop_scheduler():
    """Stop the scheduler background task."""
    global _stop, _task
    _stop = True
    if _task:
        _task.cancel()
        try:
            await _task
        except asyncio.CancelledError:
            pass
    logger.info("Scheduler arrêté")
