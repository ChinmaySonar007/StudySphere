from datetime import datetime

from pydantic import BaseModel, ConfigDict


class DocumentResponse(BaseModel):
    id: int
    filename: str
    original_filename: str
    file_type: str
    file_size: int
    status: str
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


class RAGQueryRequest(BaseModel):
    query: str
    document_id: int | None = None


class Citation(BaseModel):
    page: int | None = None
    content: str
    document_id: str | None = None


class RAGQueryResponse(BaseModel):
    answer: str
    citations: list[Citation]
    query: str
    document_id: int | None = None