"""Shared utilities."""
import uuid


def to_uuid(value) -> uuid.UUID:
    """Convert string or UUID to uuid.UUID. Safe for SQLite Uuid columns."""
    if isinstance(value, uuid.UUID):
        return value
    if isinstance(value, str):
        try:
            return uuid.UUID(value)
        except ValueError:
            return value  # let SQLAlchemy handle the error
    return value
