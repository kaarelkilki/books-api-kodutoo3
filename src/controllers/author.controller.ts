import * as authorService from "../services/author.service";
import { Request, Response } from "express";

export async function getAuthors(req: Request, res: Response): Promise<void> {
  try {
    const authors = await authorService.getAuthors();
    res.json(authors);
  } catch (error) {
    res.status(500).json({ message: "Error fetching authors" });
  }
}

export async function getAuthorById(
  req: Request,
  res: Response,
): Promise<void> {
  const id = parseInt(req.params.id as string, 10);
  try {
    const author = await authorService.getAuthorById(id);
    if (author) {
      res.json(author);
    } else {
      res.status(404).json({ message: "Author not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching author" });
  }
}

export async function addAuthor(req: Request, res: Response): Promise<void> {
  const newAuthor = req.body;
  try {
    const addedAuthor = await authorService.addAuthor(newAuthor);
    res.status(201).json(addedAuthor);
  } catch (error) {
    res.status(500).json({ message: "Error adding author" });
  }
}

export async function updateAuthor(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id as string, 10);
  const updatedAuthor = req.body;
  try {
    const author = await authorService.updateAuthor(id, updatedAuthor);
    if (author) {
      res.json(author);
    } else {
      res.status(404).json({ message: "Author not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating author" });
  }
}

export async function deleteAuthor(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id as string, 10);
  try {
    const author = await authorService.deleteAuthor(id);
    if (author) {
      res.json(author);
    } else {
      res.status(404).json({ message: "Author not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting author" });
  }
}
