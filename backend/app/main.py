from fastapi import FastAPI
from app.routers import auth, books
from app.database import engine, Base
from app.models import User, Book
from fastapi.middleware.cors import CORSMiddleware


Base.metadata.create_all(bind=engine)


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(books.router)


@app.get("/")
async def root():
    return "¡Hola FastAPI!"