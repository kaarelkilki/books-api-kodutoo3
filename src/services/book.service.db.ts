import { PrismaClient } from "@prisma/client";
import {
  Book,
  BookListQuery,
  PaginatedBooksResponse,
} from "../models/book.model";

const prisma = new PrismaClient();

function buildPagination(page: number, limit: number, totalItems: number) {
  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / limit);

  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
  };
}

function mapBookWithAuthors(book: {
  id: number;
  title: string;
  publishedYear: number;
  authors: Array<{
    author: {
      firstName: string;
      lastName: string;
    };
  }>;
}): Book {
  const authorNames = book.authors.map(({ author }) => {
    return `${author.firstName} ${author.lastName}`.trim();
  });

  return {
    id: book.id,
    title: book.title,
    publishedYear: book.publishedYear,
    author: authorNames.length > 0 ? authorNames.join(", ") : "Unknown",
    language: "",
    genre: "",
  };
}

export async function getBooks(
  query: BookListQuery = {},
): Promise<PaginatedBooksResponse> {
  const {
    title,
    year,
    author,
    sortBy,
    order = "asc",
    page = 1,
    limit = 10,
  } = query;

  const where = {
    ...(title
      ? {
          title: {
            contains: title,
            mode: "insensitive" as const,
          },
        }
      : {}),
    ...(year !== undefined ? { publishedYear: year } : {}),
    ...(author
      ? {
          authors: {
            some: {
              author: {
                OR: [
                  {
                    firstName: {
                      contains: author,
                      mode: "insensitive" as const,
                    },
                  },
                  {
                    lastName: {
                      contains: author,
                      mode: "insensitive" as const,
                    },
                  },
                ],
              },
            },
          },
        }
      : {}),
  };

  const [totalItems, books] = await prisma.$transaction([
    prisma.book.count({ where }),
    prisma.book.findMany({
      where,
      orderBy: sortBy ? { [sortBy]: order } : undefined,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        authors: {
          include: {
            author: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    }),
  ]);

  return {
    data: books.map(mapBookWithAuthors),
    pagination: buildPagination(page, limit, totalItems),
  };
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
