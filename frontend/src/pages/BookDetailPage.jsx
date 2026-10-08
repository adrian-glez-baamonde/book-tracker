import { Link, useParams } from "react-router-dom";
import BookCover from "../components/BookCover";
import { STATUS_LABELS } from "../constants/bookStatus";
import { useState, useEffect } from "react";

function BookDetailPage() {
  const { id } = useParams();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateError, setUpdateError] = useState(null);
  const [pageInput, setPageInput] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    setLoading(true);
    setError(null);

    let ignore = false;

    async function fetchBook() {
      try {
        const response = await fetch(`http://localhost:8000/books/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status} al cargar el libro`);
        }

        const data = await response.json();
        if (!ignore) {
          setBook(data);
          setPageInput(data.current_page);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchBook();

    return () => {
      ignore = true;
    };
  }, [id]);

  async function updateBook(changes) {
    setUpdateError(null);

    try {
      const response = await fetch(`http://localhost:8000/books/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(changes),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status} al actualizar el libro`);
      }

      const data = await response.json();
      setBook(data);
      setPageInput(data.current_page);
    } catch (err) {
      setUpdateError(err.message);
    }
  }

  function handlePageSubmit(e) {
    e.preventDefault();
    updateBook({ current_page: Number(pageInput) });
  }

  if (loading)
    return (
      <p className="mt-16 text-center font-serif text-2xl text-verde animate-pulse">
        Cargando libro...
      </p>
    );
  if (error)
    return (
      <p className="max-w-md mx-auto mt-16 text-center text-granate bg-granate/5 border border-granate/20 rounded-lg px-4 py-3">
        Error: {error}
      </p>
    );

  const hasTotal = book.total_pages !== null;
  const progress = hasTotal
    ? Math.min(100, (book.current_page / book.total_pages) * 100)
    : 0;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-10">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-tinta/60 transition-colors hover:text-granate"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="M19 12H5" />
          <path d="m11 18-6-6 6-6" />
        </svg>
        Volver a la estantería
      </Link>

      <div className="flex flex-col items-center gap-8 md:flex-row md:items-start md:gap-12">
        <div className="w-40 shrink-0 md:w-56">
          <BookCover book={book} />
        </div>

        <div className="w-full flex-1 text-center md:text-left">
          <p className="eyebrow mb-2">
            {STATUS_LABELS[book.status] ?? book.status}
          </p>
          <h1 className="text-4xl leading-tight text-verde md:text-5xl">
            {book.title}
          </h1>
          {book.author && (
            <p className="mt-2 font-serif text-xl italic text-tinta/70">
              {book.author}
            </p>
          )}

          <div className="mt-6 flex flex-wrap justify-center gap-2 md:justify-start">
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => updateBook({ status: value })}
                className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm transition ${
                  book.status === value
                    ? "border-granate bg-granate text-cream"
                    : "border-dorado/50 text-tinta/70 hover:border-granate hover:text-granate"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {updateError && (
            <p className="mt-3 text-sm text-granate">{updateError}</p>
          )}

          <div className="card-surface mt-8 p-5 text-left">
            <div className="mb-3 flex items-baseline justify-between">
              <span className="text-xs uppercase tracking-wider text-tinta/60">
                Progreso de lectura
              </span>
              <span className="font-serif text-lg text-granate">
                {hasTotal
                  ? `${book.current_page} / ${book.total_pages} páginas`
                  : `Página ${book.current_page}`}
              </span>
            </div>

            {hasTotal ? (
              <div className="h-2 overflow-hidden rounded-full bg-tinta/10">
                <div
                  className="h-full rounded-full bg-linear-to-r from-granate to-dorado"
                  style={{ width: `${progress}%` }}
                />
              </div>
            ) : (
              <p className="text-sm italic text-tinta/50">
                Añade el número total de páginas para ver tu progreso.
              </p>
            )}

            <form
              onSubmit={handlePageSubmit}
              className="mt-5 flex items-end gap-3"
            >
              <div className="flex-1">
                <label htmlFor="currentPage" className="field-label">
                  Página actual
                </label>
                <input
                  id="currentPage"
                  type="number"
                  min="0"
                  max={book.total_pages ?? undefined}
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  className="input-field"
                />
              </div>
              <button type="submit" className="btn-primary">
                Guardar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookDetailPage;
