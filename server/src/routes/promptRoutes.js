const express = require('express');
const promptController = require('../controllers/promptController');
const imageController = require('../controllers/imageController');
const validate = require('../middlewares/validate');
const upload = require('../middlewares/upload');
const { protect, authorize } = require('../middlewares/auth');
const { createPromptSchema, updatePromptSchema } = require('../validators/promptValidators');
const { ROLES } = require('../constants');

const router = express.Router();

router.use(protect, authorize(ROLES.ADMIN));

router.get('/', promptController.listPrompts);
router.post('/', validate(createPromptSchema), promptController.createPrompt);
router.get('/:id', promptController.getPrompt);
router.patch('/:id', validate(updatePromptSchema), promptController.updatePrompt);
router.delete('/:id', promptController.deletePrompt);
router.patch('/:id/archive', promptController.archivePrompt);

router.get('/:promptId/images', imageController.listImagesForPrompt);
router.post('/:promptId/images/:modelKey', upload.single('image'), imageController.uploadImage);

module.exports = router;
