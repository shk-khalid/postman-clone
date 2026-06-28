from fastapi import FastAPI

from src.core.config import settings
from src.database.database import engine
from src.database.base import Base
from src.api.request import router as request_router
from src.api.environment import router as environment_router
from src.api.collection import router as collection_router
from src.api.settings import router as settings_router
from src.api.history import router as history_router

from src.middleware.logging import LoggingMiddleware
from src.middleware.exceptions import register_exception_handlers

# Import all models to ensure they are registered on the Base metadata
from src.models.history import History  # noqa: F401
from src.models.environment import Environment  # noqa: F401
from src.models.variable import Variable  # noqa: F401
from src.models.collection import Collection  # noqa: F401
from src.models.request import SavedRequest  # noqa: F401
from src.models.settings import Settings  # noqa: F401

from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables automatically on application startup
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG,
    lifespan=lifespan,
)

# Register CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register logging middleware
app.add_middleware(LoggingMiddleware)

# Register global exception handlers
register_exception_handlers(app)

app.include_router(request_router)
app.include_router(environment_router)
app.include_router(collection_router)
app.include_router(settings_router)
app.include_router(history_router)


@app.get("/")
async def root():
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "environment": settings.APP_ENV
    }