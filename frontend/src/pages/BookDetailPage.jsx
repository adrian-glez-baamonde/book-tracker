import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";

function BookDetailPage() {
  const { id } = useParams();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-4xl text-verde">{book.title}</h1>
      <p>{book.author}</p>
      <p>{book.status}</p>
    </div>
  );
}

export default BookDetailPage;
