const { EvaluationSession, Prompt, Image, Assignment, Response, Participant } = require('../models');
const { IMAGE_SLOTS, SESSION_STATUS } = require('../constants');
const shuffle = require('../utils/shuffle');
const ApiError = require('../utils/ApiError');

/**
 * Returns (and lazily creates) the randomized slot mapping for a participant + prompt.
 * The mapping, once created, never changes for that participant — this keeps the
 * experience consistent if they resume later, while still being random per participant.
 */
const getOrCreateAssignment = async (sessionId, participantId, promptId) => {
  let assignment = await Assignment.findOne({ session: sessionId, participant: participantId, prompt: promptId });
  if (assignment) return assignment;

  const images = await Image.find({ prompt: promptId });
  if (images.length !== 3) {
    throw new ApiError(500, 'This prompt does not have exactly 3 images configured.');
  }

  const shuffled = shuffle(images);
  assignment = await Assignment.create({
    session: sessionId,
    participant: participantId,
    prompt: promptId,
    slotMap: {
      imageA: shuffled[0]._id,
      imageB: shuffled[1]._id,
      imageC: shuffled[2]._id,
    },
  });
  return assignment;
};

/**
 * Builds the participant-facing (blind) view of a prompt: slot letters + image URLs only.
 * Company/model identity is intentionally never included.
 */
const buildBlindPromptPayload = async (sessionId, participantId, prompt) => {
  const assignment = await getOrCreateAssignment(sessionId, participantId, prompt._id);
  const imageIds = IMAGE_SLOTS.map((slot) => assignment.slotMap[slot]);
  const images = await Image.find({ _id: { $in: imageIds } });
  const imageMap = new Map(images.map((img) => [String(img._id), img]));

  const slots = {};
  IMAGE_SLOTS.forEach((slot) => {
    const img = imageMap.get(String(assignment.slotMap[slot]));
    slots[slot] = { imageUrl: img?.imageUrl };
  });

  return {
    prompt: prompt.toParticipantView(),
    assignmentId: assignment._id,
    images: slots,
  };
};

const getSessionForParticipant = async (sessionId, userId) => {
  const participant = await Participant.findOne({ user: userId });
  if (!participant) throw new ApiError(404, 'Participant profile not found.');

  const session = await EvaluationSession.findById(sessionId).populate('prompts');
  if (!session) throw new ApiError(404, 'Evaluation session not found.');
  if (session.status !== SESSION_STATUS.PUBLISHED) {
    throw new ApiError(403, 'This evaluation session is not currently active.');
  }
  const isAssigned = session.assignedParticipants.some((id) => String(id) === String(participant._id));
  if (!isAssigned) {
    throw new ApiError(403, 'You are not assigned to this evaluation session.');
  }

  const submittedResponses = await Response.find({ session: sessionId, participant: participant._id }).select('prompt');
  const submittedPromptIds = new Set(submittedResponses.map((r) => String(r.prompt)));

  const nextPrompt = session.prompts.find((p) => !submittedPromptIds.has(String(p._id)));

  return { session, participant, submittedCount: submittedPromptIds.size, totalPrompts: session.prompts.length, nextPrompt };
};

const submitResponse = async (userId, payload) => {
  const participant = await Participant.findOne({ user: userId });
  if (!participant) throw new ApiError(404, 'Participant profile not found.');

  const { sessionId, promptId, scores, bestImage, comments, completionTimeSeconds } = payload;

  const session = await EvaluationSession.findById(sessionId);
  if (!session || session.status !== SESSION_STATUS.PUBLISHED) {
    throw new ApiError(403, 'This evaluation session is not currently active.');
  }

  const assignment = await Assignment.findOne({ session: sessionId, participant: participant._id, prompt: promptId });
  if (!assignment) {
    throw new ApiError(400, 'No active assignment found for this prompt. Please reload the evaluation.');
  }

  const existing = await Response.findOne({ session: sessionId, participant: participant._id, prompt: promptId });
  if (existing) {
    throw new ApiError(409, 'A response for this prompt has already been submitted.');
  }

  const response = await Response.create({
    session: sessionId,
    participant: participant._id,
    prompt: promptId,
    assignment: assignment._id,
    scores,
    bestImage,
    comments,
    completionTimeSeconds,
  });

  const submittedResponses = await Response.countDocuments({ session: sessionId, participant: participant._id });
  const totalPrompts = session.prompts.length;
  const isComplete = submittedResponses >= totalPrompts;

  if (isComplete) {
    await Participant.updateOne({ _id: participant._id }, { $addToSet: { completedSessions: sessionId } });
  }

  return { response, isComplete, submittedResponses, totalPrompts };
};

module.exports = { getOrCreateAssignment, buildBlindPromptPayload, getSessionForParticipant, submitResponse };
