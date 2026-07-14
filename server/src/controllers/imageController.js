const asyncHandler = require('express-async-handler');
const streamifier = require('streamifier');
const cloudinary = require('../config/cloudinary');
const { Image, Prompt } = require('../models');
const { MODEL_SOURCES } = require('../constants');
const ApiError = require('../utils/ApiError');

const streamUpload = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', transformation: [{ quality: 'auto:good' }] },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });

const uploadImage = asyncHandler(async (req, res) => {
  const { promptId, modelKey } = req.params;
  const modelInfo = MODEL_SOURCES.find((m) => m.key === modelKey);
  if (!modelInfo) throw new ApiError(400, 'Unknown model key.');

  const prompt = await Prompt.findById(promptId);
  if (!prompt) throw new ApiError(404, 'Prompt not found.');
  if (prompt.isLocked) {
    throw new ApiError(423, 'This prompt is locked because it belongs to a published session.');
  }

  if (!req.file) throw new ApiError(400, 'An image file is required.');

  const result = await streamUpload(req.file.buffer, `bharatvision/${promptId}`);

  const existing = await Image.findOne({ prompt: promptId, modelKey });
  if (existing) {
    // Replace: remove old cloudinary asset, update record
    if (existing.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(existing.cloudinaryPublicId).catch(() => null);
    }
    existing.imageUrl = result.secure_url;
    existing.cloudinaryPublicId = result.public_id;
    existing.fileSize = result.bytes;
    existing.format = result.format;
    existing.uploadedBy = req.user._id;
    await existing.save();
    return res.status(200).json({ success: true, image: existing, replaced: true });
  }

  const image = await Image.create({
    prompt: promptId,
    company: modelInfo.company,
    model: modelInfo.model,
    modelKey,
    imageUrl: result.secure_url,
    cloudinaryPublicId: result.public_id,
    fileSize: result.bytes,
    format: result.format,
    uploadedBy: req.user._id,
  });

  res.status(201).json({ success: true, image, replaced: false });
});

const deleteImage = asyncHandler(async (req, res) => {
  const image = await Image.findById(req.params.id);
  if (!image) throw new ApiError(404, 'Image not found.');
  if (image.isLocked) {
    throw new ApiError(423, 'This image is locked because it belongs to a published session.');
  }
  if (image.cloudinaryPublicId) {
    await cloudinary.uploader.destroy(image.cloudinaryPublicId).catch(() => null);
  }
  await image.deleteOne();
  res.status(200).json({ success: true, message: 'Image deleted successfully.' });
});

const listImagesForPrompt = asyncHandler(async (req, res) => {
  const images = await Image.find({ prompt: req.params.promptId });
  res.status(200).json({ success: true, images, modelSources: MODEL_SOURCES });
});

module.exports = { uploadImage, deleteImage, listImagesForPrompt };
