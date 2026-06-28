from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from src.database.session import get_db
from src.repositories.environment import EnvironmentRepository
from src.schemas.environment import (
    CreateEnvironment, UpdateEnvironment, EnvironmentResponse,
    CreateVariable, UpdateVariable, VariableResponse
)
from src.schemas.response import StandardResponse
from src.services.environment_service import EnvironmentService


router = APIRouter(
    prefix="/api",
    tags=["environments"]
)


def get_env_service(db: Session = Depends(get_db)) -> EnvironmentService:
    repo = EnvironmentRepository(db)
    return EnvironmentService(repo)


# --- Environments CRUD ---

@router.get("/environments", response_model=StandardResponse[list[EnvironmentResponse]])
def list_environments(service: EnvironmentService = Depends(get_env_service)):
    data = service.list_environments()
    return StandardResponse(
        success=True,
        message="Environments retrieved successfully.",
        data=data
    )


@router.get("/environments/{id}", response_model=StandardResponse[EnvironmentResponse])
def get_environment(id: int, service: EnvironmentService = Depends(get_env_service)):
    data = service.get_environment(id)
    return StandardResponse(
        success=True,
        message="Environment retrieved successfully.",
        data=data
    )


@router.post("/environments", response_model=StandardResponse[EnvironmentResponse], status_code=status.HTTP_201_CREATED)
def create_environment(payload: CreateEnvironment, service: EnvironmentService = Depends(get_env_service)):
    data = service.create_environment(payload)
    return StandardResponse(
        success=True,
        message="Environment created successfully.",
        data=data
    )


@router.patch("/environments/{id}", response_model=StandardResponse[EnvironmentResponse])
def update_environment(id: int, payload: UpdateEnvironment, service: EnvironmentService = Depends(get_env_service)):
    data = service.update_environment(id, payload)
    return StandardResponse(
        success=True,
        message="Environment updated successfully.",
        data=data
    )


@router.delete("/environments/{id}", response_model=StandardResponse[None], status_code=status.HTTP_200_OK)
def delete_environment(id: int, service: EnvironmentService = Depends(get_env_service)):
    service.delete_environment(id)
    return StandardResponse(
        success=True,
        message="Environment deleted successfully."
    )


# --- Variables CRUD ---

@router.post("/environments/{id}/variables", response_model=StandardResponse[VariableResponse], status_code=status.HTTP_201_CREATED)
def add_variable(id: int, payload: CreateVariable, service: EnvironmentService = Depends(get_env_service)):
    data = service.add_variable(id, payload)
    return StandardResponse(
        success=True,
        message="Variable added to environment successfully.",
        data=data
    )


@router.patch("/variables/{id}", response_model=StandardResponse[VariableResponse])
def update_variable(id: int, payload: UpdateVariable, service: EnvironmentService = Depends(get_env_service)):
    data = service.update_variable(id, payload)
    return StandardResponse(
        success=True,
        message="Variable updated successfully.",
        data=data
    )


@router.delete("/variables/{id}", response_model=StandardResponse[None], status_code=status.HTTP_200_OK)
def delete_variable(id: int, service: EnvironmentService = Depends(get_env_service)):
    service.delete_variable(id)
    return StandardResponse(
        success=True,
        message="Variable deleted successfully."
    )
