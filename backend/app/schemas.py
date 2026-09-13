from datetime import datetime
from enum import Enum
from pydantic import BaseModel


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
    current_page: int = 0
    status: StatusItem = StatusItem.TO_READ
    cover_url: str | None = None
    total_pages: int | None = None


class BookUpdate(BaseModel):
    title: str | None = None
    author: str | None = None
    cover_url: str | None = None
    total_pages: int | None = None
    current_page: int | None = None
    status: StatusItem | None = None


class BookResponse(BaseModel):
    id: int
    owner_id: int
    title: str
    author: str
    cover_url: str | None = None
    total_pages: int | None = None
    current_page: int
    status: StatusItem
    created_at: datetime
    updated_at: datetime