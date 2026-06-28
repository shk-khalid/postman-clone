from fastapi import FastAPI

from src.core.config import settings
from src.database.database import engine
from src.database.base import Base
from src.api.request import router as request_router

# Import all models to ensure they are registered on the Base metadata before create_all
from src.models.history import History  # noqa: F401

# Create tables at startup (since Alembic is not implemented in MVP)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG,
)

app.include_router(request_router)


@app.get("/")
async def root():
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "environment": settings.APP_ENV
    }