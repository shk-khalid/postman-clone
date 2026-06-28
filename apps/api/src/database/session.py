from sqlalchemy.orm import sessionmaker

from src.database.database import engine


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def get_db():
    """Dependency for injecting database sessions into API routes."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()