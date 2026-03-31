"""Overseerr client — fetches media requests for recap enrichment."""
import logging
from datetime import datetime

import httpx

logger = logging.getLogger("wrapparr.overseerr")


class OverseerrClient:
    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key

    async def test_connection(self) -> tuple[bool, str]:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(
                    f"{self.base_url}/api/v1/status",
                    headers={"X-Api-Key": self.api_key},
                )
                if resp.status_code == 200:
                    version = resp.json().get("version", "?")
                    return True, f"Overseerr v{version}"
                return False, f"HTTP {resp.status_code}"
        except Exception as e:
            return False, str(e)

    async def get_users(self) -> list[dict]:
        """Fetch Overseerr users for mapping."""
        users = []
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.get(
                    f"{self.base_url}/api/v1/user",
                    headers={"X-Api-Key": self.api_key},
                    params={"take": 100},
                )
                if resp.status_code == 200:
                    data = resp.json()
                    results = data.get("results", data) if isinstance(data, dict) else data
                    for u in results:
                        users.append({
                            "id": str(u.get("id", "")),
                            "name": u.get("displayName") or u.get("plexUsername") or u.get("email", "?"),
                            "email": u.get("email", ""),
                            "plex_username": u.get("plexUsername", ""),
                        })
        except Exception as e:
            logger.warning("Erreur fetch users Overseerr: %s", e)
        return users

    async def get_requests_for_year(self, year: int, overseerr_user_id: int | None = None) -> dict:
        """Fetch all requests created during `year`, optionally filtered by user."""
        all_requests = []
        page = 1
        page_size = 50

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                while True:
                    params = {"take": page_size, "skip": (page - 1) * page_size, "sort": "added"}
                    if overseerr_user_id:
                        params["requestedBy"] = overseerr_user_id
                    resp = await client.get(
                        f"{self.base_url}/api/v1/request",
                        headers={"X-Api-Key": self.api_key},
                        params=params,
                    )
                    if resp.status_code != 200:
                        logger.warning("Overseerr requests HTTP %s", resp.status_code)
                        break

                    data = resp.json()
                    results = data.get("results", [])
                    if not results:
                        break

                    for req in results:
                        created = req.get("createdAt", "")
                        try:
                            dt = datetime.fromisoformat(created.replace("Z", "+00:00"))
                        except (ValueError, AttributeError):
                            continue

                        if dt.year < year:
                            # Requests are sorted by added date, older = stop
                            return self._build_summary(all_requests, year)
                        if dt.year == year:
                            all_requests.append(self._parse_request(req, dt))

                    # Check if we got all pages
                    total = data.get("pageInfo", {}).get("results", 0)
                    if page * page_size >= total:
                        break
                    page += 1

        except Exception as e:
            logger.warning("Erreur fetch requests Overseerr: %s", e)

        return self._build_summary(all_requests, year)

    def _parse_request(self, req: dict, dt: datetime) -> dict:
        media = req.get("media", {})
        media_type = req.get("type", media.get("mediaType", "unknown"))
        status_val = media.get("status", req.get("status", 0))
        # Overseerr statuses: 1=unknown, 2=pending, 3=processing, 4=partially_available, 5=available
        status_map = {1: "unknown", 2: "pending", 3: "processing", 4: "partial", 5: "available"}
        status = status_map.get(status_val, str(status_val))

        return {
            "id": req.get("id"),
            "type": "movie" if media_type == "movie" else "tv",
            "title": media.get("title") or media.get("name") or req.get("media", {}).get("title", "?"),
            "tmdb_id": media.get("tmdbId"),
            "poster": f"https://image.tmdb.org/t/p/w185{media.get('posterPath')}" if media.get("posterPath") else None,
            "status": status,
            "month": dt.month,
            "requested_by": req.get("requestedBy", {}).get("displayName")
                or req.get("requestedBy", {}).get("plexUsername", "?"),
        }

    def _build_summary(self, requests: list[dict], year: int) -> dict:
        if not requests:
            return {"total": 0, "movies": 0, "series": 0, "approved": 0, "pending": 0, "top": [], "monthly": [], "by_status": {}}

        movies = [r for r in requests if r["type"] == "movie"]
        series = [r for r in requests if r["type"] == "tv"]

        # Status counts
        by_status = {}
        for r in requests:
            by_status[r["status"]] = by_status.get(r["status"], 0) + 1

        # Monthly breakdown
        monthly_counts = {}
        month_names = ["Jan", "Fev", "Mar", "Avr", "Mai", "Juin", "Juil", "Aout", "Sep", "Oct", "Nov", "Dec"]
        for r in requests:
            m = month_names[r["month"] - 1]
            monthly_counts[m] = monthly_counts.get(m, 0) + 1
        monthly = [{"m": m, "v": monthly_counts.get(m, 0)} for m in month_names]

        # Top requested (deduplicate by title, count)
        title_map = {}
        for r in requests:
            key = r["title"].lower().strip()
            if key not in title_map:
                title_map[key] = {**r, "count": 0}
            title_map[key]["count"] += 1
        top = sorted(title_map.values(), key=lambda x: -x["count"])[:10]

        return {
            "total": len(requests),
            "movies": len(movies),
            "series": len(series),
            "approved": by_status.get("available", 0) + by_status.get("partial", 0),
            "pending": by_status.get("pending", 0) + by_status.get("processing", 0),
            "by_status": by_status,
            "monthly": monthly,
            "top": top,
        }

    async def match_requests_with_watched(self, requests_data: dict, watched_titles: list[str]) -> dict:
        """Cross-reference requests with what was actually watched."""
        if not requests_data.get("top"):
            return {"matched": [], "not_watched": [], "match_rate": 0}

        watched_set = {t.lower().strip() for t in watched_titles if t}
        matched = []
        not_watched = []

        for req in requests_data["top"]:
            title_lower = req["title"].lower().strip()
            if title_lower in watched_set:
                matched.append(req)
            else:
                not_watched.append(req)

        total = len(matched) + len(not_watched)
        return {
            "matched": matched,
            "not_watched": not_watched,
            "match_rate": round(len(matched) / total * 100) if total > 0 else 0,
        }
