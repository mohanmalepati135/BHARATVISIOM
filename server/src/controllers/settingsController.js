const asyncHandler = require('express-async-handler');
const { Settings } = require('../models');

const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne({ key: 'global' });
  if (!settings) {
    settings = await Settings.create({ key: 'global' });
  }
  res.status(200).json({ success: true, settings });
});

const updateSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.findOneAndUpdate(
    { key: 'global' },
    { ...req.body, updatedBy: req.user._id },
    { new: true, upsert: true }
  );
  res.status(200).json({ success: true, settings });
});

module.exports = { getSettings, updateSettings };
