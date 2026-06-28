import math
from src.repositories.history import HistoryRepository
from src.schemas.history import PaginatedHistoryResponse, HistoryResponse
from src.models.history import History


class HistoryServiceError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class HistoryService:
    """
    Service containing business logic for request History log operations.
    """

    def __init__(self, repo: HistoryRepository):
        self.repo = repo

    def get_paginated_history(
        self,
        page: int = 1,
        limit: int = 20,
        method: str | None = None,
        search: str | None = None,
        status: int | None = None,
        sort: str = "newest"
    ) -> PaginatedHistoryResponse:
        """Queries and formats a paginated history response."""
        if page < 1:
            page = 1
        if limit < 1 or limit > 100:
            limit = 20

        items, total = self.repo.list_paginated(
            page=page,
            limit=limit,
            method=method,
            search=search,
            status=status,
            sort=sort
        )

        pages = math.ceil(total / limit) if total > 0 else 1

        return PaginatedHistoryResponse(
            items=[HistoryResponse.model_validate(item) for item in items],
            total=total,
            page=page,
            limit=limit,
            pages=pages
        )

    def get_history_detail(self, history_id: int) -> History:
        """Retrieves details of a single request history log."""
        history = self.repo.get(history_id)
        if not history:
            raise HistoryServiceError(f"History record with ID {history_id} not found", status_code=404)
        return history

    def delete_history_record(self, history_id: int) -> None:
        """Deletes a single request history log."""
        history = self.get_history_detail(history_id)
        self.repo.delete(history)

    def clear_history(self) -> None:
        """Deletes all request logs."""
        self.repo.clear_all()
