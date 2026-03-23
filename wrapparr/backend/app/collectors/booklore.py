from app.collectors.base import BaseCollector, NormalizedData


class BookloreCollector(BaseCollector):
    @property
    def _headers(self):
        return {"Authorization": f"Bearer {self.api_key}"}

    async def test_connection(self) -> tuple[bool, str]:
        try:
            resp = await self.client.get(f"{self.base_url}/api/books", headers=self._headers, params={"limit": "1"})
            resp.raise_for_status()
            return True, "Connexion Booklore réussie"
        except Exception as e:
            return False, str(e)

    async def collect(self, year: int) -> dict:
        resp = await self.client.get(
            f"{self.base_url}/api/books",
            headers=self._headers,
            params={"limit": "5000", "read": "true"},
        )
        resp.raise_for_status()
        books = resp.json() if isinstance(resp.json(), list) else resp.json().get("books", [])
        return {"books": books, "year": year}

    def normalize(self, raw: dict) -> NormalizedData:
        books = raw.get("books", [])

        genre_count = {}
        author_count = {}
        for b in books:
            for g in b.get("genres", []):
                name = g if isinstance(g, str) else g.get("name", "")
                if name:
                    genre_count[name] = genre_count.get(name, 0) + 1
            for a in b.get("authors", []):
                name = a if isinstance(a, str) else a.get("name", "")
                if name:
                    author_count[name] = author_count.get(name, 0) + 1

        genres = sorted([{"n": k, "v": v} for k, v in genre_count.items()], key=lambda x: -x["v"])[:5]

        return NormalizedData(
            service_type="booklore",
            total_items=len(books),
            total_hours=0,
            genres=genres,
            extra={
                "books": len(books),
                "authors": sorted([{"n": k, "v": v} for k, v in author_count.items()], key=lambda x: -x["v"])[:10],
            },
        )
