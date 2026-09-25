import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(128)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  department: z.string().trim().optional(),
  year: z.enum(['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', '']).optional(),
  securityQuestion: z.string().min(5, 'Please select a security question'),
  securityAnswer: z.string().min(2, 'Answer must be at least 2 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  bio: z.string().max(500).optional(),
  department: z.string().trim().optional(),
  year: z.enum(['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Alumni', '']).optional(),
  skills: z.array(z.string().trim().max(50)).max(20).optional(),
  interests: z.array(z.string().trim().max(50)).max(20).optional(),
  socialLinks: z.object({
    github: z.string().url().or(z.literal('')).optional(),
    linkedin: z.string().url().or(z.literal('')).optional(),
    twitter: z.string().url().or(z.literal('')).optional(),
    portfolio: z.string().url().or(z.literal('')).optional(),
  }).optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  securityAnswer: z.string().min(2, 'Answer must be at least 2 characters'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(128)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(128)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

export const updateEmailSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
});

