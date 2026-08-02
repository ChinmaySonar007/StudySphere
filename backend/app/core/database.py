from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.core.config import settings


class Base(DeclarativeBase):
    pass


connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

try:
    engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)
    # Test connection
    with engine.connect() as conn:
        pass
except Exception as e:
    print(f"Database connection to {settings.DATABASE_URL} failed ({e}). Falling back to SQLite.")
    sqlite_url = "sqlite:///./studysphere.db"
    engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})

# Run safe schema migration for existing tables if columns are missing
try:
    with engine.begin() as conn:
        from sqlalchemy import text
        for col_name, col_type in [
            ("bio", "VARCHAR(500) DEFAULT ''"),
            ("avatar_url", "VARCHAR(255) DEFAULT ''"),
            ("study_goal", "VARCHAR(255) DEFAULT 'Master your subjects with AI'"),
            ("theme_preference", "VARCHAR(50) DEFAULT 'system'"),
        ]:
            try:
                conn.execute(text(f"ALTER TABLE users ADD COLUMN IF NOT EXISTS {col_name} {col_type};"))
            except Exception as alter_err:
                print(f"Error adding column {col_name}: {alter_err}")
except Exception as migration_err:
    print(f"User columns migration note: {migration_err}")


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Import all models so metadata is registered for Base.metadata.create_all()
import app.models