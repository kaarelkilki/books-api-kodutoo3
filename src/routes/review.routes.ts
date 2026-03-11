import { Router } from "express";
import * as reviewController from "../controllers/review.controller";

const router = Router();

// GET /api/v1/reviews
router.get("/reviews", reviewController.getReviews);
// GET /api/v1/reviews/:id
router.get("/reviews/:id", reviewController.getReviewById);
// POST /api/v1/reviews
router.post("/reviews", reviewController.addReview);
// PUT /api/v1/reviews/:id
router.put("/reviews/:id", reviewController.updateReview);
// DELETE /api/v1/reviews/:id
router.delete("/reviews/:id", reviewController.deleteReview);

export default router;
