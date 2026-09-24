import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
    <div className="flex justify-center px-4 py-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white/60 border border-dorado rounded-lg shadow-md p-6"
      >
        <h1 className="text-2xl font-bold text-verde mb-6 text-center">
          Añadir libro
        </h1>

        <div className="relative mb-3">
          <input
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
            placeholder="Título"
            className="w-full border border-dorado rounded px-3 py-2 bg-cream focus:outline-none focus:ring-2 focus:ring-granate"
          />

          {title.length >= 3 && !justSelected && loadingSearch && (
            <p className="text-sm text-tinta/60 mt-1">Buscando...</p>
          )}

          {title.length >= 3 &&
            !justSelected &&
            !loadingSearch &&
            searchResults.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-dorado rounded shadow-md mt-1 max-h-56 overflow-y-auto">
                {searchResults.map((book, index) => (
                  <li
                    key={index}
                    onClick={() => handleSelectResult(book)}
                    className="px-3 py-2 hover:bg-cream cursor-pointer border-b border-dorado/30 last:border-b-0"
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
              <p className="text-sm text-tinta/60 mt-1">
                No se han encontrado resultados
              </p>
            )}
        </div>

        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Autor"
          className="w-full border border-dorado rounded px-3 py-2 mb-3 bg-cream focus:outline-none focus:ring-2 focus:ring-granate"
        />
        <input
          type="number"
          value={totalPages}
          onChange={(e) => setTotalPages(e.target.value)}
          placeholder="Páginas totales (opcional)"
          className="w-full border border-dorado rounded px-3 py-2 mb-4 bg-cream focus:outline-none focus:ring-2 focus:ring-granate"
        />

        <button
          type="submit"
          className="w-full bg-granate text-cream font-semibold py-2 rounded hover:bg-granate/90 transition"
        >
          Añadir libro
        </button>

        {error && <p className="text-red-700 text-sm mt-3">{error}</p>}
      </form>
    </div>
  );
}

export default AddBookPage;
