from collections import Counter, defaultdict
from datetime import datetime

from app.collectors.base import BaseCollector, NormalizedData


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

        # Find top movie rating_keys and top series grandparent_rating_keys separately
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

        # Fetch metadata for top 4 movies + top 4 series
        metadata = {}
        to_fetch = [rk for rk, _ in movie_rk.most_common(4)] + [rk for rk, _ in series_rk.most_common(4)]
        for rk in to_fetch:
            meta = await self._get_metadata(rk)
            if meta:
                metadata[str(rk)] = meta

        return {"history": history, "users": users_table, "metadata": metadata, "year": year, "base_url": self.base_url}

    def normalize(self, raw: dict) -> NormalizedData:
        history = raw.get("history", {})
        records = history.get("data", []) if isinstance(history, dict) else []
        metadata = raw.get("metadata", {})

        films = [r for r in records if r.get("media_type") == "movie"]
        series = [r for r in records if r.get("media_type") == "episode"]

        top_films = self._build_top_films(films, metadata)
        top_series = self._build_top_series(series, metadata)
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
                "films": {"total": len(films), "hours": round(total_h_films, 1), "top": top_films},
                "series": {"episodes": len(series), "hours": round(total_h_series, 1), "top": top_series},
                "backdrop": backdrop,
                "top_genres": genres[:6],
            },
        )

    def _build_top_films(self, films: list, metadata: dict) -> list:
        plays = Counter()
        info = {}
        for r in films:
            title = r.get("full_title") or r.get("title", "?")
            rk = str(r.get("rating_key", ""))
            plays[title] += 1
            if title not in info:
                meta = metadata.get(rk, {})
                info[title] = {
                    "t": title,
                    "y": meta.get("year") or r.get("year", 0),
                    "date": r.get("originally_available_at", ""),
                    "g": ", ".join(meta.get("genres", [])[:2]) if meta.get("genres") else "",
                    "r": meta.get("audience_rating") or meta.get("rating") or 0,
                    "h": 0,
                    "thumb": self._poster_url(meta.get("thumb") or r.get("thumb", "")),
                    "art": self._poster_url(meta.get("art", "")),
                    "rk": rk,
                }
            info[title]["h"] += r.get("duration", 0) / 3600

        result = []
        for i, (title, count) in enumerate(plays.most_common(4)):
            entry = {**info[title], "rank": i + 1, "plays": count, "h": round(info[title]["h"], 1)}
            result.append(entry)
        return result

    def _build_top_series(self, series: list, metadata: dict) -> list:
        plays = Counter()
        info = {}
        for r in series:
            show = r.get("grandparent_title") or r.get("title", "?")
            grk = str(r.get("grandparent_rating_key") or r.get("rating_key", ""))
            plays[show] += 1
            if show not in info:
                meta = metadata.get(grk, {})
                info[show] = {
                    "t": show,
                    "g": ", ".join(meta.get("genres", [])[:2]) if meta.get("genres") else "",
                    "r": meta.get("audience_rating") or meta.get("rating") or 0,
                    "ep": 0,
                    "thumb": self._poster_url(meta.get("thumb") or r.get("grandparent_thumb") or r.get("thumb", "")),
                    "art": self._poster_url(meta.get("art", "")),
                }
            info[show]["ep"] = plays[show]

        result = []
        for i, (show, count) in enumerate(plays.most_common(4)):
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
