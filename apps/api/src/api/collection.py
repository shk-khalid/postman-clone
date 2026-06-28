from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from src.database.session import get_db
from src.repositories.collection import CollectionRepository
from src.repositories.saved_request import SavedRequestRepository
from src.schemas.collection import (
    CreateCollection, UpdateCollection, CollectionResponse,
    CreateSavedRequest, UpdateSavedRequest, SavedRequestResponse
)
from src.schemas.response import StandardResponse
from src.services.collection_service import CollectionService


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

@router.get("/collections", response_model=StandardResponse[list[CollectionResponse]])
def list_collections(service: CollectionService = Depends(get_collection_service)):
    data = service.list_collections()
    return StandardResponse(
        success=True,
        message="Collections retrieved successfully.",
        data=data
    )


@router.get("/collections/{id}", response_model=StandardResponse[CollectionResponse])
def get_collection(id: int, service: CollectionService = Depends(get_collection_service)):
    data = service.get_collection(id)
    return StandardResponse(
        success=True,
        message="Collection retrieved successfully.",
        data=data
    )


@router.post("/collections", response_model=StandardResponse[CollectionResponse], status_code=status.HTTP_201_CREATED)
def create_collection(payload: CreateCollection, service: CollectionService = Depends(get_collection_service)):
    data = service.create_collection(payload)
    return StandardResponse(
        success=True,
        message="Collection created successfully.",
        data=data
    )


@router.patch("/collections/{id}", response_model=StandardResponse[CollectionResponse])
def update_collection(id: int, payload: UpdateCollection, service: CollectionService = Depends(get_collection_service)):
    data = service.update_collection(id, payload)
    return StandardResponse(
        success=True,
        message="Collection updated successfully.",
        data=data
    )


@router.delete("/collections/{id}", response_model=StandardResponse[None], status_code=status.HTTP_200_OK)
def delete_collection(id: int, service: CollectionService = Depends(get_collection_service)):
    service.delete_collection(id)
    return StandardResponse(
        success=True,
        message="Collection deleted successfully."
    )


# --- Saved Requests CRUD ---

@router.post("/collections/{id}/requests", response_model=StandardResponse[SavedRequestResponse], status_code=status.HTTP_201_CREATED)
def save_request(id: int, payload: CreateSavedRequest, service: CollectionService = Depends(get_collection_service)):
    data = service.save_request(id, payload)
    return StandardResponse(
        success=True,
        message="Saved request added to collection successfully.",
        data=data
    )


@router.get("/requests/{id}", response_model=StandardResponse[SavedRequestResponse])
def get_request(id: int, service: CollectionService = Depends(get_collection_service)):
    data = service.get_request(id)
    return StandardResponse(
        success=True,
        message="Saved request retrieved successfully.",
        data=data
    )


@router.patch("/requests/{id}", response_model=StandardResponse[SavedRequestResponse])
def update_request(id: int, payload: UpdateSavedRequest, service: CollectionService = Depends(get_collection_service)):
    data = service.update_request(id, payload)
    return StandardResponse(
        success=True,
        message="Saved request updated successfully.",
        data=data
    )


@router.delete("/requests/{id}", response_model=StandardResponse[None], status_code=status.HTTP_200_OK)
def delete_request(id: int, service: CollectionService = Depends(get_collection_service)):
    service.delete_request(id)
    return StandardResponse(
        success=True,
        message="Saved request deleted successfully."
    )


@router.patch("/requests/{id}/move", response_model=StandardResponse[SavedRequestResponse])
def move_request(id: int, payload: MoveRequestPayload, service: CollectionService = Depends(get_collection_service)):
    data = service.move_request(id, payload.new_collection_id)
    return StandardResponse(
        success=True,
        message="Saved request moved successfully.",
        data=data
    )


@router.patch("/requests/{id}/duplicate", response_model=StandardResponse[SavedRequestResponse], status_code=status.HTTP_201_CREATED)
def duplicate_request(id: int, service: CollectionService = Depends(get_collection_service)):
    data = service.duplicate_request(id)
    return StandardResponse(
        success=True,
        message="Saved request duplicated successfully.",
        data=data
    )
