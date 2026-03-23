from pydantic import BaseModel


class SlideConfigItem(BaseModel):
    slide_id: str
    enabled: bool
    sort_order: int

    model_config = {"from_attributes": True}


class SlideConfigUpdate(BaseModel):
    slides: list[SlideConfigItem]
