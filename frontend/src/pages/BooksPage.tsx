import { Link } from "react-router-dom";

function BooksPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Books</h1>
      <p className="mt-2 text-sm text-slate-600">
        Books list page is wired to route /books.
      </p>

      <div className="mt-6">
        <Link
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          to="/books/1"
        >
          Vaata detaili
        </Link>
      </div>
    </main>
  );
}

export default BooksPage;
