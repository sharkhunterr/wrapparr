from app.collectors.base import BaseCollector, NormalizedData


class ROMMCollector(BaseCollector):
    @property
    def _headers(self):
        return {"Authorization": f"Bearer {self.api_key}"}

    async def test_connection(self) -> tuple[bool, str]:
        try:
            resp = await self.client.get(f"{self.base_url}/api/heartbeat", headers=self._headers)
            resp.raise_for_status()
            return True, "Connexion ROMM réussie"
        except Exception as e:
            return False, str(e)

    async def collect(self, year: int) -> dict:
        resp = await self.client.get(f"{self.base_url}/api/roms", headers=self._headers)
        resp.raise_for_status()
        roms = resp.json()
        return {"roms": roms, "year": year}

    def normalize(self, raw: dict) -> NormalizedData:
        roms = raw.get("roms", [])
        total_hours = sum(r.get("playtime_minutes", 0) for r in roms) / 60

        platform_count = {}
        genre_count = {}
        for r in roms:
            p = r.get("platform", {}).get("name", "Inconnu")
            platform_count[p] = platform_count.get(p, 0) + 1
            for g in r.get("genres", []):
                name = g if isinstance(g, str) else g.get("name", "")
                if name:
                    genre_count[name] = genre_count.get(name, 0) + 1

        genres = sorted([{"n": k, "v": v} for k, v in genre_count.items()], key=lambda x: -x["v"])[:5]

        return NormalizedData(
            service_type="romm",
            total_items=len(roms),
            total_hours=total_hours,
            genres=genres,
            extra={
                "games": len(roms),
                "consoles": sorted([{"n": k, "v": v} for k, v in platform_count.items()], key=lambda x: -x["v"]),
            },
        )
