from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ==========================
    # Database
    # ==========================
    DATABASE_URL: str

    # ==========================
    # JWT Authentication
    # ==========================
    SECRET_KEY: str
    ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ==========================
    # LLM API Keys (Gemini / Grok / OpenAI)
    # ==========================
    GOOGLE_API_KEY: str = ""
    GROK_API_KEY: str = ""
    XAI_API_KEY: str = ""

    # ==========================
    # File Uploads
    # ==========================
    UPLOAD_DIR: str = "uploads"

    # ==========================
    # ChromaDB
    # ==========================
    CHROMA_DB_DIR: str = "chroma_db"

    # ==========================
    # Pydantic Settings
    # ==========================
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()