import { Router } from "express";
import * as genreController from "../controllers/genre.controller";

const router = Router();

// GET /api/v1/genres
router.get("/genres", genreController.getGenres);
// GET /api/v1/genres/:id
router.get("/genres/:id", genreController.getGenreById);
// POST /api/v1/genres
router.post("/genres", genreController.addGenre);
// PUT /api/v1/genres/:id
router.put("/genres/:id", genreController.updateGenre);
// DELETE /api/v1/genres/:id
router.delete("/genres/:id", genreController.deleteGenre);

export default router;
