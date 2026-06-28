from sqlalchemy import select, delete, func
from sqlalchemy.orm import Session
from src.models.history import History


class HistoryRepository:
    """
    Repository responsible for handling CRUD database operations for request History.
    Decoupled from business logic.
    """

    def __init__(self, db: Session):
        self.db = db

    def save(self, history: History) -> History:
        """
        Persists a History record to the database.
        """
        self.db.add(history)
        self.db.commit()
        self.db.refresh(history)
        return history

    def get(self, history_id: int) -> History | None:
        """Retrieves a single History record by ID."""
        return self.db.query(History).filter(History.id == history_id).first()

    def delete(self, history: History) -> None:
        """Deletes a single History record."""
        self.db.delete(history)
        self.db.commit()

    def clear_all(self) -> None:
        """Deletes all History records from the database."""
        self.db.execute(delete(History))
        self.db.commit()

    def list_paginated(
        self,
        page: int = 1,
        limit: int = 20,
        method: str | None = None,
        search: str | None = None,
        status: int | None = None,
        sort: str = "newest"
    ) -> tuple[list[History], int]:
        """
        Queries and returns a paginated list of History logs based on method,
        status, and search text filters.
        """
        query = self.db.query(History)

        # Filtering
        if method:
            query = query.filter(History.method == method.upper())
        if status is not None:
            query = query.filter(History.status == status)
        if search:
            query = query.filter(History.url.like(f"%{search}%"))

        # Total count before pagination offsets
        total = query.count()

        # Sorting
        if sort == "oldest":
            query = query.order_by(History.created_at.asc())
        else:
            query = query.order_by(History.created_at.desc())

        # Pagination
        offset = (page - 1) * limit
        items = query.offset(offset).limit(limit).all()

        return items, total
