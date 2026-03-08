import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL as string,
  }),
});
async function main() {
  console.log("Seeding database...");
  await prisma.authorBook.deleteMany();
  await prisma.book.deleteMany();
  await prisma.author.deleteMany();
  const authors = await prisma.$transaction([
    prisma.author.create({
      data: { firstName: "Robert", lastName: "Martin" },
    }),
    prisma.author.create({
      data: { firstName: "Martin", lastName: "Fowler" },
    }),
    prisma.author.create({
      data: { firstName: "Erich", lastName: "Gamma" },
    }),
    prisma.author.create({
      data: { firstName: "Richard", lastName: "Helm" },
    }),
    prisma.author.create({
      data: { firstName: "Ralph", lastName: "Johnson" },
    }),
    prisma.author.create({
      data: { firstName: "John", lastName: "Vlissides" },
    }),
    prisma.author.create({
      data: { firstName: "Kent", lastName: "Beck" },
    }),
    prisma.author.create({
      data: { firstName: "Joshua", lastName: "Bloch" },
    }),
  ]);
  const [
    robertMartin,
    martinFowler,
    erichGamma,
    richardHelm,
    ralphJohnson,
    johnVlissides,
    kentBeck,
    joshuaBloch,
  ] = authors;
  const books = await prisma.$transaction([
    prisma.book.create({
      data: { title: "Clean Code", publishedYear: 2008 },
    }),
    prisma.book.create({
      data: { title: "The Pragmatic Programmer", publishedYear: 1999 },
    }),
    prisma.book.create({
      data: { title: "Refactoring", publishedYear: 1999 },
    }),
    prisma.book.create({
      data: { title: "Clean Architecture", publishedYear: 2017 },
    }),
    prisma.book.create({
      data: { title: "Design Patterns", publishedYear: 1994 },
    }),
    prisma.book.create({
      data: { title: "Test-Driven Development", publishedYear: 2002 },
    }),
    prisma.book.create({
      data: { title: "Effective Java", publishedYear: 2001 },
    }),
    prisma.book.create({
      data: {
        title: "Patterns of Enterprise Application Architecture",
        publishedYear: 2002,
      },
    }),
    prisma.book.create({
      data: {
        title: "Working Effectively with Legacy Code",
        publishedYear: 2004,
      },
    }),
    prisma.book.create({
      data: { title: "Refactoring to Patterns", publishedYear: 2004 },
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

  await prisma.authorBook.createMany({
    data: [
      // Robert C. Martin
      { authorId: robertMartin.id, bookId: cleanCode.id },
      { authorId: robertMartin.id, bookId: cleanArchitecture.id },
      // Martin Fowler
      { authorId: martinFowler.id, bookId: refactoring.id },
      { authorId: martinFowler.id, bookId: poeaa.id },
      // Gang of Four
      { authorId: erichGamma.id, bookId: designPatterns.id },
      { authorId: richardHelm.id, bookId: designPatterns.id },
      { authorId: ralphJohnson.id, bookId: designPatterns.id },
      { authorId: johnVlissides.id, bookId: designPatterns.id },
      // Kent Beck
      { authorId: kentBeck.id, bookId: tdd.id },
      { authorId: kentBeck.id, bookId: legacyCode.id },
      // Joshua Bloch
      { authorId: joshuaBloch.id, bookId: effectiveJava.id },
      // Multiple authors on same book
      { authorId: martinFowler.id, bookId: legacyCode.id },
      { authorId: kentBeck.id, bookId: refactoringToPatterns.id },
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
