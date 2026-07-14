const { z } = require('zod');

const createPromptSchema = z.object({
  festivalName: z.string().min(1, 'Festival name is required.'),
  state: z.string().min(1, 'State is required.'),
  category: z.string().min(1, 'Category is required.'),
  promptTitle: z.string().min(1, 'Prompt title is required.'),
  promptDescription: z.string().min(1, 'Prompt description is required.'),
  fullPrompt: z.string().min(1, 'Full prompt text is required.'),
  expectedCulturalElements: z.string().optional(),
  commonFailureCases: z.string().optional(),
});

const updatePromptSchema = createPromptSchema.partial();

module.exports = { createPromptSchema, updatePromptSchema };
