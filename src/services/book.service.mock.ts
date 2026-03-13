import { books } from "../data/mock/books.mock";
import {
  Book,
  BookListQuery,
  PaginatedBooksResponse,
} from "../models/book.model";
// service for mock data, not async, no error handling needed

function buildPagination(page: number, limit: number, totalItems: number) {
  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / limit);

  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
  };
}

export function getBooks(query: BookListQuery = {}): PaginatedBooksResponse {
  const {
    title,
    year,
    language,
    author,
    genre,
    sortBy,
    order = "asc",
    page = 1,
    limit = 10,
  } = query;

  let filteredBooks = books.filter((book) => {
    if (title && !book.title.toLowerCase().includes(title.toLowerCase())) {
      return false;
    }

    if (year !== undefined && book.publishedYear !== year) {
      return false;
    }

    if (language && book.language.toLowerCase() !== language.toLowerCase()) {
      return false;
    }

    if (author && !book.author.toLowerCase().includes(author.toLowerCase())) {
      return false;
    }

    if (genre && !book.genre.toLowerCase().includes(genre.toLowerCase())) {
      return false;
    }

    return true;
  });

  if (sortBy) {
    filteredBooks = [...filteredBooks].sort((leftBook, rightBook) => {
      const leftValue = leftBook[sortBy];
      const rightValue = rightBook[sortBy];

      if (leftValue === rightValue) {
        return 0;
      }

      const comparison = leftValue > rightValue ? 1 : -1;
      return order === "desc" ? comparison * -1 : comparison;
    });
  }

  const totalItems = filteredBooks.length;

  return {
    data: filteredBooks.slice((page - 1) * limit, page * limit),
    pagination: buildPagination(page, limit, totalItems),
  };
}

export function getBookById(id: number): Book | null {
  const book = books.find((b) => b.id === id);
  return book || null;
}

export function addBook(newBook: Omit<Book, "id">): Book {
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
