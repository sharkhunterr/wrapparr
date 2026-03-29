"""In-memory log store — ring buffer accessible via API."""
import logging
from collections import deque
from datetime import datetime, timezone


class LogStore(logging.Handler):
    """Captures log records into a ring buffer for API access."""

    def __init__(self, max_entries=500):
        super().__init__()
        self.entries = deque(maxlen=max_entries)

    def emit(self, record):
        try:
            self.entries.append({
                "ts": datetime.now(timezone.utc).isoformat(),
                "level": record.levelname,
                "logger": record.name,
                "message": self.format(record),
            })
        except Exception:
            pass

    def get_logs(self, limit=100, level=None):
        logs = list(self.entries)
        if level:
            logs = [l for l in logs if l["level"] == level.upper()]
        return logs[-limit:]

    def clear(self):
        self.entries.clear()


# Singleton
log_store = LogStore(max_entries=500)


def setup_logging():
    """Attach log_store to root + uvicorn + wrapparr loggers."""
    formatter = logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s", datefmt="%H:%M:%S")
    log_store.setFormatter(formatter)
    log_store.setLevel(logging.DEBUG)

    for name in ("wrapparr", "uvicorn", "uvicorn.error", "uvicorn.access", "sqlalchemy.engine"):
        logger = logging.getLogger(name)
        logger.addHandler(log_store)

    # Also capture root logger warnings/errors
    root = logging.getLogger()
    root.addHandler(log_store)
