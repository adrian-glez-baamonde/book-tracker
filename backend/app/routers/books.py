from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas import BookCreate, BookUpdate, BookResponse, StatusItem, StatsResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Book, User
from app.security import get_current_user
from app.services.open_library import search_books_by_title, format_book_result

router = APIRouter()


NON_NULLABLE_FIELDS = {"title", "author", "status", "current_page"}


def resolve_reading_progress(
    status: StatusItem,
    current_page: int,
    total_pages: int | None,
    apply_automatic_transitions: bool
) -> tuple[StatusItem, int]:
    # 1. Transiciones automáticas: solo cuando el usuario cambia la página sin elegir estado
    if apply_automatic_transitions:
        if total_pages is not None and current_page == total_pages:
            status = StatusItem.READ                                                    # Ha llegado a la última página
        elif status == StatusItem.READ and total_pages is not None:
            status = StatusItem.READING                                                 # Ha bajado de la última página
        elif current_page > 0 and status == StatusItem.TO_READ:
            status = StatusItem.READING                                                 # Ha empezado a leerlo

    # 2. Coherencia entre estado y página
    if status == StatusItem.READ and total_pages is not None:
        current_page = total_pages                                                      # Leído: página = total (si se conoce)
    elif status == StatusItem.TO_READ:
        current_page = 0                                                                # Por leer: sin empezar

    # Si es READ sin total_pages, se conserva current_page (antes se ponía a 0)
    return status, current_page


def validate_page_consistency(current_page: int, total_pages: int | None) -> None:
    if total_pages is not None and current_page > total_pages:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="El número de páginas actuales no puede ser superior al total")


@router.post("/books", response_model=BookResponse, status_code=status.HTTP_201_CREATED)
async def create_book(
    book: BookCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    book_status, current_page = resolve_reading_progress(
        book.status,
        book.current_page,
        book.total_pages,
        apply_automatic_transitions=True
    )
    validate_page_consistency(current_page, book.total_pages)

    new_book = Book(
        title=book.title,
        author=book.author,
        current_page=current_page,
        status=book_status,
        cover_url=book.cover_url,
        total_pages=book.total_pages,
        owner_id=current_user.id
    )

    db.add(new_book)                                                                    # Marcamos el objeto para ser guardado
    db.commit()                                                                         # Confirmamos el cambio en la base de datos
    db.refresh(new_book)                                                                # Recargamos el objeto para obtener el id y fechas ya generados

    return new_book


@router.get("/books", response_model=list[BookResponse])
async def show_books(
    status_filter: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Book).filter(Book.owner_id == current_user.id)

    if status_filter is not None:
        query = query.filter(Book.status == status_filter)

    books = query.all()

    return books


@router.get("/books/search")
async def search_book(
    title: str,
    current_user: User = Depends(get_current_user)
):
    results = await search_books_by_title(title)
    return [format_book_result(doc) for doc in results]


@router.get("/books/{book_id}", response_model=BookResponse)
async def get_book(
    book_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    book = db.query(Book).filter(Book.id == book_id).first()

    if book is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No existe ningún libro con id {book_id}")

    if book.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No existe ningún libro con id {book_id}")

    return book


@router.patch("/books/{book_id}", response_model=BookResponse)
async def update_book(
    book_update: BookUpdate,
    book_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    book = db.query(Book).filter(Book.id == book_id).first()

    if book is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No existe ningún libro con id {book_id}")

    if book.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No existe ningún libro con id {book_id}")

    update_data = book_update.model_dump(exclude_unset=True)                           # Solo los campos que venían en el JSON

    null_fields = sorted(
        field for field in NON_NULLABLE_FIELDS
        if field in update_data and update_data[field] is None
    )
    if null_fields:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"Estos campos no pueden ser nulos: {', '.join(null_fields)}")

    for field, value in update_data.items():
        setattr(book, field, value)                                                     # Equivale a book.<field> = value

    # Solo hay transición automática si el usuario cambió la página y NO eligió estado
    page_changed_without_status = (
        "current_page" in update_data and "status" not in update_data
    )

    book.status, book.current_page = resolve_reading_progress(
        book.status,
        book.current_page,
        book.total_pages,
        apply_automatic_transitions=page_changed_without_status
    )
    validate_page_consistency(book.current_page, book.total_pages)

    db.commit()
    db.refresh(book)

    return book


@router.delete("/books/{book_id}", response_model=BookResponse)
async def delete_book(
    book_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    book = db.query(Book).filter(Book.id == book_id).first()

    if book is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No existe ningún libro con id {book_id}")

    if book.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No existe ningún libro con id {book_id}")

    db.delete(book)                                                                     # SQLAlchemy traduce esto a un DELETE SQL sobre esa fila
    db.commit()

    return book


@router.get("/stats", response_model=StatsResponse)
async def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    books = db.query(Book).filter(Book.owner_id == current_user.id).all()

    to_read_count = len([b for b in books if b.status == StatusItem.TO_READ])
    reading_count = len([b for b in books if b.status == StatusItem.READING])
    read_count = len([b for b in books if b.status == StatusItem.READ])
    total_books = len(books)

    total_pages_read = sum([b.current_page for b in books])

    reading_books_with_total = [
        b for b in books
        if b.status == StatusItem.READING and b.total_pages is not None
    ]

    if not reading_books_with_total:
        average_reading_progress = None
    else:
        progresses = [b.current_page / b.total_pages * 100 for b in reading_books_with_total]
        average_reading_progress = sum(progresses) / len(progresses)

    return {
        "total_books": total_books,
        "to_read_count": to_read_count,
        "reading_count": reading_count,
        "read_count": read_count,
        "total_pages_read": total_pages_read,
        "average_reading_progress": average_reading_progress
    }
