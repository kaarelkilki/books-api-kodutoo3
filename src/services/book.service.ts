import * as bookServiceDb from "./book.service.db";
import * as bookServiceMock from "./book.service.mock";

export const useMock = process.env.USE_MOCK === "true";

export const getBooks = useMock
  ? bookServiceMock.getBooks
  : bookServiceDb.getBooks;
export const getBookById = useMock
  ? bookServiceMock.getBookById
  : bookServiceDb.getBookById;
export const addBook = useMock
  ? bookServiceMock.addBook
  : bookServiceDb.addBook;
export const updateBook = useMock
  ? bookServiceMock.updateBook
  : bookServiceDb.updateBook;
export const deleteBook = useMock
  ? bookServiceMock.deleteBook
  : bookServiceDb.deleteBook;
