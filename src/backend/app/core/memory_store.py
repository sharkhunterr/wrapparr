"""In-memory key-value store — replaces Redis when not available."""
import asyncio
from datetime import datetime, timezone


class MemoryStore:
    """Simple TTL key-value store. Thread-safe via asyncio."""

    def __init__(self):
        self._data = {}  # key → (value, expires_at)

    async def get(self, key: str) -> str | None:
        entry = self._data.get(key)
        if not entry:
            return None
        value, expires_at = entry
        if datetime.now(timezone.utc).timestamp() > expires_at:
            del self._data[key]
            return None
        return value

    async def setex(self, key: str, ttl: int, value: str):
        expires_at = datetime.now(timezone.utc).timestamp() + ttl
        self._data[key] = (value, expires_at)

    async def delete(self, key: str):
        self._data.pop(key, None)

    async def close(self):
        self._data.clear()


memory_store = MemoryStore()
