import { Link } from "react-router-dom";
import BookCover from "./BookCover";

function Shelf({ label, books }) {
  return (
    <section>
      <div className="mb-2 flex justify-center md:mb-4">
        <div className="inline-flex items-center gap-3 rounded-sm border border-dorado bg-linear-to-b from-laton to-dorado px-4 py-1 shadow-md md:px-5 md:py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-tinta/40" />
          <span className="font-serif text-base font-semibold text-verde md:text-lg">
            {label} · {books.length}
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-tinta/40" />
        </div>
      </div>

      {books.length === 0 ? (
        <p className="flex h-32 items-end justify-center pb-4 font-serif italic text-tinta/50 md:h-40">
          Esta balda está vacía
        </p>
      ) : (
        <ul className="flex snap-x items-end gap-3 overflow-x-auto px-3 pt-3 pb-2 md:gap-5 md:px-4 md:pt-4 md:pb-3 [scrollbar-width:thin]">
          {books.map((book) => (
            <li key={book.id} className="w-20 shrink-0 snap-start md:w-28">
              <Link
                to={`/books/${book.id}`}
                aria-label={`${book.title}${book.author ? `, de ${book.author}` : ""}`}
                title={book.title}
                className="block transition duration-300 hover:-translate-y-2 focus-visible:-translate-y-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-granate"
              >
                <BookCover book={book} />
              </Link>

              {book.status === "reading" && book.total_pages && (
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-tinta/15 md:mt-2">
                  <div
                    className="h-full bg-granate"
                    style={{
                      width: `${Math.min(100, (book.current_page / book.total_pages) * 100)}%`,
                    }}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="h-2.5 rounded-sm bg-linear-to-b from-madera to-madera-oscura shadow-[0_8px_12px_-6px_rgba(42,33,24,0.6)] md:h-3" />
    </section>
  );
}

export default Shelf;
