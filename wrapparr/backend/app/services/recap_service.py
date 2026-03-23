import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.recap import HistorySnapshot, YearlyRecap


async def get_recaps(db: AsyncSession, user_id: uuid.UUID) -> list[YearlyRecap]:
    result = await db.execute(
        select(YearlyRecap)
        .where(YearlyRecap.user_id == user_id)
        .order_by(YearlyRecap.year.desc())
    )
    return list(result.scalars().all())


async def get_recap(db: AsyncSession, user_id: uuid.UUID, year: int) -> YearlyRecap | None:
    result = await db.execute(
        select(YearlyRecap).where(YearlyRecap.user_id == user_id, YearlyRecap.year == year)
    )
    return result.scalar_one_or_none()


async def get_snapshot(db: AsyncSession, user_id: uuid.UUID, year: int) -> HistorySnapshot | None:
    result = await db.execute(
        select(HistorySnapshot).where(HistorySnapshot.user_id == user_id, HistorySnapshot.year == year)
    )
    return result.scalar_one_or_none()


async def get_compare_data(db: AsyncSession, user_id: uuid.UUID, years: list[int]) -> list[dict]:
    results = []
    for year in years:
        recap = await get_recap(db, user_id, year)
        if recap and recap.data:
            results.append({"year": year, "data": recap.data})
    return results
