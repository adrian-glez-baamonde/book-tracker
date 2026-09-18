import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db
from app.models import Book, User
from app.schemas import StatusItem
from app.security import hash_password

TEST_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    TEST_DATABASE_URL, connect_args={"check_same_thread": False}
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(autouse=True)
def setup_and_teardown_db():
    Base.metadata.create_all(bind=engine)
    app.dependency_overrides[get_db] = override_get_db
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client(setup_and_teardown_db):
    return TestClient(app)


@pytest.fixture
def test_user(client):
    db = TestingSessionLocal()
    user = User(email="test@mail.com", hashed_password=hash_password("contraseña123"))
    db.add(user)
    db.commit()
    db.refresh(user)
    db.close()
    return user


@pytest.fixture
def other_user(client):
    db = TestingSessionLocal()
    user = User(email="test2@mail.com", hashed_password=hash_password("contraseña123"))
    db.add(user)
    db.commit()
    db.refresh(user)
    db.close()
    return user


@pytest.fixture
def auth_headers(client, test_user):
    response = client.post(
        "/login",
        data={"username": test_user.email, "password": "contraseña123"}
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def test_book(client, test_user):
    db = TestingSessionLocal()
    book = Book(
        title="Libro Prueba",
        author="Anónimo",
        current_page=0,
        total_pages=300,
        status=StatusItem.TO_READ,
        owner_id=test_user.id
    )
    db.add(book)
    db.commit()
    db.refresh(book)
    db.close()
    return book


@pytest.fixture
def other_book(client, other_user):
    db = TestingSessionLocal()
    book = Book(
        title="Libro Prueba 2",
        author="Anónimo",
        current_page=0,
        total_pages=500,
        status=StatusItem.TO_READ,
        owner_id=other_user.id
    )
    db.add(book)
    db.commit()
    db.refresh(book)
    db.close()
    return book