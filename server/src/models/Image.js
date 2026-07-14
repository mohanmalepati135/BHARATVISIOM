const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  {
    prompt: { type: mongoose.Schema.Types.ObjectId, ref: 'Prompt', required: true },
    company: { type: String, required: true }, // e.g. 'OpenAI', 'Google'
    model: { type: String, required: true }, // e.g. 'GPT Image 1'
    modelKey: { type: String, required: true }, // stable key, e.g. 'openai_gpt_image_1'
    imageUrl: { type: String, required: true },
    cloudinaryPublicId: { type: String },
    fileSize: { type: Number },
    format: { type: String },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isLocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

imageSchema.index({ prompt: 1, modelKey: 1 }, { unique: true });

module.exports = mongoose.model('Image', imageSchema);
