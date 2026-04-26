import { Link } from "react-router-dom";

function BooksPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Books</h1>
      <p className="mt-2 text-sm text-slate-600">
        Books list page is wired to route /books.
      </p>

      <div className="mt-6">
        <Link className="text-blue-600 underline" to="/books/1">
          Open sample book detail (/books/1)
        </Link>
      </div>
    </main>
  );
}

export default BooksPage;
