import { useState, useEffect } from "react";
import Reveal from "../components/Reveal";

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
      <p className="mt-16 text-center font-serif text-2xl text-verde animate-pulse">
        Cargando estadísticas...
      </p>
    );
  if (error)
    return (
      <p className="max-w-md mx-auto mt-16 text-center text-granate bg-granate/5 border border-granate/20 rounded-lg px-4 py-3">
        Error: {error}
      </p>
    );

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
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-10">
      <Reveal className="mb-8 pb-6 border-b border-dorado/30">
        <p className="eyebrow mb-1">Tu lectura en cifras</p>
        <h1 className="text-4xl md:text-5xl text-verde">Mis estadísticas</h1>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((item, index) => (
          <Reveal key={item.label} delay={(index % 3) * 80}>
            <div className="card-surface h-full p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lg">
              <p className="text-xs uppercase tracking-[0.2em] text-tinta/60">
                {item.label}
              </p>
              <p className="font-serif text-4xl md:text-5xl font-semibold text-granate mt-2">
                {item.value}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

export default StatsPage;
