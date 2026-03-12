import * as bookService from "../services/book.service";
import * as reviewService from "../services/review.service";
import { Request, Response } from "express";
import { BookListQuery } from "../models/book.model";
import { getBooksQuerySchema } from "../validators/book.validators";

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

export async function getBooks(req: Request, res: Response): Promise<void> {
  try {
    const parsedQuery = getBooksQuerySchema.safeParse(
      normalizeBooksQuery(req.query),
    );

    if (!parsedQuery.success) {
      res.status(400).json({
        message: "Invalid query parameters",
        details: parsedQuery.error.issues,
      });
      return;
    }

    const books = await bookService.getBooks(parsedQuery.data);
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: "Error fetching books" });
  }
}

export async function getBookById(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id as string, 10);
  try {
    const book = await bookService.getBookById(id);
    if (book) {
      res.json(book);
    } else {
      res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching book" });
  }
}

export async function addBook(req: Request, res: Response): Promise<void> {
  const newBook = req.body;
  try {
    const addedBook = await bookService.addBook(newBook);
    res.status(201).json(addedBook);
  } catch (error) {
    res.status(500).json({ message: "Error adding book" });
  }
}

export async function updateBook(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id as string, 10);
  const updatedBookData = req.body;
  try {
    const updatedBook = await bookService.updateBook(id, updatedBookData);
    if (updatedBook) {
      res.json(updatedBook);
    } else {
      res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating book" });
  }
}

export async function deleteBook(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id as string, 10);
  try {
    const deleted = await bookService.deleteBook(id);
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting book" });
  }
}

export async function getBookReviews(
  req: Request,
  res: Response,
): Promise<void> {
  const bookId = parseInt(req.params.id as string, 10);
  try {
    const reviews = await reviewService.getReviewsByBookId(bookId);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Error fetching book reviews" });
  }
}

export async function addBookReview(
  req: Request,
  res: Response,
): Promise<void> {
  const bookId = parseInt(req.params.id as string, 10);
  try {
    const review = await reviewService.addReviewForBook(bookId, req.body);
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: "Error adding review for book" });
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
      res.status(404).json({ message: "Review not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting review" });
  }
}

export async function getBookAverageRating(
  req: Request,
  res: Response,
): Promise<void> {
  const bookId = parseInt(req.params.id as string, 10);
  try {
    const averageRating = await reviewService.getAverageRatingForBook(bookId);
    res.json({ bookId, averageRating });
  } catch (error) {
    res.status(500).json({ message: "Error fetching average rating" });
  }
}
