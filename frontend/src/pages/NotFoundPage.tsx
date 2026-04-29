import { Link } from "react-router-dom";
import { EmptyState } from "../components/UiStates";

function NotFoundPage() {
  return (
    <main className="app-shell">
      <div className="page-wrap max-w-4xl">
        <EmptyState
          title="404 - lehte ei leitud"
          message="Sinu otsitud leht puudub. Mine tagasi raamatuvaatesse ja jatka sealt."
        />
        <div className="mt-6 text-center">
          <Link to="/books" className="btn-primary">
            Tagasi raamatute juurde
          </Link>
        </div>
      </div>
    </main>
  );
}

export default NotFoundPage;
