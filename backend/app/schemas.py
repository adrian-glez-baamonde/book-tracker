from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field


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
    cover_url: str | None = None
    total_pages: int | None = Field(default=None, gt=0)


class BookUpdate(BaseModel):
    title: str | None = None
    author: str | None = None
    cover_url: str | None = None
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