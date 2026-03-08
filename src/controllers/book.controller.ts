import * as bookService from "../services/book.service";
import { Request, Response } from "express";

export function getBooks(req: Request, res: Response): void {
  const books = bookService.getBooks();
  res.json(books);
}

export function getBookById(req: Request, res: Response): void {
  const id = parseInt(req.params.id as string, 10);
  const book = bookService.getBookById(id);
  if (book) {
    res.json(book);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
}

export function addBook(req: Request, res: Response): void {
  const newBook = req.body;
  const addedBook = bookService.addBook(newBook);
  res.status(201).json(addedBook);
}

export function updateBook(req: Request, res: Response): void {
  const id = parseInt(req.params.id as string, 10);
  const updatedBookData = req.body;
  const updatedBook = bookService.updateBook(id, updatedBookData);
  if (updatedBook) {
    res.json(updatedBook);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
}

export function deleteBook(req: Request, res: Response): void {
  const id = parseInt(req.params.id as string, 10);
  const deleted = bookService.deleteBook(id);
  if (deleted) {
    res.status(204).send();
  } else {
    res.status(404).json({ message: "Book not found" });
  }
}
