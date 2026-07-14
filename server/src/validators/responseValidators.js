const { z } = require('zod');

const scoreSchema = z.object({
  overallQuality: z.number().min(1).max(10),
  promptAdherence: z.number().min(1).max(10),
  culturalAuthenticity: z.number().min(1).max(10),
  regionalAccuracy: z.number().min(1).max(10),
  visualRealism: z.number().min(1).max(10),
  overallPreference: z.number().min(1).max(10),
});

const submitResponseSchema = z.object({
  sessionId: z.string().min(1),
  promptId: z.string().min(1),
  scores: z.object({
    imageA: scoreSchema,
    imageB: scoreSchema,
    imageC: scoreSchema,
  }),
  bestImage: z.enum(['imageA', 'imageB', 'imageC']),
  comments: z.string().optional().default(''),
  completionTimeSeconds: z.number().optional(),
});

const consentSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  age: z.number().int().positive().optional(),
  state: z.string().optional(),
  occupation: z.string().optional(),
  consentGiven: z.literal(true, { errorMap: () => ({ message: 'Consent is required to proceed.' }) }),
});

module.exports = { submitResponseSchema, consentSchema };
