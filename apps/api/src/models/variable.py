from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from src.database.base import Base


class Variable(Base):
    """
    Model representing a key-value variable configured inside an Environment.
    """
    __tablename__ = "variables"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    environment_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("environments.id", ondelete="CASCADE"),
        nullable=False
    )
    key: Mapped[str] = mapped_column(String, nullable=False)
    value: Mapped[str] = mapped_column(String, nullable=False)

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
    environment: Mapped["Environment"] = relationship(
        "Environment",
        back_populates="variables"
    )

    # Ensure key is unique per environment
    __table_args__ = (
        UniqueConstraint("environment_id", "key", name="uq_environment_variable_key"),
    )
