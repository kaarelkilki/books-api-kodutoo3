import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBooks, isApiError } from "../api";
import type { Book } from "../api";

function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadBooks() {
      try {
        setLoading(true);
        setError(null);
        const response = await getBooks(undefined, controller.signal);
        setBooks(response.data);
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }

        if (isApiError(err)) {
          setError(
            err.response?.data?.error ?? "Raamatute laadimine ebaõnnestus.",
          );
          return;
        }

        setError("Tekkis ootamatu viga raamatute laadimisel.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadBooks();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Books</h1>
      <p className="mt-2 text-sm text-slate-600">
        Raamatud API-st kaardivaates.
      </p>

      {loading && (
        <p className="mt-6 rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-600">
          Laen raamatuid...
        </p>
      )}

      {error && (
        <p className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      )}

      {!loading && !error && books.length === 0 && (
        <p className="mt-6 rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-600">
          Uhtegi raamatut ei leitud.
        </p>
      )}

      {!loading && !error && books.length > 0 && (
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => {
            const genres = book.genre
              .split(",")
              .map((genre) => genre.trim())
              .filter(Boolean);

            return (
              <article
                key={book.id}
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
              >
                <h2 className="text-lg font-semibold text-slate-900">
                  {book.title}
                </h2>
                <p className="mt-2 text-sm text-slate-700">
                  Autor: {book.author}
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  Aasta: {book.publishedYear}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {genres.map((genre) => (
                    <span
                      key={`${book.id}-${genre}`}
                      className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
                    >
                      {genre}
                    </span>
                  ))}
                </div>

                <div className="mt-4">
                  <Link
                    className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                    to={`/books/${book.id}`}
                  >
                    Vaata detaili
                  </Link>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}

export default BooksPage;
