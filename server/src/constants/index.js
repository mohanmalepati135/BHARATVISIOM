const ROLES = {
  ADMIN: 'admin',
  PARTICIPANT: 'participant',
};

const SESSION_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  CLOSED: 'closed',
};

const PROMPT_STATUS = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
};

const MODEL_SOURCES = [
  { key: 'openai_gpt_image_1', company: 'OpenAI', model: 'GPT Image 1' },
  { key: 'google_gemini_2_5_flash_image', company: 'Google', model: 'Gemini 2.5 Flash Image' },
  { key: 'google_gemini_3_1_flash_image_preview', company: 'Google', model: 'Gemini 3.1 Flash Image Preview' },
];

const IMAGE_SLOTS = ['imageA', 'imageB', 'imageC'];

module.exports = {
  ROLES,
  SESSION_STATUS,
  PROMPT_STATUS,
  MODEL_SOURCES,
  IMAGE_SLOTS,
};
