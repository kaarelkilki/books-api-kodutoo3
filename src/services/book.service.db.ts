import { PrismaClient } from "../generated/prisma/client";
import {
  Book,
  BookListQuery,
  PaginatedBooksResponse,
} from "../models/book.model";

const prisma = new PrismaClient();
const DEFAULT_PUBLISHER_NAME = "Unknown Publisher";
const DEFAULT_PUBLISHER_COUNTRY = "Unknown";

function isPrismaKnownError(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === code
  );
}

type BookWithAverageRating = Book & {
  averageRating: number | null;
};

type DbBookForResponse = {
  id: number;
  title: string;
  isbn: string | null;
  publishedYear: number;
  pageCount: number | null;
  language: string;
  description: string | null;
  coverImage: string | null;
  author: {
    firstName: string;
    lastName: string;
  };
  publisher: {
    name: string;
  };
  genres: Array<{
    genre: {
      name: string;
    };
  }>;
};

function parseAuthorName(fullName: string) {
  const normalized = fullName.trim().replace(/\s+/g, " ");
  const [firstName = "Unknown", ...rest] = normalized.split(" ");
  const lastName = rest.join(" ");

  return {
    firstName,
    lastName,
  };
}

function parseGenreNames(value: string): string[] {
  return value
    .split(",")
    .map((genreName) => genreName.trim())
    .filter((genreName) => genreName.length > 0);
}

async function resolveAuthorId(authorName: string): Promise<number> {
  const { firstName, lastName } = parseAuthorName(authorName);

  const existingAuthor = await prisma.author.findFirst({
    where: {
      firstName,
      lastName,
    },
    select: { id: true },
  });

  if (existingAuthor) {
    return existingAuthor.id;
  }

  const createdAuthor = await prisma.author.create({
    data: {
      firstName,
      lastName,
    },
    select: { id: true },
  });

  return createdAuthor.id;
}

async function resolvePublisherId(publisherName?: string): Promise<number> {
  const normalizedPublisherName =
    publisherName?.trim() || DEFAULT_PUBLISHER_NAME;

  const existingPublisher = await prisma.publisher.findFirst({
    where: { name: normalizedPublisherName },
    select: { id: true },
  });

  if (existingPublisher) {
    return existingPublisher.id;
  }

  const createdPublisher = await prisma.publisher.create({
    data: {
      name: normalizedPublisherName,
      country: DEFAULT_PUBLISHER_COUNTRY,
    },
    select: { id: true },
  });

  return createdPublisher.id;
}

async function replaceBookGenres(bookId: number, genreNames: string[]) {
  await prisma.bookGenre.deleteMany({
    where: { bookId },
  });

  if (genreNames.length === 0) {
    return;
  }

  const genreIds = await Promise.all(
    genreNames.map(async (genreName) => {
      const genre = await prisma.genre.upsert({
        where: { name: genreName },
        update: {},
        create: {
          name: genreName,
        },
        select: { id: true },
      });

      return genre.id;
    }),
  );

  await prisma.bookGenre.createMany({
    data: genreIds.map((genreId) => ({
      bookId,
      genreId,
    })),
    skipDuplicates: true,
  });
}

async function getAverageRatingsByBookIds(bookIds: number[]) {
  if (bookIds.length === 0) {
    return new Map<number, number | null>();
  }

  const groupedRatings = await prisma.review.groupBy({
    by: ["bookId"],
    where: {
      bookId: {
        in: bookIds,
      },
    },
    _avg: {
      rating: true,
    },
  });

  const averageRatings = new Map<number, number | null>();
  for (const row of groupedRatings) {
    averageRatings.set(row.bookId, row._avg.rating ?? null);
  }

  return averageRatings;
}

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

function mapBookForResponse(
  book: DbBookForResponse,
  averageRating: number | null,
): BookWithAverageRating {
  const authorName = `${book.author.firstName} ${book.author.lastName}`.trim();
  const genres = book.genres.map(({ genre }) => genre.name).filter(Boolean);

  return {
    id: book.id,
    title: book.title,
    isbn: book.isbn ?? undefined,
    publishedYear: book.publishedYear,
    pageCount: book.pageCount ?? undefined,
    author: authorName.length > 0 ? authorName : "Unknown",
    publisher: book.publisher.name,
    language: book.language,
    description: book.description ?? undefined,
    coverImage: book.coverImage ?? undefined,
    genre: genres.length > 0 ? genres.join(", ") : "Unknown",
    averageRating,
  };
}

