import { z } from 'zod';
import { POST_CATEGORIES } from '../config/constants.js';

export const createPostSchema = z.object({
  content: z.string().trim().min(1, 'Post content is required').max(5000),
  category: z.enum(Object.values(POST_CATEGORIES)).optional().default('GENERAL'),
  club: z.string().optional().nullable(),
});

export const createCommentSchema = z.object({
  content: z.string().trim().min(1, 'Comment is required').max(1000),
  parentComment: z.string().optional().nullable(),
});
