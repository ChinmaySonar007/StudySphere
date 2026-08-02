from datetime import datetime
from pydantic import BaseModel


class FlashcardBase(BaseModel):
    front: str
    back: str
    is_mastered: bool = False


class FlashcardCreate(FlashcardBase):
    pass


class FlashcardResponse(FlashcardBase):
    id: int
    deck_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class FlashcardDeckBase(BaseModel):
    title: str
    description: str = ""
    document_id: int | None = None


class FlashcardDeckCreate(FlashcardDeckBase):
    cards: list[FlashcardCreate] = []


class FlashcardDeckResponse(FlashcardDeckBase):
    id: int
    user_id: int
    created_at: datetime
    cards: list[FlashcardResponse] = []

    class Config:
        from_attributes = True


class AIGenerateFlashcardsRequest(BaseModel):
    document_id: int
    title: str | None = None
    count: int = 5
