from sqlalchemy.orm import Session

from app.models.document import Document


def create_document(
    db: Session,
    **kwargs,
):
    document = Document(**kwargs)

    db.add(document)
    db.commit()
    db.refresh(document)

    return document


def get_document(
    db: Session,
    document_id: int,
):
    return (
        db.query(Document)
        .filter(Document.id == document_id)
        .first()
    )


def get_user_documents(
    db: Session,
    user_id: int,
):
    return (
        db.query(Document)
        .filter(Document.user_id == user_id)
        .order_by(Document.created_at.desc())
        .all()
    )


def delete_document(
    db: Session,
    document: Document,
):
    db.delete(document)
    db.commit()
    