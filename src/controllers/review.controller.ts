import * as reviewService from "../services/review.service";
import { Request, Response } from "express";
import {
  createReviewSchema,
  updateReviewSchema,
} from "../validators/review.validator";

export async function getReviews(req: Request, res: Response): Promise<void> {
  try {
    const reviews = await reviewService.getReviews();
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reviews" });
  }
}

export async function getReviewById(
  req: Request,
  res: Response,
): Promise<void> {
  const id = parseInt(req.params.id as string, 10);
  try {
    const review = await reviewService.getReviewById(id);
    if (review) {
      res.json(review);
    } else {
      res.status(404).json({ message: "Review not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching review" });
  }
}

export async function addReview(req: Request, res: Response): Promise<void> {
  const parsed = createReviewSchema.safeParse(req.body);
  if (!parsed.success) {
    res
      .status(400)
      .json({ error: "Validation failed", details: parsed.error.issues });
    return;
  }
  const newReview = {
    ...parsed.data,
    bookId: parseInt(req.body.bookId as string, 10),
  };
  try {
    const addedReview = await reviewService.addReview(newReview);
    res.status(201).json(addedReview);
  } catch (error) {
    res.status(500).json({ message: "Error adding review" });
  }
}

export async function updateReview(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id as string, 10);
  const parsed = updateReviewSchema.safeParse(req.body);
  if (!parsed.success) {
    res
      .status(400)
      .json({ error: "Validation failed", details: parsed.error.issues });
    return;
  }
  try {
    const review = await reviewService.updateReview(id, parsed.data);
    if (review) {
      res.json(review);
    } else {
      res.status(404).json({ message: "Review not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating review" });
  }
}

export async function deleteReview(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id as string, 10);
  try {
    const deleted = await reviewService.deleteReview(id);
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: "Review not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting review" });
  }
}
