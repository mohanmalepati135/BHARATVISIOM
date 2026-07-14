const mongoose = require('mongoose');

/**
 * Stores the randomized Image A / B / C -> actual Image document mapping
 * generated once per participant per prompt, the moment they first view it.
 * This mapping is NEVER sent to the client directly; only slot letters are exposed.
 */
const assignmentSchema = new mongoose.Schema(
  {
    session: { type: mongoose.Schema.Types.ObjectId, ref: 'EvaluationSession', required: true },
    participant: { type: mongoose.Schema.Types.ObjectId, ref: 'Participant', required: true },
    prompt: { type: mongoose.Schema.Types.ObjectId, ref: 'Prompt', required: true },
    slotMap: {
      imageA: { type: mongoose.Schema.Types.ObjectId, ref: 'Image', required: true },
      imageB: { type: mongoose.Schema.Types.ObjectId, ref: 'Image', required: true },
      imageC: { type: mongoose.Schema.Types.ObjectId, ref: 'Image', required: true },
    },
  },
  { timestamps: true }
);

assignmentSchema.index({ session: 1, participant: 1, prompt: 1 }, { unique: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
