from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.core.database import SessionLocal

from app.crud.document import create_document
from app.models.document import Document

from app.services.file_service import save_upload_file
from app.services.index_service import index_document


def upload_document(
    db: Session,
    user_id: int,
    file: UploadFile,
):

    filename, path, ext, file_size = save_upload_file(file)

    document = create_document(
        db=db,
        user_id=user_id,
        filename=filename,
        original_filename=file.filename or filename,
        file_type=ext,
        file_size=file_size,
        status="UPLOADED",
    )

    return document, path


def process_document(
    document_id: int,
    path: str,
):

    db = SessionLocal()

    try:

        document = (
            db.query(Document)
            .filter(Document.id == document_id)
            .first()
        )

        if not document:
            return

        document.status = "PROCESSING"
        db.commit()

        chunks = index_document(path, document_id=document.id, user_id=document.user_id)

        document.status = "READY"
        db.commit()

        print(f"Indexed {chunks} chunks")

    except Exception as e:

        if document:
            document.status = "FAILED"
            db.commit()

        print(e)

    finally:
        db.close()