const asyncHandler = require('express-async-handler');
const { Response, Assignment, Image } = require('../models');
const { IMAGE_SLOTS } = require('../constants');
const ApiError = require('../utils/ApiError');

// Admin: view all responses for a session, with model identity revealed (post-hoc, admin only)
const getSessionResults = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const responses = await Response.find({ session: sessionId })
    .populate('participant', 'fullName email state')
    .populate('prompt', 'promptTitle festivalName state category')
    .sort({ createdAt: -1 });

  const assignmentIds = responses.map((r) => r.assignment);
  const assignments = await Assignment.find({ _id: { $in: assignmentIds } });
  const assignmentMap = new Map(assignments.map((a) => [String(a._id), a]));

  const allImageIds = assignments.flatMap((a) => IMAGE_SLOTS.map((slot) => a.slotMap[slot]));
  const images = await Image.find({ _id: { $in: allImageIds } });
  const imageMap = new Map(images.map((img) => [String(img._id), img]));

  const results = responses.map((r) => {
    const assignment = assignmentMap.get(String(r.assignment));
    const revealed = {};
    IMAGE_SLOTS.forEach((slot) => {
      const image = imageMap.get(String(assignment?.slotMap?.[slot]));
      revealed[slot] = image ? { company: image.company, model: image.model, imageUrl: image.imageUrl } : null;
    });
    return {
      id: r._id,
      participant: r.participant,
      prompt: r.prompt,
      scores: r.scores,
      bestImage: r.bestImage,
      bestModel: revealed[r.bestImage]?.model,
      comments: r.comments,
      completionTimeSeconds: r.completionTimeSeconds,
      submittedAt: r.submittedAt,
      revealedImages: revealed,
    };
  });

  res.status(200).json({ success: true, results });
});

module.exports = { getSessionResults };
