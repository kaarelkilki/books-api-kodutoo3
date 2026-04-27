import * as bookService from "../services/book.service";
import * as reviewService from "../services/review.service";
import { Request, Response } from "express";
import {
  Book,
  BookListQuery,
  PaginatedBooksResponse,
} from "../models/book.model";
import {
  createBookSchema,
  getBooksQuerySchema,
  updateBookSchema,
} from "../validators/book.validators";
import {
  createReviewSchema,
  reviewQuerySchema,
} from "../validators/review.validator";

function parseOptionalNumber(value: unknown): number | undefined {
  if (typeof value !== "string" || value.trim() === "") {
    return undefined;
  }

  const parsedValue = Number(value);
  return parsedValue;
}

function normalizeBooksQuery(query: Request["query"]): BookListQuery {
  return {
    title: typeof query.title === "string" ? query.title : undefined,
    year: parseOptionalNumber(query.year),
    language: typeof query.language === "string" ? query.language : undefined,
    author: typeof query.author === "string" ? query.author : undefined,
    genre: typeof query.genre === "string" ? query.genre : undefined,
    sortBy:
      query.sortBy === "title" || query.sortBy === "publishedYear"
        ? query.sortBy
        : undefined,
    order:
      query.order === "asc" || query.order === "desc" ? query.order : undefined,
    page: parseOptionalNumber(query.page),
    limit: parseOptionalNumber(query.limit),
  };
}

type BookResponse = Book & {
  averageRating: number | null;
};

function normalizeBookResponse(book: Book): BookResponse {
  const bookWithAverage = book as Book & { averageRating?: number | null };

  return {
    id: book.id,
    title: book.title,
    isbn: book.isbn,
    publishedYear: book.publishedYear,
    pageCount: book.pageCount,
    author: book.author,
    publisher: book.publisher,
    language: book.language,
    description: book.description,
    coverImage: book.coverImage,
    genre: book.genre,
    averageRating: bookWithAverage.averageRating ?? null,
  };
}

function normalizePaginatedBooksResponse(books: PaginatedBooksResponse): {
  data: BookResponse[];
  pagination: PaginatedBooksResponse["pagination"];
} {
  return {
    data: books.data.map(normalizeBookResponse),
    pagination: books.pagination,
  };
}

export async function getBooks(req: Request, res: Response): Promise<void> {
  try {
    const parsedQuery = getBooksQuerySchema.safeParse(
      normalizeBooksQuery(req.query),
    );

    if (!parsedQuery.success) {
      res.status(400).json({
        error: "Invalid query parameters",
        details: parsedQuery.error.issues,
      });
      return;
    }

    const books = await bookService.getBooks(parsedQuery.data);
    res.json(normalizePaginatedBooksResponse(books));
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ error: "Error fetching books", details: [] });
  }
}

export async function getBookById(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id as string, 10);
  try {
    const book = await bookService.getBookById(id);
    if (book) {
      res.json(normalizeBookResponse(book));
    } else {
      res.status(404).json({ error: "Book not found", details: [] });
    }
  } catch (error) {
    res.status(500).json({ error: "Error fetching book", details: [] });
  }
}

export async function addBook(req: Request, res: Response): Promise<void> {
  const parsedBook = createBookSchema.safeParse(req.body);
  if (!parsedBook.success) {
    res.status(400).json({
      error: "Validation failed",
      details: parsedBook.error.issues,
    });
    return;
  }

  try {
    const addedBook = await bookService.addBook(parsedBook.data);
    res.status(201).json(normalizeBookResponse(addedBook));
  } catch (error) {
    const statusCode = (error as any)?.statusCode;
    if (statusCode === 409) {
      res.status(409).json({ error: (error as Error).message, details: [] });
    } else {
      res.status(500).json({ error: "Error adding book", details: [] });
    }
  }
}

export async function updateBook(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id as string, 10);
  const parsedBook = updateBookSchema.safeParse(req.body);
  if (!parsedBook.success) {
    res.status(400).json({
      error: "Validation failed",
      details: parsedBook.error.issues,
    });
    return;
  }

  try {
    const updatedBook = await bookService.updateBook(id, parsedBook.data);
    if (updatedBook) {
      res.json(normalizeBookResponse(updatedBook));
    } else {
      res.status(404).json({ error: "Book not found", details: [] });
    }
  } catch (error) {
    res.status(500).json({ error: "Error updating book", details: [] });
  }
}

export async function deleteBook(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id as string, 10);
  try {
    const deleted = await bookService.deleteBook(id);
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: "Book not found", details: [] });
    }
  } catch (error) {
    res.status(500).json({ error: "Error deleting book", details: [] });
  }
}

export async function getBookReviews(
  req: Request,
  res: Response,
): Promise<void> {
  const bookId = parseInt(req.params.id as string, 10);
  const parsedQuery = reviewQuerySchema.safeParse({
    page: req.query.page !== undefined ? Number(req.query.page) : undefined,
    limit: req.query.limit !== undefined ? Number(req.query.limit) : undefined,
  });
  if (!parsedQuery.success) {
    res.status(400).json({
      error: "Invalid query parameters",
      details: parsedQuery.error.issues,
    });
    return;
  }
  try {
    const exists = await bookService.bookExists(bookId);
    if (!exists) {
      res.status(404).json({ error: "Book not found", details: [] });
      return;
    }
    const reviews = await reviewService.getReviewsByBookId(
      bookId,
      parsedQuery.data,
    );
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: "Error fetching book reviews", details: [] });
  }
}

export async function addBookReview(
  req: Request,
  res: Response,
): Promise<void> {
  const bookId = parseInt(req.params.id as string, 10);
  const parsed = createReviewSchema.safeParse(req.body);
  if (!parsed.success) {
    res
      .status(400)
      .json({ error: "Validation failed", details: parsed.error.issues });
    return;
  }
  try {
    const review = await reviewService.addReviewForBook(bookId, parsed.data);
    if (review === null) {
      res.status(404).json({ error: "Book not found", details: [] });
      return;
    }
    res.status(201).json(review);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error adding review for book", details: [] });
  }
}

export async function deleteBookReview(
  req: Request,
  res: Response,
): Promise<void> {
  const bookId = parseInt(req.params.id as string, 10);
  const reviewId = parseInt(req.params.reviewId as string, 10);
  try {
    const deleted = await reviewService.deleteReviewForBook(bookId, reviewId);
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: "Review not found", details: [] });
    }
  } catch (error) {
    res.status(500).json({ error: "Error deleting review", details: [] });
  }
}

export async function getBookAverageRating(
  req: Request,
  res: Response,
): Promise<void> {
  const bookId = parseInt(req.params.id as string, 10);
  try {
    const exists = await bookService.bookExists(bookId);
    if (!exists) {
      res.status(404).json({ error: "Book not found", details: [] });
      return;
    }
    const averageRating = await reviewService.getAverageRatingForBook(bookId);
    res.json({ bookId, averageRating });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching average rating", details: [] });
  }
}
