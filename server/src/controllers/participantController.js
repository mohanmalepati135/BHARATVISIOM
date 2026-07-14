const asyncHandler = require('express-async-handler');
const { Participant, Response } = require('../models');
const ApiError = require('../utils/ApiError');

const submitConsent = asyncHandler(async (req, res) => {
  const participant = await Participant.findOne({ user: req.user._id });
  if (!participant) throw new ApiError(404, 'Participant profile not found.');

  Object.assign(participant, {
    fullName: req.body.fullName,
    email: req.body.email,
    age: req.body.age,
    state: req.body.state,
    occupation: req.body.occupation,
    consentGiven: true,
    consentTimestamp: new Date(),
  });
  await participant.save();

  res.status(200).json({ success: true, participant });
});

const getMyProfile = asyncHandler(async (req, res) => {
  const participant = await Participant.findOne({ user: req.user._id });
  if (!participant) throw new ApiError(404, 'Participant profile not found.');
  res.status(200).json({ success: true, participant });
});

// Admin: list all participants with response stats
const listParticipants = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  const skip = (Number(page) - 1) * Number(limit);
  const [participants, total] = await Promise.all([
    Participant.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Participant.countDocuments(filter),
  ]);

  const withCounts = await Promise.all(
    participants.map(async (p) => {
      const responseCount = await Response.countDocuments({ participant: p._id });
      return { ...p.toObject(), responseCount };
    })
  );

  res.status(200).json({
    success: true,
    participants: withCounts,
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
  });
});

const getParticipant = asyncHandler(async (req, res) => {
  const participant = await Participant.findById(req.params.id);
  if (!participant) throw new ApiError(404, 'Participant not found.');
  const responses = await Response.find({ participant: participant._id }).populate('prompt', 'promptTitle festivalName');
  res.status(200).json({ success: true, participant, responses });
});

module.exports = { submitConsent, getMyProfile, listParticipants, getParticipant };
