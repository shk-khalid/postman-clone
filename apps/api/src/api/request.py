from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from src.database.session import get_db
from src.repositories.history import HistoryRepository
from src.schemas.request import RequestPayload, ResponsePayload
from src.services.request_service import RequestService, RequestServiceError


router = APIRouter(
    prefix="/api/request",
    tags=["request"]
)


from src.repositories.environment import EnvironmentRepository


@router.post(
    "/send",
    response_model=ResponsePayload,
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
    and invoking RequestService.
    """
    history_repo = HistoryRepository(db)
    environment_repo = EnvironmentRepository(db)
    request_service = RequestService(history_repo, environment_repo)
    
    try:
        response = await request_service.send_request(payload)
        return response
    except RequestServiceError as e:
        return JSONResponse(
            status_code=e.status_code,
            content={"detail": e.message}
        )
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": f"Internal server error: {str(e)}"}
        )
