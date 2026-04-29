import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getAuthors, getBooks, isApiError } from "../api";
import { EmptyState, MessageAlert, SpinnerBlock } from "../components/UiStates";
import type { Author, Book } from "../api";

type AuthorWithBooks = {
  author: Author;
  books: Book[];
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (!isApiError(error)) {
    return fallback;
  }

  return (
    error.response?.data?.error ?? error.response?.data?.message ?? fallback
  );
}

async function loadAllBooks(signal: AbortSignal): Promise<Book[]> {
  const firstPage = await getBooks({ page: 1, limit: 50 }, signal);
  const allBooks = [...firstPage.data];

  for (let page = 2; page <= firstPage.pagination.totalPages; page += 1) {
    const nextPage = await getBooks({ page, limit: 50 }, signal);
    allBooks.push(...nextPage.data);
  }

  return allBooks;
}

function fullName(author: Author): string {
  return `${author.firstName} ${author.lastName}`.trim();
}

function AuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const activeControllersRef = useRef<Set<AbortController>>(new Set());

  useEffect(() => {
    return () => {
      activeControllersRef.current.forEach((controller) => controller.abort());
      activeControllersRef.current.clear();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    activeControllersRef.current.add(controller);

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const [authorsResponse, booksResponse] = await Promise.all([
          getAuthors(controller.signal),
          loadAllBooks(controller.signal),
        ]);

        setAuthors(authorsResponse);
        setBooks(booksResponse);
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }

        setError(getErrorMessage(err, "Autorite laadimine ebaonnestus."));
      } finally {
        activeControllersRef.current.delete(controller);
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      controller.abort();
    };
  }, []);

  const authorCards = useMemo<AuthorWithBooks[]>(() => {
    const booksByAuthor = new Map<string, Book[]>();

    for (const book of books) {
      const key = book.author.trim().toLowerCase();
      const current = booksByAuthor.get(key) ?? [];
      current.push(book);
      booksByAuthor.set(key, current);
    }

    return authors.map((author) => {
      const name = fullName(author);
      const matchingBooks = booksByAuthor.get(name.toLowerCase()) ?? [];

      return {
        author,
        books: matchingBooks.sort((a, b) => a.title.localeCompare(b.title)),
      };
    });
  }, [authors, books]);

  return (
    <main className="app-shell">
      <div className="page-wrap">
        <section className="panel-hero">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
                Authors
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                Autorid ja nende raamatud
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Ulevaade autoritest koos nende raamatutega. Iga raamatu juurest
                saab liikuda detailvaatesse.
              </p>
            </div>
            <Link className="btn-secondary" to="/books">
              Tagasi raamatute juurde
            </Link>
          </div>
        </section>

        {loading && (
          <div className="mt-6">
            <SpinnerBlock label="Laen autoreid ja raamatuid..." />
          </div>
        )}

        {!loading && error && (
          <div className="mt-6">
            <MessageAlert
              tone="error"
              title="Andmete laadimine ebaonnestus"
              message={error}
            />
          </div>
        )}

        {!loading && !error && authorCards.length === 0 && (
          <EmptyState
            title="Autoreid ei leitud"
            message="Kontrolli backend API andmeid ning proovi uuesti laadida."
          />
        )}

        {!loading && !error && authorCards.length > 0 && (
          <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {authorCards.map(({ author, books: authoredBooks }) => (
              <article key={author.id} className="panel p-5">
                <h2 className="text-xl font-semibold text-slate-900">
                  {fullName(author)}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Sunniaasta: {author.birthYear}
                </p>

                <div className="mt-4 border-t border-slate-200 pt-4">
                  <p className="text-sm font-medium text-slate-700">
                    Raamatud ({authoredBooks.length})
                  </p>

                  {authoredBooks.length === 0 ? (
                    <p className="mt-2 text-sm text-slate-500">
                      Selle autori raamatuid ei leitud.
                    </p>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {authoredBooks.map((book) => (
                        <li key={book.id}>
                          <Link
                            className="text-sm font-medium text-cyan-700 hover:text-cyan-900 hover:underline"
                            to={`/books/${book.id}`}
                          >
                            {book.title}
                          </Link>
                          <span className="ml-2 text-xs text-slate-500">
                            ({book.publishedYear})
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

export default AuthorsPage;
