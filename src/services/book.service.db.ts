import { PrismaClient } from "../generated/prisma/client";
import {
  Book,
  BookListQuery,
  PaginatedBooksResponse,
} from "../models/book.model";

const prisma = new PrismaClient();
const DEFAULT_PUBLISHER_NAME = "Unknown Publisher";
const DEFAULT_PUBLISHER_COUNTRY = "Unknown";

type BookWithAverageRating = Book & {
  averageRating: number | null;
};

type DbBookForResponse = {
  id: number;
  title: string;
  publishedYear: number;
  language: string;
  author: {
    firstName: string;
    lastName: string;
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

async function resolvePublisherId(): Promise<number> {
  const existingPublisher = await prisma.publisher.findFirst({
    where: { name: DEFAULT_PUBLISHER_NAME },
    select: { id: true },
  });

  if (existingPublisher) {
    return existingPublisher.id;
  }

  const createdPublisher = await prisma.publisher.create({
    data: {
      name: DEFAULT_PUBLISHER_NAME,
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
    publishedYear: book.publishedYear,
    author: authorName.length > 0 ? authorName : "Unknown",
    language: book.language,
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
    resolvePublisherId(),
  ]);

  const createdBook = await prisma.book.create({
    data: {
      title: newBook.title,
      publishedYear: newBook.publishedYear,
      language: newBook.language,
      authorId,
      publisherId,
    },
    select: {
      id: true,
    },
  });

  await replaceBookGenres(createdBook.id, parseGenreNames(newBook.genre));

  const savedBook = await getBookById(createdBook.id);
  if (!savedBook) {
    throw new Error("Book creation failed");
  }

  return savedBook;
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
    publishedYear?: number;
    language?: string;
    authorId?: number;
  } = {};

  if (updatedBook.title !== undefined) {
    data.title = updatedBook.title;
  }
  if (updatedBook.publishedYear !== undefined) {
    data.publishedYear = updatedBook.publishedYear;
  }
  if (updatedBook.language !== undefined) {
    data.language = updatedBook.language;
  }
  if (updatedBook.author !== undefined) {
    data.authorId = await resolveAuthorId(updatedBook.author);
  }

  await prisma.book.update({
    where: { id },
    data,
  });

  if (updatedBook.genre !== undefined) {
    await replaceBookGenres(id, parseGenreNames(updatedBook.genre));
  }

  const savedBook = await getBookById(id);
  return savedBook ?? undefined;
}

export async function deleteBook(id: number): Promise<boolean> {
  try {
    await prisma.book.delete({ where: { id } });
    return true;
  } catch (error) {
    return false;
  }
}
