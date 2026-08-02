import os
import re

from langchain_community.document_loaders import (
    PyPDFLoader,
    Docx2txtLoader,
    UnstructuredPowerPointLoader,
)


def clean_text(text: str) -> str:
    if not text:
        return ""
    # Normalize spaces within lines
    lines = [re.sub(r'[ \t]+', ' ', line.strip()) for line in text.splitlines()]
    cleaned = "\n".join([line for line in lines if line])
    # Replace line breaks in mid-sentences
    cleaned = re.sub(r'([a-zA-Z0-9,])\n([a-zA-Z0-9])', r'\1 \2', cleaned)
    return cleaned


def load_document(file_path: str):

    extension = os.path.splitext(file_path)[1].lower()

    if extension == ".pdf":
        loader = PyPDFLoader(file_path)

    elif extension == ".docx":
        loader = Docx2txtLoader(file_path)

    elif extension == ".pptx":
        loader = UnstructuredPowerPointLoader(file_path)

    else:
        raise Exception("Unsupported file.")

    docs = loader.load()
    for doc in docs:
        if doc.page_content:
            doc.page_content = clean_text(doc.page_content)

    return docs