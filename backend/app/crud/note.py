from sqlalchemy.orm import Session
from app.models.note import Note
from app.schemas.note import NoteCreate, NoteUpdate


def get_user_notes(db: Session, user_id: int) -> list[Note]:
    return db.query(Note).filter(Note.user_id == user_id).order_by(Note.updated_at.desc()).all()


def get_note(db: Session, note_id: int) -> Note | None:
    return db.query(Note).filter(Note.id == note_id).first()


def create_note(db: Session, user_id: int, note_in: NoteCreate) -> Note:
    note = Note(
        user_id=user_id,
        title=note_in.title,
        content=note_in.content,
        category=note_in.category,
        tags=note_in.tags,
        document_id=note_in.document_id,
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


def update_note(db: Session, note: Note, note_in: NoteUpdate) -> Note:
    update_data = note_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(note, field, value)
    db.commit()
    db.refresh(note)
    return note


def delete_note(db: Session, note: Note) -> None:
    db.delete(note)
    db.commit()
