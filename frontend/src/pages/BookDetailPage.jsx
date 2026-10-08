import { Link, useNavigate, useParams } from "react-router-dom";
import BookCover from "../components/BookCover";
import BottomSheet from "../components/BottomSheet";
import { STATUS_LABELS } from "../constants/bookStatus";
import { useState, useEffect } from "react";

const EMPTY_EDIT_FORM = { title: "", author: "", totalPages: "", coverUrl: "" };

// Intenta sacar el mensaje "detail" que devuelve FastAPI; si no, usa uno genérico
async function getErrorMessage(response, fallback) {
  try {
    const data = await response.json();
    if (typeof data.detail === "string") return data.detail;
  } catch {
    // La respuesta no era JSON: usamos el mensaje genérico
  }
  return `${fallback} (error ${response.status})`;
}

function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateError, setUpdateError] = useState(null);
  const [pageInput, setPageInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(EMPTY_EDIT_FORM);

  const token = localStorage.getItem("token");

  useEffect(() => {
    setLoading(true);
    setError(null);
    setIsEditing(false);

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

  // Devuelve true si se guardó y false si hubo error
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
        throw new Error(
          await getErrorMessage(response, "No se pudo actualizar el libro"),
        );
      }

      const data = await response.json();
      setBook(data);
      setPageInput(data.current_page);
      return true;
    } catch (err) {
      setUpdateError(err.message);
      return false;
    }
  }

  function handlePageSubmit(e) {
    e.preventDefault();
    updateBook({ current_page: Number(pageInput) });
  }

  function openEditForm() {
    setEditForm({
      title: book.title,
      author: book.author ?? "",
      totalPages: book.total_pages ?? "",
      coverUrl: book.cover_url ?? "",
    });
    setUpdateError(null);
    setIsEditing(true);
  }

  function closeEditForm() {
    setUpdateError(null);
    setIsEditing(false);
  }

  function handleEditChange(e) {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleEditSubmit(e) {
    e.preventDefault();

    const coverUrl = editForm.coverUrl.trim();

    const saved = await updateBook({
      title: editForm.title.trim(),
      author: editForm.author.trim(),
      total_pages:
        editForm.totalPages === "" ? null : Number(editForm.totalPages),
      cover_url: coverUrl === "" ? null : coverUrl,
    });

    if (saved) {
      setIsEditing(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `¿Seguro que quieres borrar "${book.title}"? Esta acción no se puede deshacer.`,
    );
    if (!confirmed) return;

    setUpdateError(null);

    try {
      const response = await fetch(`http://localhost:8000/books/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response, "No se pudo borrar el libro"),
        );
      }

      navigate("/");
    } catch (err) {
      setUpdateError(err.message);
    }
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
          {/* La key reinicia BookCover (y su imageError) cuando cambia la portada */}
          <BookCover key={book.cover_url ?? "sin-portada"} book={book} />
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

          {updateError && !isEditing && (
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

          <button
            type="button"
            onClick={openEditForm}
            className="mt-6 inline-flex cursor-pointer items-center gap-1.5 text-sm text-tinta/60 transition-colors hover:text-granate"
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
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
            Editar datos del libro
          </button>
        </div>
      </div>

      <BottomSheet
        isOpen={isEditing}
        onClose={closeEditForm}
        title="Editar datos"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label htmlFor="editTitle" className="field-label">
              Título
            </label>
            <input
              id="editTitle"
              name="title"
              type="text"
              required
              value={editForm.title}
              onChange={handleEditChange}
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="editAuthor" className="field-label">
              Autor
            </label>
            <input
              id="editAuthor"
              name="author"
              type="text"
              value={editForm.author}
              onChange={handleEditChange}
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="editTotalPages" className="field-label">
              Páginas totales
            </label>
            <input
              id="editTotalPages"
              name="totalPages"
              type="number"
              min="1"
              value={editForm.totalPages}
              onChange={handleEditChange}
              placeholder="Déjalo vacío si no lo sabes"
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="editCoverUrl" className="field-label">
              URL de la portada
            </label>
            <div className="flex gap-2">
              <input
                id="editCoverUrl"
                name="coverUrl"
                type="url"
                value={editForm.coverUrl}
                onChange={handleEditChange}
                placeholder="https://..."
                className="input-field"
              />
              {editForm.coverUrl && (
                <button
                  type="button"
                  onClick={() =>
                    setEditForm((prev) => ({ ...prev, coverUrl: "" }))
                  }
                  className="shrink-0 cursor-pointer text-sm text-tinta/60 transition-colors hover:text-granate"
                >
                  Quitar
                </button>
              )}
            </div>
          </div>

          {updateError && <p className="text-sm text-granate">{updateError}</p>}

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn-primary">
              Guardar cambios
            </button>
            <button
              type="button"
              onClick={closeEditForm}
              className="cursor-pointer px-4 py-2 text-sm text-tinta/70 transition-colors hover:text-granate"
            >
              Cancelar
            </button>
          </div>

          <div className="border-t border-dorado/30 pt-4">
            <button
              type="button"
              onClick={handleDelete}
              className="cursor-pointer rounded-md border border-granate/40 px-4 py-2 text-sm text-granate transition hover:bg-granate hover:text-cream"
            >
              Borrar libro
            </button>
          </div>
        </form>
      </BottomSheet>
    </div>
  );
}

export default BookDetailPage;
