import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Reveal from "../components/Reveal";
import BookCard from "../components/BookCard";

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
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-10">
      <Reveal className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 pb-6 border-b border-dorado/30">
        <div>
          <p className="eyebrow mb-1">Tu biblioteca</p>
          <h1 className="text-4xl md:text-5xl text-verde">Mis libros</h1>
          <p className="text-tinta/60 mt-1">
            {books.length} {books.length === 1 ? "libro" : "libros"} en tus
            estanterías
          </p>
        </div>
        <Link to="/add-book" className="btn-primary self-start sm:self-auto">
          + Añadir libro
        </Link>
      </Reveal>

      {books.length === 0 ? (
        <Reveal className="text-center py-16 border border-dashed border-dorado/50 rounded-xl">
          <p className="font-serif text-2xl text-verde mb-2">
            Tus estanterías están vacías
          </p>
          <p className="text-tinta/60">Añade tu primer libro para empezar.</p>
        </Reveal>
      ) : (
        <div>
          {shelves.map((shelf) => {
            const shelfBooks = books.filter(
              (book) => book.status === shelf.status,
            );

            return (
              <section key={shelf.status}>
                <h2>
                  {shelf.label} · {shelfBooks.length}
                </h2>
                <ul>
                  {shelfBooks.map((book) => (
                    <li key={book.id}>{book.title}</li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default HomePage;
