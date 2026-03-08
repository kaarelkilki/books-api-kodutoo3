import { Router } from "express";
import * as bookController from "../controllers/book.controller";
const router = Router();

// GET /api/v1/books
router.get("/books", bookController.getBooks);
// GET /api/v1/books/:id
router.get("/books/:id", bookController.getBookById);
// POST /api/v1/books
router.post("/books", bookController.addBook);
// PUT /api/v1/books/:id
router.put("/books/:id", bookController.updateBook);
// DELETE /api/v1/books/:id
router.delete("/books/:id", bookController.deleteBook);

export default router;
