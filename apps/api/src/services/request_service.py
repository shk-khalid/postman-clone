import time
from typing import Any, Dict
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse
import httpx

from src.models.history import History
from src.repositories.history import HistoryRepository
from src.repositories.environment import EnvironmentRepository
from src.services.settings_service import SettingsService
from src.schemas.request import RequestPayload, ResponsePayload


class RequestServiceError(Exception):
    """Custom exception raised when an outbound request fails to execute."""
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class RequestService:
    """
    Service layer responsible for business logic around validating, preparing,
    executing outbound HTTP requests, calculating metrics, and storing history.
    """

    def __init__(
        self,
        history_repo: HistoryRepository,
        environment_repo: EnvironmentRepository | None = None,
        settings_service: SettingsService | None = None
    ):
        self.history_repo = history_repo
        self.environment_repo = environment_repo
        self.settings_service = settings_service

    def _resolve(self, val: Any, variables: list) -> Any:
        """
        Recursively resolves {{key}} variable placeholders with variable values.
        """
        if isinstance(val, str):
            for var in variables:
                placeholder = f"{{{{{var.key}}}}}"
                val = val.replace(placeholder, var.value)
            return val
        elif isinstance(val, dict):
            return {self._resolve(k, variables): self._resolve(v, variables) for k, v in val.items()}
        elif isinstance(val, list):
            return [self._resolve(item, variables) for item in val]
        return val

    def _prepare_request(self, payload: RequestPayload) -> tuple[str, dict[str, str], tuple[str, str] | None]:
        """
        Validates URL, resolves and merges query parameters, and sets up authentication.
        """
        # Validate URL scheme and netloc
        url = payload.url.strip()
        if not url:
            raise RequestServiceError("URL cannot be empty")

        parsed = urlparse(url)
        if not parsed.scheme or not parsed.netloc:
            # Try to prepend http:// if scheme is missing, standard browser/Postman behavior
            if not url.startswith(("http://", "https://")):
                url = "http://" + url
                parsed = urlparse(url)
            else:
                raise RequestServiceError(f"Invalid URL format: '{payload.url}'")

        # Merge query parameters
        url_params = dict(parse_qsl(parsed.query))
        merged_params = {**url_params, **(payload.params or {})}

        # Reconstruct URL without query string (so httpx can append the merged params properly)
        clean_url = urlunparse((
            parsed.scheme,
            parsed.netloc,
            parsed.path,
            parsed.params,
            urlencode(merged_params) if merged_params else "",
            parsed.fragment
        ))

        # Setup headers
        headers = payload.headers.copy() if payload.headers else {}

        # Setup authentication
        auth_tuple = None
        if payload.auth:
            username = payload.auth.get("username", "")
            password = payload.auth.get("password", "")
            # Basic Auth
            if username or password:
                auth_tuple = (username, password)
            # Bearer Auth fallback
            elif "bearer" in payload.auth or "token" in payload.auth:
                token = payload.auth.get("bearer") or payload.auth.get("token")
                if token:
                    headers["Authorization"] = f"Bearer {token}"

        return clean_url, headers, auth_tuple

    async def send_request(self, payload: RequestPayload) -> ResponsePayload:
        """
        Executes the outbound HTTP request, calculates metrics, saves history,
        and returns the response payload. Resolves variables and applies settings.
        """
        # Load environment and resolve variables if environment_id is provided
        variables = []
        if payload.environment_id and self.environment_repo:
            env = self.environment_repo.get(payload.environment_id)
            if env:
                variables = env.variables

        # Resolve variable placeholders in payload parameters before execution
        if variables:
            payload.url = self._resolve(payload.url, variables)
            if payload.headers:
                payload.headers = self._resolve(payload.headers, variables)
            if payload.params:
                payload.params = self._resolve(payload.params, variables)
            if payload.body:
                payload.body = self._resolve(payload.body, variables)
            if payload.auth:
                payload.auth = self._resolve(payload.auth, variables)

        # Default fallback values for configuration settings
        follow_redirects = True
        verify_ssl = True
        timeout_val = 10.0
        max_size_limit = 10485760

        # Override defaults using SettingsService values
        if self.settings_service:
            settings_obj = self.settings_service.get_settings()
            follow_redirects = settings_obj.follow_redirects
            verify_ssl = settings_obj.verify_ssl
            timeout_val = settings_obj.default_timeout
            max_size_limit = settings_obj.max_response_size

        try:
            url, headers, auth = self._prepare_request(payload)
        except RequestServiceError as e:
            self._save_history_fail(payload, str(e))
            raise e

        # Prepare request snapshots
        request_snapshot = {
            "method": payload.method,
            "url": payload.url,
            "headers": headers,
            "params": payload.params,
            "body": payload.body,
            "auth": {k: "***" for k in payload.auth.keys()} if payload.auth else None
        }

        start_time = time.perf_counter()
        
        try:
            async with httpx.AsyncClient(timeout=timeout_val, verify=verify_ssl, follow_redirects=follow_redirects) as client:
                response = await client.request(
                    method=payload.method,
                    url=url,
                    headers=headers,
                    content=payload.body,
                    auth=auth
                )
            
            duration = time.perf_counter() - start_time
            response_size = len(response.content)

            # Check response size limits
            if response_size > max_size_limit:
                raise RequestServiceError(f"Response size ({response_size} bytes) exceeds configured limit of {max_size_limit} bytes", status_code=413)
            
            # Normalize response body (decode to text)
            try:
                response_body = response.text
            except Exception:
                response_body = "<Binary/Unparseable Content>"

            response_payload = ResponsePayload(
                status=response.status_code,
                status_text=response.reason_phrase,
                headers=dict(response.headers),
                body=response_body,
                duration=duration,
                size=response_size
            )

            # Save history
            response_snapshot = {
                "status": response.status_code,
                "status_text": response.reason_phrase,
                "headers": dict(response.headers),
                "size": response_size
            }

            history = History(
                method=payload.method,
                url=payload.url,
                status=response.status_code,
                duration=duration,
                response_size=response_size,
                request_snapshot=request_snapshot,
                response_snapshot=response_snapshot
            )
            self.history_repo.save(history)

            return response_payload

        except httpx.ConnectTimeout as e:
            duration = time.perf_counter() - start_time
            self._save_history_fail(payload, "Connection Timeout", duration, request_snapshot)
            raise RequestServiceError("Connection timed out. Target host took too long to respond.", status_code=504)

        except httpx.ReadTimeout as e:
            duration = time.perf_counter() - start_time
            self._save_history_fail(payload, "Read Timeout", duration, request_snapshot)
            raise RequestServiceError("Read timed out. The server took too long to send response data.", status_code=504)

        except httpx.ConnectError as e:
            duration = time.perf_counter() - start_time
            self._save_history_fail(payload, f"Connection Error: {str(e)}", duration, request_snapshot)
            raise RequestServiceError("Failed to connect to the server. Please check the URL or host address.", status_code=502)

        except httpx.HTTPStatusError as e:
            duration = time.perf_counter() - start_time
            self._save_history_fail(payload, f"HTTP Error: {str(e)}", duration, request_snapshot)
            raise RequestServiceError(f"HTTP response error: {str(e)}", status_code=500)

        except httpx.RequestError as e:
            duration = time.perf_counter() - start_time
            self._save_history_fail(payload, f"Request Error: {str(e)}", duration, request_snapshot)
            raise RequestServiceError(f"Outbound request failed: {str(e)}", status_code=400)

        except RequestServiceError as e:
            duration = time.perf_counter() - start_time
            self._save_history_fail(payload, e.message, duration, request_snapshot)
            raise e

        except Exception as e:
            duration = time.perf_counter() - start_time
            self._save_history_fail(payload, f"Unexpected error: {str(e)}", duration, request_snapshot)
            raise RequestServiceError(f"An unexpected error occurred: {str(e)}", status_code=500)

    def _save_history_fail(
        self,
        payload: RequestPayload,
        error_msg: str,
        duration: float | None = None,
        request_snapshot: Dict[str, Any] | None = None
    ):
        """Helper to save failed execution attempts to database history."""
        try:
            if not request_snapshot:
                request_snapshot = {
                    "method": payload.method,
                    "url": payload.url,
                    "headers": payload.headers,
                    "params": payload.params,
                    "body": payload.body
                }

            history = History(
                method=payload.method,
                url=payload.url,
                status=None,
                duration=duration,
                response_size=None,
                request_snapshot=request_snapshot,
                response_snapshot={"error": error_msg}
            )
            self.history_repo.save(history)
        except Exception:
            pass
