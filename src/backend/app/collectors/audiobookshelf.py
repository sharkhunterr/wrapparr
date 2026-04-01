import logging
from collections import Counter
from datetime import datetime

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

    async def _find_user_id(self, username: str) -> str | None:
        """Find Audiobookshelf user ID by username (admin endpoint)."""
        try:
            resp = await self.client.get(f"{self.base_url}/api/users", headers=self._headers)
            if resp.status_code == 200:
                users = resp.json()
                if isinstance(users, dict):
                    users = users.get("users", [])
                for u in users:
                    if u.get("username", "").lower() == username.lower():
                        return u.get("id")
        except Exception as e:
            logger.warning("Impossible de lister les users Audiobookshelf: %s", e)
        return None

    async def _get_user_sessions(self, user_id: str | None) -> list[dict]:
        """Fetch listening sessions for a specific user or current user."""
        all_sessions = []
        page = 0
        # Use admin endpoint if we have a user_id, otherwise /api/me
        if user_id:
            endpoint = f"{self.base_url}/api/users/{user_id}/listening-sessions"
        else:
            endpoint = f"{self.base_url}/api/me/listening-sessions"

        while True:
            resp = await self.client.get(
                endpoint,
                headers=self._headers,
                params={"itemsPerPage": 100, "page": page},
            )
            resp.raise_for_status()
            data = resp.json()
            sessions = data.get("sessions", [])
            all_sessions.extend(sessions)
            if page >= data.get("numPages", 1) - 1:
                break
            page += 1

        return all_sessions

    async def collect(self, year: int) -> dict:
        # Resolve target user ID if mapping exists
        abs_user_id = None
        if self.target_user:
            abs_user_id = await self._find_user_id(self.target_user)
            if abs_user_id:
                logger.info("Audiobookshelf user matched: %s -> %s", self.target_user, abs_user_id)
            else:
                logger.warning("Audiobookshelf user '%s' not found, using token user", self.target_user)

        # Fetch year-specific stats (only works for token user)
        year_stats = {}
        try:
            resp = await self.client.get(
                f"{self.base_url}/api/me/stats/year/{year}",
                headers=self._headers,
            )
            if resp.status_code == 200:
                year_stats = resp.json()
        except Exception:
            pass

        # Fetch all listening sessions for the user
        all_sessions = await self._get_user_sessions(abs_user_id)

        # Filter sessions by year
        year_sessions = []
        year_prefix = str(year)
        for sess in all_sessions:
            sess_date = sess.get("date", "") or ""
            # date field format: "2025-03-15"
            if sess_date.startswith(year_prefix):
                year_sessions.append(sess)
                continue
            # Fallback: check createdAt/startedAt timestamp
            created_at = sess.get("createdAt") or sess.get("startedAt")
            if created_at:
                try:
                    if isinstance(created_at, (int, float)):
                        dt = datetime.fromtimestamp(created_at / 1000 if created_at > 1e12 else created_at)
                    else:
                        dt = datetime.fromisoformat(str(created_at).replace("Z", "+00:00"))
                    if dt.year == year:
                        year_sessions.append(sess)
                except (ValueError, OSError):
                    pass

        logger.info("Audiobookshelf: %d sessions total, %d for year %d (user=%s)",
                     len(all_sessions), len(year_sessions), year, self.target_user or "me")

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

        return {
            "year_stats": year_stats,
            "sessions": year_sessions,
            "items": items_by_id,
            "year": year,
        }

    def normalize(self, raw: dict) -> NormalizedData:
        year_stats = raw.get("year_stats", {})
        sessions = raw.get("sessions", [])
        items_by_id = raw.get("items", {})
        year = raw.get("year", 0)

        # Aggregate per book: listening time, session count
        book_time = Counter()
        book_sessions = Counter()
        book_meta = {}
        total_seconds = 0

        for sess in sessions:
            lib_id = sess.get("libraryItemId", "")
            time_listened = sess.get("timeListening", 0)
            total_seconds += time_listened
            book_time[lib_id] += time_listened
            book_sessions[lib_id] += 1

            if lib_id not in book_meta:
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

        total_hours = total_seconds / 3600

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
                "g": meta.get("author", ""),
            })

        genres = [{"n": k, "v": v} for k, v in genre_count.most_common(8)]

        # Monthly listening from year sessions
        monthly = [0] * 12
        for sess in sessions:
            sess_date = sess.get("date", "")
            time_listened = sess.get("timeListening", 0)
            try:
                month = int(sess_date.split("-")[1]) - 1
                monthly[month] += time_listened
            except (ValueError, IndexError):
                pass
        month_names = ["Jan", "Fev", "Mar", "Avr", "Mai", "Jun", "Jul", "Aou", "Sep", "Oct", "Nov", "Dec"]
        monthly_data = [{"m": month_names[i], "v": round(monthly[i] / 3600, 1)} for i in range(12)]

        # Day of week from year sessions
        dow_counts = Counter()
        for sess in sessions:
            dow = sess.get("dayOfWeek", "")
            if dow:
                dow_counts[dow] += sess.get("timeListening", 0)
        dow_map = {"Monday": "Lun", "Tuesday": "Mar", "Wednesday": "Mer", "Thursday": "Jeu", "Friday": "Ven", "Saturday": "Sam", "Sunday": "Dim"}
        dow_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        day_of_week = [{"d": dow_map.get(d, d), "v": round(dow_counts.get(d, 0) / 3600, 1)} for d in dow_order]

        # Top authors and narrators from year data
        author_time = Counter()
        narrator_time = Counter()
        for lib_id, seconds in book_time.items():
            meta = book_meta.get(lib_id, {})
            if meta.get("author"):
                author_time[meta["author"]] += seconds
            if meta.get("narrator"):
                narrator_time[meta["narrator"]] += seconds

        top_authors = [{"name": n, "hours": round(s / 3600, 1)} for n, s in author_time.most_common(5)]
        top_narrators = [{"name": n, "hours": round(s / 3600, 1)} for n, s in narrator_time.most_common(5)]

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
                "top_authors": top_authors,
                "top_narrators": top_narrators,
                "books_finished": year_stats.get("numBooksFinished", 0),
                "longest_finished": year_stats.get("longestAudiobookFinished"),
            },
        )
