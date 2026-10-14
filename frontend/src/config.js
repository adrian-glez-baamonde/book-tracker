// URL del backend. En producción la define Vercel con VITE_API_URL;
// en local, si no existe, se usa el backend de tu ordenador.
export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
