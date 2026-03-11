import { Book } from "../models/book.model";
import { books } from "../data/mock/books.mock";
// service for mock data, not async, no error handling needed

export function getBooks(): Book[] {
  return books;
}

export function getBookById(id: number): Book | null {
  const book = books.find((b) => b.id === id);
  return book || null;
}

export function addBook(newBook: Book): Book {
  const createdBook = { ...newBook, id: books.length + 1 };
  books.push(createdBook);
  return createdBook;
}

export function updateBook(
  id: number,
  updatedBook: Partial<Book>,
): Book | undefined {
  const index = books.findIndex((b) => b.id === id);
  if (index === -1) {
    return undefined;
  }
  const updatedBookData = { ...books[index], ...updatedBook };
  books[index] = updatedBookData;
  return updatedBookData;
}

export function deleteBook(id: number): boolean {
  const index = books.findIndex((b) => b.id === id);
  if (index === -1) {
    return false;
  }
  books.splice(index, 1);
  return true;
}
