import * as bookServiceDb from "./book.service.db";
import * as bookServiceMock from "./book.service.mock";
import {
  Book,
  BookListQuery,
  PaginatedBooksResponse,
} from "../models/book.model";

function isMockEnabled(): boolean {
  return process.env.USE_MOCK === "true";
}

export function getDataSourceMode(): "mock" | "db" {
  return isMockEnabled() ? "mock" : "db";
}

export async function getBooks(
  query: BookListQuery = {},
): Promise<PaginatedBooksResponse> {
  return isMockEnabled()
    ? bookServiceMock.getBooks(query)
    : bookServiceDb.getBooks(query);
}

export async function getBookById(id: number): Promise<Book | null> {
  return isMockEnabled()
    ? bookServiceMock.getBookById(id)
    : bookServiceDb.getBookById(id);
}

export async function addBook(newBook: Omit<Book, "id">): Promise<Book> {
  return isMockEnabled()
    ? bookServiceMock.addBook(newBook)
    : bookServiceDb.addBook(newBook);
}

export async function updateBook(
  id: number,
  updatedBook: Partial<Book>,
): Promise<Book | undefined> {
  return isMockEnabled()
    ? bookServiceMock.updateBook(id, updatedBook)
    : bookServiceDb.updateBook(id, updatedBook);
}

export async function deleteBook(id: number): Promise<boolean> {
  return isMockEnabled()
    ? bookServiceMock.deleteBook(id)
    : bookServiceDb.deleteBook(id);
}
