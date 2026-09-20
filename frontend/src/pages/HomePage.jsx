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
  }, []); // array vacío = ejecutar solo una vez, al montar el componente

  if (loading) return <p>Cargando libros...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Mis libros</h1>
      <ul>
        {books.map((book) => (
          <li key={book.id}>
            {book.title} — {book.author}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HomePage;
