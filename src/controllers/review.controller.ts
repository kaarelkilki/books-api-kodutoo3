import * as reviewService from "../services/review.service";
import { Request, Response } from "express";

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
  const newReview = req.body;
  try {
    const addedReview = await reviewService.addReview(newReview);
    res.status(201).json(addedReview);
  } catch (error) {
    res.status(500).json({ message: "Error adding review" });
  }
}

export async function updateReview(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id as string, 10);
  const updatedReview = req.body;
  try {
    const review = await reviewService.updateReview(id, updatedReview);
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
