from sqlalchemy import String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    full_name: Mapped[str] = mapped_column(String(100), nullable=False)

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )

    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    bio: Mapped[str] = mapped_column(String(500), nullable=False, default="")
    avatar_url: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    study_goal: Mapped[str] = mapped_column(String(255), nullable=False, default="Master your subjects with AI")
    theme_preference: Mapped[str] = mapped_column(String(50), nullable=False, default="system")

    is_active: Mapped[bool] = mapped_column(default=True)

    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )