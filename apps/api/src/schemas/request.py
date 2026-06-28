from typing import Any, Dict
from pydantic import BaseModel, Field


class RequestPayload(BaseModel):
    """
    Pydantic schema representing the outbound HTTP request to be sent.
    """
    method: str = Field(..., description="HTTP Method (GET, POST, PUT, DELETE, etc.)")
    url: str = Field(..., description="Target destination URL")
    headers: Dict[str, str] | None = Field(default=None, description="Request headers")
    params: Dict[str, str] | None = Field(default=None, description="Query parameters to append to the URL")
    body: str | None = Field(default=None, description="Raw request body payload")
    auth: Dict[str, str] | None = Field(default=None, description="Authentication credentials (e.g. username/password)")


class ResponsePayload(BaseModel):
    """
    Pydantic schema representing the normalization of the outbound HTTP response.
    """
    status: int | None = Field(..., description="HTTP Status Code returned, or None if execution failed")
    status_text: str = Field(..., description="HTTP status text or error description")
    headers: Dict[str, str] = Field(default_factory=dict, description="Response headers")
    body: str = Field(..., description="Raw response content or error details")
    duration: float = Field(..., description="Request roundtrip duration in seconds")
    size: int = Field(..., description="Size of response payload in bytes")
