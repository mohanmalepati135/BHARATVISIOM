const asyncHandler = require('express-async-handler');
const { EvaluationSession, Prompt, Image, Participant, Response } = require('../models');
const { SESSION_STATUS } = require('../constants');
const ApiError = require('../utils/ApiError');

const listSessions = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const sessions = await EvaluationSession.find(filter)
    .populate('prompts', 'promptTitle festivalName')
    .populate('assignedParticipants', 'fullName email')
    .sort({ createdAt: -1 });

  const withCounts = await Promise.all(
    sessions.map(async (s) => {
      const responseCount = await Response.countDocuments({ session: s._id });
      return { ...s.toObject(), responseCount };
    })
  );

  res.status(200).json({ success: true, sessions: withCounts });
});

const getSession = asyncHandler(async (req, res) => {
  const session = await EvaluationSession.findById(req.params.id)
    .populate('prompts')
    .populate('assignedParticipants', 'fullName email state');
  if (!session) throw new ApiError(404, 'Evaluation session not found.');
  const responseCount = await Response.countDocuments({ session: session._id });
  res.status(200).json({ success: true, session: { ...session.toObject(), responseCount } });
});

const createSession = asyncHandler(async (req, res) => {
  const session = await EvaluationSession.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ success: true, session });
});

const updateSession = asyncHandler(async (req, res) => {
  const session = await EvaluationSession.findById(req.params.id);
  if (!session) throw new ApiError(404, 'Evaluation session not found.');
  if (session.status === SESSION_STATUS.PUBLISHED) {
    throw new ApiError(423, 'Published sessions cannot be edited. Close the session first.');
  }
  Object.assign(session, req.body);
  await session.save();
  res.status(200).json({ success: true, session });
});

const deleteSession = asyncHandler(async (req, res) => {
  const session = await EvaluationSession.findById(req.params.id);
  if (!session) throw new ApiError(404, 'Evaluation session not found.');
  if (session.status !== SESSION_STATUS.DRAFT) {
    throw new ApiError(423, 'Only draft sessions can be deleted.');
  }
  await session.deleteOne();
  res.status(200).json({ success: true, message: 'Session deleted successfully.' });
});

/**
 * Publishing a session locks every prompt and image attached to it so the evaluation
 * set stays fixed and reproducible for the duration of the session.
 */
const publishSession = asyncHandler(async (req, res) => {
  const session = await EvaluationSession.findById(req.params.id);
  if (!session) throw new ApiError(404, 'Evaluation session not found.');
  if (session.prompts.length === 0) {
    throw new ApiError(400, 'Add at least one prompt before publishing.');
  }

  // Verify every prompt has exactly 3 images uploaded
  const imageCounts = await Image.aggregate([
    { $match: { prompt: { $in: session.prompts } } },
    { $group: { _id: '$prompt', count: { $sum: 1 } } },
  ]);
  const countMap = new Map(imageCounts.map((c) => [String(c._id), c.count]));
  const incomplete = session.prompts.filter((pId) => (countMap.get(String(pId)) || 0) < 3);
  if (incomplete.length > 0) {
    throw new ApiError(400, `${incomplete.length} prompt(s) are missing one or more of the 3 required images.`);
  }

  await Prompt.updateMany({ _id: { $in: session.prompts } }, { $set: { isLocked: true } });
  await Image.updateMany({ prompt: { $in: session.prompts } }, { $set: { isLocked: true } });

  session.status = SESSION_STATUS.PUBLISHED;
  session.publishedAt = new Date();
  await session.save();

  // Attach this session to each assigned participant's queue
  await Participant.updateMany(
    { _id: { $in: session.assignedParticipants } },
    { $addToSet: { assignedSessions: session._id } }
  );

  res.status(200).json({ success: true, session });
});

const closeSession = asyncHandler(async (req, res) => {
  const session = await EvaluationSession.findById(req.params.id);
  if (!session) throw new ApiError(404, 'Evaluation session not found.');
  if (session.status !== SESSION_STATUS.PUBLISHED) {
    throw new ApiError(400, 'Only published sessions can be closed.');
  }
  session.status = SESSION_STATUS.CLOSED;
  session.closedAt = new Date();
  await session.save();
  res.status(200).json({ success: true, session });
});

const assignParticipants = asyncHandler(async (req, res) => {
  const { participantIds } = req.body;
  const session = await EvaluationSession.findById(req.params.id);
  if (!session) throw new ApiError(404, 'Evaluation session not found.');

  session.assignedParticipants = Array.from(new Set([...session.assignedParticipants.map(String), ...participantIds]));
  await session.save();

  if (session.status === SESSION_STATUS.PUBLISHED) {
    await Participant.updateMany(
      { _id: { $in: participantIds } },
      { $addToSet: { assignedSessions: session._id } }
    );
  }

  res.status(200).json({ success: true, session });
});

module.exports = {
  listSessions,
  getSession,
  createSession,
  updateSession,
  deleteSession,
  publishSession,
  closeSession,
  assignParticipants,
};
