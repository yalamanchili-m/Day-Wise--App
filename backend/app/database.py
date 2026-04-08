import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

ENV_PATH = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(ENV_PATH)


def _normalize_database_url(raw_url: str | None) -> str:
    if not raw_url:
        raise RuntimeError("DATABASE_URL is not set in backend/.env")

    normalized = raw_url.strip()
    if normalized.startswith("DATABASE_URL="):
        normalized = normalized.split("=", 1)[1].strip()

    if not normalized:
        raise RuntimeError("DATABASE_URL is empty in backend/.env")

    return normalized


SQLALCHEMY_DATABASE_URL = _normalize_database_url(os.getenv("DATABASE_URL"))

engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
