from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.config import DATABASE_URL


def normalize_database_url(url: str) -> str:
    # Neon da "postgresql://..." y algunos servicios "postgres://...";
    # SQLAlchemy necesita que le digamos el driver: "postgresql+psycopg://..."
    if url.startswith("postgres://"):
        url = "postgresql://" + url.removeprefix("postgres://")
    if url.startswith("postgresql://"):
        url = "postgresql+psycopg://" + url.removeprefix("postgresql://")
    return url


SQLALCHEMY_DATABASE_URL = normalize_database_url(DATABASE_URL)
IS_SQLITE = SQLALCHEMY_DATABASE_URL.startswith("sqlite")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False} if IS_SQLITE else {},              # Opción exclusiva de SQLite
    pool_pre_ping=True                                                          # Comprueba la conexión antes de usarla (Neon cierra las inactivas)
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
