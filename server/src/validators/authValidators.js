const { z } = require('zod');

const adminLoginSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

const participantRegisterSchema = z.object({
  fullName: z.string().min(2, 'Full name is required.'),
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  age: z.number().int().positive().optional(),
  state: z.string().optional(),
  occupation: z.string().optional(),
});

const participantLoginSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

module.exports = {
  adminLoginSchema,
  participantRegisterSchema,
  participantLoginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
