import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">404 Not Found</h1>
      <p className="mt-2 text-sm text-slate-600">
        The page you are looking for does not exist.
      </p>
      <Link to="/" className="mt-4 inline-block text-blue-500 hover:underline">
        Go back to the homepage
      </Link>
    </main>
  );
}

export default NotFoundPage;
