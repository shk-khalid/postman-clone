from sqlalchemy.orm import Session
from src.models.collection import Collection


class CollectionRepository:
    """
    Repository for Collection persistence operations.
    No business logic.
    """

    def __init__(self, db: Session):
        self.db = db

    def create(self, name: str, description: str | None = None) -> Collection:
        collection = Collection(name=name, description=description)
        self.db.add(collection)
        self.db.commit()
        self.db.refresh(collection)
        return collection

    def get(self, collection_id: int) -> Collection | None:
        return self.db.query(Collection).filter(Collection.id == collection_id).first()

    def list(self) -> list[Collection]:
        return self.db.query(Collection).order_by(Collection.name).all()

    def update(self, collection: Collection, name: str | None = None, description: str | None = None) -> Collection:
        if name is not None:
            collection.name = name
        if description is not None:
            collection.description = description
        self.db.commit()
        self.db.refresh(collection)
        return collection

    def delete(self, collection: Collection) -> None:
        self.db.delete(collection)
        self.db.commit()
