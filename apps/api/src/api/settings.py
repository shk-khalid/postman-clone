from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.database.session import get_db
from src.repositories.settings import SettingsRepository
from src.schemas.settings import SettingsResponse, SettingsUpdate
from src.schemas.response import StandardResponse
from src.services.settings_service import SettingsService


router = APIRouter(
    prefix="/api",
    tags=["settings"]
)


def get_settings_service(db: Session = Depends(get_db)) -> SettingsService:
    repo = SettingsRepository(db)
    return SettingsService(repo)


@router.get("/settings", response_model=StandardResponse[SettingsResponse])
def get_settings(service: SettingsService = Depends(get_settings_service)):
    """Retrieves current application settings."""
    settings_data = service.get_settings()
    return StandardResponse(
        success=True,
        message="Settings retrieved successfully.",
        data=settings_data
    )


@router.patch("/settings", response_model=StandardResponse[SettingsResponse])
def update_settings(payload: SettingsUpdate, service: SettingsService = Depends(get_settings_service)):
    """Updates settings variables configuration."""
    updated_data = service.update_settings(payload)
    return StandardResponse(
        success=True,
        message="Settings updated successfully.",
        data=updated_data
    )
