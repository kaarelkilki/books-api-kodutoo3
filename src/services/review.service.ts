import { Review } from "../models/review.model";

let reviews: Review[] = [
  {
    id: 1,
    bookId: 1,
    reviewerName: "Alice",
    rating: 5,
    comment: "Very practical and clear.",
  },
  {
    id: 2,
    bookId: 2,
    reviewerName: "Bob",
    rating: 4,
    comment: "Great read for software engineers.",
  },
  {
    id: 3,
    bookId: 3,
    reviewerName: "Charlie",
    rating: 5,
    comment: "A timeless classic.",
  },
];

export async function getReviews(): Promise<Review[]> {
  return reviews;
}

export async function getReviewById(id: number): Promise<Review | null> {
  const review = reviews.find((item) => item.id === id);
  return review ?? null;
}

export async function addReview(
  newReview: Omit<Review, "id">,
): Promise<Review> {
  const id = reviews.length > 0 ? reviews[reviews.length - 1].id + 1 : 1;
  const reviewToAdd: Review = { id, ...newReview };
  reviews.push(reviewToAdd);
  return reviewToAdd;
}

export async function getReviewsByBookId(
  bookId: number,
  query: { page?: number; limit?: number } = {},
): Promise<Review[]> {
  const bookReviews = reviews.filter((item) => item.bookId === bookId);
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const start = (page - 1) * limit;
  return bookReviews.slice(start, start + limit);
}

export async function addReviewForBook(
  bookId: number,
  payload: Omit<Review, "id" | "bookId">,
): Promise<Review> {
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
  const index = reviews.findIndex((item) => item.id === id);
  if (index === -1) {
    return null;
  }

  const merged = { ...reviews[index], ...updatedReview, id };
  reviews[index] = merged;
  return merged;
}

export async function deleteReview(id: number): Promise<boolean> {
  const before = reviews.length;
  reviews = reviews.filter((item) => item.id !== id);
  return reviews.length < before;
}
