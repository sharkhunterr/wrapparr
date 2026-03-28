from app.collectors.base import BaseCollector, NormalizedData


class KomgaCollector(BaseCollector):
    @property
    def _auth(self):
        # Komga uses basic auth with email:api_key
        return (self.api_key.split(":")[0], self.api_key.split(":")[-1]) if ":" in self.api_key else ("", self.api_key)

    async def test_connection(self) -> tuple[bool, str]:
        try:
            resp = await self.client.get(f"{self.base_url}/api/v1/users/me", auth=self._auth)
            resp.raise_for_status()
            return True, "Connexion Komga réussie"
        except Exception as e:
            return False, str(e)

    async def collect(self, year: int) -> dict:
        resp = await self.client.get(
            f"{self.base_url}/api/v1/books",
            auth=self._auth,
            params={"read_status": "READ", "size": "5000"},
        )
        resp.raise_for_status()
        books = resp.json().get("content", [])

        resp = await self.client.get(f"{self.base_url}/api/v1/series", auth=self._auth, params={"size": "500"})
        resp.raise_for_status()
        series = resp.json().get("content", [])

        return {"books": books, "series": series, "year": year}

    def normalize(self, raw: dict) -> NormalizedData:
        books = raw.get("books", [])
        series = raw.get("series", [])

        genre_count = {}
        for s in series:
            meta = s.get("metadata", {})
            for g in meta.get("genres", []):
                genre_count[g] = genre_count.get(g, 0) + 1

        genres = sorted([{"n": k, "v": v} for k, v in genre_count.items()], key=lambda x: -x["v"])[:5]

        return NormalizedData(
            service_type="komga",
            total_items=len(books),
            total_hours=0,
            genres=genres,
            extra={"volumes": len(books), "series": len(series)},
        )
