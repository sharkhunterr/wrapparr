from app.collectors.base import BaseCollector, NormalizedData


class JellyfinCollector(BaseCollector):
    @property
    def _headers(self):
        return {"X-Emby-Token": self.api_key}

    async def test_connection(self) -> tuple[bool, str]:
        try:
            resp = await self.client.get(f"{self.base_url}/System/Info", headers=self._headers)
            resp.raise_for_status()
            info = resp.json()
            return True, f"Jellyfin {info.get('Version', '?')} connecté"
        except Exception as e:
            return False, str(e)

    async def collect(self, year: int) -> dict:
        # Get all users to find playback data
        resp = await self.client.get(f"{self.base_url}/Users", headers=self._headers)
        resp.raise_for_status()
        users = resp.json()

        items = []
        for user in users:
            uid = user["Id"]
            resp = await self.client.get(
                f"{self.base_url}/Users/{uid}/Items",
                headers=self._headers,
                params={
                    "Recursive": "true",
                    "IncludeItemTypes": "Movie,Episode",
                    "IsPlayed": "true",
                    "MinDateLastSaved": f"{year}-01-01T00:00:00Z",
                    "Fields": "Genres,RunTimeTicks,DateCreated",
                    "Limit": "5000",
                },
            )
            resp.raise_for_status()
            items.extend(resp.json().get("Items", []))

        return {"items": items, "year": year}

    def normalize(self, raw: dict) -> NormalizedData:
        items = raw.get("items", [])
        movies = [i for i in items if i.get("Type") == "Movie"]
        episodes = [i for i in items if i.get("Type") == "Episode"]

        total_ticks = sum(i.get("RunTimeTicks", 0) for i in items)
        total_hours = total_ticks / (10_000_000 * 3600)

        genre_count = {}
        for i in items:
            for g in i.get("Genres", []):
                genre_count[g] = genre_count.get(g, 0) + 1
        genres = sorted([{"n": k, "v": v} for k, v in genre_count.items()], key=lambda x: -x["v"])[:5]

        return NormalizedData(
            service_type="jellyfin",
            total_items=len(movies),
            total_hours=total_hours,
            genres=genres,
            extra={
                "films": {"total": len(movies)},
                "series": {"episodes": len(episodes)},
            },
        )
