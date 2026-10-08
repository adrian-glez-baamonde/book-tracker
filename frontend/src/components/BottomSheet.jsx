import { useEffect, useId, useRef, useState } from "react";

// Píxeles que hay que arrastrar hacia abajo para que se cierre al soltar
const CLOSE_THRESHOLD = 100;

function BottomSheet({ isOpen, onClose, title, children }) {
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const sheetRef = useRef(null);
  const titleId = useId();

  // Escape para cerrar + bloquear el scroll de la página de fondo
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Al abrir, el foco pasa al panel (lectores de pantalla y teclado)
  useEffect(() => {
    if (isOpen) sheetRef.current?.focus();
  }, [isOpen]);

  function handlePointerDown(e) {
    startYRef.current = e.clientY;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e) {
    if (!isDragging) return;
    setDragOffset(Math.max(0, e.clientY - startYRef.current)); // Solo hacia abajo
  }

  function handlePointerUp() {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragOffset > CLOSE_THRESHOLD) onClose();
    setDragOffset(0);
  }

  return (
    <div
      className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`}
      inert={!isOpen}
    >
      {/* Fondo oscuro: tocarlo cierra */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Posición: abajo en móvil, centrado en escritorio */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center md:p-4">
        <div
          ref={sheetRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          style={{ transform: `translateY(${dragOffset}px)` }}
          className={`pointer-events-auto flex max-h-[85vh] w-full flex-col rounded-t-2xl border-t-2 border-dorado bg-cream shadow-2xl outline-none md:max-w-lg md:rounded-2xl md:border-2 ${
            isDragging ? "" : "transition duration-300 ease-out"
          } ${
            isOpen
              ? "translate-y-0 md:opacity-100"
              : "translate-y-full md:translate-y-8 md:opacity-0"
          }`}
        >
          {/* Asa para arrastrar (solo móvil) */}
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="flex cursor-grab touch-none justify-center py-3 active:cursor-grabbing md:hidden"
          >
            <div className="h-1.5 w-12 rounded-full bg-tinta/20" />
          </div>

          <div className="flex items-center justify-between px-5 pb-3 md:pt-5">
            <h2 id={titleId} className="text-2xl text-verde">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="cursor-pointer rounded-full p-1.5 text-tinta/60 transition-colors hover:text-granate"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          {/* Contenido con su propio scroll */}
          <div className="overflow-y-auto px-5 pb-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default BottomSheet;
