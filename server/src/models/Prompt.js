const mongoose = require('mongoose');
const { PROMPT_STATUS } = require('../constants');

const promptSchema = new mongoose.Schema(
  {
    festivalName: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    promptTitle: { type: String, required: true, trim: true },
    promptDescription: { type: String, required: true },
    fullPrompt: { type: String, required: true },
    expectedCulturalElements: { type: String }, // admin only, never sent to participants
    commonFailureCases: { type: String }, // admin only, never sent to participants
    status: { type: String, enum: Object.values(PROMPT_STATUS), default: PROMPT_STATUS.ACTIVE },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isLocked: { type: Boolean, default: false }, // locked once part of a published session
  },
  { timestamps: true }
);

promptSchema.index({ festivalName: 1, state: 1, category: 1 });

// Fields safe to expose to participants (never expose admin-only analysis fields)
promptSchema.methods.toParticipantView = function toParticipantView() {
  return {
    id: this._id,
    festivalName: this.festivalName,
    state: this.state,
    category: this.category,
    promptTitle: this.promptTitle,
    promptDescription: this.promptDescription,
    fullPrompt: this.fullPrompt,
  };
};

module.exports = mongoose.model('Prompt', promptSchema);