export async function getBooks(
  query: BookListQuery = {},
): Promise<PaginatedBooksResponse> {
  const {
    title,
    year,
    language,
    author,
    genre,
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
    ...(language
      ? {
          language: {
            equals: language,
            mode: "insensitive" as const,
          },
        }
      : {}),
    ...(author
      ? {
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
        }
      : {}),
    ...(genre
      ? {
          genres: {
            some: {
              genre: {
                name: {
                  contains: genre,
                  mode: "insensitive" as const,
                },
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
      orderBy: sortBy ? { [sortBy]: order } : { id: "asc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        publisher: {
          select: {
            name: true,
          },
        },
        genres: {
          include: {
            genre: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const averageRatingsByBookId = await getAverageRatingsByBookIds(
    books.map((book) => book.id),
  );

  return {
    data: books.map((book) => {
      return mapBookForResponse(
        book,
        averageRatingsByBookId.get(book.id) ?? null,
      );
    }),
    pagination: buildPagination(page, limit, totalItems),
  };
}

export async function getBookById(id: number): Promise<Book | null> {
  const book = await prisma.book.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      publisher: {
        select: {
          name: true,
        },
      },
      genres: {
        include: {
          genre: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!book) {
    return null;
  }

  const averageRatingResult = await prisma.review.aggregate({
    where: { bookId: id },
    _avg: {
      rating: true,
    },
  });

  return mapBookForResponse(book, averageRatingResult._avg.rating ?? null);
}

export async function addBook(newBook: Omit<Book, "id">): Promise<Book> {
  const [authorId, publisherId] = await Promise.all([
    resolveAuthorId(newBook.author),
    resolvePublisherId(newBook.publisher),
  ]);

  let createdBook: { id: number };
  try {
    createdBook = await prisma.book.create({
      data: {
        title: newBook.title,
        isbn: newBook.isbn,
        publishedYear: newBook.publishedYear,
        pageCount: newBook.pageCount,
        language: newBook.language,
        description: newBook.description,
        coverImage: newBook.coverImage,
        authorId,
        publisherId,
      },
      select: {
        id: true,
      },
    });
  } catch (error) {
    if (isPrismaKnownError(error, "P2002")) {
      throw makeHttpError("A book with this ISBN already exists", 409);
    }
    throw error;
  }

  await replaceBookGenres(createdBook.id, parseGenreNames(newBook.genre));

  const savedBook = await getBookById(createdBook.id);
  if (!savedBook) {
    throw new Error("Book creation failed");
  }

  return savedBook;
}

function makeHttpError(message: string, statusCode: number): Error {
  const err = new Error(message) as Error & { statusCode: number };
  err.statusCode = statusCode;
  return err;
}

export async function updateBook(
  id: number,
  updatedBook: Partial<Book>,
): Promise<Book | undefined> {
  const existingBook = await prisma.book.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingBook) {
    return undefined;
  }

  const data: {
    title?: string;
    isbn?: string;
    publishedYear?: number;
    pageCount?: number;
    language?: string;
    description?: string;
    coverImage?: string;
    authorId?: number;
    publisherId?: number;
  } = {};

  if (updatedBook.title !== undefined) {
    data.title = updatedBook.title;
  }
  if (updatedBook.isbn !== undefined) {
    data.isbn = updatedBook.isbn;
  }
  if (updatedBook.publishedYear !== undefined) {
    data.publishedYear = updatedBook.publishedYear;
  }
  if (updatedBook.pageCount !== undefined) {
    data.pageCount = updatedBook.pageCount;
  }
  if (updatedBook.language !== undefined) {
    data.language = updatedBook.language;
  }
  if (updatedBook.description !== undefined) {
    data.description = updatedBook.description;
  }
  if (updatedBook.coverImage !== undefined) {
    data.coverImage = updatedBook.coverImage;
  }
  if (updatedBook.author !== undefined) {
    data.authorId = await resolveAuthorId(updatedBook.author);
  }
  if (updatedBook.publisher !== undefined) {
    data.publisherId = await resolvePublisherId(updatedBook.publisher);
  }

  try {
    await prisma.book.update({
      where: { id },
      data,
    });
  } catch (error) {
    if (isPrismaKnownError(error, "P2002")) {
      throw makeHttpError("A book with this ISBN already exists", 409);
    }
    throw error;
  }

  if (updatedBook.genre !== undefined) {
    await replaceBookGenres(id, parseGenreNames(updatedBook.genre));
  }

  const savedBook = await getBookById(id);
  return savedBook ?? undefined;
}

export async function bookExists(id: number): Promise<boolean> {
  const count = await prisma.book.count({ where: { id } });
  return count > 0;
}

export async function deleteBook(id: number): Promise<boolean> {
  try {
    await prisma.book.delete({ where: { id } });
    return true;
  } catch (error) {
    if (isPrismaKnownError(error, "P2025")) {
      return false;
    }
    throw error;
  }
}
