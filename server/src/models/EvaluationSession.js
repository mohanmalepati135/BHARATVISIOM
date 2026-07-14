const mongoose = require('mongoose');
const { SESSION_STATUS } = require('../constants');

const evaluationSessionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String },
    status: { type: String, enum: Object.values(SESSION_STATUS), default: SESSION_STATUS.DRAFT },
    startDate: { type: Date },
    endDate: { type: Date },
    prompts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Prompt' }],
    assignedParticipants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Participant' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    publishedAt: { type: Date },
    closedAt: { type: Date },
  },
  { timestamps: true }
);

evaluationSessionSchema.virtual('responseCount', {
  ref: 'Response',
  localField: '_id',
  foreignField: 'session',
  count: true,
});

evaluationSessionSchema.set('toJSON', { virtuals: true });
evaluationSessionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('EvaluationSession', evaluationSessionSchema);
