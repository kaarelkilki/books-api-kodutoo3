import { Book } from "../models/book.model";
import { books } from "../data/mock/books.mock";

export function getBooks(): Book[] {
  return books;
}

export function getBookById(id: number): Book | undefined {
  return books.find((book) => book.id === id);
}

export function addBook(newBook: Book): Book {
  const id = books.length > 0 ? books[books.length - 1].id + 1 : 1;
  const bookToAdd = { ...newBook, id };
  books.push(bookToAdd);
  return bookToAdd;
}

export function updateBook(
  id: number,
  updatedBook: Partial<Book>,
): Book | undefined {
  const bookIndex = books.findIndex((book) => book.id === id);
  if (bookIndex === -1) {
    return undefined;
  }
  const updatedBookData = { ...books[bookIndex], ...updatedBook };
  books[bookIndex] = updatedBookData;
  return updatedBookData;
}

export function deleteBook(id: number): boolean {
  const bookIndex = books.findIndex((book) => book.id === id);
  if (bookIndex === -1) {
    return false;
  }
  books.splice(bookIndex, 1);
  return true;
}
