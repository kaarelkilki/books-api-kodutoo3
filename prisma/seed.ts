import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL as string,
  }),
});

async function main() {
  console.log("Seeding database...");

  await prisma.review.deleteMany();
  await prisma.bookGenre.deleteMany();
  await prisma.book.deleteMany();
  await prisma.genre.deleteMany();
  await prisma.publisher.deleteMany();
  await prisma.author.deleteMany();

  const authors = await prisma.$transaction([
    prisma.author.create({
      data: { firstName: "Robert", lastName: "Martin", birthYear: 1952 },
    }),
    prisma.author.create({
      data: { firstName: "Martin", lastName: "Fowler", birthYear: 1963 },
    }),
    prisma.author.create({
      data: { firstName: "Erich", lastName: "Gamma", birthYear: 1961 },
    }),
    prisma.author.create({
      data: { firstName: "Kent", lastName: "Beck", birthYear: 1961 },
    }),
    prisma.author.create({
      data: { firstName: "Joshua", lastName: "Bloch", birthYear: 1961 },
    }),
    prisma.author.create({
      data: { firstName: "Andrew", lastName: "Hunt", birthYear: 1964 },
    }),
    prisma.author.create({
      data: { firstName: "Michael", lastName: "Feathers", birthYear: 1967 },
    }),
  ]);

  const [
    robertMartin,
    martinFowler,
    erichGamma,
    kentBeck,
    joshuaBloch,
    andrewHunt,
    michaelFeathers,
  ] = authors;

  const publishers = await prisma.$transaction([
    prisma.publisher.create({
      data: { name: "Prentice Hall", country: "USA", foundedYear: 1913 },
    }),
    prisma.publisher.create({
      data: { name: "Addison-Wesley", country: "USA", foundedYear: 1942 },
    }),
    prisma.publisher.create({
      data: { name: "Pearson", country: "United Kingdom", foundedYear: 1844 },
    }),
    prisma.publisher.create({
      data: { name: "O'Reilly Media", country: "USA", foundedYear: 1978 },
    }),
  ]);

  const [prenticeHall, addisonWesley, pearson, oreilly] = publishers;

  const genres = await prisma.$transaction([
    prisma.genre.create({
      data: {
        name: "Software Engineering",
        description: "General engineering practices for maintainable software.",
      },
    }),
    prisma.genre.create({
      data: {
        name: "Architecture",
        description: "Software architecture and system design.",
      },
    }),
    prisma.genre.create({
      data: {
        name: "Programming",
        description:
          "Programming languages, craftsmanship and coding practices.",
      },
    }),
    prisma.genre.create({
      data: {
        name: "Testing",
        description: "Testing techniques and quality practices.",
      },
    }),
    prisma.genre.create({
      data: {
        name: "Computer Science",
        description: "Computer science fundamentals and patterns.",
      },
    }),
  ]);

  const [
    softwareEngineering,
    architecture,
    programming,
    testing,
    computerScience,
  ] = genres;

  const books = await prisma.$transaction([
    prisma.book.create({
      data: {
        title: "Clean Code",
        isbn: "9780132350884",
        publishedYear: 2008,
        pageCount: 464,
        language: "English",
        description: "A handbook of agile software craftsmanship.",
        coverImage: "https://example.com/covers/clean-code.jpg",
        author: { connect: { id: robertMartin.id } },
        publisher: { connect: { id: prenticeHall.id } },
      },
    }),
    prisma.book.create({
      data: {
        title: "The Pragmatic Programmer",
        isbn: "9780201616224",
        publishedYear: 1999,
        pageCount: 352,
        language: "English",
        description: "Practical advice for becoming a better programmer.",
        coverImage: "https://example.com/covers/pragmatic-programmer.jpg",
        author: { connect: { id: andrewHunt.id } },
        publisher: { connect: { id: addisonWesley.id } },
      },
    }),
    prisma.book.create({
      data: {
        title: "Refactoring",
        isbn: "9780201485677",
        publishedYear: 1999,
        pageCount: 431,
        language: "English",
        description: "Improving the design of existing code.",
        coverImage: "https://example.com/covers/refactoring.jpg",
        author: { connect: { id: martinFowler.id } },
        publisher: { connect: { id: addisonWesley.id } },
      },
    }),
    prisma.book.create({
      data: {
        title: "Clean Architecture",
        isbn: "9780134494166",
        publishedYear: 2017,
        pageCount: 432,
        language: "English",
        description: "A guide to software structure and design.",
        coverImage: "https://example.com/covers/clean-architecture.jpg",
        author: { connect: { id: robertMartin.id } },
        publisher: { connect: { id: pearson.id } },
      },
    }),
    prisma.book.create({
      data: {
        title: "Design Patterns",
        isbn: "9780201633610",
        publishedYear: 1994,
        pageCount: 395,
        language: "English",
        description: "Elements of reusable object-oriented software.",
        coverImage: "https://example.com/covers/design-patterns.jpg",
        author: { connect: { id: erichGamma.id } },
        publisher: { connect: { id: addisonWesley.id } },
      },
    }),
    prisma.book.create({
      data: {
        title: "Test-Driven Development",
        isbn: "9780321146533",
        publishedYear: 2002,
        pageCount: 240,
        language: "English",
        description: "By example introduction to test-driven development.",
        coverImage: "https://example.com/covers/tdd.jpg",
        author: { connect: { id: kentBeck.id } },
        publisher: { connect: { id: addisonWesley.id } },
      },
    }),
    prisma.book.create({
      data: {
        title: "Effective Java",
        isbn: "9780134685991",
        publishedYear: 2001,
        pageCount: 416,
        language: "English",
        description: "Best practices for the Java platform.",
        coverImage: "https://example.com/covers/effective-java.jpg",
        author: { connect: { id: joshuaBloch.id } },
        publisher: { connect: { id: addisonWesley.id } },
      },
    }),
    prisma.book.create({
      data: {
        title: "Patterns of Enterprise Application Architecture",
        isbn: "9780321127426",
        publishedYear: 2002,
        pageCount: 533,
        language: "English",
        description: "Enterprise application design patterns and tradeoffs.",
        coverImage: "https://example.com/covers/poeaa.jpg",
        author: { connect: { id: martinFowler.id } },
        publisher: { connect: { id: addisonWesley.id } },
      },
    }),
    prisma.book.create({
      data: {
        title: "Working Effectively with Legacy Code",
        isbn: "9780131177055",
        publishedYear: 2004,
        pageCount: 456,
        language: "English",
        description: "Techniques for safely changing legacy systems.",
        coverImage: "https://example.com/covers/legacy-code.jpg",
        author: { connect: { id: michaelFeathers.id } },
        publisher: { connect: { id: prenticeHall.id } },
      },
    }),
    prisma.book.create({
      data: {
        title: "Refactoring to Patterns",
        isbn: "9780321213358",
        publishedYear: 2004,
        pageCount: 448,
        language: "English",
        description: "Applying patterns through practical refactoring.",
        coverImage: "https://example.com/covers/refactoring-to-patterns.jpg",
        author: { connect: { id: joshuaBloch.id } },
        publisher: { connect: { id: addisonWesley.id } },
      },
    }),
  ]);

  const [
    cleanCode,
    pragmaticProgrammer,
    refactoring,
    cleanArchitecture,
    designPatterns,
    tdd,
    effectiveJava,
    poeaa,
    legacyCode,
    refactoringToPatterns,
  ] = books;

  await prisma.bookGenre.createMany({
    data: [
      { bookId: cleanCode.id, genreId: softwareEngineering.id },
      { bookId: cleanCode.id, genreId: programming.id },
      { bookId: pragmaticProgrammer.id, genreId: softwareEngineering.id },
      { bookId: pragmaticProgrammer.id, genreId: programming.id },
      { bookId: refactoring.id, genreId: softwareEngineering.id },
      { bookId: refactoring.id, genreId: architecture.id },
      { bookId: cleanArchitecture.id, genreId: architecture.id },
      { bookId: cleanArchitecture.id, genreId: softwareEngineering.id },
      { bookId: designPatterns.id, genreId: architecture.id },
      { bookId: designPatterns.id, genreId: computerScience.id },
      { bookId: tdd.id, genreId: testing.id },
      { bookId: tdd.id, genreId: softwareEngineering.id },
      { bookId: effectiveJava.id, genreId: programming.id },
      { bookId: poeaa.id, genreId: architecture.id },
      { bookId: legacyCode.id, genreId: softwareEngineering.id },
      { bookId: refactoringToPatterns.id, genreId: architecture.id },
      { bookId: refactoringToPatterns.id, genreId: softwareEngineering.id },
    ],
  });

  await prisma.review.createMany({
    data: [
      {
        bookId: cleanCode.id,
        reviewerName: "Alice",
        rating: 5,
        comment: "Very practical and clear.",
      },
      {
        bookId: pragmaticProgrammer.id,
        reviewerName: "Bob",
        rating: 5,
        comment: "Still one of the best books for developers.",
      },
      {
        bookId: refactoring.id,
        reviewerName: "Charlie",
        rating: 5,
        comment: "Essential for improving existing code safely.",
      },
      {
        bookId: cleanArchitecture.id,
        reviewerName: "Diana",
        rating: 4,
        comment: "Strong architectural principles and tradeoffs.",
      },
      {
        bookId: designPatterns.id,
        reviewerName: "Ethan",
        rating: 5,
        comment: "Classic reference for reusable design solutions.",
      },
      {
        bookId: tdd.id,
        reviewerName: "Fatima",
        rating: 4,
        comment: "Compact and effective introduction to TDD.",
      },
      {
        bookId: effectiveJava.id,
        reviewerName: "George",
        rating: 5,
        comment: "Packed with practical Java advice.",
      },
      {
        bookId: poeaa.id,
        reviewerName: "Hanna",
        rating: 4,
        comment: "Dense but highly useful enterprise patterns.",
      },
      {
        bookId: legacyCode.id,
        reviewerName: "Ivan",
        rating: 5,
        comment: "Excellent strategies for difficult codebases.",
      },
      {
        bookId: refactoringToPatterns.id,
        reviewerName: "Julia",
        rating: 4,
        comment: "Useful bridge between refactoring and design patterns.",
      },
    ],
  });

  console.log("Seed done!");
}

main()
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
