from fastapi import FastAPI
from app.routers import auth, books
from app.database import engine, Base
from app.models import User, Book


Base.metadata.create_all(bind=engine)


app = FastAPI()


app.include_router(auth.router)
app.include_router(books.router)


@app.get("/")
async def root():
    return "¡Hola FastAPI!"