from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from src.database.session import get_db
from src.repositories.history import HistoryRepository
from src.repositories.environment import EnvironmentRepository
from src.schemas.request import RequestPayload, ResponsePayload
from src.schemas.response import StandardResponse
from src.services.request_service import RequestService


router = APIRouter(
    prefix="/api/request",
    tags=["request"]
)


@router.post(
    "/send",
    response_model=StandardResponse[ResponsePayload],
    status_code=status.HTTP_200_OK,
    summary="Send outbound HTTP Request",
    description="Executes an outbound HTTP request, records metrics, persists history, and returns the response."
)
async def send_request(
    payload: RequestPayload,
    db: Session = Depends(get_db)
):
    """
    Thin controller endpoint validating payload, injecting dependencies,
    and invoking RequestService. Exception handlers globally catch custom service errors.
    """
    history_repo = HistoryRepository(db)
    environment_repo = EnvironmentRepository(db)
    request_service = RequestService(history_repo, environment_repo)
    
    response = await request_service.send_request(payload)
    return StandardResponse(
        success=True,
        message="Request sent and logged successfully.",
        data=response
    )
