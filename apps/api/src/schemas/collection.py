from datetime import datetime
from typing import Any, Dict
from pydantic import BaseModel, Field


class CreateSavedRequest(BaseModel):
    name: str = Field(..., min_length=1, description="Friendly display name of the saved request")
    method: str = Field(..., description="HTTP Method (GET, POST, etc.)")
    url: str = Field(..., description="Destination URL")
    headers: Dict[str, Any] | None = Field(default=None, description="Request Headers dictionary")
    params: Dict[str, Any] | None = Field(default=None, description="Query params dictionary")
    body: str | None = Field(default=None, description="Body string content")
    body_type: str | None = Field(default=None, description="Format of request body (json, text, form-data, etc.)")
    auth_type: str | None = Field(default=None, description="Type of authentication (basic, bearer, apiKey, etc.)")
    auth_data: Dict[str, Any] | None = Field(default=None, description="Auth details data snapshot")


class UpdateSavedRequest(BaseModel):
    name: str | None = Field(None, min_length=1)
    method: str | None = Field(None)
    url: str | None = Field(None)
    headers: Dict[str, Any] | None = Field(None)
    params: Dict[str, Any] | None = Field(None)
    body: str | None = Field(None)
    body_type: str | None = Field(None)
    auth_type: str | None = Field(None)
    auth_data: Dict[str, Any] | None = Field(None)


class SavedRequestResponse(BaseModel):
    id: int
    collection_id: int
    name: str
    method: str
    url: str
    headers: Dict[str, Any] | None
    params: Dict[str, Any] | None
    body: str | None
    body_type: str | None
    auth_type: str | None
    auth_data: Dict[str, Any] | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CreateCollection(BaseModel):
    name: str = Field(..., min_length=1, description="Collection name")
    description: str | None = Field(None, description="Optional description of the collection")


class UpdateCollection(BaseModel):
    name: str | None = Field(None, min_length=1)
    description: str | None = Field(None)


class CollectionResponse(BaseModel):
    id: int
    name: str
    description: str | None
    requests: list[SavedRequestResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
