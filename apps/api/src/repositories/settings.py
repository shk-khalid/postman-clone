from sqlalchemy.orm import Session
from src.models.settings import Settings


class SettingsRepository:
    """
    Repository for persisting and retrieving dynamic Settings.
    Seeds default configurations on startup or first request.
    """

    DEFAULTS = {
        "follow_redirects": "true",
        "verify_ssl": "true",
        "default_timeout": "10.0",
        "max_response_size": "10485760"
    }

    def __init__(self, db: Session):
        self.db = db
        # Seed defaults if not present
        self._seed_defaults()

    def _seed_defaults(self) -> None:
        """Seeds default configuration key-value pairs if not already present."""
        seeded = False
        for key, val in self.DEFAULTS.items():
            existing = self.db.query(Settings).filter(Settings.key == key).first()
            if not existing:
                self.db.add(Settings(key=key, value=val))
                seeded = True
        if seeded:
            self.db.commit()

    def get(self, key: str) -> str | None:
        record = self.db.query(Settings).filter(Settings.key == key).first()
        return record.value if record else None

    def get_all(self) -> dict[str, str]:
        records = self.db.query(Settings).all()
        return {r.key: r.value for r in records}

    def set(self, key: str, value: str) -> Settings:
        record = self.db.query(Settings).filter(Settings.key == key).first()
        if record:
            record.value = value
        else:
            record = Settings(key=key, value=value)
            self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        return record
