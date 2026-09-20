import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AddBookPage() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [totalPages, setTotalPages] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    const token = localStorage.getItem("token");

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
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título"
      />
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
