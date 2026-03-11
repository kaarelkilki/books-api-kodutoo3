import { z } from 'zod';

export const createReviewSchema = z.object({
    rating: z.number().int().min(1).max(5),
    title: z.string().min(1).max(200),
    content: z.string().min(1).max(5000),
    bookId: z.string().uuid(),
});

export const updateReviewSchema = createReviewSchema.partial();

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;