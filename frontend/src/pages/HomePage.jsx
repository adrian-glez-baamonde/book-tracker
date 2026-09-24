import { useState, useEffect } from "react";

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
    return <p className="text-center mt-8 text-verde">Cargando libros...</p>;
  if (error)
    return <p className="text-center mt-8 text-red-700">Error: {error}</p>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-verde mb-6">Mis libros</h1>

      {books.length === 0 ? (
        <p className="text-tinta/70">Todavía no has añadido ningún libro.</p>
      ) : (
        <ul className="space-y-3">
          {books.map((book) => (
            <li
              key={book.id}
              className="bg-white/60 border-l-4 border-dorado rounded-lg shadow-sm px-4 py-3"
            >
              <p className="font-semibold text-verde">{book.title}</p>
              <p className="text-sm text-tinta/80">{book.author}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default HomePage;
