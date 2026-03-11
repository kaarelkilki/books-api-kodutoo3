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
