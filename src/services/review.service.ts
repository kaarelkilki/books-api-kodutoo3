import { PrismaClient } from "../generated/prisma/client";
import { reviews } from "../data/mock/reviews.mock";
import { Review } from "../models/review.model";

const prisma = new PrismaClient();

function isMockEnabled(): boolean {
  if (process.env.USE_MOCK === "true") {
    return true;
  }

  if (process.env.USE_MOCK === "false") {
    return false;
  }

  return !process.env.DATABASE_URL;
}

function mapDbReviewToReview(review: {
  id: number;
  bookId: number;
  reviewerName: string;
  rating: number;
  comment: string | null;
}): Review {
  return {
    id: review.id,
    bookId: review.bookId,
    reviewerName: review.reviewerName,
    rating: review.rating,
    comment: review.comment ?? undefined,
  };
}

export async function getReviews(): Promise<Review[]> {
  if (!isMockEnabled()) {
    const dbReviews = await prisma.review.findMany({
      orderBy: { id: "asc" },
    });
    return dbReviews.map(mapDbReviewToReview);
  }

  return reviews;
}

export async function getReviewById(id: number): Promise<Review | null> {
  if (!isMockEnabled()) {
    const review = await prisma.review.findUnique({ where: { id } });
    return review ? mapDbReviewToReview(review) : null;
  }

  const review = reviews.find((item) => item.id === id);
  return review ?? null;
}

export async function addReview(
  newReview: Omit<Review, "id">,
): Promise<Review> {
  if (!isMockEnabled()) {
    const createdReview = await prisma.review.create({
      data: {
        bookId: newReview.bookId,
        reviewerName: newReview.reviewerName,
        rating: newReview.rating,
        comment: newReview.comment,
      },
    });
    return mapDbReviewToReview(createdReview);
  }

  const id = reviews.length > 0 ? reviews[reviews.length - 1].id + 1 : 1;
  const reviewToAdd: Review = { id, ...newReview };
  reviews.push(reviewToAdd);
  return reviewToAdd;
}

export async function getReviewsByBookId(
  bookId: number,
  query: { page?: number; limit?: number } = {},
): Promise<Review[]> {
  if (!isMockEnabled()) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const dbReviews = await prisma.review.findMany({
      where: { bookId },
      orderBy: { id: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return dbReviews.map(mapDbReviewToReview);
  }

  const bookReviews = reviews.filter((item) => item.bookId === bookId);
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const start = (page - 1) * limit;
  return bookReviews.slice(start, start + limit);
}

export async function addReviewForBook(
  bookId: number,
  payload: Omit<Review, "id" | "bookId">,
): Promise<Review | null> {
  if (!isMockEnabled()) {
    const bookCount = await prisma.book.count({ where: { id: bookId } });
    if (bookCount === 0) {
      return null;
    }
  }
  const reviewToAdd: Omit<Review, "id"> = {
    bookId,
    reviewerName: payload.reviewerName,
    rating: payload.rating,
    comment: payload.comment,
  };

  return addReview(reviewToAdd);
}

export async function deleteReviewForBook(
  bookId: number,
  reviewId: number,
): Promise<boolean> {
  if (!isMockEnabled()) {
    const deletedRows = await prisma.review.deleteMany({
      where: {
        id: reviewId,
        bookId,
      },
    });
    return deletedRows.count > 0;
  }

  const review = reviews.find(
    (item) => item.id === reviewId && item.bookId === bookId,
  );
  if (!review) {
    return false;
  }

  return deleteReview(reviewId);
}

export async function getAverageRatingForBook(
  bookId: number,
): Promise<number | null> {
  if (!isMockEnabled()) {
    const aggregate = await prisma.review.aggregate({
      where: { bookId },
      _avg: {
        rating: true,
      },
    });
    return aggregate._avg.rating ?? null;
  }

  const bookReviews = reviews.filter((item) => item.bookId === bookId);
  if (bookReviews.length === 0) {
    return null;
  }

  const total = bookReviews.reduce((sum, item) => sum + item.rating, 0);
  return total / bookReviews.length;
}

export async function updateReview(
  id: number,
  updatedReview: Partial<Review>,
): Promise<Review | null> {
  if (!isMockEnabled()) {
    try {
      const updated = await prisma.review.update({
        where: { id },
        data: {
          reviewerName: updatedReview.reviewerName,
          rating: updatedReview.rating,
          comment: updatedReview.comment,
          bookId: updatedReview.bookId,
        },
      });
      return mapDbReviewToReview(updated);
    } catch (error) {
      return null;
    }
  }

  const index = reviews.findIndex((item) => item.id === id);
  if (index === -1) {
    return null;
  }

  const merged = { ...reviews[index], ...updatedReview, id };
  reviews[index] = merged;
  return merged;
}

export async function deleteReview(id: number): Promise<boolean> {
  if (!isMockEnabled()) {
    try {
      await prisma.review.delete({ where: { id } });
      return true;
    } catch (error) {
      return false;
    }
  }

  const index = reviews.findIndex((item) => item.id === id);
  if (index === -1) {
    return false;
  }

  reviews.splice(index, 1);
  return true;
}
