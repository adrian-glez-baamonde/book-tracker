import { useState, useEffect } from "react";

function StatsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("http://localhost:8000/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status} al pedir las estadísticas`);
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) return <p>Cargando estadísticas...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Mis estadísticas</h1>
      <ul>
        <li>Total de libros: {stats.total_books}</li>
        <li>Por leer: {stats.to_read_count}</li>
        <li>Leyendo: {stats.reading_count}</li>
        <li>Leídos: {stats.read_count}</li>
        <li>Páginas leídas: {stats.total_pages_read}</li>
        <li>
          Progreso medio de lectura:{" "}
          {stats.average_reading_progress !== null
            ? `${stats.average_reading_progress.toFixed(1)}%`
            : "No disponible"}
        </li>
      </ul>
    </div>
  );
}

export default StatsPage;
