from sqlalchemy.orm import Session
from src.models.request import SavedRequest


class SavedRequestRepository:
    """
    Repository for SavedRequest persistence operations.
    No business logic.
    """

    def __init__(self, db: Session):
        self.db = db

    def create(self, collection_id: int, name: str, method: str, url: str,
               headers: dict | None = None, params: dict | None = None,
               body: str | None = None, body_type: str | None = None,
               auth_type: str | None = None, auth_data: dict | None = None) -> SavedRequest:
        req = SavedRequest(
            collection_id=collection_id,
            name=name,
            method=method,
            url=url,
            headers=headers,
            params=params,
            body=body,
            body_type=body_type,
            auth_type=auth_type,
            auth_data=auth_data
        )
        self.db.add(req)
        self.db.commit()
        self.db.refresh(req)
        return req

    def get(self, request_id: int) -> SavedRequest | None:
        return self.db.query(SavedRequest).filter(SavedRequest.id == request_id).first()

    def list_by_collection(self, collection_id: int) -> list[SavedRequest]:
        return self.db.query(SavedRequest).filter(
            SavedRequest.collection_id == collection_id
        ).order_by(SavedRequest.id).all()

    def update(self, req: SavedRequest, **kwargs) -> SavedRequest:
        for key, val in kwargs.items():
            if hasattr(req, key):
                setattr(req, key, val)
        self.db.commit()
        self.db.refresh(req)
        return req

    def delete(self, req: SavedRequest) -> None:
        self.db.delete(req)
        self.db.commit()

    def move(self, req: SavedRequest, new_collection_id: int) -> SavedRequest:
        req.collection_id = new_collection_id
        self.db.commit()
        self.db.refresh(req)
        return req

    def duplicate(self, req: SavedRequest, new_name: str) -> SavedRequest:
        duplicate_req = SavedRequest(
            collection_id=req.collection_id,
            name=new_name,
            method=req.method,
            url=req.url,
            headers=req.headers.copy() if req.headers else None,
            params=req.params.copy() if req.params else None,
            body=req.body,
            body_type=req.body_type,
            auth_type=req.auth_type,
            auth_data=req.auth_data.copy() if req.auth_data else None
        )
        self.db.add(duplicate_req)
        self.db.commit()
        self.db.refresh(duplicate_req)
        return duplicate_req
