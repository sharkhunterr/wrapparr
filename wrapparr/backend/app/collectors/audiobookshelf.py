import logging
from collections import Counter

from app.collectors.base import BaseCollector, NormalizedData

logger = logging.getLogger("wrapparr.audiobookshelf")


class AudiobookshelfCollector(BaseCollector):
    @property
    def _headers(self):
        return {"Authorization": f"Bearer {self.api_key}"}

    async def test_connection(self) -> tuple[bool, str]:
        try:
            resp = await self.client.get(f"{self.base_url}/api/me", headers=self._headers)
            resp.raise_for_status()
            data = resp.json()
            return True, f"Audiobookshelf connecte ({data.get('username', '?')})"
        except Exception as e:
            return False, str(e)

    async def collect(self, year: int) -> dict:
        # Listening stats (total time, per-item time, per-day)
        resp = await self.client.get(f"{self.base_url}/api/me/listening-stats", headers=self._headers)
        resp.raise_for_status()
        stats = resp.json()

        # All listening sessions (actual plays with details)
        all_sessions = []
        page = 0
        while True:
            resp2 = await self.client.get(
                f"{self.base_url}/api/me/listening-sessions",
                headers=self._headers,
                params={"itemsPerPage": 100, "page": page},
            )
            resp2.raise_for_status()
            data = resp2.json()
            sessions = data.get("sessions", [])
            all_sessions.extend(sessions)
            if page >= data.get("numPages", 1) - 1:
                break
            page += 1

        # Library items (for covers and full metadata)
        resp3 = await self.client.get(f"{self.base_url}/api/libraries", headers=self._headers)
        resp3.raise_for_status()
        libraries = resp3.json().get("libraries", [])

        items_by_id = {}
        for lib in libraries:
            resp4 = await self.client.get(
                f"{self.base_url}/api/libraries/{lib['id']}/items",
                headers=self._headers,
                params={"limit": "1000"},
            )
            resp4.raise_for_status()
            for item in resp4.json().get("results", []):
                items_by_id[item["id"]] = item

        # In-progress items (for progress data)
        resp5 = await self.client.get(f"{self.base_url}/api/me/items-in-progress", headers=self._headers)
        in_progress = {}
        if resp5.status_code == 200:
            for item in resp5.json().get("libraryItems", []):
                in_progress[item.get("id")] = item

        logger.info("Audiobookshelf: %d sessions, %d library items", len(all_sessions), len(items_by_id))
        return {
            "stats": stats,
            "sessions": all_sessions,
            "items": items_by_id,
            "in_progress": in_progress,
            "year": year,
        }

    def normalize(self, raw: dict) -> NormalizedData:
        stats = raw.get("stats", {})
        sessions = raw.get("sessions", [])
        items_by_id = raw.get("items", {})
        in_progress = raw.get("in_progress", {})

        total_seconds = stats.get("totalTime", 0)
        total_hours = total_seconds / 3600

        # Aggregate per book: listening time, session count
        book_time = Counter()
        book_sessions = Counter()
        book_meta = {}

        for sess in sessions:
            lib_id = sess.get("libraryItemId", "")
            time_listened = sess.get("timeListening", 0)
            book_time[lib_id] += time_listened
            book_sessions[lib_id] += 1

            if lib_id not in book_meta:
                # Get metadata from session or library item
                mm = sess.get("mediaMetadata", {})
                lib_item = items_by_id.get(lib_id, {})
                lib_meta = lib_item.get("media", {}).get("metadata", {})
                cover_path = sess.get("coverPath") or lib_item.get("media", {}).get("coverPath", "")

                # Authors and narrators
                authors = mm.get("authors") or lib_meta.get("authors") or []
                author_name = mm.get("authorName") or lib_meta.get("authorName") or ""
                if not author_name and authors:
                    author_name = ", ".join(a.get("name", "") for a in authors if a.get("name"))

                narrators = mm.get("narrators") or lib_meta.get("narrators") or []
                narrator_name = lib_meta.get("narratorName") or ""
                if not narrator_name and narrators:
                    narrator_name = ", ".join(narrators) if isinstance(narrators[0], str) else ", ".join(n.get("name", "") for n in narrators)

                # Series
                series_list = mm.get("series") or lib_meta.get("series") or []
                series_name = lib_meta.get("seriesName") or ""
                if not series_name and series_list:
                    s = series_list[0]
                    series_name = s.get("name", "")
                    seq = s.get("sequence", "")
                    if seq:
                        series_name += f" #{seq}"

                # Genres
                genres = mm.get("genres") or lib_meta.get("genres") or []

                # Cover URL
                cover_url = ""
                if cover_path:
                    cover_url = f"{self.base_url}/api/items/{lib_id}/cover"

                book_meta[lib_id] = {
                    "t": mm.get("title") or lib_meta.get("title") or sess.get("displayTitle", "?"),
                    "author": author_name,
                    "narrator": narrator_name,
                    "series": series_name,
                    "y": mm.get("publishedYear") or lib_meta.get("publishedYear") or 0,
                    "publisher": mm.get("publisher") or lib_meta.get("publisher") or "",
                    "genres": genres,
                    "thumb": cover_url,
                    "description": (mm.get("description") or lib_meta.get("description") or "")[:150],
                }

        # Build genre counts from listened books
        genre_count = Counter()
        for lib_id in book_time:
            meta = book_meta.get(lib_id, {})
            for g in meta.get("genres", []):
                genre_count[g] += 1

        # Build top items by listening time
        top = []
        for lib_id, seconds in book_time.most_common():
            meta = book_meta.get(lib_id, {})
            hours = seconds / 3600
            top.append({
                "t": meta.get("t", "?"),
                "author": meta.get("author", ""),
                "narrator": meta.get("narrator", ""),
                "series": meta.get("series", ""),
                "y": meta.get("y", 0),
                "h": round(hours, 1) if hours >= 1 else round(seconds / 60, 0),
                "h_unit": "h" if hours >= 1 else "min",
                "plays": book_sessions.get(lib_id, 1),
                "thumb": meta.get("thumb", ""),
                "g": meta.get("author", ""),  # used as subtitle in podium
            })

        genres = [{"n": k, "v": v} for k, v in genre_count.most_common(8)]

        # Monthly listening from stats.days
        monthly = [0] * 12
        for date_str, seconds in stats.get("days", {}).items():
            try:
                month = int(date_str.split("-")[1]) - 1
                monthly[month] += seconds
            except (ValueError, IndexError):
                pass
        month_names = ["Jan", "Fev", "Mar", "Avr", "Mai", "Jun", "Jul", "Aou", "Sep", "Oct", "Nov", "Dec"]
        monthly_data = [{"m": month_names[i], "v": round(monthly[i] / 3600, 1)} for i in range(12)]

        # Day of week from stats
        dow_map = {"Monday": "Lun", "Tuesday": "Mar", "Wednesday": "Mer", "Thursday": "Jeu", "Friday": "Ven", "Saturday": "Sam", "Sunday": "Dim"}
        dow_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        day_of_week = [{"d": dow_map.get(d, d), "v": round(stats.get("dayOfWeek", {}).get(d, 0) / 3600, 1)} for d in dow_order]

        return NormalizedData(
            service_type="audiobookshelf",
            total_items=len(book_time),
            total_hours=round(total_hours, 1),
            top=top[:4],
            genres=genres,
            monthly=monthly_data,
            day_of_week=day_of_week,
            extra={
                "books": len(book_time),
                "total_sessions": len(sessions),
                "all_books": top,
            },
        )
