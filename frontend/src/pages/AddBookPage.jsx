import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Reveal from "../components/Reveal";

function AddBookPage() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [totalPages, setTotalPages] = useState("");
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [coverUrl, setCoverUrl] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [skipSearch, setSkipSearch] = useState(false);
  const [justSelected, setJustSelected] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);

  useEffect(() => {
    if (skipSearch) {
      setSkipSearch(false);
      return;
    }

    if (title.length < 3) {
      setSearchResults([]);
      setLoadingSearch(false);
      return;
    }

    setLoadingSearch(true);

    let ignore = false;

    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/books/search?title=${title}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Error al buscar en Open Library");
        }

        const data = await response.json();
        if (!ignore) {
          setSearchResults(data.slice(0, 8));
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!ignore) {
          setLoadingSearch(false);
        }
      }
    }, 200);

    return () => {
      ignore = true;
      clearTimeout(timeoutId);
    };
  }, [title]);

  function handleSelectResult(book) {
    setSkipSearch(true);
    setJustSelected(true);
    setTitle(book.title);
    setAuthor(book.author);
    setTotalPages(book.total_pages ?? "");
    setCoverUrl(book.cover_url);
    setSearchResults([]);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8000/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title,
          author: author,
          total_pages: totalPages ? Number(totalPages) : null,
          cover_url: coverUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo añadir el libro");
      }

      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="flex justify-center px-4 py-10">
      <Reveal className="w-full max-w-lg">
        <form
          onSubmit={handleSubmit}
          className="card-surface relative overflow-hidden px-6 md:px-8 py-8 shadow-lg"
        >
          <span className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-granate via-dorado to-verde" />

          <p className="eyebrow text-center mb-1">Nueva adquisición</p>
          <h1 className="text-4xl text-verde text-center mb-8">Añadir libro</h1>

          {coverUrl && (
            <div className="flex justify-center mb-6">
              <img
                src={coverUrl}
                alt={`Portada de ${title}`}
                className="h-40 rounded shadow-md"
              />
            </div>
          )}

          <label htmlFor="title" className="field-label">
            Título
          </label>
          <div className="relative mb-4">
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => {
                setJustSelected(false);
                setTitle(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                }
              }}
              onBlur={() => {
                setTimeout(() => setJustSelected(true), 150);
              }}
              placeholder="Empieza a escribir para buscar..."
              className="input-field"
            />

            {title.length >= 3 && !justSelected && loadingSearch && (
              <p className="text-sm italic text-tinta/60 mt-2">
                Buscando en Open Library...
              </p>
            )}

            {title.length >= 3 &&
              !justSelected &&
              !loadingSearch &&
              searchResults.length > 0 && (
                <ul className="absolute z-10 w-full mt-2 max-h-64 overflow-y-auto rounded-lg border border-dorado/40 bg-white shadow-xl">
                  {searchResults.map((book, index) => (
                    <li
                      key={index}
                      onClick={() => handleSelectResult(book)}
                      className="px-4 py-2.5 cursor-pointer border-b border-dorado/20 last:border-b-0 transition-colors hover:bg-cream"
                    >
                      <p className="font-medium text-verde">{book.title}</p>
                      <p className="text-sm text-tinta/70">{book.author}</p>
                    </li>
                  ))}
                </ul>
              )}

            {title.length >= 3 &&
              !justSelected &&
              !loadingSearch &&
              searchResults.length === 0 && (
                <p className="text-sm italic text-tinta/60 mt-2">
                  No se han encontrado resultados
                </p>
              )}
          </div>

          <label htmlFor="author" className="field-label">
            Autor
          </label>
          <input
            id="author"
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Nombre del autor"
            className="input-field mb-4"
          />

          <label htmlFor="totalPages" className="field-label">
            Páginas totales
          </label>
          <input
            id="totalPages"
            type="number"
            value={totalPages}
            onChange={(e) => setTotalPages(e.target.value)}
            placeholder="Opcional"
            className="input-field mb-6"
          />

          <button type="submit" className="btn-primary w-full">
            Añadir libro
          </button>

          {error && (
            <p className="mt-4 text-sm text-center text-granate bg-granate/5 border border-granate/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </form>
      </Reveal>
    </div>
  );
}

export default AddBookPage;
