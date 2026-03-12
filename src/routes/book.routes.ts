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
// GET /api/v1/books/:id/reviews
router.get("/books/:id/reviews", bookController.getBookReviews);
// POST /api/v1/books/:id/reviews
router.post("/books/:id/reviews", bookController.addBookReview);
// DELETE /api/v1/books/:id/reviews/:reviewId
router.delete("/books/:id/reviews/:reviewId", bookController.deleteBookReview);
// GET /api/v1/books/:id/average-rating
router.get("/books/:id/average-rating", bookController.getBookAverageRating);

export default router;
