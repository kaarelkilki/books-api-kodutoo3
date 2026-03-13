export interface Review {
  id: number;
  bookId: number;
  reviewerName: string;
  rating: number;
  comment?: string;
}
