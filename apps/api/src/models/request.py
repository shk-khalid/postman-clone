from datetime import datetime
from typing import Any, Dict
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from src.database.base import Base


class SavedRequest(Base):
    """
    Model representing a saved request inside a Collection.
    """
    __tablename__ = "saved_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    collection_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("collections.id", ondelete="CASCADE"),
        nullable=False
    )
    name: Mapped[str] = mapped_column(String, nullable=False)
    method: Mapped[str] = mapped_column(String, nullable=False)
    url: Mapped[str] = mapped_column(String, nullable=False)
    
    headers: Mapped[Dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    params: Mapped[Dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    body: Mapped[str | None] = mapped_column(Text, nullable=True)
    body_type: Mapped[str | None] = mapped_column(String, nullable=True)
    auth_type: Mapped[str | None] = mapped_column(String, nullable=True)
    auth_data: Mapped[Dict[str, Any] | None] = mapped_column(JSON, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

    # Relationships
    collection: Mapped["Collection"] = relationship(
        "Collection",
        back_populates="requests"
    )
