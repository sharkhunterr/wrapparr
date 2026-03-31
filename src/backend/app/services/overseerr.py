"""Overseerr client — fetches media requests for recap enrichment."""
import logging
from datetime import datetime

import httpx

logger = logging.getLogger("wrapparr.overseerr")


class OverseerrClient:
    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self._media_cache: dict[str, dict] = {}  # "movie:12345" -> {title, poster, ...}

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

    async def _resolve_media(self, client: httpx.AsyncClient, media_type: str, tmdb_id: int) -> dict:
        """Resolve tmdb_id to title + poster via Overseerr's own endpoints."""
        cache_key = f"{media_type}:{tmdb_id}"
        if cache_key in self._media_cache:
            return self._media_cache[cache_key]

        endpoint = "movie" if media_type == "movie" else "tv"
        try:
            resp = await client.get(
                f"{self.base_url}/api/v1/{endpoint}/{tmdb_id}",
                headers={"X-Api-Key": self.api_key},
            )
            if resp.status_code == 200:
                d = resp.json()
                info = {
                    "title": d.get("title") or d.get("name") or d.get("originalTitle") or "?",
                    "poster": f"https://image.tmdb.org/t/p/w185{d['posterPath']}" if d.get("posterPath") else None,
                    "year": (d.get("releaseDate") or d.get("firstAirDate") or "")[:4],
                }
                self._media_cache[cache_key] = info
                return info
        except Exception:
            pass

        fallback = {"title": "?", "poster": None, "year": ""}
        self._media_cache[cache_key] = fallback
        return fallback

    async def get_requests_for_year(self, year: int, overseerr_user_id: int | None = None) -> dict:
        all_requests = []
        page = 1
        page_size = 50

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                # Phase 1: collect raw requests
                raw_requests = []
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
                            break
                        if dt.year == year:
                            raw_requests.append((req, dt))

                    # Stop if we went past the target year
                    if results:
                        last_created = results[-1].get("createdAt", "")
                        try:
                            last_dt = datetime.fromisoformat(last_created.replace("Z", "+00:00"))
                            if last_dt.year < year:
                                break
                        except (ValueError, AttributeError):
                            pass

                    total = data.get("pageInfo", {}).get("results", 0)
                    if page * page_size >= total:
                        break
                    page += 1

                # Phase 2: resolve media details (batch, with cache)
                for req, dt in raw_requests:
                    parsed = await self._parse_request(client, req, dt)
                    all_requests.append(parsed)

        except Exception as e:
            logger.warning("Erreur fetch requests Overseerr: %s", e)

        return self._build_summary(all_requests, year)

    async def _parse_request(self, client: httpx.AsyncClient, req: dict, dt: datetime) -> dict:
        media = req.get("media", {})
        media_type = req.get("type", media.get("mediaType", "unknown"))
        tmdb_id = media.get("tmdbId")

        status_val = media.get("status", req.get("status", 0))
        status_map = {1: "unknown", 2: "pending", 3: "processing", 4: "partial", 5: "available"}
        status = status_map.get(status_val, str(status_val))

        # Resolve title + poster from Overseerr
        if tmdb_id:
            info = await self._resolve_media(client, media_type, tmdb_id)
        else:
            info = {"title": "?", "poster": None, "year": ""}

        return {
            "id": req.get("id"),
            "type": "movie" if media_type == "movie" else "tv",
            "title": info["title"],
            "tmdb_id": tmdb_id,
            "poster": info["poster"],
            "year": info["year"],
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

        # Top requested (deduplicate by tmdb_id)
        title_map = {}
        for r in requests:
            key = str(r.get("tmdb_id") or "") or r["title"].lower().strip()
            if key not in title_map:
                title_map[key] = {**r, "count": 0}
            title_map[key]["count"] += 1
        top = sorted(title_map.values(), key=lambda x: -x["count"])[:10]

        # Top requesters
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
            "all_requests": requests,
            "top_requesters": top_requesters,
        }

    def match_requests_with_watched(self, requests_data: dict, watched_items: list[dict]) -> dict:
        """Cross-reference requests with watched content using tmdb_id + fuzzy title."""
        all_reqs = requests_data.get("all_requests", [])
        if not all_reqs:
            return {"matched": [], "not_watched": [], "match_rate": 0}

        # Build lookup sets
        watched_tmdb_ids = set()
        watched_titles = set()
        for item in watched_items:
            if item.get("tmdb_id"):
                watched_tmdb_ids.add(str(item["tmdb_id"]))
            if item.get("t"):
                watched_titles.add(item["t"].lower().strip())

        # Deduplicate requests
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
            # Match by tmdb_id (most reliable)
            if r.get("tmdb_id") and str(r["tmdb_id"]) in watched_tmdb_ids:
                is_match = True
            # Fallback: fuzzy title
            if not is_match and r["title"] != "?":
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
            "matched": matched[:20],
            "not_watched": not_watched[:20],
            "matched_count": len(matched),
            "not_watched_count": len(not_watched),
            "match_rate": round(len(matched) / total * 100) if total > 0 else 0,
        }
