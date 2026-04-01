"""Grimmory collector — rich reading + listening stats for yearly recap."""
import logging
from collections import Counter

from app.collectors.base import BaseCollector, NormalizedData

logger = logging.getLogger("wrapparr.grimmory")


class GrimmoryCollector(BaseCollector):
    @property
    def _headers(self):
        return {"Authorization": f"Bearer {self.api_key}"}

    async def test_connection(self) -> tuple[bool, str]:
        try:
            resp = await self.client.get(f"{self.base_url}/api/v1/books", headers=self._headers, params={"page": 0, "size": 1})
            if resp.status_code == 200:
                return True, "Grimmory connecte"
            if resp.status_code == 401:
                return False, "Token invalide"
            return False, f"HTTP {resp.status_code}"
        except Exception as e:
            return False, str(e)

    async def _get(self, path: str, params: dict = None) -> dict | list | None:
        """Helper: GET with error handling."""
        try:
            resp = await self.client.get(f"{self.base_url}/api/v1/{path}", headers=self._headers, params=params)
            if resp.status_code == 200:
                return resp.json()
        except Exception as e:
            logger.warning("Grimmory GET %s failed: %s", path, e)
        return None

    async def collect(self, year: int) -> dict:
        # ── Reading stats ──
        book_timeline = await self._get("user-stats/reading/book-timeline", {"year": year}) or []
        heatmap = await self._get("user-stats/reading/heatmap", {"year": year}) or []
        peak_hours = await self._get("user-stats/reading/peak-hours", {"year": year}) or []
        fav_days = await self._get("user-stats/reading/favorite-days", {"year": year}) or []
        genres = await self._get("user-stats/reading/genres") or []
        streak = await self._get("user-stats/reading/streak") or {}
        completion = await self._get("user-stats/reading/completion-timeline", {"year": year}) or []
        page_turners = await self._get("user-stats/reading/page-turner-scores") or []
        speed = await self._get("user-stats/reading/speed", {"year": year}) or []
        distributions = await self._get("user-stats/reading/book-distributions") or {}

        # ── Listening stats ──
        listening_authors = await self._get("user-stats/listening/authors") or []
        listening_genres = await self._get("user-stats/listening/genres") or []
        listening_pace = await self._get("user-stats/listening/monthly-pace", {"months": 12}) or []
        listening_peak = await self._get("user-stats/listening/peak-hours", {"year": year}) or []
        listening_longest = await self._get("user-stats/listening/longest-books") or []
        listening_funnel = await self._get("user-stats/listening/finish-funnel") or {}

        logger.info("Grimmory: %d books in timeline, %d heatmap days, %d genres",
                     len(book_timeline), len(heatmap), len(genres))

        return {
            "year": year,
            "reading": {
                "book_timeline": book_timeline,
                "heatmap": heatmap,
                "peak_hours": peak_hours,
                "favorite_days": fav_days,
                "genres": genres,
                "streak": streak,
                "completion": completion,
                "page_turners": page_turners,
                "speed": speed,
                "distributions": distributions,
            },
            "listening": {
                "authors": listening_authors,
                "genres": listening_genres,
                "monthly_pace": listening_pace,
                "peak_hours": listening_peak,
                "longest_books": listening_longest,
                "finish_funnel": listening_funnel,
            },
        }

    def normalize(self, raw: dict) -> NormalizedData:
        year = raw.get("year", 0)
        reading = raw.get("reading", {})
        listening = raw.get("listening", {})

        # ── Books read this year ──
        timeline = reading.get("book_timeline", [])
        # Each entry: {bookId, title, authorName, pageCount, totalSessions, totalDurationSeconds, maxProgress, readStatus, firstSessionDate, lastSessionDate, coverUrl}
        books_read = [b for b in timeline if b.get("totalSessions", 0) > 0]
        books_finished = [b for b in books_read if b.get("readStatus") == "FINISHED" or (b.get("maxProgress", 0) or 0) >= 0.95]

        total_seconds = sum(b.get("totalDurationSeconds", 0) for b in books_read)
        total_hours = total_seconds / 3600
        total_pages = sum(
            int((b.get("pageCount", 0) or 0) * min(b.get("maxProgress", 0) or 0, 1))
            for b in books_read
        )

        # Top books by reading time
        top = []
        for b in sorted(books_read, key=lambda x: x.get("totalDurationSeconds", 0), reverse=True):
            hours = b.get("totalDurationSeconds", 0) / 3600
            top.append({
                "t": b.get("title", "?"),
                "author": b.get("authorName", ""),
                "y": 0,
                "h": round(hours, 1) if hours >= 1 else round(b.get("totalDurationSeconds", 0) / 60),
                "h_unit": "h" if hours >= 1 else "min",
                "plays": b.get("totalSessions", 1),
                "thumb": b.get("coverUrl", ""),
                "g": b.get("authorName", ""),
                "pages": b.get("pageCount", 0),
                "progress": round((b.get("maxProgress", 0) or 0) * 100),
                "status": b.get("readStatus", ""),
            })

        # ── Genres ──
        genre_list = reading.get("genres", [])
        genres = [{"n": g.get("genre", "?"), "v": g.get("bookCount", 0)} for g in genre_list[:8]]

        # ── Monthly (from completion timeline) ──
        month_names = ["Jan", "Fev", "Mar", "Avr", "Mai", "Juin", "Juil", "Aout", "Sep", "Oct", "Nov", "Dec"]
        monthly_data = []
        completion_data = reading.get("completion", [])
        for i, m in enumerate(month_names):
            entry = next((c for c in completion_data if c.get("month") == i + 1), None)
            monthly_data.append({"m": m, "v": entry.get("completed", 0) if entry else 0})

        # ── Day of week ──
        dow_map = {"MONDAY": "Lun", "TUESDAY": "Mar", "WEDNESDAY": "Mer", "THURSDAY": "Jeu",
                   "FRIDAY": "Ven", "SATURDAY": "Sam", "SUNDAY": "Dim"}
        fav_days = reading.get("favorite_days", [])
        day_of_week = []
        for d_en in ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]:
            entry = next((f for f in fav_days if f.get("dayOfWeek", "").upper() == d_en), None)
            day_of_week.append({"d": dow_map.get(d_en, d_en), "v": entry.get("sessionCount", 0) if entry else 0})

        # ── Time of day ──
        peak = reading.get("peak_hours", [])
        time_of_day = []
        for h in range(24):
            entry = next((p for p in peak if p.get("hour") == h), None)
            time_of_day.append({"h": h, "v": entry.get("sessionCount", 0) if entry else 0})

        # ── Streak ──
        streak = reading.get("streak", {})

        # ── Page-turners ──
        page_turners = reading.get("page_turners", [])
        top_page_turners = []
        for pt in sorted(page_turners, key=lambda x: x.get("gripScore", 0), reverse=True)[:5]:
            top_page_turners.append({
                "title": pt.get("title", "?"),
                "author": pt.get("authorName", ""),
                "score": round(pt.get("gripScore", 0), 1),
                "sessions": pt.get("sessionCount", 0),
                "cover": pt.get("coverUrl", ""),
            })

        # ── Reading speed ──
        speed_data = reading.get("speed", [])

        # ── Distributions ──
        distributions = reading.get("distributions", {})

        # ── Top authors (reading) ──
        author_time = Counter()
        for b in books_read:
            if b.get("authorName"):
                author_time[b["authorName"]] += b.get("totalDurationSeconds", 0)
        use_minutes = total_hours < 1
        divisor = 60 if use_minutes else 3600
        top_authors = [{"name": n, "hours": round(s / divisor, 1)} for n, s in author_time.most_common(5)]

        # ── Listening ──
        listening_authors = [
            {"name": a.get("authorName", "?"), "hours": round(a.get("totalDurationSeconds", 0) / divisor, 1), "books": a.get("bookCount", 0)}
            for a in listening.get("authors", [])[:5]
        ]
        listening_genres_list = [
            {"n": g.get("genre", "?"), "v": g.get("bookCount", 0), "hours": round(g.get("totalDurationSeconds", 0) / divisor, 1)}
            for g in listening.get("genres", [])[:8]
        ]
        listening_longest = [
            {"title": b.get("title", "?"), "author": b.get("authorName", ""), "hours": round(b.get("durationSeconds", 0) / 3600, 1), "cover": b.get("coverUrl", "")}
            for b in listening.get("longest_books", [])[:5]
        ]
        listening_funnel = listening.get("finish_funnel", {})
        listening_pace = listening.get("monthly_pace", [])

        return NormalizedData(
            service_type="grimmory",
            total_items=len(books_read),
            total_hours=round(total_hours, 1),
            top=top[:4],
            genres=genres,
            monthly=monthly_data,
            day_of_week=day_of_week,
            time_of_day=time_of_day,
            extra={
                "books_read": len(books_read),
                "books_finished": len(books_finished),
                "total_pages": total_pages,
                "total_sessions": sum(b.get("totalSessions", 0) for b in books_read),
                "all_books": top,
                "top_authors": top_authors,
                "time_unit": "min" if use_minutes else "h",
                # Grimmory-specific rich data
                "streak": {
                    "current": streak.get("currentStreak", 0),
                    "longest": streak.get("longestStreak", 0),
                    "total_days": streak.get("totalReadingDays", 0),
                },
                "page_turners": top_page_turners,
                "speed": speed_data,
                "distributions": distributions,
                "completion": completion_data,
                # Listening
                "listening": {
                    "authors": listening_authors,
                    "genres": listening_genres_list,
                    "longest": listening_longest,
                    "funnel": listening_funnel,
                    "monthly_pace": listening_pace,
                },
            },
        )
