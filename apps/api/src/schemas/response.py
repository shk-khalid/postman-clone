from typing import Any, Generic, TypeVar
from pydantic import BaseModel


T = TypeVar("T")


class StandardResponse(BaseModel, Generic[T]):
    """
    Standardized API response wrapper structure.
    """
    success: bool
    message: str
    data: T | None = None
    errors: list[Any] | None = None
