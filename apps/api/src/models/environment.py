from datetime import datetime
from typing import List
from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from src.database.base import Base


class Environment(Base):
    """
    Model representing an environment workspace (e.g. Development, Production).
    Holds environment-specific variables.
    """
    __tablename__ = "environments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    
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
    variables: Mapped[List["Variable"]] = relationship(
        "Variable",
        back_populates="environment",
        cascade="all, delete-orphan",
        lazy="selectin"
    )
