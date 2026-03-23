import uuid

from pydantic import BaseModel


class PhraseCreate(BaseModel):
    category: str
    text: str
    sort_order: int = 0
    mode: str = "mix"


class PhraseUpdate(BaseModel):
    text: str | None = None
    sort_order: int | None = None
    mode: str | None = None


class PhraseResponse(BaseModel):
    id: uuid.UUID
    category: str
    text: str
    sort_order: int
    mode: str

    model_config = {"from_attributes": True}
