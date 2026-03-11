import { Router } from "express";
import * as authorController from "../controllers/author.controller";
const router = Router();

// GET /api/v1/authors
router.get("/authors", authorController.getAuthors);
// GET /api/v1/authors/:id
router.get("/authors/:id", authorController.getAuthorById);
// POST /api/v1/authors
router.post("/authors", authorController.addAuthor);
// PUT /api/v1/authors/:id
router.put("/authors/:id", authorController.updateAuthor);
// DELETE /api/v1/authors/:id
router.delete("/authors/:id", authorController.deleteAuthor);

export default router;
