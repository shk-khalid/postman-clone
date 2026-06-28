from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from src.database.session import get_db
from src.repositories.environment import EnvironmentRepository
from src.schemas.environment import (
    CreateEnvironment, UpdateEnvironment, EnvironmentResponse,
    CreateVariable, UpdateVariable, VariableResponse
)
from src.services.environment_service import EnvironmentService, EnvironmentServiceError


router = APIRouter(
    prefix="/api",
    tags=["environments"]
)


def get_env_service(db: Session = Depends(get_db)) -> EnvironmentService:
    repo = EnvironmentRepository(db)
    return EnvironmentService(repo)


# --- Environments CRUD ---

@router.get("/environments", response_model=list[EnvironmentResponse])
def list_environments(service: EnvironmentService = Depends(get_env_service)):
    return service.list_environments()


@router.get("/environments/{id}", response_model=EnvironmentResponse)
def get_environment(id: int, service: EnvironmentService = Depends(get_env_service)):
    try:
        return service.get_environment(id)
    except EnvironmentServiceError as e:
        return JSONResponse(status_code=e.status_code, content={"detail": e.message})


@router.post("/environments", response_model=EnvironmentResponse, status_code=status.HTTP_201_CREATED)
def create_environment(payload: CreateEnvironment, service: EnvironmentService = Depends(get_env_service)):
    return service.create_environment(payload)


@router.patch("/environments/{id}", response_model=EnvironmentResponse)
def update_environment(id: int, payload: UpdateEnvironment, service: EnvironmentService = Depends(get_env_service)):
    try:
        return service.update_environment(id, payload)
    except EnvironmentServiceError as e:
        return JSONResponse(status_code=e.status_code, content={"detail": e.message})


@router.delete("/environments/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_environment(id: int, service: EnvironmentService = Depends(get_env_service)):
    try:
        service.delete_environment(id)
    except EnvironmentServiceError as e:
        return JSONResponse(status_code=e.status_code, content={"detail": e.message})


# --- Variables CRUD ---

@router.post("/environments/{id}/variables", response_model=VariableResponse, status_code=status.HTTP_201_CREATED)
def add_variable(id: int, payload: CreateVariable, service: EnvironmentService = Depends(get_env_service)):
    try:
        return service.add_variable(id, payload)
    except EnvironmentServiceError as e:
        return JSONResponse(status_code=e.status_code, content={"detail": e.message})


@router.patch("/variables/{id}", response_model=VariableResponse)
def update_variable(id: int, payload: UpdateVariable, service: EnvironmentService = Depends(get_env_service)):
    try:
        return service.update_variable(id, payload)
    except EnvironmentServiceError as e:
        return JSONResponse(status_code=e.status_code, content={"detail": e.message})


@router.delete("/variables/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_variable(id: int, service: EnvironmentService = Depends(get_env_service)):
    try:
        service.delete_variable(id)
    except EnvironmentServiceError as e:
        return JSONResponse(status_code=e.status_code, content={"detail": e.message})
