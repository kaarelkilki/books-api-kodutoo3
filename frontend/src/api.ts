import axios, { AxiosError } from "axios";

export type SortOrder = "asc" | "desc";
export type BookSortField = "title" | "publishedYear";

export interface ApiErrorResponse {
  error?: string;
  message?: string;
  details?: unknown[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface Book {
  id: number;
  title: string;
  isbn?: string;
  publishedYear: number;
  pageCount?: number;
  author: string;
  publisher?: string;
  language: string;
  description?: string;
  coverImage?: string;
  genre: string;
  averageRating: number | null;
}

export interface BookListQuery {
  title?: string;
  year?: number;
  language?: string;
  author?: string;
  genre?: string;
  sortBy?: BookSortField;
  order?: SortOrder;
  page?: number;
  limit?: number;
}

export interface PaginatedBooksResponse {
  data: Book[];
  pagination: PaginationMeta;
}

export interface CreateBookPayload {
  title: string;
  isbn?: string;
  publishedYear: number;
  pageCount?: number;
  author: string;
  publisher?: string;
  language: string;
  description?: string;
  coverImage?: string;
  genre: string;
}

export type UpdateBookPayload = Partial<CreateBookPayload>;

export interface Review {
  id: number;
  bookId: number;
  reviewerName: string;
  rating: number;
  comment?: string;
}

export interface Author {
  id: number;
  firstName: string;
  lastName: string;
  birthYear: number;
}

export interface ReviewListQuery {
  page?: number;
  limit?: number;
}

export interface CreateReviewPayload {
  reviewerName: string;
  rating: number;
  comment?: string;
}

export interface CreateGlobalReviewPayload extends CreateReviewPayload {
  bookId: number;
}

export type UpdateReviewPayload = Partial<CreateGlobalReviewPayload>;

export interface BookAverageRatingResponse {
  bookId: number;
  averageRating: number | null;
}

const apiBaseUrl =
  import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1";

export const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

export function isApiError(
  error: unknown,
): error is AxiosError<ApiErrorResponse> {
  return axios.isAxiosError(error);
}

export async function getBooks(
  params?: BookListQuery,
  signal?: AbortSignal,
): Promise<PaginatedBooksResponse> {
  const response = await api.get<PaginatedBooksResponse>("/books", {
    params,
    signal,
  });
  return response.data;
}

export async function getBookById(
  id: number,
  signal?: AbortSignal,
): Promise<Book> {
  const response = await api.get<Book>(`/books/${id}`, { signal });
  return response.data;
}

export async function createBook(
  payload: CreateBookPayload,
  signal?: AbortSignal,
): Promise<Book> {
  const response = await api.post<Book>("/books", payload, { signal });
  return response.data;
}

export async function updateBook(
  id: number,
  payload: UpdateBookPayload,
  signal?: AbortSignal,
): Promise<Book> {
  const response = await api.put<Book>(`/books/${id}`, payload, { signal });
  return response.data;
}

export async function deleteBook(
  id: number,
  signal?: AbortSignal,
): Promise<void> {
  await api.delete(`/books/${id}`, { signal });
}

export async function getBookReviews(
  bookId: number,
  params?: ReviewListQuery,
  signal?: AbortSignal,
): Promise<Review[]> {
  const response = await api.get<Review[]>(`/books/${bookId}/reviews`, {
    params,
    signal,
  });
  return response.data;
}

export async function createBookReview(
  bookId: number,
  payload: CreateReviewPayload,
  signal?: AbortSignal,
): Promise<Review> {
  const response = await api.post<Review>(`/books/${bookId}/reviews`, payload, {
    signal,
  });
  return response.data;
}

export async function deleteBookReview(
  bookId: number,
  reviewId: number,
  signal?: AbortSignal,
): Promise<void> {
  await api.delete(`/books/${bookId}/reviews/${reviewId}`, { signal });
}

export async function getBookAverageRating(
  bookId: number,
  signal?: AbortSignal,
): Promise<BookAverageRatingResponse> {
  const response = await api.get<BookAverageRatingResponse>(
    `/books/${bookId}/average-rating`,
    { signal },
  );
  return response.data;
}

export async function getReviews(signal?: AbortSignal): Promise<Review[]> {
  const response = await api.get<Review[]>("/reviews", { signal });
  return response.data;
}

export async function getReviewById(
  id: number,
  signal?: AbortSignal,
): Promise<Review> {
  const response = await api.get<Review>(`/reviews/${id}`, { signal });
  return response.data;
}

export async function createReview(
  payload: CreateGlobalReviewPayload,
  signal?: AbortSignal,
): Promise<Review> {
  const response = await api.post<Review>("/reviews", payload, { signal });
  return response.data;
}

export async function updateReview(
  id: number,
  payload: UpdateReviewPayload,
  signal?: AbortSignal,
): Promise<Review> {
  const response = await api.put<Review>(`/reviews/${id}`, payload, { signal });
  return response.data;
}

export async function deleteReview(
  id: number,
  signal?: AbortSignal,
): Promise<void> {
  await api.delete(`/reviews/${id}`, { signal });
}

export async function getAuthors(signal?: AbortSignal): Promise<Author[]> {
  const response = await api.get<Author[]>("/authors", { signal });
  return response.data;
}

export interface Genre {
  id: number;
  name: string;
  description?: string;
}

export async function getGenres(signal?: AbortSignal): Promise<Genre[]> {
  const response = await api.get<Genre[]>("/genres", { signal });
  return response.data;
}
