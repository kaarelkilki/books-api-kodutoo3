import { z } from "zod";

export const createBookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  language: z.string().min(1, "Language is required"),
  genre: z.string().min(1, "Genre is required"),
  publishedYear: z
    .number()
    .int()
    .min(0, "Published year must be a positive integer"),
});

export const updateBookSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  author: z.string().min(1, "Author is required").optional(),
  language: z.string().min(1, "Language is required").optional(),
  genre: z.string().min(1, "Genre is required").optional(),
  publishedYear: z
    .number()
    .int()
    .min(0, "Published year must be a positive integer")
    .optional(),
});

export const getBooksQuerySchema = z.object({
  title: z.string().optional(),
  year: z
    .number()
    .int()
    .min(0, "Published year must be a positive integer")
    .optional(),
  language: z.string().optional(),
  author: z.string().optional(),
  genre: z.string().optional(),
  sortBy: z.enum(["title", "publishedYear"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
  page: z.number().int().min(1, "Page must be at least 1").optional(),
  limit: z.number().int().min(1, "Limit must be at least 1").optional(),
});
