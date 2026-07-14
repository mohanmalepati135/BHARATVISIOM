const mongoose = require('mongoose');

const slotScoreSchema = new mongoose.Schema(
  {
    overallQuality: { type: Number, min: 1, max: 10, required: true },
    promptAdherence: { type: Number, min: 1, max: 10, required: true },
    culturalAuthenticity: { type: Number, min: 1, max: 10, required: true },
    regionalAccuracy: { type: Number, min: 1, max: 10, required: true },
    visualRealism: { type: Number, min: 1, max: 10, required: true },
    overallPreference: { type: Number, min: 1, max: 10, required: true },
  },
  { _id: false }
);

const responseSchema = new mongoose.Schema(
  {
    session: { type: mongoose.Schema.Types.ObjectId, ref: 'EvaluationSession', required: true },
    participant: { type: mongoose.Schema.Types.ObjectId, ref: 'Participant', required: true },
    prompt: { type: mongoose.Schema.Types.ObjectId, ref: 'Prompt', required: true },
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
    scores: {
      imageA: { type: slotScoreSchema, required: true },
      imageB: { type: slotScoreSchema, required: true },
      imageC: { type: slotScoreSchema, required: true },
    },
    bestImage: { type: String, enum: ['imageA', 'imageB', 'imageC'], required: true },
    comments: { type: String, default: '' },
    completionTimeSeconds: { type: Number },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

responseSchema.index({ session: 1, participant: 1, prompt: 1 }, { unique: true });

module.exports = mongoose.model('Response', responseSchema);
