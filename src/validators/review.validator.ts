import { z } from "zod";

export const createReviewSchema = z.object({
  reviewerName: z.string().min(1).max(200),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1).max(5000).optional(),
});

export const updateReviewSchema = createReviewSchema.partial();

export const reviewQuerySchema = z.object({
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type ReviewQuery = z.infer<typeof reviewQuerySchema>;
