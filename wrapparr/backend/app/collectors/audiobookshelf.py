from app.collectors.base import BaseCollector, NormalizedData


class AudiobookshelfCollector(BaseCollector):
    @property
    def _headers(self):
        return {"Authorization": f"Bearer {self.api_key}"}

    async def test_connection(self) -> tuple[bool, str]:
        try:
            resp = await self.client.get(f"{self.base_url}/api/me", headers=self._headers)
            resp.raise_for_status()
            data = resp.json()
            return True, f"Audiobookshelf connecté ({data.get('username', '?')})"
        except Exception as e:
            return False, str(e)

    async def collect(self, year: int) -> dict:
        resp = await self.client.get(
            f"{self.base_url}/api/me/listening-stats",
            headers=self._headers,
        )
        resp.raise_for_status()
        stats = resp.json()

        resp = await self.client.get(
            f"{self.base_url}/api/libraries",
            headers=self._headers,
        )
        resp.raise_for_status()
        libraries = resp.json().get("libraries", [])

        items = []
        for lib in libraries:
            resp = await self.client.get(
                f"{self.base_url}/api/libraries/{lib['id']}/items",
                headers=self._headers,
                params={"limit": "1000"},
            )
            resp.raise_for_status()
            items.extend(resp.json().get("results", []))

        return {"stats": stats, "items": items, "year": year}

    def normalize(self, raw: dict) -> NormalizedData:
        stats = raw.get("stats", {})
        items = raw.get("items", [])

        total_minutes = stats.get("totalTime", 0) / 60
        total_hours = total_minutes / 60

        genre_count = {}
        for item in items:
            media = item.get("media", {}).get("metadata", {})
            for g in media.get("genres", []):
                genre_count[g] = genre_count.get(g, 0) + 1

        genres = sorted([{"n": k, "v": v} for k, v in genre_count.items()], key=lambda x: -x["v"])[:5]

        return NormalizedData(
            service_type="audiobookshelf",
            total_items=len(items),
            total_hours=total_hours,
            genres=genres,
            extra={"books": len(items)},
        )
