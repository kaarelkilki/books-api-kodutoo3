import * as publisherService from "../services/publisher.service";
import { Request, Response } from "express";

export async function getPublishers(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const publishers = await publisherService.getPublishers();
    res.json(publishers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching publishers" });
  }
}

export async function getPublisherById(
  req: Request,
  res: Response,
): Promise<void> {
  const id = parseInt(req.params.id as string, 10);
  try {
    const publisher = await publisherService.getPublisherById(id);
    if (publisher) {
      res.json(publisher);
    } else {
      res.status(404).json({ message: "Publisher not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching publisher" });
  }
}

export async function addPublisher(req: Request, res: Response): Promise<void> {
  const newPublisher = req.body;
  try {
    const addedPublisher = await publisherService.addPublisher(newPublisher);
    res.status(201).json(addedPublisher);
  } catch (error) {
    res.status(500).json({ message: "Error adding publisher" });
  }
}

export async function updatePublisher(
  req: Request,
  res: Response,
): Promise<void> {
  const id = parseInt(req.params.id as string, 10);
  const updatedPublisher = req.body;
  try {
    const publisher = await publisherService.updatePublisher(
      id,
      updatedPublisher,
    );
    if (publisher) {
      res.json(publisher);
    } else {
      res.status(404).json({ message: "Publisher not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating publisher" });
  }
}

export async function deletePublisher(
  req: Request,
  res: Response,
): Promise<void> {
  const id = parseInt(req.params.id as string, 10);
  try {
    const deleted = await publisherService.deletePublisher(id);
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: "Publisher not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting publisher" });
  }
}
