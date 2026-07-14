const express = require('express');
const participantController = require('../controllers/participantController');
const { protect, authorize } = require('../middlewares/auth');
const { ROLES } = require('../constants');

const router = express.Router();

router.use(protect, authorize(ROLES.ADMIN));
router.get('/', participantController.listParticipants);
router.get('/:id', participantController.getParticipant);

module.exports = router;
