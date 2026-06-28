from datetime import datetime
from typing import Any, Dict
from sqlalchemy import JSON, DateTime, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from src.database.base import Base


class History(Base):
    """
    Model representing outbound request history.
    Stores the metadata, payloads, and response statistics of executed requests.
    """
    __tablename__ = "history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    method: Mapped[str] = mapped_column(String, nullable=False)
    url: Mapped[str] = mapped_column(String, nullable=False)
    
    # Nullable fields to handle cases where request execution fails (e.g. timeout or DNS)
    status: Mapped[int | None] = mapped_column(Integer, nullable=True)
    duration: Mapped[float | None] = mapped_column(Float, nullable=True)  # Duration in seconds
    response_size: Mapped[int | None] = mapped_column(Integer, nullable=True)  # Size in bytes
    
    # Snapshots for full request and response visualization
    request_snapshot: Mapped[Dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    response_snapshot: Mapped[Dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
