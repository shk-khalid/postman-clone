from datetime import datetime
from typing import Any, Dict
from pydantic import BaseModel


class HistoryResponse(BaseModel):
    id: int
    method: str
    url: str
    status: int | None
    duration: float | None
    response_size: int | None
    request_snapshot: Dict[str, Any] | None
    response_snapshot: Dict[str, Any] | None
    created_at: datetime

    class Config:
        from_attributes = True


class PaginatedHistoryResponse(BaseModel):
    items: list[HistoryResponse]
    total: int
    page: int
    limit: int
    pages: int
