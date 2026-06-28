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
