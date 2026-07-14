const asyncHandler = require('express-async-handler');
const { Prompt, Image } = require('../models');
const { PROMPT_STATUS } = require('../constants');
const ApiError = require('../utils/ApiError');

const listPrompts = asyncHandler(async (req, res) => {
  const { status, state, category, festivalName, search, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (state) filter.state = state;
  if (category) filter.category = category;
  if (festivalName) filter.festivalName = festivalName;
  if (search) {
    filter.$or = [
      { promptTitle: { $regex: search, $options: 'i' } },
      { festivalName: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [prompts, total] = await Promise.all([
    Prompt.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Prompt.countDocuments(filter),
  ]);

  // Attach image count per prompt
  const promptIds = prompts.map((p) => p._id);
  const imageCounts = await Image.aggregate([
    { $match: { prompt: { $in: promptIds } } },
    { $group: { _id: '$prompt', count: { $sum: 1 } } },
  ]);
  const countMap = new Map(imageCounts.map((c) => [String(c._id), c.count]));

  res.status(200).json({
    success: true,
    prompts: prompts.map((p) => ({ ...p.toObject(), imageCount: countMap.get(String(p._id)) || 0 })),
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
  });
});

const getPrompt = asyncHandler(async (req, res) => {
  const prompt = await Prompt.findById(req.params.id);
  if (!prompt) throw new ApiError(404, 'Prompt not found.');
  const images = await Image.find({ prompt: prompt._id });
  res.status(200).json({ success: true, prompt, images });
});

const createPrompt = asyncHandler(async (req, res) => {
  const prompt = await Prompt.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ success: true, prompt });
});

const updatePrompt = asyncHandler(async (req, res) => {
  const prompt = await Prompt.findById(req.params.id);
  if (!prompt) throw new ApiError(404, 'Prompt not found.');
  if (prompt.isLocked) {
    throw new ApiError(423, 'This prompt is locked because it belongs to a published session.');
  }
  Object.assign(prompt, req.body);
  await prompt.save();
  res.status(200).json({ success: true, prompt });
});

const deletePrompt = asyncHandler(async (req, res) => {
  const prompt = await Prompt.findById(req.params.id);
  if (!prompt) throw new ApiError(404, 'Prompt not found.');
  if (prompt.isLocked) {
    throw new ApiError(423, 'This prompt is locked because it belongs to a published session.');
  }
  await Image.deleteMany({ prompt: prompt._id });
  await prompt.deleteOne();
  res.status(200).json({ success: true, message: 'Prompt deleted successfully.' });
});

const archivePrompt = asyncHandler(async (req, res) => {
  const prompt = await Prompt.findById(req.params.id);
  if (!prompt) throw new ApiError(404, 'Prompt not found.');
  prompt.status = prompt.status === PROMPT_STATUS.ARCHIVED ? PROMPT_STATUS.ACTIVE : PROMPT_STATUS.ARCHIVED;
  await prompt.save();
  res.status(200).json({ success: true, prompt });
});

module.exports = { listPrompts, getPrompt, createPrompt, updatePrompt, deletePrompt, archivePrompt };
