import { Publisher } from "../models/publisher.model";

let publishers: Publisher[] = [
  { id: 1, name: "Addison-Wesley", country: "USA", foundedYear: 1942 },
  { id: 2, name: "O'Reilly Media", country: "USA", foundedYear: 1978 },
  { id: 3, name: "Manning", country: "USA", foundedYear: 1990 },
];

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
  const before = publishers.length;
  publishers = publishers.filter((item) => item.id !== id);
  return publishers.length < before;
}
