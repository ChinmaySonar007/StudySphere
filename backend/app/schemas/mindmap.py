from datetime import datetime
from typing import Any
from pydantic import BaseModel


class MindmapBase(BaseModel):
    title: str
    nodes_json: str = "[]"
    document_id: int | None = None


class MindmapCreate(MindmapBase):
    pass


class MindmapUpdate(BaseModel):
    title: str | None = None
    nodes_json: str | None = None


class MindmapResponse(MindmapBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AIGenerateMindmapRequest(BaseModel):
    document_id: int
    title: str | None = None
