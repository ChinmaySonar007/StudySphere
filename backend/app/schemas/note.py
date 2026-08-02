from datetime import datetime
from pydantic import BaseModel


class NoteBase(BaseModel):
    title: str
    content: str = ""
    category: str = "General"
    tags: str = ""
    document_id: int | None = None


class NoteCreate(NoteBase):
    pass


class NoteUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    category: str | None = None
    tags: str | None = None
    document_id: int | None = None


class NoteResponse(NoteBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AIGenerateNoteRequest(BaseModel):
    document_id: int
    topic: str | None = None
