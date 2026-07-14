const asyncHandler = require('express-async-handler');
const { EvaluationSession, Participant } = require('../models');
const { SESSION_STATUS } = require('../constants');
const evaluationService = require('../services/evaluationService');
const ApiError = require('../utils/ApiError');

// List sessions assigned to the logged-in participant
const myAssignedSessions = asyncHandler(async (req, res) => {
  const participant = await Participant.findOne({ user: req.user._id });
  if (!participant) throw new ApiError(404, 'Participant profile not found.');

  const sessions = await EvaluationSession.find({
    _id: { $in: participant.assignedSessions },
    status: SESSION_STATUS.PUBLISHED,
  }).select('name category description startDate endDate prompts');

  const withProgress = await Promise.all(
    sessions.map(async (s) => {
      const { submittedCount, totalPrompts } = await evaluationService.getSessionForParticipant(s._id, req.user._id);
      return {
        id: s._id,
        name: s.name,
        category: s.category,
        description: s.description,
        totalPrompts,
        submittedCount,
        isComplete: submittedCount >= totalPrompts,
      };
    })
  );

  res.status(200).json({ success: true, sessions: withProgress });
});

// Get the current (next unanswered) prompt for a session, blind-formatted
const getCurrentPrompt = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { session, participant, submittedCount, totalPrompts, nextPrompt } = await evaluationService.getSessionForParticipant(sessionId, req.user._id);

  if (!nextPrompt) {
    return res.status(200).json({
      success: true,
      isComplete: true,
      submittedCount,
      totalPrompts,
    });
  }

  const payload = await evaluationService.buildBlindPromptPayload(sessionId, participant._id, nextPrompt); 

  res.status(200).json({
    success: true,
    isComplete: false,
    submittedCount,
    totalPrompts,
    session: { id: session._id, name: session.name, category: session.category },
    ...payload,
  });
});

const submitResponse = asyncHandler(async (req, res) => {
  const result = await evaluationService.submitResponse(req.user._id, req.body);
  res.status(201).json({ success: true, ...result });
});

module.exports = { myAssignedSessions, getCurrentPrompt, submitResponse };
