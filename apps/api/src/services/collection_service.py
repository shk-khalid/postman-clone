from src.repositories.collection import CollectionRepository
from src.repositories.saved_request import SavedRequestRepository
from src.schemas.collection import CreateCollection, UpdateCollection, CreateSavedRequest, UpdateSavedRequest
from src.models.collection import Collection
from src.models.request import SavedRequest


class CollectionServiceError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class CollectionService:
    """
    Service containing business logic for Collection and SavedRequest management.
    """

    def __init__(self, collection_repo: CollectionRepository, request_repo: SavedRequestRepository):
        self.collection_repo = collection_repo
        self.request_repo = request_repo

    def create_collection(self, payload: CreateCollection) -> Collection:
        return self.collection_repo.create(name=payload.name, description=payload.description)

    def get_collection(self, collection_id: int) -> Collection:
        coll = self.collection_repo.get(collection_id)
        if not coll:
            raise CollectionServiceError(f"Collection with ID {collection_id} not found", status_code=404)
        return coll

    def list_collections(self) -> list[Collection]:
        return self.collection_repo.list()

    def update_collection(self, collection_id: int, payload: UpdateCollection) -> Collection:
        coll = self.get_collection(collection_id)
        return self.collection_repo.update(coll, name=payload.name, description=payload.description)

    def delete_collection(self, collection_id: int) -> None:
        coll = self.get_collection(collection_id)
        self.collection_repo.delete(coll)

    def save_request(self, collection_id: int, payload: CreateSavedRequest) -> SavedRequest:
        # Prevent orphan requests by ensuring the collection exists
        self.get_collection(collection_id)
        
        # Validate request name is not empty
        if not payload.name or not payload.name.strip():
            raise CollectionServiceError("Saved request name cannot be empty")

        return self.request_repo.create(
            collection_id=collection_id,
            name=payload.name.strip(),
            method=payload.method,
            url=payload.url,
            headers=payload.headers,
            params=payload.params,
            body=payload.body,
            body_type=payload.body_type,
            auth_type=payload.auth_type,
            auth_data=payload.auth_data
        )

    def get_request(self, request_id: int) -> SavedRequest:
        req = self.request_repo.get(request_id)
        if not req:
            raise CollectionServiceError(f"Saved request with ID {request_id} not found", status_code=404)
        return req

    def update_request(self, request_id: int, payload: UpdateSavedRequest) -> SavedRequest:
        req = self.get_request(request_id)
        
        update_data = payload.model_dump(exclude_unset=True)
        if "name" in update_data:
            if not update_data["name"] or not update_data["name"].strip():
                raise CollectionServiceError("Saved request name cannot be empty")
            update_data["name"] = update_data["name"].strip()

        return self.request_repo.update(req, **update_data)

    def delete_request(self, request_id: int) -> None:
        req = self.get_request(request_id)
        self.request_repo.delete(req)

    def move_request(self, request_id: int, new_collection_id: int) -> SavedRequest:
        req = self.get_request(request_id)
        # Ensure destination collection exists
        self.get_collection(new_collection_id)
        return self.request_repo.move(req, new_collection_id)

    def duplicate_request(self, request_id: int) -> SavedRequest:
        req = self.get_request(request_id)
        new_name = f"{req.name} Copy"
        return self.request_repo.duplicate(req, new_name)
