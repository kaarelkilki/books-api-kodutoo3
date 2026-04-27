import { Navigate, Route, Routes } from "react-router-dom";
import BookDetailPage from "./pages/BookDetailPage.tsx";
import BooksPage from "./pages/BooksPage.tsx";
import NotFoundPage from "./pages/NotFoundPage.tsx";

function App() {
  return (
    <Routes>
      <Route path="/books" element={<BooksPage />} />
      <Route path="/books/:id" element={<BookDetailPage />} />
      <Route path="/" element={<Navigate to="/books" />} />
      <Route path="*" element={<Navigate to="/404" />} />
      <Route path="/404" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
