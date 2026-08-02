import os
import uuid
from fastapi import UploadFile, HTTPException

from app.core.config import settings


ALLOWED_EXTENSIONS = {
    ".pdf",
    ".docx",
    ".pptx",
}


def save_upload_file(
    file: UploadFile,
):
    filename_orig = file.filename or ""
    extension = os.path.splitext(filename_orig)[1].lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{extension}'. Allowed extensions: PDF, DOCX, PPTX",
        )

    upload_dir = settings.UPLOAD_DIR
    os.makedirs(upload_dir, exist_ok=True)

    filename = f"{uuid.uuid4()}{extension}"
    file_path = os.path.join(upload_dir, filename)

    contents = file.file.read()
    with open(file_path, "wb") as buffer:
        buffer.write(contents)

    return (
        filename,
        file_path,
        extension,
        len(contents),
    )