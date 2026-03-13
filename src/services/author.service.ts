import { authors } from "../data/mock/authors.mock";
import { Author } from "../models/author.model";

export async function getAuthors(): Promise<Author[]> {
  return authors;
}

export async function getAuthorById(id: number): Promise<Author | null> {
  return authors.find((author) => author.id === id) ?? null;
}

export async function addAuthor(
  newAuthor: Omit<Author, "id">,
): Promise<Author> {
  const id = authors.length > 0 ? authors[authors.length - 1].id + 1 : 1;
  const authorToAdd: Author = { id, ...newAuthor };
  authors.push(authorToAdd);
  return authorToAdd;
}

export async function updateAuthor(
  id: number,
  updatedAuthor: Partial<Author>,
): Promise<Author | null> {
  const index = authors.findIndex((author) => author.id === id);
  if (index === -1) {
    return null;
  }

  const merged = { ...authors[index], ...updatedAuthor, id };
  authors[index] = merged;
  return merged;
}

export async function deleteAuthor(id: number): Promise<Author | null> {
  const index = authors.findIndex((author) => author.id === id);
  if (index === -1) {
    return null;
  }

  const [deletedAuthor] = authors.splice(index, 1);
  return deletedAuthor;
}
