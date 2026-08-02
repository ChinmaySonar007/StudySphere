from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE")
    )

    filename: Mapped[str] = mapped_column(String(255))

    original_filename: Mapped[str] = mapped_column(String(255))

    file_type: Mapped[str] = mapped_column(String(50))

    file_size: Mapped[int]

    status: Mapped[str] = mapped_column(
        String(30),
        default="UPLOADED",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    user = relationship("User")