from app.services.document_loader import load_document
from app.services.text_splitter import split_documents
from app.services.vector_store import get_vectorstore


def index_document(file_path: str, document_id: int | None = None, user_id: int | None = None):

    docs = load_document(file_path)

    chunks = split_documents(docs)

    for chunk in chunks:
        if document_id is not None:
            chunk.metadata["document_id"] = str(document_id)
        if user_id is not None:
            chunk.metadata["user_id"] = str(user_id)

    vectorstore = get_vectorstore()

    vectorstore.add_documents(chunks)

    return len(chunks)