from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from src.database.session import get_db
from src.repositories.collection import CollectionRepository
from src.repositories.saved_request import SavedRequestRepository
from src.schemas.collection import (
    CreateCollection, UpdateCollection, CollectionResponse,
    CreateSavedRequest, UpdateSavedRequest, SavedRequestResponse
)
from src.services.collection_service import CollectionService, CollectionServiceError


router = APIRouter(
    prefix="/api",
    tags=["collections"]
)


class MoveRequestPayload(BaseModel):
    new_collection_id: int = Field(..., description="Target Collection ID to move the request to")


def get_collection_service(db: Session = Depends(get_db)) -> CollectionService:
    c_repo = CollectionRepository(db)
    r_repo = SavedRequestRepository(db)
    return CollectionService(c_repo, r_repo)


# --- Collections CRUD ---

@router.get("/collections", response_model=list[CollectionResponse])
def list_collections(service: CollectionService = Depends(get_collection_service)):
    return service.list_collections()


@router.get("/collections/{id}", response_model=CollectionResponse)
def get_collection(id: int, service: CollectionService = Depends(get_collection_service)):
    try:
        return service.get_collection(id)
    except CollectionServiceError as e:
        return JSONResponse(status_code=e.status_code, content={"detail": e.message})


@router.post("/collections", response_model=CollectionResponse, status_code=status.HTTP_201_CREATED)
def create_collection(payload: CreateCollection, service: CollectionService = Depends(get_collection_service)):
    return service.create_collection(payload)


@router.patch("/collections/{id}", response_model=CollectionResponse)
def update_collection(id: int, payload: UpdateCollection, service: CollectionService = Depends(get_collection_service)):
    try:
        return service.update_collection(id, payload)
    except CollectionServiceError as e:
        return JSONResponse(status_code=e.status_code, content={"detail": e.message})


@router.delete("/collections/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_collection(id: int, service: CollectionService = Depends(get_collection_service)):
    try:
        service.delete_collection(id)
    except CollectionServiceError as e:
        return JSONResponse(status_code=e.status_code, content={"detail": e.message})


# --- Saved Requests CRUD ---

@router.post("/collections/{id}/requests", response_model=SavedRequestResponse, status_code=status.HTTP_201_CREATED)
def save_request(id: int, payload: CreateSavedRequest, service: CollectionService = Depends(get_collection_service)):
    try:
        return service.save_request(id, payload)
    except CollectionServiceError as e:
        return JSONResponse(status_code=e.status_code, content={"detail": e.message})


@router.get("/requests/{id}", response_model=SavedRequestResponse)
def get_request(id: int, service: CollectionService = Depends(get_collection_service)):
    try:
        return service.get_request(id)
    except CollectionServiceError as e:
        return JSONResponse(status_code=e.status_code, content={"detail": e.message})


@router.patch("/requests/{id}", response_model=SavedRequestResponse)
def update_request(id: int, payload: UpdateSavedRequest, service: CollectionService = Depends(get_collection_service)):
    try:
        return service.update_request(id, payload)
    except CollectionServiceError as e:
        return JSONResponse(status_code=e.status_code, content={"detail": e.message})


@router.delete("/requests/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_request(id: int, service: CollectionService = Depends(get_collection_service)):
    try:
        service.delete_request(id)
    except CollectionServiceError as e:
        return JSONResponse(status_code=e.status_code, content={"detail": e.message})


@router.patch("/requests/{id}/move", response_model=SavedRequestResponse)
def move_request(id: int, payload: MoveRequestPayload, service: CollectionService = Depends(get_collection_service)):
    try:
        return service.move_request(id, payload.new_collection_id)
    except CollectionServiceError as e:
        return JSONResponse(status_code=e.status_code, content={"detail": e.message})


@router.patch("/requests/{id}/duplicate", response_model=SavedRequestResponse, status_code=status.HTTP_201_CREATED)
def duplicate_request(id: int, service: CollectionService = Depends(get_collection_service)):
    try:
        return service.duplicate_request(id)
    except CollectionServiceError as e:
        return JSONResponse(status_code=e.status_code, content={"detail": e.message})
