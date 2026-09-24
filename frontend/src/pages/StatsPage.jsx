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

  if (loading)
    return (
      <p className="text-center mt-8 text-verde">Cargando estadísticas...</p>
    );
  if (error)
    return <p className="text-center mt-8 text-red-700">Error: {error}</p>;

  const items = [
    { label: "Total de libros", value: stats.total_books },
    { label: "Por leer", value: stats.to_read_count },
    { label: "Leyendo", value: stats.reading_count },
    { label: "Leídos", value: stats.read_count },
    { label: "Páginas leídas", value: stats.total_pages_read },
    {
      label: "Progreso medio de lectura",
      value:
        stats.average_reading_progress !== null
          ? `${stats.average_reading_progress.toFixed(1)}%`
          : "No disponible",
    },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-verde mb-6">Mis estadísticas</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="bg-white/60 border border-dorado rounded-lg shadow-sm px-4 py-3"
          >
            <p className="text-sm text-tinta/70">{item.label}</p>
            <p className="text-xl font-bold text-granate">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StatsPage;
