from pydantic import BaseModel, Field


class SettingsUpdate(BaseModel):
    follow_redirects: bool | None = Field(default=None, description="Whether to follow redirects automatically")
    verify_ssl: bool | None = Field(default=None, description="Whether to verify SSL certificates")
    default_timeout: float | None = Field(default=None, ge=0.1, le=300.0, description="Default request timeout in seconds")
    max_response_size: int | None = Field(default=None, ge=1024, description="Max allowed response size in bytes")


class SettingsResponse(BaseModel):
    follow_redirects: bool
    verify_ssl: bool
    default_timeout: float
    max_response_size: int
