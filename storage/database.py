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
        if db_url:
            self.engine = create_engine(db_url)
            log.info(f"Connected to PostgreSQL via SQLAlchemy: {db_url}")
        else:
            sqlite_path = os.path.join(get_base_dir(), settings.database.path)
            os.makedirs(os.path.dirname(sqlite_path), exist_ok=True)
            self.engine = create_engine(f"sqlite:///{sqlite_path}")
            log.info(f"Connected to SQLite via SQLAlchemy: {sqlite_path}")
            
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
