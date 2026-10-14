import { useEffect, useState } from "react";

// Devuelve true si "active" lleva más de "delay" ms activo.
// Sirve para avisar cuando el servidor gratuito está despertando.
export function useSlowHint(active, delay = 4000) {
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    if (!active) return;

    const timer = setTimeout(() => setIsSlow(true), delay);

    return () => {
      clearTimeout(timer);
      setIsSlow(false);
    };
  }, [active, delay]);

  return active && isSlow;
}
