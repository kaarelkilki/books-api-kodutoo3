import { publishers } from "../data/mock/publishers.mock";
import { Publisher } from "../models/publisher.model";

export async function getPublishers(): Promise<Publisher[]> {
  return publishers;
}

export async function getPublisherById(id: number): Promise<Publisher | null> {
  const publisher = publishers.find((item) => item.id === id);
  return publisher ?? null;
}

export async function addPublisher(
  newPublisher: Omit<Publisher, "id">,
): Promise<Publisher> {
  const id =
    publishers.length > 0 ? publishers[publishers.length - 1].id + 1 : 1;
  const publisherToAdd: Publisher = { id, ...newPublisher };
  publishers.push(publisherToAdd);
  return publisherToAdd;
}

export async function updatePublisher(
  id: number,
  updatedPublisher: Partial<Publisher>,
): Promise<Publisher | null> {
  const index = publishers.findIndex((item) => item.id === id);
  if (index === -1) {
    return null;
  }

  const merged = { ...publishers[index], ...updatedPublisher, id };
  publishers[index] = merged;
  return merged;
}

export async function deletePublisher(id: number): Promise<boolean> {
  const index = publishers.findIndex((item) => item.id === id);
  if (index === -1) {
    return false;
  }

  publishers.splice(index, 1);
  return true;
}
