from datetime import datetime
from enum import Enum
from typing import Annotated
from pydantic import AfterValidator, BaseModel, Field, HttpUrl, TypeAdapter


_http_url_adapter = TypeAdapter(HttpUrl)


def validate_http_url(value: str) -> str:
    return str(_http_url_adapter.validate_python(value))                            # Valida como URL http/https y la devuelve como str


CoverUrl = Annotated[str, AfterValidator(validate_http_url)]


class StatusItem(str, Enum):
    TO_READ = "to-read"
    READING = "reading"
    READ = "read"


class UserCreate(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    created_at: datetime


class BookCreate(BaseModel):
    title: str
    author: str
    current_page: int = Field(default=0, ge=0)
    status: StatusItem = StatusItem.TO_READ
    cover_url: CoverUrl | None = None
    total_pages: int | None = Field(default=None, gt=0)


class BookUpdate(BaseModel):
    title: str | None = None
    author: str | None = None
    cover_url: CoverUrl | None = None
    total_pages: int | None = Field(default=None, gt=0)
    current_page: int | None = Field(default=None, ge=0)
    status: StatusItem | None = None


class BookResponse(BaseModel):
    id: int
    owner_id: int
    title: str
    author: str
    cover_url: str | None = None
    total_pages: int | None = Field(default=None, gt=0)
    current_page: int = Field(ge=0)
    status: StatusItem
    created_at: datetime
    updated_at: datetime


class StatsResponse(BaseModel):
    total_books: int
    to_read_count: int
    reading_count: int
    read_count: int
    total_pages_read: int
    average_reading_progress: float| None = None