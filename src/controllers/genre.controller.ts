import * as genreService from "../services/genre.service";
import { Request, Response } from "express";

export async function getGenres(req: Request, res: Response): Promise<void> {
  try {
    const genres = await genreService.getGenres();
    res.json(genres);
  } catch (error) {
    res.status(500).json({ message: "Error fetching genres" });
  }
}

export async function getGenreById(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id as string, 10);
  try {
    const genre = await genreService.getGenreById(id);
    if (genre) {
      res.json(genre);
    } else {
      res.status(404).json({ message: "Genre not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching genre" });
  }
}

export async function addGenre(req: Request, res: Response): Promise<void> {
  const newGenre = req.body;
  try {
    const addedGenre = await genreService.addGenre(newGenre);
    res.status(201).json(addedGenre);
  } catch (error) {
    res.status(500).json({ message: "Error adding genre" });
  }
}

export async function updateGenre(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id as string, 10);
  const updatedGenre = req.body;
  try {
    const genre = await genreService.updateGenre(id, updatedGenre);
    if (genre) {
      res.json(genre);
    } else {
      res.status(404).json({ message: "Genre not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating genre" });
  }
}

export async function deleteGenre(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id as string, 10);
  try {
    const deleted = await genreService.deleteGenre(id);
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: "Genre not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting genre" });
  }
}
