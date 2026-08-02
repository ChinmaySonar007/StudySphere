import os
from typing import List
from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
    BackgroundTasks,
    HTTPException,
    status,
)
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.schemas.document import (
    DocumentResponse,
    RAGQueryRequest,
    RAGQueryResponse,
)
from app.crud.document import (
    get_user_documents,
    get_document,
    delete_document,
)
from app.services.document_service import (
    upload_document,
    process_document,
)
from app.services.rag_service import query_rag_pipeline
from app.services.vector_store import get_vectorstore

router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
)


@router.post(
    "/upload",
    response_model=DocumentResponse,
)
def upload(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    document, path = upload_document(
        db,
        current_user.id,
        file,
    )

    background_tasks.add_task(
        process_document,
        document.id,
        path,
    )

    return document


@router.get(
    "/",
    response_model=List[DocumentResponse],
)
def list_documents(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """List all documents uploaded by the current user."""
    return get_user_documents(db, current_user.id)


@router.get(
    "/{document_id}",
    response_model=DocumentResponse,
)
def read_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Retrieve details for a specific document."""
    doc = get_document(db, document_id)
    if not doc or doc.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )
    return doc


@router.delete(
    "/{document_id}",
    status_code=status.HTTP_200_OK,
)
def remove_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Delete a document and clear its chunks from vector store."""
    doc = get_document(db, document_id)
    if not doc or doc.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )

    # Delete from vector store if possible
    try:
        vectorstore = get_vectorstore()
        vectorstore.delete(where={"document_id": str(document_id)})
    except Exception as err:
        print(f"Failed to delete chunks from vector store: {err}")

    # Delete database record
    delete_document(db, doc)

    return {"message": "Document deleted successfully.", "id": document_id}


@router.post(
    "/query",
    response_model=RAGQueryResponse,
)
def query_rag(
    payload: RAGQueryRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Execute RAG query against uploaded documents."""
    result = query_rag_pipeline(
        db=db,
        user_id=current_user.id,
        query=payload.query,
        document_id=payload.document_id,
    )
    return result