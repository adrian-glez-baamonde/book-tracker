import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Reveal from "../components/Reveal";

const statusLabels = { to_read: "Por leer", reading: "Leyendo", read: "Leído" };

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
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {books.map((book, index) => (
            <Reveal as="li" key={book.id} delay={(index % 3) * 80}>
              <article className="card-surface relative h-full flex gap-4 overflow-hidden p-4 pl-5 transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-dorado/60">
                <span className="absolute inset-y-0 left-0 w-1.5 bg-linear-to-b from-granate to-verde" />
                {book.cover_url ? (
                  <img
                    src={book.cover_url}
                    alt=""
                    className="w-14 h-20 shrink-0 object-cover rounded shadow-sm"
                  />
                ) : (
                  <div className="w-14 h-20 shrink-0 rounded bg-linear-to-br from-verde to-verde-claro flex items-center justify-center font-serif text-2xl text-dorado">
                    {book.title.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <h2 className="text-xl leading-tight text-verde line-clamp-2">
                    {book.title}
                  </h2>
                  <p className="text-sm text-tinta/70 mt-1 truncate">
                    {book.author}
                  </p>
                  {book.status && (
                    <span className="inline-block mt-3 text-xs uppercase tracking-wider text-dorado border border-dorado/40 rounded-full px-2.5 py-0.5">
                      {statusLabels[book.status] ?? book.status}
                    </span>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      )}
    </div>
  );
}

export default HomePage;
