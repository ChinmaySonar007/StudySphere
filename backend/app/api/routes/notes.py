from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.schemas.note import (
    NoteResponse,
    NoteCreate,
    NoteUpdate,
    AIGenerateNoteRequest,
)
from app.crud.note import (
    get_user_notes,
    get_note,
    create_note,
    update_note,
    delete_note,
)
from app.services.rag_service import query_rag_pipeline

router = APIRouter(
    prefix="/notes",
    tags=["Notes"],
)


@router.get("/", response_model=List[NoteResponse])
def list_notes(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return get_user_notes(db, current_user.id)


@router.get("/{note_id}", response_model=NoteResponse)
def get_note_detail(
    note_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    note = get_note(db, note_id)
    if not note or note.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    return note


@router.post("/", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def create_new_note(
    note_in: NoteCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return create_note(db, current_user.id, note_in)


@router.put("/{note_id}", response_model=NoteResponse)
def update_existing_note(
    note_id: int,
    note_in: NoteUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    note = get_note(db, note_id)
    if not note or note.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    return update_note(db, note, note_in)


@router.delete("/{note_id}", status_code=status.HTTP_200_OK)
def remove_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    note = get_note(db, note_id)
    if not note or note.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    delete_note(db, note)
    return {"message": "Note deleted successfully", "id": note_id}


@router.post("/generate-ai", response_model=NoteResponse)
def generate_note_from_document(
    payload: AIGenerateNoteRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query_text = f"Create comprehensive study notes summarizing the core concepts{f' regarding {payload.topic}' if payload.topic else ''}."
    rag_result = query_rag_pipeline(
        db=db,
        user_id=current_user.id,
        query=query_text,
        document_id=payload.document_id,
        top_k=10,
    )
    
    title = f"AI Notes: {payload.topic or 'Study Summary'}"
    content = rag_result.get("answer", "No notes could be generated.")
    
    note_in = NoteCreate(
        title=title,
        content=content,
        category="AI Generated",
        tags="AI, StudyNotes",
        document_id=payload.document_id,
    )
    return create_note(db, current_user.id, note_in)
