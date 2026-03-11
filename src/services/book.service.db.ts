import { Book } from "../models/book.model";
import { books } from "../data/mock/books.mock";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getBooks(): Promise<Book[]> {
  return prisma.book.findMany();
}

export async function getBookById(id: number): Promise<Book | null> {
  return prisma.book.findUnique({ where: { id } });
}

export async function addBook(newBook: Book): Promise<Book> {
  const createdBook = await prisma.book.create({ data: newBook });
  return createdBook;
}

export async function updateBook(
  id: number,
  updatedBook: Partial<Book>,
): Promise<Book | undefined> {
  try {
    const updatedBookData = await prisma.book.update({
      where: { id },
      data: updatedBook,
    });
    return updatedBookData;
  } catch (error) {
    return undefined;
  }
}

export async function deleteBook(id: number): Promise<boolean> {
  try {
    await prisma.book.delete({ where: { id } });
    return true;
  } catch (error) {
    return false;
  }
}
