import { Author } from "../models/author.model";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function getAuthors(): Promise<Author[]> {
  return prisma.author.findMany();
}

export async function getAuthorById(id: number): Promise<Author | null> {
  return prisma.author.findUnique({
    where: { id },
  });
}

export async function addAuthor(newAuthor: Author): Promise<Author> {
  const createdAuthor = await prisma.author.create({ data: newAuthor });
  return createdAuthor;
}

export async function updateAuthor(
  id: number,
  updatedAuthor: Partial<Author>,
): Promise<Author | null> {
  const author = await prisma.author.update({
    where: { id },
    data: updatedAuthor,
  });
  return author;
}

export async function deleteAuthor(id: number): Promise<Author | null> {
  const author = await prisma.author.delete({
    where: { id },
  });
  return author;
}
