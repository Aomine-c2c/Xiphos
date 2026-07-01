import os
from contextlib import contextmanager
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from core.config import settings
from core.paths import get_base_dir
from core.logger import log
from core.database import Base

class DatabaseManager:
    def __init__(self):
        db_url = getattr(settings.database, 'url', None)
        self.engine = None

        # Try Postgres first; fall back to SQLite so the app always starts
        if db_url:
            try:
                engine = create_engine(db_url, connect_args={"connect_timeout": 3})
                # Probe the connection immediately to detect bad credentials
                with engine.connect():
                    pass
                self.engine = engine
                log.info(f"Connected to PostgreSQL: {db_url}")
            except Exception as e:
                log.warning(f"PostgreSQL unavailable ({e}). Falling back to SQLite.")

        if self.engine is None:
            sqlite_path = os.path.join(get_base_dir(), settings.database.path)
            os.makedirs(os.path.dirname(sqlite_path), exist_ok=True)
            self.engine = create_engine(f"sqlite:///{sqlite_path}")
            log.info(f"Using SQLite: {sqlite_path}")

        Base.metadata.create_all(self.engine)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)

    @contextmanager
    def get_session(self):
        session = self.SessionLocal()
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

db = DatabaseManager()
