import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { createBook, deleteBook, getBooks, isApiError } from "../api";
import {
  BooksSkeleton,
  EmptyState,
  MessageAlert,
  SpinnerBlock,
} from "../components/UiStates";
import type {
  Book,
  BookListQuery,
  BookSortField,
  CreateBookPayload,
  PaginationMeta,
  SortOrder,
} from "../api";

const DEFAULT_LIMIT = 6;

const emptyCreateForm: CreateBookPayload = {
  title: "",
  author: "",
  publishedYear: new Date().getFullYear(),
  language: "",
  genre: "",
};

function parsePositiveInteger(value: string | null, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function buildQueryFromSearchParams(
  searchParams: URLSearchParams,
): BookListQuery {
  const title = searchParams.get("title")?.trim() ?? "";
  const language = searchParams.get("language")?.trim() ?? "";
  const yearValue = searchParams.get("year")?.trim() ?? "";
  const sortByValue = searchParams.get("sortBy");
  const orderValue = searchParams.get("order");
  const page = parsePositiveInteger(searchParams.get("page"), 1);
  const limit = parsePositiveInteger(searchParams.get("limit"), DEFAULT_LIMIT);

  const query: BookListQuery = {
    page,
    limit,
  };

  if (title) {
    query.title = title;
  }

  if (language) {
    query.language = language;
  }

  if (yearValue) {
    const parsedYear = Number(yearValue);
    if (Number.isInteger(parsedYear) && parsedYear >= 0) {
      query.year = parsedYear;
    }
  }

  if (sortByValue === "title" || sortByValue === "publishedYear") {
    query.sortBy = sortByValue;
  }

  if (orderValue === "asc" || orderValue === "desc") {
    query.order = orderValue;
  }

  return query;
}

function buildSearchParams(query: BookListQuery): URLSearchParams {
  const params = new URLSearchParams();

  if (query.title) {
    params.set("title", query.title);
  }

  if (query.year !== undefined) {
    params.set("year", String(query.year));
  }

  if (query.language) {
    params.set("language", query.language);
  }

  if (query.sortBy) {
    params.set("sortBy", query.sortBy);
  }

  if (query.order) {
    params.set("order", query.order);
  }

  if (query.page && query.page > 1) {
    params.set("page", String(query.page));
  }

  if (query.limit && query.limit !== DEFAULT_LIMIT) {
    params.set("limit", String(query.limit));
  }

  return params;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (!isApiError(error)) {
    return fallback;
  }

  return error.response?.data?.error ?? fallback;
}

function isAbortError(error: unknown): boolean {
  return isApiError(error) && error.code === "ERR_CANCELED";
}

function BooksPage() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState<Book[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] =
    useState<CreateBookPayload>(emptyCreateForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const activeControllersRef = useRef<Set<AbortController>>(new Set());

  const query = useMemo(
    () => buildQueryFromSearchParams(searchParams),
    [searchParams],
  );

  const titleFilter = searchParams.get("title") ?? "";
  const yearFilter = searchParams.get("year") ?? "";
  const languageFilter = searchParams.get("language") ?? "";
  const sortBy =
    (searchParams.get("sortBy") as BookSortField | null) ?? "title";
  const order = (searchParams.get("order") as SortOrder | null) ?? "asc";
  const limitValue = String(query.limit ?? DEFAULT_LIMIT);

  useEffect(() => {
    return () => {
      activeControllersRef.current.forEach((controller) => controller.abort());
      activeControllersRef.current.clear();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    activeControllersRef.current.add(controller);

    async function loadBooks() {
      try {
        setLoading(true);
        setError(null);
        const response = await getBooks(query, controller.signal);
        setBooks(response.data);
        setPagination(response.pagination);
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }

        setError(getErrorMessage(err, "Raamatute laadimine ebaõnnestus."));
      } finally {
        activeControllersRef.current.delete(controller);
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadBooks();

    return () => {
      controller.abort();
    };
  }, [query]);

  function updateQuery(nextValues: Partial<BookListQuery>) {
    const nextQuery: BookListQuery = {
      ...query,
      ...nextValues,
    };

    if (nextQuery.page === undefined || nextQuery.page < 1) {
      nextQuery.page = 1;
    }

    const nextSearchParams = buildSearchParams(nextQuery);

    if (nextSearchParams.toString() === searchParams.toString()) {
      return;
    }

    setSearchParams(nextSearchParams);
  }

  function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const nextTitle = String(formData.get("title") ?? "").trim();
    const nextYear = String(formData.get("year") ?? "").trim();
    const nextLanguage = String(formData.get("language") ?? "").trim();

    updateQuery({
      title: nextTitle || undefined,
      year: nextYear ? Number(nextYear) : undefined,
      language: nextLanguage || undefined,
      page: 1,
    });
  }

  function handleSortChange(nextSortBy: BookSortField, nextOrder: SortOrder) {
    updateQuery({
      sortBy: nextSortBy,
      order: nextOrder,
      page: 1,
    });
  }

  async function handleCreateBook(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const controller = new AbortController();
    activeControllersRef.current.add(controller);

    try {
      setIsSubmitting(true);
      setActionError(null);
      await createBook(createForm, controller.signal);
      setCreateForm(emptyCreateForm);
      setShowCreateForm(false);
      updateQuery({ page: 1 });
    } catch (err) {
      if (isAbortError(err)) {
        return;
      }

      setActionError(getErrorMessage(err, "Raamatu lisamine ebaõnnestus."));
    } finally {
      activeControllersRef.current.delete(controller);

      if (!controller.signal.aborted) {
        setIsSubmitting(false);
      }
    }
  }

  async function handleDeleteBook(id: number) {
    const confirmed = window.confirm(
      "Kas oled kindel, et soovid selle raamatu kustutada?",
    );

    if (!confirmed) {
      return;
    }

    const controller = new AbortController();
    activeControllersRef.current.add(controller);

    try {
      setDeletingId(id);
      setActionError(null);
      await deleteBook(id, controller.signal);

      const nextPage =
        books.length === 1 && (query.page ?? 1) > 1 ? (query.page ?? 1) - 1 : 1;

      updateQuery({ page: nextPage });
    } catch (err) {
      if (isAbortError(err)) {
        return;
      }

      setActionError(getErrorMessage(err, "Raamatu kustutamine ebaõnnestus."));
    } finally {
      activeControllersRef.current.delete(controller);

      if (!controller.signal.aborted) {
        setDeletingId(null);
      }
    }
  }

  const totalPages = pagination?.totalPages ?? 0;
  const currentPage = query.page ?? 1;
  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  );
  const returnTo = `${location.pathname}${location.search}`;

  return (
    <main className="app-shell">
      <div className="page-wrap">
        <div className="panel-hero flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
              Books catalog
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">
              Halda oma raamatuvalikut
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Filtreeri, sorteeri ja halda raamatuid samal vaatel. Seaded
              salvestuvad URL-i query parameetritesse.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link className="btn-secondary" to="/authors">
              Autorid
            </Link>
            <button
              className="btn-primary"
              type="button"
              onClick={() => {
                setShowCreateForm((current) => !current);
                setActionError(null);
              }}
            >
              {showCreateForm ? "Sulge vorm" : "Lisa raamat"}
            </button>
          </div>
        </div>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <form className="panel p-6" onSubmit={handleFilterSubmit}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">Filtrid</h2>
              <button
                className="btn-link"
                type="button"
                onClick={() => {
                  setSearchParams(
                    buildSearchParams({ page: 1, limit: DEFAULT_LIMIT }),
                  );
                }}
              >
                Tuhjenda
              </button>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <label className="field-label">
                <span className="field-caption">Pealkiri</span>
                <input
                  className="input-base"
                  defaultValue={titleFilter}
                  name="title"
                  placeholder="Nt Dune"
                  type="text"
                />
              </label>

              <label className="field-label">
                <span className="field-caption">Aasta</span>
                <input
                  className="input-base"
                  defaultValue={yearFilter}
                  min="0"
                  name="year"
                  placeholder="Nt 1965"
                  type="number"
                />
              </label>

              <label className="field-label">
                <span className="field-caption">Keel</span>
                <input
                  className="input-base"
                  defaultValue={languageFilter}
                  name="language"
                  placeholder="Nt English"
                  type="text"
                />
              </label>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button className="btn-primary" type="submit">
                Rakenda filtrid
              </button>
            </div>
          </form>

          <section className="panel p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Sorteeri ja kuva
            </h2>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <label className="field-label">
                <span className="field-caption">Sorteeri jargi</span>
                <select
                  name="sortBy"
                  className="input-base"
                  value={sortBy}
                  onChange={(event) =>
                    handleSortChange(event.target.value as BookSortField, order)
                  }
                >
                  <option value="title">Pealkiri</option>
                  <option value="publishedYear">Aasta</option>
                </select>
              </label>

              <label className="field-label">
                <span className="field-caption">Jarjekord</span>
                <select
                  name="order"
                  className="input-base"
                  value={order}
                  onChange={(event) =>
                    handleSortChange(sortBy, event.target.value as SortOrder)
                  }
                >
                  <option value="asc">Kasvav</option>
                  <option value="desc">Kahanev</option>
                </select>
              </label>

              <label className="field-label">
                <span className="field-caption">Lehel kuvatakse</span>
                <select
                  name="limit"
                  className="input-base"
                  value={limitValue}
                  onChange={(event) => {
                    updateQuery({ limit: Number(event.target.value), page: 1 });
                  }}
                >
                  <option value="6">6</option>
                  <option value="9">9</option>
                  <option value="12">12</option>
                </select>
              </label>
            </div>
          </section>
        </section>

        {showCreateForm && (
          <form className="panel mt-6 p-6" onSubmit={handleCreateBook}>
            <h2 className="text-lg font-semibold text-slate-900">
              Lisa uus raamat
            </h2>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <label className="field-label">
                <span className="field-caption">Pealkiri</span>
                <input
                  name="title"
                  required
                  className="input-base"
                  type="text"
                  value={createForm.title}
                  onChange={(event) =>
                    setCreateForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="field-label">
                <span className="field-caption">Autor</span>
                <input
                  name="author"
                  required
                  className="input-base"
                  type="text"
                  value={createForm.author}
                  onChange={(event) =>
                    setCreateForm((current) => ({
                      ...current,
                      author: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="field-label">
                <span className="field-caption">Aasta</span>
                <input
                  name="publishedYear"
                  required
                  className="input-base"
                  min="0"
                  type="number"
                  value={String(createForm.publishedYear)}
                  onChange={(event) =>
                    setCreateForm((current) => ({
                      ...current,
                      publishedYear: Number(event.target.value),
                    }))
                  }
                />
              </label>

              <label className="field-label">
                <span className="field-caption">Keel</span>
                <input
                  name="language"
                  required
                  className="input-base"
                  type="text"
                  value={createForm.language}
                  onChange={(event) =>
                    setCreateForm((current) => ({
                      ...current,
                      language: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="field-label">
                <span className="field-caption">Zanrid</span>
                <input
                  name="genre"
                  required
                  className="input-base"
                  placeholder="Sci-Fi, Adventure"
                  type="text"
                  value={createForm.genre}
                  onChange={(event) =>
                    setCreateForm((current) => ({
                      ...current,
                      genre: event.target.value,
                    }))
                  }
                />
              </label>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                className="btn-accent"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? "Salvestan..." : "Salvesta raamat"}
              </button>

              <button
                className="btn-secondary"
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setCreateForm(emptyCreateForm);
                  setActionError(null);
                }}
              >
                Loobu
              </button>
            </div>
          </form>
        )}

        {actionError && (
          <div className="mt-6">
            <MessageAlert
              tone="error"
              title="Toiming ebaonnestus"
              message={actionError}
            />
          </div>
        )}

        {loading && (
          <>
            <div className="mt-6">
              <SpinnerBlock label="Laen raamatuid..." />
            </div>
            <BooksSkeleton />
          </>
        )}

        {error && !loading && (
          <div className="mt-6">
            <MessageAlert
              tone="error"
              title="Andmete laadimine katkestus"
              message={error}
            />
          </div>
        )}

        {!loading && !error && books.length === 0 && (
          <EmptyState
            title="Uhtegi raamatut ei leitud"
            message="Proovi filtreid muuta voi lisa uus raamat, et nimekiri taas taita."
          />
        )}

        {!loading && !error && books.length > 0 && (
          <>
            <div className="mt-6 flex items-center justify-between gap-3 text-sm text-slate-600">
              <p>
                Kuvan {books.length} / {pagination?.totalItems ?? books.length}{" "}
                raamatut.
              </p>
              <p>
                Leht {pagination?.page ?? 1} / {Math.max(totalPages, 1)}
              </p>
            </div>

            <section className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {books.map((book) => {
                const genres = book.genre
                  .split(",")
                  .map((genre) => genre.trim())
                  .filter(Boolean);

                return (
                  <article key={book.id} className="panel p-4">
                    <h2 className="text-lg font-semibold text-slate-900">
                      {book.title}
                    </h2>
                    <p className="mt-2 text-sm text-slate-700">
                      Autor: {book.author}
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      Aasta: {book.publishedYear}
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      Keel: {book.language}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {genres.map((genre) => (
                        <span key={`${book.id}-${genre}`} className="chip">
                          {genre}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link
                        className="btn-primary"
                        state={{ from: returnTo }}
                        to={`/books/${book.id}`}
                      >
                        Vaata detaili
                      </Link>

                      <button
                        className="btn-secondary border-red-200 text-red-700 hover:bg-red-50"
                        disabled={deletingId === book.id}
                        type="button"
                        onClick={() => {
                          void handleDeleteBook(book.id);
                        }}
                      >
                        {deletingId === book.id ? "Kustutan..." : "Kustuta"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </section>

            <nav className="mt-6 flex flex-wrap items-center gap-2">
              <button
                className="btn-secondary px-3"
                disabled={!pagination?.hasPreviousPage}
                type="button"
                onClick={() => updateQuery({ page: currentPage - 1 })}
              >
                Eelmine
              </button>

              {pageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                    pageNumber === currentPage
                      ? "bg-slate-900 text-white"
                      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                  type="button"
                  onClick={() => updateQuery({ page: pageNumber })}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                className="btn-secondary px-3"
                disabled={!pagination?.hasNextPage}
                type="button"
                onClick={() => updateQuery({ page: currentPage + 1 })}
              >
                Jargmine
              </button>
            </nav>
          </>
        )}
      </div>
    </main>
  );
}

export default BooksPage;
