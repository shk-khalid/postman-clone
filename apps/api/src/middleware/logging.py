import time
import uuid
import logging
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

# Configure logger name
logger = logging.getLogger("api.access")
# Set a default logging level
logger.setLevel(logging.INFO)


class LoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware logging client IPs, Request IDs, HTTP verbs, status codes,
    and request/response execution times.
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = str(uuid.uuid4())
        # Store on request state for reuse inside handlers or error boundary
        request.state.request_id = request_id
        
        start_time = time.perf_counter()
        client_ip = request.client.host if request.client else "unknown"
        
        logger.info(
            f"RID={request_id} IP={client_ip} START {request.method} {request.url.path}"
        )
        
        try:
            response = await call_next(request)
            duration = (time.perf_counter() - start_time) * 1000  # ms
            
            logger.info(
                f"RID={request_id} IP={client_ip} FINISH {request.method} {request.url.path} "
                f"STATUS={response.status_code} TIME={duration:.2f}ms"
            )
            
            # Attach Request ID header to client responses
            response.headers["X-Request-ID"] = request_id
            return response
            
        except Exception as e:
            duration = (time.perf_counter() - start_time) * 1000  # ms
            logger.error(
                f"RID={request_id} IP={client_ip} CRASH {request.method} {request.url.path} "
                f"ERROR='{str(e)}' TIME={duration:.2f}ms"
            )
            raise e
