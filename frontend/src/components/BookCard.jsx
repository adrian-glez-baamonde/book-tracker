import { useState } from "react";

const statusLabels = { to_read: "Por leer", reading: "Leyendo", read: "Leído" };

function BookCard({ book }) {
  const [imageError, setImageError] = useState(false);

  const showCover = book.cover_url && !imageError;

  return (
    <article className="card-surface relative h-full flex gap-4 overflow-hidden p-4 pl-5 transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-dorado/60">
      <span className="absolute inset-y-0 left-0 w-1.5 bg-linear-to-b from-granate to-verde" />

      {showCover ? (
        <img
          src={book.cover_url}
          alt=""
          onError={() => setImageError(true)}
          className="w-14 h-20 shrink-0 object-cover rounded shadow-sm"
        />
      ) : (
        <div className="w-14 h-20 shrink-0 rounded bg-linear-to-br from-verde to-verde-claro flex items-center justify-center font-serif text-2xl text-dorado">
          {book.title.charAt(0)}
        </div>
      )}

      <div className="min-w-0">
        <h2 className="text-xl leading-tight text-verde line-clamp-2">
          {book.title}
        </h2>
        <p className="text-sm text-tinta/70 mt-1 truncate">{book.author}</p>
        {book.status && (
          <span className="inline-block mt-3 text-xs uppercase tracking-wider text-dorado border border-dorado/40 rounded-full px-2.5 py-0.5">
            {statusLabels[book.status] ?? book.status}
          </span>
        )}
      </div>
    </article>
  );
}

export default BookCard;
