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

  // Búsqueda con debounce: se dispara cada vez que "title" cambia
  useEffect(() => {
    if (skipSearch) {
      setSkipSearch(false);
      return;
    }

    if (title.length < 3) {
      setSearchResults([]);
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
        const data = await response.json();
        if (!ignore) {
          setSearchResults(data);
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
    <form onSubmit={handleSubmit}>
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
      />

      {title.length >= 3 && !justSelected && loadingSearch && (
        <p>Buscando...</p>
      )}

      {title.length >= 3 &&
        !justSelected &&
        !loadingSearch &&
        searchResults.length > 0 && (
          <ul>
            {searchResults.map((book, index) => (
              <li key={index} onClick={() => handleSelectResult(book)}>
                {book.title} — {book.author}
              </li>
            ))}
          </ul>
        )}

      {title.length >= 3 &&
        !justSelected &&
        !loadingSearch &&
        searchResults.length === 0 && <p>No se han encontrado resultados</p>}

      <input
        type="text"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        placeholder="Autor"
      />
      <input
        type="number"
        value={totalPages}
        onChange={(e) => setTotalPages(e.target.value)}
        placeholder="Páginas totales (opcional)"
      />
      <button type="submit">Añadir libro</button>
      {error && <p>{error}</p>}
    </form>
  );
}

export default AddBookPage;
