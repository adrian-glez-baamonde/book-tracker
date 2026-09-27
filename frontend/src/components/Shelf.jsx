import { Link } from "react-router-dom";
import BookCover from "./BookCover";

function Shelf({ label, books }) {
  return (
    <section className="shadow-[inset_0_12px_14px_-10px_rgba(0,0,0,0.7)]">
      <div className="flex justify-center pt-3 md:pt-5">
        <div className="inline-flex items-center gap-3 rounded-sm border border-dorado bg-linear-to-b from-laton to-dorado px-4 py-0.5 shadow-[0_2px_4px_rgba(0,0,0,0.5)] md:px-5 md:py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-tinta/40" />
          <span className="font-serif text-base font-semibold text-tinta md:text-lg">
            {label} · {books.length}
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-tinta/40" />
        </div>
      </div>

      {books.length === 0 ? (
        <p className="flex h-32 items-end justify-center pb-4 font-serif italic text-cream/40 md:h-44">
          Esta balda está vacía
        </p>
      ) : (
        <ul className="flex snap-x items-end gap-3 overflow-x-auto px-3 pt-3 md:gap-5 md:px-6 md:pt-5 [scrollbar-width:none]">
          {books.map((book) => (
            <li key={book.id} className="w-20 shrink-0 snap-start md:w-28">
              <Link
                to={`/books/${book.id}`}
                aria-label={`${book.title}${book.author ? `, de ${book.author}` : ""}`}
                title={book.title}
                className="relative block transition duration-300 hover:-translate-y-2 focus-visible:-translate-y-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-laton"
              >
                <BookCover book={book} />

                {book.status === "reading" && book.total_pages && (
                  <div className="absolute inset-x-1.5 bottom-1.5 h-1 overflow-hidden rounded-full bg-black/45">
                    <div
                      className="h-full bg-laton"
                      style={{
                        width: `${Math.min(100, (book.current_page / book.total_pages) * 100)}%`,
                      }}
                    />
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Balda: superficie superior en perspectiva + canto frontal con veta */}
      <div className="h-1.5 bg-linear-to-b from-madera-clara to-madera" />
      <div className="wood h-3 border-t border-black/25 md:h-4" />
    </section>
  );
}

export default Shelf;
