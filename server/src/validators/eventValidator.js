import { z } from 'zod';
import { EVENT_STATUS } from '../config/constants.js';

export const createEventSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(5000),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date').optional(),
  time: z.string().optional(),
  location: z.string().max(200).optional(),
  isOnline: z.boolean().optional(),
  meetingLink: z.string().url().or(z.literal('')).optional(),
  club: z.string().optional().nullable(),
  registrationDeadline: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date').optional(),
  maxParticipants: z.number().int().min(0).optional(),
  tags: z.array(z.string().trim().max(30)).max(10).optional(),
});

export const updateEventSchema = z.object({
  title: z.string().trim().min(3).max(200).optional(),
  description: z.string().trim().min(10).max(5000).optional(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date').optional(),
  time: z.string().optional(),
  location: z.string().max(200).optional(),
  status: z.enum(Object.values(EVENT_STATUS)).optional(),
  maxParticipants: z.number().int().min(0).optional(),
  tags: z.array(z.string().trim().max(30)).max(10).optional(),
});
