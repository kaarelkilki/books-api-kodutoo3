import { Navigate, Route, Routes } from "react-router-dom";
import BookDetailPage from "./pages/BookDetailPage.tsx";
import BooksPage from "./pages/BooksPage.tsx";

function App() {
  return (
    <Routes>
      <Route path="/books" element={<BooksPage />} />
      <Route path="/books/:id" element={<BookDetailPage />} />
      <Route path="*" element={<Navigate to="/books" replace />} />
    </Routes>
  );
}

export default App;
