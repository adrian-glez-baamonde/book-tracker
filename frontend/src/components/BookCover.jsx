import { useState } from "react";

const palettes = [
  {
    bg: "from-verde to-verde-claro",
    title: "text-dorado",
    author: "text-cream/70",
    frame: "border-dorado/50",
  },
  {
    bg: "from-granate to-[#8a2a3a]",
    title: "text-dorado",
    author: "text-cream/70",
    frame: "border-dorado/50",
  },
  {
    bg: "from-cream to-cream-dark",
    title: "text-verde",
    author: "text-tinta/60",
    frame: "border-verde/30",
  },
];

function BookCover({ book }) {
  const [imageError, setImageError] = useState(false);

  const showImage = book.cover_url && !imageError;
  const palette = palettes[book.id % palettes.length];

  return (
    <div className="relative aspect-[2/3] w-full overflow-hidden rounded-r-sm rounded-l-[2px] shadow-[4px_4px_10px_-2px_rgba(42,33,24,0.45)]">
      {showImage ? (
        <img
          src={book.cover_url}
          alt=""
          onError={() => setImageError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          className={`relative h-full w-full bg-linear-to-br ${palette.bg} flex flex-col justify-between p-2 text-center`}
        >
          <div
            className={`pointer-events-none absolute inset-1.5 rounded-sm border ${palette.frame}`}
          />
          <p
            className={`mt-3 px-1 font-serif text-sm leading-tight ${palette.title} line-clamp-4`}
          >
            {book.title}
          </p>
          <p
            className={`mb-2 px-1 text-[10px] uppercase tracking-wider ${palette.author} line-clamp-2`}
          >
            {book.author}
          </p>
        </div>
      )}

      {/* sombra del lomo en el borde izquierdo, para que parezca un libro y no una tarjeta */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-2 bg-linear-to-r from-black/30 to-transparent" />
    </div>
  );
}

export default BookCover;
