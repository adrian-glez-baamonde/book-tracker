"""
Crea (o reinicia) la cuenta demo de Monfort con libros de ejemplo.

Uso, desde backend/:
    uv run python -m scripts.seed_demo

Usa la base de datos de DATABASE_URL (o SQLite local si no está definida).
Se puede ejecutar todas las veces que haga falta: borra los libros de la
cuenta demo y los vuelve a crear, así que deja la demo como nueva.
"""
import asyncio

from app.database import Base, SessionLocal, engine
from app.models import Book, User
from app.routers.books import resolve_reading_progress
from app.schemas import StatusItem
from app.security import hash_password
from app.services.open_library import format_book_result, search_books_by_title

DEMO_EMAIL = "demo@monfort.app"
DEMO_PASSWORD = "monfort-demo"

# (título, autor, búsqueda en Open Library, estado, progreso de 0 a 1)
DEMO_BOOKS = [
    ("El imperio final", "Brandon Sanderson", "Mistborn The Final Empire", StatusItem.READING, 0.4),
    ("Cien años de soledad", "Gabriel García Márquez", "Cien años de soledad", StatusItem.READING, 0.65),
    ("Dune", "Frank Herbert", "Dune", StatusItem.TO_READ, 0),
    ("La sombra del viento", "Carlos Ruiz Zafón", "La sombra del viento", StatusItem.TO_READ, 0),
    ("El nombre del viento", "Patrick Rothfuss", "The Name of the Wind", StatusItem.TO_READ, 0),
    ("1984", "George Orwell", "Nineteen Eighty-Four", StatusItem.READ, 1),
    ("El principito", "Antoine de Saint-Exupéry", "Le Petit Prince", StatusItem.READ, 1),
    ("Don Quijote de la Mancha", "Miguel de Cervantes", "Don Quijote", StatusItem.READ, 1),
]


async def find_cover_and_pages(query: str, author: str) -> tuple[str | None, int | None]:
    try:
        docs = await search_books_by_title(query)
    except Exception as error:                                                          # Sin conexión o Open Library caído: libro sin portada
        print(f"  Aviso: no se pudo buscar «{query}» ({error})")
        return None, None

    surname = author.split()[-1].lower()
    results = [format_book_result(doc) for doc in docs]
    with_cover = [r for r in results if r.get("cover_url")]
    by_author = [r for r in with_cover if surname in (r.get("author") or "").lower()]

    best = (by_author or with_cover or [None])[0]
    if best is None:
        return None, None
    return best.get("cover_url"), best.get("total_pages")


async def main() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        user = db.query(User).filter(User.email == DEMO_EMAIL).first()
        if user is None:
            user = User(email=DEMO_EMAIL, hashed_password=hash_password(DEMO_PASSWORD))
            db.add(user)
            db.flush()                                                                  # Obtiene user.id sin cerrar la transacción
            print(f"Usuario demo creado: {DEMO_EMAIL}")
        else:
            user.hashed_password = hash_password(DEMO_PASSWORD)                         # Por si alguien la hubiera cambiado
            deleted = db.query(Book).filter(Book.owner_id == user.id).delete()
            print(f"Usuario demo encontrado; {deleted} libros anteriores borrados")

        for title, author, query, status, progress in DEMO_BOOKS:
            cover_url, total_pages = await find_cover_and_pages(query, author)
            current_page = round(total_pages * progress) if total_pages else (120 if progress else 0)

            status, current_page = resolve_reading_progress(
                status, current_page, total_pages, apply_automatic_transitions=False
            )

            db.add(Book(
                title=title,
                author=author,
                cover_url=cover_url,
                total_pages=total_pages,
                current_page=current_page,
                status=status,
                owner_id=user.id
            ))
            print(f"  + {title} ({status.value}, portada: {'sí' if cover_url else 'no'})")

        db.commit()                                                                     # Todo o nada: si algo falla antes, no se guarda nada
        print("Cuenta demo lista.")
    finally:
        db.close()


if __name__ == "__main__":
    asyncio.run(main())
