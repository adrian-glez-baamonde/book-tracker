import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Shelf from "../components/Shelf";

const shelves = [
  { status: "reading", label: "Leyendo" },
  { status: "to-read", label: "Por leer" },
  { status: "read", label: "Leídos" },
];

function HomePage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchBooks() {
      try {
        const response = await fetch("http://localhost:8000/books", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status} al pedir los libros`);
        }

        const data = await response.json();
        setBooks(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchBooks();
  }, []);

  if (loading)
    return (
      <p className="mt-16 text-center font-serif text-2xl text-verde animate-pulse">
        Cargando tu biblioteca...
      </p>
    );
  if (error)
    return (
      <p className="max-w-md mx-auto mt-16 text-center text-granate bg-granate/5 border border-granate/20 rounded-lg px-4 py-3">
        Error: {error}
      </p>
    );

  return (
    <div className="flex flex-1 flex-col w-full max-w-5xl mx-auto px-4 md:px-8 pt-4 pb-24 md:py-10">
      <div className="flex items-center justify-between gap-4 mb-4 md:mb-8 md:pb-6 md:border-b md:border-dorado/30">
        <div>
          <p className="eyebrow mb-1 hidden md:block">Tu biblioteca</p>
          <h1 className="text-3xl md:text-5xl text-verde">Mis libros</h1>
          <p className="hidden md:block text-tinta/60 mt-1">
            {books.length} {books.length === 1 ? "libro" : "libros"} en tus
            estanterías
          </p>
        </div>
        <div className="hidden md:block">
          <Link to="/add-book" className="btn-primary">
            + Añadir libro
          </Link>
        </div>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-dorado/50 rounded-xl">
          <p className="font-serif text-2xl text-verde mb-2">
            Tus estanterías están vacías
          </p>
          <p className="text-tinta/60">Añade tu primer libro para empezar.</p>
        </div>
      ) : (
        <div className="wood flex flex-1 flex-col rounded-lg p-2 shadow-[0_20px_40px_-15px_rgba(42,33,24,0.7)] md:flex-none md:p-3">
          <div className="wood-back flex flex-1 flex-col overflow-hidden rounded-sm">
            {shelves.map((shelf) => {
              const shelfBooks = books.filter(
                (book) => book.status === shelf.status,
              );

              return (
                <Shelf
                  key={shelf.status}
                  label={shelf.label}
                  books={shelfBooks}
                />
              );
            })}
          </div>
        </div>
      )}

      <Link
        to="/add-book"
        aria-label="Añadir libro"
        className="md:hidden fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-granate to-granate/85 text-cream shadow-lg transition active:scale-95"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="h-6 w-6"
        >
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>{" "}
      </Link>
    </div>
  );
}

export default HomePage;
