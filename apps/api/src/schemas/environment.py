from datetime import datetime
from pydantic import BaseModel, Field


class CreateVariable(BaseModel):
    key: str = Field(..., min_length=1, description="Variable name key")
    value: str = Field(..., description="Variable value mapping")


class UpdateVariable(BaseModel):
    key: str | None = Field(None, min_length=1, description="Variable name key")
    value: str | None = Field(None, description="Variable value mapping")


class VariableResponse(BaseModel):
    id: int
    environment_id: int
    key: str
    value: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CreateEnvironment(BaseModel):
    name: str = Field(..., min_length=1, description="Environment name (e.g. staging)")


class UpdateEnvironment(BaseModel):
    name: str | None = Field(None, min_length=1, description="Environment name")


class EnvironmentResponse(BaseModel):
    id: int
    name: str
    variables: list[VariableResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
