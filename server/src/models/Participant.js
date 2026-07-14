const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    age: { type: Number },
    state: { type: String },
    occupation: { type: String },
    consentGiven: { type: Boolean, default: false },
    consentTimestamp: { type: Date },
    assignedSessions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'EvaluationSession' }],
    completedSessions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'EvaluationSession' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Participant', participantSchema);
