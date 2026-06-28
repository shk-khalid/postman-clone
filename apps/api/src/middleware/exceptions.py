import logging
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
import httpx

logger = logging.getLogger("api.errors")


from src.services.request_service import RequestServiceError
from src.services.environment_service import EnvironmentServiceError
from src.services.collection_service import CollectionServiceError
from src.services.history_service import HistoryServiceError


def register_exception_handlers(app: FastAPI) -> None:
    """
    Registers centralized exception handlers to format all API errors
    into a standardized JSON structure.
    """

    @app.exception_handler(RequestServiceError)
    @app.exception_handler(EnvironmentServiceError)
    @app.exception_handler(CollectionServiceError)
    @app.exception_handler(HistoryServiceError)
    async def service_exception_handler(request: Request, exc):
        return JSONResponse(
            status_code=getattr(exc, "status_code", 400),
            content={
                "success": False,
                "message": getattr(exc, "message", str(exc)),
                "errors": [{"detail": getattr(exc, "message", str(exc))}]
            }
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        errors_list = []
        for error in exc.errors():
            loc = " -> ".join(str(l) for l in error.get("loc", []))
            msg = error.get("msg", "Validation error")
            errors_list.append({"location": loc, "message": msg, "type": error.get("type")})
            
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "success": False,
                "message": "Request payload validation failed.",
                "errors": errors_list
            }
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "message": exc.detail,
                "errors": [{"detail": exc.detail}]
            }
        )

    @app.exception_handler(IntegrityError)
    async def integrity_error_handler(request: Request, exc: IntegrityError):
        logger.error(f"Database integrity conflict: {str(exc)}")
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={
                "success": False,
                "message": "A database integrity conflict occurred (e.g. key already exists).",
                "errors": [{"detail": str(exc.orig) if exc.orig else str(exc)}]
            }
        )

    @app.exception_handler(SQLAlchemyError)
    async def sqlalchemy_error_handler(request: Request, exc: SQLAlchemyError):
        logger.error(f"Database execution error: {str(exc)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "message": "An internal database error occurred.",
                "errors": [{"detail": "Persistent storage operation failed."}]
            }
        )

    @app.exception_handler(httpx.TimeoutException)
    async def httpx_timeout_handler(request: Request, exc: httpx.TimeoutException):
        return JSONResponse(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            content={
                "success": False,
                "message": "The outbound request timed out.",
                "errors": [{"detail": str(exc)}]
            }
        )

    @app.exception_handler(httpx.ConnectError)
    async def httpx_connect_handler(request: Request, exc: httpx.ConnectError):
        return JSONResponse(
            status_code=status.HTTP_502_BAD_GATEWAY,
            content={
                "success": False,
                "message": "Failed to establish connection to target outbound server.",
                "errors": [{"detail": str(exc)}]
            }
        )

    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception):
        logger.critical(f"Unhandled server exception: {str(exc)}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "message": "An unexpected error occurred on the server.",
                "errors": [{"detail": str(exc)}]
            }
        )
