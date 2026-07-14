const express = require('express');
const imageController = require('../controllers/imageController');
const { protect, authorize } = require('../middlewares/auth');
const { ROLES } = require('../constants');

const router = express.Router();

router.use(protect, authorize(ROLES.ADMIN));
router.delete('/:id', imageController.deleteImage);

module.exports = router;
