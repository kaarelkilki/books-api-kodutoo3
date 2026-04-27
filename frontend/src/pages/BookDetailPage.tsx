import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createBookReview,
  deleteBook,
  getBookAverageRating,
  getBookById,
  getBookReviews,
  isApiError,
  updateBook,
} from "../api";
import type {
  Book,
  CreateReviewPayload,
  Review,
  UpdateBookPayload,
} from "../api";

type BookEditFormState = {
  title: string;
  isbn: string;
  publishedYear: string;
  pageCount: string;
  author: string;
  publisher: string;
  language: string;
  genre: string;
  description: string;
  coverImage: string;
};

const emptyReviewForm: CreateReviewPayload = {
  reviewerName: "",
  rating: 5,
  comment: "",
};

function buildEditFormState(book: Book): BookEditFormState {
  return {
    title: book.title,
    isbn: book.isbn ?? "",
    publishedYear: String(book.publishedYear),
    pageCount: book.pageCount !== undefined ? String(book.pageCount) : "",
    author: book.author,
    publisher: book.publisher ?? "",
    language: book.language,
    genre: book.genre,
    description: book.description ?? "",
    coverImage: book.coverImage ?? "",
  };
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (!isApiError(error)) {
    return fallback;
  }

  return error.response?.data?.error ?? fallback;
}

function formatAverageRating(value: number | null): string {
  if (value === null) {
    return "Hinnang puudub";
  }

  return `${value.toFixed(1)} / 5`;
}

function BookDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewForm, setReviewForm] =
    useState<CreateReviewPayload>(emptyReviewForm);
  const [editForm, setEditForm] = useState<BookEditFormState | null>(null);

  const bookId = id ? Number(id) : Number.NaN;

  useEffect(() => {
    if (!Number.isInteger(bookId) || bookId < 1) {
      setError("Vigane raamatu id.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadBookDetail() {
      try {
        setLoading(true);
        setError(null);
        setActionError(null);

        const [bookResponse, ratingResponse, reviewsResponse] =
          await Promise.all([
            getBookById(bookId, controller.signal),
            getBookAverageRating(bookId, controller.signal),
            getBookReviews(bookId, undefined, controller.signal),
          ]);

        setBook(bookResponse);
        setEditForm(buildEditFormState(bookResponse));
        setAverageRating(ratingResponse.averageRating);
        setReviews(reviewsResponse);
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }

        setError(
          getErrorMessage(err, "Raamatu detailide laadimine ebaonnestus."),
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadBookDetail();

    return () => {
      controller.abort();
    };
  }, [bookId]);

  async function refreshBookData() {
    if (!Number.isInteger(bookId) || bookId < 1) {
      return;
    }

    const controller = new AbortController();

    const [bookResponse, ratingResponse, reviewsResponse] = await Promise.all([
      getBookById(bookId, controller.signal),
      getBookAverageRating(bookId, controller.signal),
      getBookReviews(bookId, undefined, controller.signal),
    ]);

    setBook(bookResponse);
    setEditForm(buildEditFormState(bookResponse));
    setAverageRating(ratingResponse.averageRating);
    setReviews(reviewsResponse);
  }

  async function handleUpdateBook(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editForm || !Number.isInteger(bookId) || bookId < 1) {
      return;
    }

    const payload: UpdateBookPayload = {
      title: editForm.title.trim(),
      isbn: editForm.isbn.trim() || undefined,
      publishedYear: Number(editForm.publishedYear),
      pageCount: editForm.pageCount.trim()
        ? Number(editForm.pageCount)
        : undefined,
      author: editForm.author.trim(),
      publisher: editForm.publisher.trim() || undefined,
      language: editForm.language.trim(),
      genre: editForm.genre.trim(),
      description: editForm.description.trim() || undefined,
      coverImage: editForm.coverImage.trim() || undefined,
    };

    try {
      setIsSaving(true);
      setActionError(null);
      const updatedBook = await updateBook(bookId, payload);
      setBook(updatedBook);
      setEditForm(buildEditFormState(updatedBook));
      setIsEditOpen(false);
      await refreshBookData();
    } catch (err) {
      setActionError(getErrorMessage(err, "Raamatu uuendamine ebaonnestus."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteBook() {
    if (!Number.isInteger(bookId) || bookId < 1) {
      return;
    }

    const confirmed = window.confirm(
      "Kas oled kindel, et soovid selle raamatu kustutada?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsDeleting(true);
      setActionError(null);
      await deleteBook(bookId);
      navigate("/books");
    } catch (err) {
      setActionError(getErrorMessage(err, "Raamatu kustutamine ebaonnestus."));
      setIsDeleting(false);
    }
  }

  async function handleCreateReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!Number.isInteger(bookId) || bookId < 1) {
      return;
    }

    try {
      setIsSubmittingReview(true);
      setActionError(null);
      await createBookReview(bookId, {
        reviewerName: reviewForm.reviewerName.trim(),
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment?.trim() || undefined,
      });
      setReviewForm(emptyReviewForm);
      await refreshBookData();
    } catch (err) {
      setActionError(getErrorMessage(err, "Arvustuse lisamine ebaonnestus."));
    } finally {
      setIsSubmittingReview(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm text-slate-500">Laen raamatu detailvaadet...</p>
        </div>
      </main>
    );
  }

  if (error || !book) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-4xl rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold text-slate-900">
            Raamatut ei leitud
          </h1>
          <p className="mt-3 text-sm text-red-700">
            {error ?? "Sellist raamatut ei ole olemas."}
          </p>
          <Link
            className="mt-6 inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            to="/books"
          >
            Tagasi nimekirja
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            to="/books"
          >
            Tagasi nimekirja
          </Link>

          <div className="flex flex-wrap gap-3">
            <button
              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              type="button"
              onClick={() => setIsEditOpen((current) => !current)}
            >
              {isEditOpen ? "Sulge muutmine" : "Muuda"}
            </button>

            <button
              className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400"
              disabled={isDeleting}
              type="button"
              onClick={() => {
                void handleDeleteBook();
              }}
            >
              {isDeleting ? "Kustutan..." : "Kustuta"}
            </button>
          </div>
        </div>

        {actionError && (
          <p className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {actionError}
          </p>
        )}

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="grid gap-0 md:grid-cols-[0.8fr_1.2fr]">
              <div className="min-h-[320px] bg-gradient-to-br from-cyan-500 via-sky-600 to-slate-900 p-6 text-white">
                <p className="text-xs uppercase tracking-[0.25em] text-cyan-100">
                  Book detail
                </p>
                <h1 className="mt-4 text-4xl font-semibold leading-tight">
                  {book.title}
                </h1>
                <p className="mt-4 text-sm text-cyan-50">
                  {book.description ?? "Kirjeldus puudub."}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {book.genre.split(",").map((genreItem) => (
                    <span
                      key={genreItem.trim()}
                      className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur"
                    >
                      {genreItem.trim()}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-6">
                <dl className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Autor
                    </dt>
                    <dd className="mt-2 text-base font-medium text-slate-900">
                      {book.author}
                    </dd>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Kirjastus
                    </dt>
                    <dd className="mt-2 text-base font-medium text-slate-900">
                      {book.publisher ?? "Puudub"}
                    </dd>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      ISBN
                    </dt>
                    <dd className="mt-2 text-base font-medium text-slate-900">
                      {book.isbn ?? "Puudub"}
                    </dd>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Aasta
                    </dt>
                    <dd className="mt-2 text-base font-medium text-slate-900">
                      {book.publishedYear}
                    </dd>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Lehekulgi
                    </dt>
                    <dd className="mt-2 text-base font-medium text-slate-900">
                      {book.pageCount ?? "Puudub"}
                    </dd>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Keel
                    </dt>
                    <dd className="mt-2 text-base font-medium text-slate-900">
                      {book.language}
                    </dd>
                  </div>
                </dl>

                {book.coverImage && (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    <span className="font-medium text-slate-900">
                      Kaane pilt:
                    </span>{" "}
                    <a
                      className="text-blue-600 hover:underline"
                      href={book.coverImage}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Ava cover image
                    </a>
                  </div>
                )}
              </div>
            </div>
          </article>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                Keskmine hinnang
              </p>
              <p className="mt-3 text-4xl font-semibold text-slate-900">
                {formatAverageRating(averageRating)}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Arvutatud eraldi endpointist /books/{book.id}/average-rating.
              </p>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">
                Lisa arvustus
              </h2>

              <form className="mt-4 space-y-4" onSubmit={handleCreateReview}>
                <label className="block text-sm text-slate-700">
                  <span className="mb-1 block font-medium">Kasutajanimi</span>
                  <input
                    required
                    className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-900"
                    type="text"
                    value={reviewForm.reviewerName}
                    onChange={(event) =>
                      setReviewForm((current) => ({
                        ...current,
                        reviewerName: event.target.value,
                      }))
                    }
                  />
                </label>

                <label className="block text-sm text-slate-700">
                  <span className="mb-1 block font-medium">Hinnang</span>
                  <select
                    className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-900"
                    value={String(reviewForm.rating)}
                    onChange={(event) =>
                      setReviewForm((current) => ({
                        ...current,
                        rating: Number(event.target.value),
                      }))
                    }
                  >
                    {[1, 2, 3, 4, 5].map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm text-slate-700">
                  <span className="mb-1 block font-medium">Kommentaar</span>
                  <textarea
                    className="min-h-28 w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-900"
                    value={reviewForm.comment ?? ""}
                    onChange={(event) =>
                      setReviewForm((current) => ({
                        ...current,
                        comment: event.target.value,
                      }))
                    }
                  />
                </label>

                <button
                  className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
                  disabled={isSubmittingReview}
                  type="submit"
                >
                  {isSubmittingReview ? "Salvestan..." : "Lisa arvustus"}
                </button>
              </form>
            </section>
          </aside>
        </section>

        {isEditOpen && editForm && (
          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              Muuda raamatu andmeid
            </h2>
            <form
              className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3"
              onSubmit={handleUpdateBook}
            >
              <label className="text-sm text-slate-700">
                <span className="mb-1 block font-medium">Pealkiri</span>
                <input
                  required
                  className="w-full rounded-md border border-slate-300 px-3 py-2"
                  type="text"
                  value={editForm.title}
                  onChange={(event) =>
                    setEditForm((current) =>
                      current
                        ? { ...current, title: event.target.value }
                        : current,
                    )
                  }
                />
              </label>
              <label className="text-sm text-slate-700">
                <span className="mb-1 block font-medium">ISBN</span>
                <input
                  className="w-full rounded-md border border-slate-300 px-3 py-2"
                  type="text"
                  value={editForm.isbn}
                  onChange={(event) =>
                    setEditForm((current) =>
                      current
                        ? { ...current, isbn: event.target.value }
                        : current,
                    )
                  }
                />
              </label>
              <label className="text-sm text-slate-700">
                <span className="mb-1 block font-medium">Aasta</span>
                <input
                  required
                  className="w-full rounded-md border border-slate-300 px-3 py-2"
                  min="0"
                  type="number"
                  value={editForm.publishedYear}
                  onChange={(event) =>
                    setEditForm((current) =>
                      current
                        ? { ...current, publishedYear: event.target.value }
                        : current,
                    )
                  }
                />
              </label>
              <label className="text-sm text-slate-700">
                <span className="mb-1 block font-medium">Lehekulgi</span>
                <input
                  className="w-full rounded-md border border-slate-300 px-3 py-2"
                  min="1"
                  type="number"
                  value={editForm.pageCount}
                  onChange={(event) =>
                    setEditForm((current) =>
                      current
                        ? { ...current, pageCount: event.target.value }
                        : current,
                    )
                  }
                />
              </label>
              <label className="text-sm text-slate-700">
                <span className="mb-1 block font-medium">Autor</span>
                <input
                  required
                  className="w-full rounded-md border border-slate-300 px-3 py-2"
                  type="text"
                  value={editForm.author}
                  onChange={(event) =>
                    setEditForm((current) =>
                      current
                        ? { ...current, author: event.target.value }
                        : current,
                    )
                  }
                />
              </label>
              <label className="text-sm text-slate-700">
                <span className="mb-1 block font-medium">Kirjastus</span>
                <input
                  className="w-full rounded-md border border-slate-300 px-3 py-2"
                  type="text"
                  value={editForm.publisher}
                  onChange={(event) =>
                    setEditForm((current) =>
                      current
                        ? { ...current, publisher: event.target.value }
                        : current,
                    )
                  }
                />
              </label>
              <label className="text-sm text-slate-700">
                <span className="mb-1 block font-medium">Keel</span>
                <input
                  required
                  className="w-full rounded-md border border-slate-300 px-3 py-2"
                  type="text"
                  value={editForm.language}
                  onChange={(event) =>
                    setEditForm((current) =>
                      current
                        ? { ...current, language: event.target.value }
                        : current,
                    )
                  }
                />
              </label>
              <label className="text-sm text-slate-700">
                <span className="mb-1 block font-medium">Zanrid</span>
                <input
                  required
                  className="w-full rounded-md border border-slate-300 px-3 py-2"
                  type="text"
                  value={editForm.genre}
                  onChange={(event) =>
                    setEditForm((current) =>
                      current
                        ? { ...current, genre: event.target.value }
                        : current,
                    )
                  }
                />
              </label>
              <label className="text-sm text-slate-700 xl:col-span-3">
                <span className="mb-1 block font-medium">Kaane pildi URL</span>
                <input
                  className="w-full rounded-md border border-slate-300 px-3 py-2"
                  type="url"
                  value={editForm.coverImage}
                  onChange={(event) =>
                    setEditForm((current) =>
                      current
                        ? { ...current, coverImage: event.target.value }
                        : current,
                    )
                  }
                />
              </label>
              <label className="text-sm text-slate-700 xl:col-span-3">
                <span className="mb-1 block font-medium">Kirjeldus</span>
                <textarea
                  className="min-h-32 w-full rounded-md border border-slate-300 px-3 py-2"
                  value={editForm.description}
                  onChange={(event) =>
                    setEditForm((current) =>
                      current
                        ? { ...current, description: event.target.value }
                        : current,
                    )
                  }
                />
              </label>

              <div className="flex flex-wrap gap-3 xl:col-span-3">
                <button
                  className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                  disabled={isSaving}
                  type="submit"
                >
                  {isSaving ? "Salvestan..." : "Salvesta muudatused"}
                </button>
                <button
                  className="inline-flex items-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  type="button"
                  onClick={() => {
                    setIsEditOpen(false);
                    setEditForm(buildEditFormState(book));
                  }}
                >
                  Loobu
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-slate-900">Arvustused</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              {reviews.length} arvustust
            </span>
          </div>

          {reviews.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              Sellel raamatul pole veel arvustusi.
            </p>
          ) : (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">
                        {review.reviewerName}
                      </h3>
                      <p className="mt-1 text-sm text-amber-600">
                        Hinnang: {review.rating} / 5
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">
                    {review.comment?.trim() || "Kommentaar puudub."}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default BookDetailPage;
