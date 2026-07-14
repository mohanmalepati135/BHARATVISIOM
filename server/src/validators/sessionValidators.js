const { z } = require('zod');

const createSessionSchema = z.object({
  name: z.string().min(1, 'Evaluation name is required.'),
  category: z.string().min(1, 'Category is required.'),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  prompts: z.array(z.string()).optional().default([]),
  assignedParticipants: z.array(z.string()).optional().default([]),
});

const updateSessionSchema = createSessionSchema.partial();

const updateStatusSchema = z.object({
  status: z.enum(['draft', 'published', 'closed']),
});

module.exports = { createSessionSchema, updateSessionSchema, updateStatusSchema };
