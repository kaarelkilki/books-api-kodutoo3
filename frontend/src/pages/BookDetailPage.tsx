import { Link, useParams } from "react-router-dom";

function BookDetailPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Book Detail</h1>
      <p className="mt-2 text-sm text-slate-600">
        Book detail page is wired to route /books/:id.
      </p>
      <p className="mt-2 text-sm">Current id: {id ?? "-"}</p>

      <div className="mt-6">
        <Link
          className="inline-flex items-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          to="/books"
        >
          Tagasi nimekirja
        </Link>
      </div>
    </main>
  );
}

export default BookDetailPage;
