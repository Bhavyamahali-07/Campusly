import { z } from 'zod';
import { CLUB_TYPES } from '../config/constants.js';

export const createClubSchema = z.object({
  name: z.string().trim().min(2, 'Club name must be at least 2 characters').max(100),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(2000),
  category: z.string().trim().min(2).max(50),
  type: z.enum(Object.values(CLUB_TYPES)).optional().default('APPROVAL'),
  tags: z.array(z.string().trim().max(30)).max(10).optional(),
});

export const updateClubSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  description: z.string().trim().min(10).max(2000).optional(),
  category: z.string().trim().min(2).max(50).optional(),
  type: z.enum(Object.values(CLUB_TYPES)).optional(),
  tags: z.array(z.string().trim().max(30)).max(10).optional(),
});
