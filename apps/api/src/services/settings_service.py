from src.repositories.settings import SettingsRepository
from src.schemas.settings import SettingsResponse, SettingsUpdate


class SettingsService:
    """
    Service containing business logic for parsing, validating, and managing
    dynamic configuration Settings.
    """

    def __init__(self, repo: SettingsRepository):
        self.repo = repo

    def get_settings(self) -> SettingsResponse:
        """Loads and returns parsed application settings from the database."""
        db_settings = self.repo.get_all()
        return SettingsResponse(
            follow_redirects=db_settings.get("follow_redirects", "true").lower() == "true",
            verify_ssl=db_settings.get("verify_ssl", "true").lower() == "true",
            default_timeout=float(db_settings.get("default_timeout", "10.0")),
            max_response_size=int(db_settings.get("max_response_size", "10485760"))
        )

    def update_settings(self, payload: SettingsUpdate) -> SettingsResponse:
        """Updates specific settings variables and returns the full configuration."""
        update_dict = payload.model_dump(exclude_unset=True)
        for key, val in update_dict.items():
            if val is not None:
                # Convert to standardized string storage format
                if isinstance(val, bool):
                    str_val = str(val).lower()
                else:
                    str_val = str(val)
                self.repo.set(key, str_val)
        return self.get_settings()
