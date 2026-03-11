import * as bookService from "../services/book.service";
import { Request, Response } from "express";
/*Kui service muutub async-iks, controllerid peavad minema async/await peale + try/catch veahaldus (nt Prisma “record not found”).*/
export async function getBooks(req: Request, res: Response): Promise<void> {
  try {
    const books = await bookService.getBooks();
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
