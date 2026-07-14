const express = require('express');
const settingsController = require('../controllers/settingsController');
const { protect, authorize } = require('../middlewares/auth');
const { ROLES } = require('../constants');

const router = express.Router();

router.use(protect, authorize(ROLES.ADMIN));
router.get('/', settingsController.getSettings);
router.patch('/', settingsController.updateSettings);

module.exports = router;
