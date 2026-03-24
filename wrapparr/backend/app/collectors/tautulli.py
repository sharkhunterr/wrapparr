import logging
from collections import Counter, defaultdict
from datetime import datetime

from app.collectors.base import BaseCollector, NormalizedData

logger = logging.getLogger("wrapparr.tautulli")


class TautulliCollector(BaseCollector):
    target_user: str | None = None

    async def test_connection(self) -> tuple[bool, str]:
        try:
            resp = await self.client.get(
                f"{self.base_url}/api/v2",
                params={"apikey": self.api_key, "cmd": "get_server_info"},
            )
            resp.raise_for_status()
            data = resp.json()
            if data.get("response", {}).get("result") == "success":
                name = data.get("response", {}).get("data", {}).get("pms_name", "")
                return True, f"Connexion Tautulli reussie ({name})"
            return False, data.get("response", {}).get("message", "Reponse inattendue")
        except Exception as e:
            return False, str(e)

    async def _api(self, cmd: str, **params) -> dict:
        resp = await self.client.get(
            f"{self.base_url}/api/v2",
            params={"apikey": self.api_key, "cmd": cmd, **params},
        )
        resp.raise_for_status()
        return resp.json().get("response", {}).get("data", {})

    def _poster_url(self, thumb: str) -> str:
        if not thumb:
            return ""
        # TMDB URLs are already absolute
        if thumb.startswith("http"):
            return thumb
        return f"{self.base_url}/api/v2?apikey={self.api_key}&cmd=pms_image_proxy&img={thumb}&width=300&height=450"

    async def _get_metadata(self, rating_key: str) -> dict:
        """Fetch metadata (genres, rating, etc.) for a single item."""
        try:
            data = await self._api("get_metadata", rating_key=str(rating_key))
            if data:
                return data
        except Exception:
            pass
        return {}

    async def collect(self, year: int) -> dict:
        params = {"length": "10000", "after": f"{year}-01-01", "before": f"{year + 1}-01-01"}
        if self.target_user:
            params["user"] = self.target_user

        history = await self._api("get_history", **params)
        users_table = await self._api("get_users_table", length="50")

        records = history.get("data", []) if isinstance(history, dict) else []

        # Count plays per movie/series — single pass
        movie_rk = Counter()
        series_rk = Counter()
        for r in records:
            rk = r.get("rating_key")
            media = r.get("media_type")
            if media == "movie" and rk:
                movie_rk[rk] += 1
            elif media == "episode":
                grk = r.get("grandparent_rating_key") or rk
                if grk:
                    series_rk[grk] += 1

        # ── Build rk → (title, year, thumb) mapping from history ──
        rk_info = {}
        for r in records:
            rk = r.get("rating_key")
            if rk and rk not in rk_info:
                rk_info[rk] = {
                    "title": r.get("full_title") or r.get("title", ""),
                    "year": r.get("year", 0),
                    "thumb": r.get("thumb", ""),
                }

        movies_to_fetch = [rk for rk, _ in movie_rk.most_common(100)]
        series_to_fetch = [rk for rk, _ in series_rk.most_common(20)]

        metadata = {}
        countries_by_rk = {}
        credits_by_rk = {}

        if self.tmdb_api_key:
            # ── TMDB is the single enrichment source ──
            logger.info("TMDB configured — using as enrichment source for %d movies", len(movies_to_fetch))

            # First pass: get Tautulli metadata to extract TMDB IDs (guids)
            tautulli_meta = {}
            for rk in movies_to_fetch + series_to_fetch:
                meta = await self._get_metadata(rk)
                if meta and (meta.get("title") or meta.get("year")):
                    tautulli_meta[str(rk)] = meta

            # Second pass: enrich movies via TMDB
            for rk in movies_to_fetch:
                srk = str(rk)
                tau_meta = tautulli_meta.get(srk, {})
                tmdb_data = None

                # Try TMDB ID from Tautulli guids first
                tmdb_id = self._extract_tmdb_id(tau_meta.get("guids", []))
                if tmdb_id:
                    tmdb_data = await self._fetch_tmdb_movie(tmdb_id)

                # Otherwise search TMDB by title+year
                if not tmdb_data:
                    info = rk_info.get(rk, {})
                    title = info.get("title") or tau_meta.get("title", "")
                    year_val = info.get("year") or tau_meta.get("year", 0)
                    if title:
                        tmdb_data = await self._search_tmdb_movie(title, year_val)

                if tmdb_data:
                    metadata[srk] = self._tmdb_to_metadata(tmdb_data)
                    # Also keep Tautulli thumb/art as fallback if TMDB has none
                    if not metadata[srk].get("thumb") and tau_meta.get("thumb"):
                        metadata[srk]["thumb"] = tau_meta["thumb"]
                    countries = tmdb_data.get("production_countries", [])
                    if countries:
                        countries_by_rk[srk] = [{"code": c["iso_3166_1"], "name": c.get("name", c["iso_3166_1"])} for c in countries]
                    credits = tmdb_data.get("credits")
                    if credits:
                        credits_by_rk[srk] = credits
                elif tau_meta:
                    # TMDB failed entirely — use Tautulli data
                    metadata[srk] = tau_meta

            # Series: enrich via TMDB TV API
            for rk in series_to_fetch:
                srk = str(rk)
                tau_meta = tautulli_meta.get(srk, {})
                tmdb_data = None

                # Try TMDB ID from guids
                tmdb_id = self._extract_tmdb_id(tau_meta.get("guids", []))
                if tmdb_id:
                    tmdb_data = await self._fetch_tmdb_tv(tmdb_id)

                # Search by title
                if not tmdb_data:
                    info = rk_info.get(rk, {})
                    title = info.get("title") or tau_meta.get("title", "")
                    if title:
                        tmdb_data = await self._search_tmdb_tv(title)

                if tmdb_data:
                    metadata[srk] = self._tmdb_tv_to_metadata(tmdb_data)
                    if not metadata[srk].get("thumb") and tau_meta.get("thumb"):
                        metadata[srk]["thumb"] = tau_meta["thumb"]
                    # aggregate_credits for TV
                    agg_credits = tmdb_data.get("aggregate_credits")
                    if agg_credits:
                        # Normalize to same format as movie credits
                        cast = []
                        for member in agg_credits.get("cast", [])[:15]:
                            cast.append({
                                "id": member.get("id"),
                                "name": member.get("name", "?"),
                                "profile_path": member.get("profile_path"),
                                "order": member.get("order", 99),
                            })
                        credits_by_rk[srk] = {"cast": cast, "crew": []}
                elif tau_meta:
                    metadata[srk] = tau_meta

        else:
            # ── No TMDB — Tautulli only ──
            logger.info("No TMDB key — using Tautulli metadata only")
            for rk in movies_to_fetch + series_to_fetch:
                meta = await self._get_metadata(rk)
                if meta and (meta.get("title") or meta.get("year")):
                    metadata[str(rk)] = meta

        return {"history": history, "users": users_table, "metadata": metadata, "countries": countries_by_rk, "credits": credits_by_rk, "year": year, "base_url": self.base_url}

    def _extract_tmdb_id(self, guids):
        if not guids:
            return None
        for g in guids:
            s = g if isinstance(g, str) else g.get("id", "")
            if s.startswith("tmdb://"):
                return s.replace("tmdb://", "")
        return None

    async def _fetch_tmdb_movie(self, tmdb_id: str) -> dict:
        """Fetch full movie details from TMDB (genres, rating, countries, poster)."""
        try:
            resp = await self.client.get(
                f"https://api.themoviedb.org/3/movie/{tmdb_id}",
                params={"api_key": self.tmdb_api_key, "language": "fr-FR", "append_to_response": "credits"},
            )
            if resp.status_code == 200:
                return resp.json()
        except Exception as e:
            logger.debug("TMDB fetch error for %s: %s", tmdb_id, e)
        return {}

    async def _search_tmdb_movie(self, title: str, year: int = 0) -> dict:
        """Search TMDB by title+year, return first match details or {}."""
        try:
            params = {"api_key": self.tmdb_api_key, "language": "fr-FR", "query": title}
            if year and year > 1900:
                params["year"] = year
            resp = await self.client.get(
                "https://api.themoviedb.org/3/search/movie", params=params,
            )
            if resp.status_code == 200:
                results = resp.json().get("results", [])
                if results:
                    return await self._fetch_tmdb_movie(str(results[0]["id"]))
        except Exception as e:
            logger.debug("TMDB search error for '%s': %s", title, e)
        return {}

    def _tmdb_to_metadata(self, tmdb: dict) -> dict:
        """Convert TMDB movie data to Tautulli-like metadata dict."""
        if not tmdb:
            return {}
        poster = tmdb.get("poster_path", "")
        return {
            "title": tmdb.get("title", ""),
            "year": int(tmdb.get("release_date", "0000")[:4]) if tmdb.get("release_date") else 0,
            "genres": [g["name"] for g in tmdb.get("genres", [])],
            "audience_rating": str(round(tmdb.get("vote_average", 0), 1)) if tmdb.get("vote_average") else "",
            "rating": "",
            "thumb": f"https://image.tmdb.org/t/p/w300{poster}" if poster else "",
            "art": "",
            "production_countries": tmdb.get("production_countries", []),
            "budget": tmdb.get("budget", 0),
            "revenue": tmdb.get("revenue", 0),
            "runtime": tmdb.get("runtime", 0),
            "_source": "tmdb",
        }

    async def _fetch_tmdb_tv(self, tmdb_id: str) -> dict:
        """Fetch TV series details + credits from TMDB."""
        try:
            resp = await self.client.get(
                f"https://api.themoviedb.org/3/tv/{tmdb_id}",
                params={"api_key": self.tmdb_api_key, "language": "fr-FR", "append_to_response": "aggregate_credits"},
            )
            if resp.status_code == 200:
                return resp.json()
        except Exception as e:
            logger.debug("TMDB TV fetch error for %s: %s", tmdb_id, e)
        return {}

    async def _search_tmdb_tv(self, title: str, year: int = 0) -> dict:
        """Search TMDB TV by title, return first match details or {}."""
        try:
            params = {"api_key": self.tmdb_api_key, "language": "fr-FR", "query": title}
            if year and year > 1900:
                params["first_air_date_year"] = year
            resp = await self.client.get(
                "https://api.themoviedb.org/3/search/tv", params=params,
            )
            if resp.status_code == 200:
                results = resp.json().get("results", [])
                if results:
                    return await self._fetch_tmdb_tv(str(results[0]["id"]))
        except Exception as e:
            logger.debug("TMDB TV search error for '%s': %s", title, e)
        return {}

    def _tmdb_tv_to_metadata(self, tmdb: dict) -> dict:
        """Convert TMDB TV data to metadata dict."""
        if not tmdb:
            return {}
        poster = tmdb.get("poster_path", "")
        return {
            "title": tmdb.get("name", ""),
            "year": int(tmdb.get("first_air_date", "0000")[:4]) if tmdb.get("first_air_date") else 0,
            "genres": [g["name"] for g in tmdb.get("genres", [])],
            "audience_rating": str(round(tmdb.get("vote_average", 0), 1)) if tmdb.get("vote_average") else "",
            "rating": "",
            "thumb": f"https://image.tmdb.org/t/p/w300{poster}" if poster else "",
            "art": "",
            "_source": "tmdb",
        }

    async def _fetch_tmdb_countries(self, tmdb_id):
        data = await self._fetch_tmdb_movie(tmdb_id)
        if data:
            return [{"code": c["iso_3166_1"], "name": c.get("name", c["iso_3166_1"])} for c in data.get("production_countries", [])]
        return []

    def normalize(self, raw: dict) -> NormalizedData:
        history = raw.get("history", {})
        records = history.get("data", []) if isinstance(history, dict) else []
        metadata = raw.get("metadata", {})

        films = [r for r in records if r.get("media_type") == "movie"]
        series = [r for r in records if r.get("media_type") == "episode"]

        # ── Build COMPLETE film/series lists from the unified metadata ──
        all_films = self._build_all_films(films, metadata)
        all_series = self._build_all_series(series, metadata)

        # top = podium (first 4), all = all enriched films for other slides
        top_films = all_films[:4]
        top_series = all_series[:4]

        genres = self._build_genres(records, metadata)
        day_of_week = self._build_day_of_week(records)
        time_of_day = self._build_time_of_day(records)
        monthly = self._build_monthly(records)
        ranking = self._build_ranking(raw)

        total_h_films = sum(r.get("duration", 0) for r in films) / 3600
        total_h_series = sum(r.get("duration", 0) for r in series) / 3600

        # Backdrop art from #1 film (for podium background)
        backdrop = top_films[0].get("art", "") if top_films else ""

        return NormalizedData(
            service_type="tautulli",
            total_items=len(films) + len(series),
            total_hours=total_h_films + total_h_series,
            top=top_films,
            genres=genres,
            day_of_week=day_of_week,
            time_of_day=time_of_day,
            monthly=monthly,
            ranking=ranking,
            extra={
                "films": {"total": len(films), "hours": round(total_h_films, 1), "top": all_films},
                "series": {"episodes": len(series), "hours": round(total_h_series, 1), "top": all_series},
                "backdrop": backdrop,
                "top_genres": genres[:6],
                "series_genres": self._build_genres(series, metadata)[:6],
                "countries": self._build_countries(films, raw.get("countries", {})),
                "ratings": self._build_ratings(all_films),
                "actors": self._build_actors(films, raw.get("credits", {})),
                "directors": self._build_directors(films, raw.get("credits", {})),
                "series_actors": self._build_actors(series, raw.get("credits", {})),
                "budgets": self._build_budgets(all_films),
            },
        )

    @staticmethod
    def _build_budgets(all_films: list) -> dict:
        """Build budget analysis from enriched films."""
        films_with_budget = [f for f in all_films if f.get("budget", 0) > 0]
        if not films_with_budget:
            return {}

        budgets = [f["budget"] for f in films_with_budget]
        avg = sum(budgets) / len(budgets)
        total = sum(budgets)

        # Top budgets
        sorted_by_budget = sorted(films_with_budget, key=lambda f: -f["budget"])
        top_expensive = [{"t": f["t"], "budget": f["budget"], "thumb": f.get("thumb", "")} for f in sorted_by_budget[:3]]
        top_cheap = [{"t": f["t"], "budget": f["budget"], "thumb": f.get("thumb", "")} for f in sorted_by_budget[-3:] if f["budget"] > 0]

        # Revenue vs budget (ROI)
        films_with_revenue = [f for f in films_with_budget if f.get("revenue", 0) > 0]
        best_roi = []
        if films_with_revenue:
            for f in films_with_revenue:
                roi = (f["revenue"] - f["budget"]) / f["budget"] * 100
                best_roi.append({"t": f["t"], "roi": round(roi), "budget": f["budget"], "revenue": f["revenue"]})
            best_roi.sort(key=lambda x: -x["roi"])

        # Budget brackets
        brackets = [
            {"label": "< 5M$", "min": 0, "max": 5_000_000},
            {"label": "5-20M$", "min": 5_000_000, "max": 20_000_000},
            {"label": "20-50M$", "min": 20_000_000, "max": 50_000_000},
            {"label": "50-100M$", "min": 50_000_000, "max": 100_000_000},
            {"label": "100-200M$", "min": 100_000_000, "max": 200_000_000},
            {"label": "> 200M$", "min": 200_000_000, "max": 999_999_999_999},
        ]
        distribution = []
        for b in brackets:
            count = sum(1 for f in films_with_budget if b["min"] <= f["budget"] < b["max"])
            if count > 0:
                distribution.append({"label": b["label"], "count": count})

        return {
            "count": len(films_with_budget),
            "average": round(avg),
            "total": total,
            "top_expensive": top_expensive,
            "top_cheap": top_cheap,
            "distribution": distribution,
            "best_roi": best_roi[:3],
            "all_budgets": sorted([{"t": f["t"], "budget": f["budget"]} for f in films_with_budget], key=lambda x: x["budget"]),
        }

    def _build_ratings(self, all_films: list) -> list:
        """Extract ratings from the centralized film list."""
        ratings = []
        for f in all_films:
            r = f.get("r") or 0
            if r and float(r) > 0:
                ratings.append({"t": f["t"], "r": round(float(r), 1)})
        return sorted(ratings, key=lambda x: -x["r"])

    def _build_actors(self, records: list, credits_by_rk: dict) -> list:
        """Build top actors appearing in multiple items (films or series)."""
        PHOTO_BASE = "https://image.tmdb.org/t/p/w185"
        people = defaultdict(lambda: {"name": "", "photo": "", "items": {}})

        seen_rk = set()
        for r in records:
            rk = str(r.get("rating_key", ""))
            grk = str(r.get("grandparent_rating_key", "") or "")
            # Deduplicate by unique item key (grandparent for episodes, rating_key for movies)
            item_key = grk if grk and grk != "" else rk
            if item_key in seen_rk:
                continue
            seen_rk.add(item_key)
            title = r.get("grandparent_title") or r.get("full_title") or r.get("title", "?")
            credits = credits_by_rk.get(grk, {}) or credits_by_rk.get(rk, {})
            for member in credits.get("cast", [])[:10]:
                pid = member.get("id")
                if not pid:
                    continue
                p = people[pid]
                p["name"] = member.get("name", "?")
                profile = member.get("profile_path") or ""
                if profile and not p["photo"]:
                    p["photo"] = f"{PHOTO_BASE}{profile}"
                p["items"][item_key] = title

        result = []
        for pid, p in people.items():
            if len(p["items"]) >= 2:
                result.append({
                    "id": pid,
                    "name": p["name"],
                    "photo": p["photo"],
                    "count": len(p["items"]),
                    "films": sorted(set(p["items"].values()))[:5],
                })
        return sorted(result, key=lambda x: -x["count"])[:10]

    def _build_directors(self, records: list, credits_by_rk: dict) -> list:
        """Build top directors appearing in multiple items."""
        PHOTO_BASE = "https://image.tmdb.org/t/p/w185"
        people = defaultdict(lambda: {"name": "", "photo": "", "items": {}})

        seen_rk = set()
        for r in records:
            rk = str(r.get("rating_key", ""))
            grk = str(r.get("grandparent_rating_key", "") or "")
            item_key = grk if grk and grk != "" else rk
            if item_key in seen_rk:
                continue
            seen_rk.add(item_key)
            title = r.get("grandparent_title") or r.get("full_title") or r.get("title", "?")
            credits = credits_by_rk.get(grk, {}) or credits_by_rk.get(rk, {})
            for member in credits.get("crew", []):
                if member.get("job") != "Director":
                    continue
                pid = member.get("id")
                if not pid:
                    continue
                p = people[pid]
                p["name"] = member.get("name", "?")
                profile = member.get("profile_path") or ""
                if profile and not p["photo"]:
                    p["photo"] = f"{PHOTO_BASE}{profile}"
                p["items"][item_key] = title

        result = []
        for pid, p in people.items():
            if len(p["items"]) >= 2:
                result.append({
                    "id": pid,
                    "name": p["name"],
                    "photo": p["photo"],
                    "count": len(p["items"]),
                    "films": sorted(set(p["items"].values()))[:5],
                })
        return sorted(result, key=lambda x: -x["count"])[:10]

    def _build_countries(self, films: list, countries_by_rk: dict) -> list:
        count = Counter()
        names = {}
        for r in films:
            rk = str(r.get("rating_key", ""))
            plays = 1
            for c in countries_by_rk.get(rk, []):
                code = c["code"]
                count[code] += plays
                names[code] = c["name"]
        return sorted([{"code": k, "name": names.get(k, k), "count": v} for k, v in count.items()], key=lambda x: -x["count"])

    @staticmethod
    def _to_rating(val) -> float:
        """Convert a rating value (string, float, None) to float."""
        if not val:
            return 0
        try:
            return round(float(val), 1)
        except (ValueError, TypeError):
            return 0

    def _build_all_films(self, films: list, metadata: dict) -> list:
        """Build enriched list of ALL films, sorted by plays (most common first).

        Films with metadata get full enrichment (genres, rating, poster, year).
        Films without metadata still appear with basic info from history records.
        """
        plays = Counter()
        info = {}
        for r in films:
            title = r.get("full_title") or r.get("title", "?")
            rk = str(r.get("rating_key", ""))
            plays[title] += 1
            if title not in info:
                meta = metadata.get(rk, {})
                raw_r = meta.get("audience_rating") or meta.get("rating") or 0
                info[title] = {
                    "t": title,
                    "y": meta.get("year") or r.get("year", 0),
                    "date": r.get("originally_available_at", ""),
                    "g": ", ".join(meta.get("genres", [])[:2]) if meta.get("genres") else "",
                    "r": self._to_rating(raw_r),
                    "h": 0,
                    "thumb": self._poster_url(meta.get("thumb") or r.get("thumb", "")),
                    "art": self._poster_url(meta.get("art", "")),
                    "rk": rk,
                    "budget": meta.get("budget", 0),
                    "revenue": meta.get("revenue", 0),
                    "runtime": meta.get("runtime", 0),
                    "_enriched": bool(meta),
                }
            info[title]["h"] += r.get("duration", 0) / 3600

        result = []
        for i, (title, count) in enumerate(plays.most_common()):
            entry = {**info[title], "rank": i + 1, "plays": count, "h": round(info[title]["h"], 1)}
            result.append(entry)
        return result

    def _build_all_series(self, series: list, metadata: dict) -> list:
        """Build enriched list of ALL series, sorted by episode count."""
        plays = Counter()
        info = {}
        for r in series:
            show = r.get("grandparent_title") or r.get("title", "?")
            grk = str(r.get("grandparent_rating_key") or r.get("rating_key", ""))
            plays[show] += 1
            if show not in info:
                meta = metadata.get(grk, {})
                raw_r = meta.get("audience_rating") or meta.get("rating") or 0
                info[show] = {
                    "t": show,
                    "g": ", ".join(meta.get("genres", [])[:2]) if meta.get("genres") else "",
                    "r": self._to_rating(raw_r),
                    "ep": 0,
                    "thumb": self._poster_url(meta.get("thumb") or r.get("grandparent_thumb") or r.get("thumb", "")),
                    "art": self._poster_url(meta.get("art", "")),
                    "_enriched": bool(meta),
                }
            info[show]["ep"] = plays[show]

        result = []
        for i, (show, count) in enumerate(plays.most_common()):
            result.append({**info[show], "rank": i + 1, "ep": count})
        return result

    def _build_genres(self, records: list, metadata: dict) -> list:
        count = Counter()
        # First try from metadata (reliable)
        seen_rk = set()
        for r in records:
            rk = str(r.get("rating_key", ""))
            grk = str(r.get("grandparent_rating_key", ""))
            key = grk or rk
            if key in seen_rk:
                continue
            seen_rk.add(key)
            meta = metadata.get(key, {})
            for g in meta.get("genres", []):
                count[g] += 1
        # Fallback from history genres field
        if not count:
            for r in records:
                g_str = r.get("genres") or ""
                for g in g_str.split(","):
                    g = g.strip()
                    if g:
                        count[g] += 1
        return [{"n": k, "v": v} for k, v in count.most_common(8)]

    def _build_day_of_week(self, records: list) -> list:
        names = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
        count = defaultdict(int)
        for r in records:
            ts = r.get("started")
            if ts:
                try:
                    count[datetime.fromtimestamp(ts).weekday()] += 1
                except (ValueError, OSError):
                    pass
        return [{"d": names[i], "v": count.get(i, 0)} for i in range(7)]

    def _build_time_of_day(self, records: list) -> list:
        count = defaultdict(int)
        for r in records:
            ts = r.get("started")
            if ts:
                try:
                    h = datetime.fromtimestamp(ts).hour
                    # Group by 2h slots
                    slot = (h // 2) * 2
                    count[slot] += 1
                except (ValueError, OSError):
                    pass
        slots = sorted(count.keys())
        return [{"h": f"{s}h", "v": count[s]} for s in slots]

    def _build_monthly(self, records: list) -> list:
        names = ["Jan", "Fev", "Mar", "Avr", "Mai", "Jun", "Jul", "Aou", "Sep", "Oct", "Nov", "Dec"]
        count = defaultdict(int)
        for r in records:
            ts = r.get("started")
            if ts:
                try:
                    count[datetime.fromtimestamp(ts).month - 1] += 1
                except (ValueError, OSError):
                    pass
        return [{"m": names[i], "v": count.get(i, 0)} for i in range(12)]

    def _build_ranking(self, raw: dict) -> list:
        users_data = raw.get("users", {})
        users_list = users_data.get("data", []) if isinstance(users_data, dict) else []
        return sorted(
            [{"n": u.get("friendly_name", "?"), "v": round(u.get("duration", 0) / 3600)} for u in users_list if u.get("duration")],
            key=lambda x: -x["v"],
        )[:6]
