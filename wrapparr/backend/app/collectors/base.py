from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any

import httpx


@dataclass
class NormalizedData:
    service_type: str = ""
    total_items: int = 0
    total_hours: float = 0
    vs_last_year: int = 0
    top: list[dict[str, Any]] = field(default_factory=list)
    genres: list[dict[str, Any]] = field(default_factory=list)
    day_of_week: list[dict[str, Any]] = field(default_factory=list)
    time_of_day: list[dict[str, Any]] = field(default_factory=list)
    monthly: list[dict[str, Any]] = field(default_factory=list)
    ranking: list[dict[str, Any]] = field(default_factory=list)
    extra: dict[str, Any] = field(default_factory=dict)


class BaseCollector(ABC):
    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.target_user: str | None = None
        self.tmdb_api_key: str | None = None
        self.client = httpx.AsyncClient(timeout=30.0)

    async def close(self):
        await self.client.aclose()

    @abstractmethod
    async def test_connection(self) -> tuple[bool, str]:
        """Test connectivity. Returns (ok, details_or_error)."""
        ...

    @abstractmethod
    async def collect(self, year: int) -> dict:
        """Collect raw data for the given year."""
        ...

    @abstractmethod
    def normalize(self, raw: dict) -> NormalizedData:
        """Normalize raw data into standard format."""
        ...

    async def run(self, year: int) -> NormalizedData:
        raw = await self.collect(year)
        return self.normalize(raw)
