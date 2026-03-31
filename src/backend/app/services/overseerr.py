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
                            "requests_count": u.get("requestCount", 0),
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
                            return self._build_summary(all_requests, year)
                        if dt.year == year:
                            all_requests.append(self._parse_request(req, dt))

                    total = data.get("pageInfo", {}).get("results", 0)
                    if page * page_size >= total:
                        break
                    page += 1

        except Exception as e:
            logger.warning("Erreur fetch requests Overseerr: %s", e)

        return self._build_summary(all_requests, year)

    async def get_all_requests_for_year(self, year: int) -> dict:
        """Fetch ALL requests (all users) for community-level stats."""
        return await self.get_requests_for_year(year, overseerr_user_id=None)

    def _parse_request(self, req: dict, dt: datetime) -> dict:
        media = req.get("media", {})
        media_type = req.get("type", media.get("mediaType", "unknown"))
        status_val = media.get("status", req.get("status", 0))
        status_map = {1: "unknown", 2: "pending", 3: "processing", 4: "partial", 5: "available"}
        status = status_map.get(status_val, str(status_val))

        return {
            "id": req.get("id"),
            "type": "movie" if media_type == "movie" else "tv",
            "title": media.get("title") or media.get("name") or "?",
            "tmdb_id": media.get("tmdbId"),
            "poster": f"https://image.tmdb.org/t/p/w185{media.get('posterPath')}" if media.get("posterPath") else None,
            "status": status,
            "month": dt.month,
            "requested_by": req.get("requestedBy", {}).get("displayName")
                or req.get("requestedBy", {}).get("plexUsername", "?"),
            "requested_by_id": req.get("requestedBy", {}).get("id"),
        }

    def _build_summary(self, requests: list[dict], year: int) -> dict:
        if not requests:
            return {"total": 0, "movies": 0, "series": 0, "approved": 0, "pending": 0,
                    "top": [], "all_requests": [], "monthly": [], "by_status": {},
                    "top_requesters": []}

        movies = [r for r in requests if r["type"] == "movie"]
        series = [r for r in requests if r["type"] == "tv"]

        by_status = {}
        for r in requests:
            by_status[r["status"]] = by_status.get(r["status"], 0) + 1

        month_names = ["Jan", "Fev", "Mar", "Avr", "Mai", "Juin", "Juil", "Aout", "Sep", "Oct", "Nov", "Dec"]
        monthly_counts = {}
        for r in requests:
            m = month_names[r["month"] - 1]
            monthly_counts[m] = monthly_counts.get(m, 0) + 1
        monthly = [{"m": m, "v": monthly_counts.get(m, 0)} for m in month_names]

        # Top requested (deduplicate by tmdb_id or title)
        title_map = {}
        for r in requests:
            key = str(r.get("tmdb_id") or "") or r["title"].lower().strip()
            if key not in title_map:
                title_map[key] = {**r, "count": 0}
            title_map[key]["count"] += 1
        top = sorted(title_map.values(), key=lambda x: -x["count"])[:10]

        # Top requesters (community level)
        requester_map = {}
        for r in requests:
            name = r.get("requested_by", "?")
            if name not in requester_map:
                requester_map[name] = 0
            requester_map[name] += 1
        top_requesters = sorted(
            [{"name": n, "count": c} for n, c in requester_map.items()],
            key=lambda x: -x["count"]
        )[:10]

        return {
            "total": len(requests),
            "movies": len(movies),
            "series": len(series),
            "approved": by_status.get("available", 0) + by_status.get("partial", 0),
            "pending": by_status.get("pending", 0) + by_status.get("processing", 0),
            "by_status": by_status,
            "monthly": monthly,
            "top": top,
            "all_requests": requests,  # Keep all for matching
            "top_requesters": top_requesters,
        }

    def match_requests_with_watched(self, requests_data: dict, watched_items: list[dict]) -> dict:
        """Cross-reference requests with watched content using tmdb_id + fuzzy title."""
        all_reqs = requests_data.get("all_requests", [])
        if not all_reqs:
            return {"matched": [], "not_watched": [], "match_rate": 0}

        # Build lookup sets from watched items
        watched_tmdb_ids = set()
        watched_titles = set()
        for item in watched_items:
            if item.get("tmdb_id"):
                watched_tmdb_ids.add(str(item["tmdb_id"]))
            if item.get("t"):
                watched_titles.add(item["t"].lower().strip())

        # Deduplicate requests by tmdb_id/title
        seen = set()
        unique_reqs = []
        for r in all_reqs:
            key = str(r.get("tmdb_id") or "") or r["title"].lower().strip()
            if key not in seen:
                seen.add(key)
                unique_reqs.append(r)

        matched = []
        not_watched = []
        for r in unique_reqs:
            is_match = False
            # Match by tmdb_id first (most reliable)
            if r.get("tmdb_id") and str(r["tmdb_id"]) in watched_tmdb_ids:
                is_match = True
            # Fallback: fuzzy title match
            if not is_match:
                req_title = r["title"].lower().strip()
                for wt in watched_titles:
                    if req_title == wt or req_title in wt or wt in req_title:
                        is_match = True
                        break
            if is_match:
                matched.append(r)
            else:
                not_watched.append(r)

        total = len(matched) + len(not_watched)
        return {
            "matched": matched[:10],
            "not_watched": not_watched[:10],
            "match_rate": round(len(matched) / total * 100) if total > 0 else 0,
        }

    def compute_popular_requests(self, requests_data: dict, all_users_watched: dict) -> list[dict]:
        """Find requests that were watched by the most users (popularity score)."""
        all_reqs = requests_data.get("all_requests", [])
        if not all_reqs:
            return []

        # Build per-user watched tmdb_ids and titles
        user_watched = {}  # user_name -> set of tmdb_ids/titles
        for uid, udata in all_users_watched.items():
            titles = set()
            tmdb_ids = set()
            for item in udata.get("top", []):
                if item.get("t"):
                    titles.add(item["t"].lower().strip())
                if item.get("tmdb_id"):
                    tmdb_ids.add(str(item["tmdb_id"]))
            for section in ("films", "series"):
                for item in udata.get("extra", {}).get(section, {}).get("top", []):
                    if item.get("t"):
                        titles.add(item["t"].lower().strip())
                    if item.get("tmdb_id"):
                        tmdb_ids.add(str(item["tmdb_id"]))
            user_watched[uid] = {"titles": titles, "tmdb_ids": tmdb_ids}

        # For each unique request, count how many users watched it
        seen = set()
        results = []
        for r in all_reqs:
            key = str(r.get("tmdb_id") or "") or r["title"].lower().strip()
            if key in seen:
                continue
            seen.add(key)

            viewers = 0
            viewer_names = []
            req_title = r["title"].lower().strip()
            req_tmdb = str(r.get("tmdb_id") or "")

            for uid, wdata in user_watched.items():
                matched = False
                if req_tmdb and req_tmdb in wdata["tmdb_ids"]:
                    matched = True
                if not matched:
                    for wt in wdata["titles"]:
                        if req_title == wt or req_title in wt or wt in req_title:
                            matched = True
                            break
                if matched:
                    viewers += 1
                    viewer_names.append(uid)

            results.append({
                **r,
                "viewers": viewers,
                "viewer_names": viewer_names,
                "total_users": len(user_watched),
            })

        return sorted(results, key=lambda x: (-x["viewers"], -x.get("count", 0)))[:10]
