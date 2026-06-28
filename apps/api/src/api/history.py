from fastapi import APIRouter, Depends, Query, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from src.database.session import get_db
from src.repositories.history import HistoryRepository
from src.schemas.history import PaginatedHistoryResponse, HistoryResponse
from src.schemas.response import StandardResponse
from src.services.history_service import HistoryService, HistoryServiceError


router = APIRouter(
    prefix="/api",
    tags=["history"]
)


def get_history_service(db: Session = Depends(get_db)) -> HistoryService:
    repo = HistoryRepository(db)
    return HistoryService(repo)


@router.get("/history", response_model=StandardResponse[PaginatedHistoryResponse])
def get_history(
    page: int = Query(default=1, ge=1, description="Page number"),
    limit: int = Query(default=20, ge=1, le=100, description="Records per page"),
    method: str | None = Query(default=None, description="Filter by HTTP method"),
    search: str | None = Query(default=None, description="Wildcard search text in request URL"),
    status_code: int | None = Query(default=None, alias="status", description="Filter by response status code"),
    sort: str = Query(default="newest", regex="^(newest|oldest)$", description="Sort logs newest first or oldest first"),
    service: HistoryService = Depends(get_history_service)
):
    """Retrieves list of request execution logs paginated and filtered."""
    paginated_data = service.get_paginated_history(
        page=page,
        limit=limit,
        method=method,
        search=search,
        status=status_code,
        sort=sort
    )
    return StandardResponse(
        success=True,
        message="Request history retrieved successfully.",
        data=paginated_data
    )


@router.get("/history/{id}", response_model=StandardResponse[HistoryResponse])
def get_history_detail(id: int, service: HistoryService = Depends(get_history_service)):
    """Retrieves full details of a specific request execution log."""
    try:
        record = service.get_history_detail(id)
        return StandardResponse(
            success=True,
            message="History detail retrieved successfully.",
            data=HistoryResponse.model_validate(record)
        )
    except HistoryServiceError as e:
        return JSONResponse(
            status_code=e.status_code,
            content={
                "success": False,
                "message": e.message,
                "errors": [{"detail": e.message}]
            }
        )


@router.delete("/history/{id}", response_model=StandardResponse[None], status_code=status.HTTP_200_OK)
def delete_history_record(id: int, service: HistoryService = Depends(get_history_service)):
    """Deletes a single request history log."""
    try:
        service.delete_history_record(id)
        return StandardResponse(
            success=True,
            message="History record deleted successfully."
        )
    except HistoryServiceError as e:
        return JSONResponse(
            status_code=e.status_code,
            content={
                "success": False,
                "message": e.message,
                "errors": [{"detail": e.message}]
            }
        )


@router.delete("/history", response_model=StandardResponse[None], status_code=status.HTTP_200_OK)
def clear_history(service: HistoryService = Depends(get_history_service)):
    """Deletes all request logs (clears history)."""
    service.clear_history()
    return StandardResponse(
        success=True,
        message="History cleared successfully."
    )
