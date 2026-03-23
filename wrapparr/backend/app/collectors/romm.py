import logging
from collections import Counter
from datetime import datetime

from app.collectors.base import BaseCollector, NormalizedData

logger = logging.getLogger("wrapparr.romm")


class ROMMCollector(BaseCollector):
    """ROMM collector using username:password auth (OAuth2 token)."""

    _token: str | None = None

    async def _login(self):
        """Authenticate with ROMM and store Bearer token."""
        if self._token:
            return
        parts = self.api_key.split(":", 1)
        if len(parts) != 2:
            raise ValueError("ROMM credentials must be 'username:password'")
        username, password = parts

        for endpoint in ["/api/token", "/token"]:
            try:
                resp = await self.client.post(
                    f"{self.base_url}{endpoint}",
                    data={"username": username, "password": password, "scope": "me.read roms.read platforms.read"},
                )
                if resp.status_code == 200:
                    token = resp.json().get("access_token")
                    if token:
                        self._token = token
                        logger.info("ROMM auth OK via %s for '%s'", endpoint, username)
                        return
            except Exception:
                continue

        raise ConnectionError("ROMM login failed — verifiez vos identifiants")

    @property
    def _headers(self):
        if self._token:
            return {"Authorization": f"Bearer {self._token}"}
        return {}

    async def test_connection(self) -> tuple[bool, str]:
        try:
            await self._login()
            resp = await self.client.get(f"{self.base_url}/api/heartbeat", headers=self._headers)
            resp.raise_for_status()
            # Count platforms
            resp2 = await self.client.get(f"{self.base_url}/api/platforms", headers=self._headers)
            plat_count = len(resp2.json()) if resp2.status_code == 200 and isinstance(resp2.json(), list) else 0
            return True, f"Connexion ROMM reussie ({plat_count} plateformes)"
        except Exception as e:
            return False, str(e)

    async def collect(self, year: int) -> dict:
        await self._login()

        # Fetch only played ROMs (server-side filter)
        resp = await self.client.get(
            f"{self.base_url}/api/roms",
            headers=self._headers,
            params={"last_played": "true", "limit": 500},
        )
        resp.raise_for_status()
        data = resp.json()
        played_roms = data.get("items", []) if isinstance(data, dict) else (data if isinstance(data, list) else [])
        total_library = data.get("total", len(played_roms)) if isinstance(data, dict) else len(played_roms)

        # Also fetch platforms
        platforms = []
        try:
            resp2 = await self.client.get(f"{self.base_url}/api/platforms", headers=self._headers)
            if resp2.status_code == 200:
                platforms = resp2.json() if isinstance(resp2.json(), list) else []
        except Exception:
            pass

        logger.info("ROMM: %d played ROMs", len(played_roms))
        return {"roms": played_roms, "platforms": platforms, "total_library": total_library, "year": year}

    def normalize(self, raw: dict) -> NormalizedData:
        roms = raw.get("roms", [])
        platforms_list = raw.get("platforms", [])
        platform_names = {p.get("id"): p.get("name", p.get("slug", "?")) for p in platforms_list}

        genre_count = Counter()
        platform_count = Counter()
        top_items = []

        for r in roms:
            # Platform
            plat_name = r.get("platform_display_name") or platform_names.get(r.get("platform_id")) or r.get("platform_slug", "?")
            platform_count[plat_name] += 1

            # Genres from metadatum
            meta = r.get("metadatum") or {}
            for g in meta.get("genres", []):
                name = g if isinstance(g, str) else g.get("name", "")
                if name:
                    genre_count[name] += 1

            # Cover image
            cover = ""
            if r.get("url_cover"):
                cover = r["url_cover"]
            elif r.get("path_cover_large"):
                cover = f"{self.base_url}{r['path_cover_large']}"

            # Rating from IGDB
            igdb = r.get("igdb_metadata") or {}
            rating = 0
            try:
                rating = round(float(igdb.get("total_rating") or igdb.get("aggregated_rating") or 0) / 10, 1)
            except (ValueError, TypeError):
                pass

            # User data
            ru = r.get("rom_user") or {}
            status = ru.get("status") or ""
            user_rating = ru.get("rating", 0) or 0

            top_items.append({
                "t": r.get("name", "?"),
                "g": plat_name,
                "thumb": cover,
                "r": user_rating if user_rating > 0 else rating,
                "plays": 1,
                "status": status,
            })

        genres = [{"n": k, "v": v} for k, v in genre_count.most_common(8)]
        top = sorted(top_items, key=lambda x: -(x.get("r") or 0))[:4]

        return NormalizedData(
            service_type="romm",
            total_items=len(roms),
            total_hours=0,  # ROMM doesn't track actual playtime
            top=top,
            genres=genres,
            extra={
                "games": len(roms),
                "library_total": raw.get("total_library", 0),
                "consoles": [{"n": k, "v": v} for k, v in platform_count.most_common()],
            },
        )
