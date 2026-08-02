import os
from app.core.config import settings

_embeddings = None


def get_embeddings():
    global _embeddings
    if _embeddings is not None:
        return _embeddings

    google_key = (
        getattr(settings, "GOOGLE_API_KEY", "") or 
        os.getenv("GOOGLE_API_KEY", "") or 
        os.getenv("GEMINI_API_KEY", "")
    )

    # 1. Prefer Google Generative AI Embeddings (API-based, zero local RAM usage)
    if google_key and not google_key.startswith("xai-"):
        try:
            from langchain_google_genai import GoogleGenerativeAIEmbeddings
            _embeddings = GoogleGenerativeAIEmbeddings(
                model="models/embedding-001",
                google_api_key=google_key,
            )
            return _embeddings
        except Exception as err:
            print(f"Google embeddings init note: {err}")

    # 2. Lazy fallback to HuggingFace BGE small model
    try:
        from langchain_huggingface import HuggingFaceEmbeddings
        _embeddings = HuggingFaceEmbeddings(
            model_name="BAAI/bge-small-en-v1.5",
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True},
        )
        return _embeddings
    except Exception as err:
        print(f"HuggingFace embeddings init note: {err}")
        # Final emergency fallback: FastEmbed / Dummy
        from langchain_community.embeddings import FakeEmbeddings
        _embeddings = FakeEmbeddings(size=384)
        return _embeddings


def get_vectorstore():
    from langchain_chroma import Chroma
    return Chroma(
        persist_directory=settings.CHROMA_DB_DIR,
        embedding_function=get_embeddings(),
    )