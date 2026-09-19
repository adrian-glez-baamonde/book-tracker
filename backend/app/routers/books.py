from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas import BookCreate, BookUpdate, BookResponse, StatusItem, StatsResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Book, User
from app.security import get_current_user
from app.services.open_library import search_books_by_title, format_book_result

router = APIRouter()


def calculate_current_page(status: StatusItem, total_pages: int | None, current_page: int) -> int:
    if status == StatusItem.READ:
        return total_pages if total_pages is not None else 0

    return current_page


def validate_page_consistency(current_page: int, total_pages: int | None) -> None:
    if total_pages is not None and current_page > total_pages:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="El número de páginas actuales no puede ser superior al total")


@router.post("/books", response_model=BookResponse, status_code=status.HTTP_201_CREATED)
async def create_book(
    book: BookCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    
    current_page = calculate_current_page(book.status, book.total_pages, book.current_page)
    validate_page_consistency(current_page, book.total_pages)

    new_book = Book(
        title=book.title,
        author=book.author,
        current_page=current_page,
        status=book.status,
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

    if book_update.title is not None:
        book.title = book_update.title

    if book_update.author is not None:
        book.author = book_update.author

    if book_update.cover_url is not None:
        book.cover_url = book_update.cover_url

    if book_update.total_pages is not None:
        book.total_pages = book_update.total_pages

    if book_update.current_page is not None:
        book.current_page = book_update.current_page

    if book_update.status is not None:
        book.status = book_update.status

    book.current_page = calculate_current_page(book.status, book.total_pages, book.current_page)
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