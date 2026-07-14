const express = require('express');
const { z } = require('zod');
const sessionController = require('../controllers/sessionController');
const validate = require('../middlewares/validate');
const { protect, authorize } = require('../middlewares/auth');
const { createSessionSchema, updateSessionSchema } = require('../validators/sessionValidators');
const { ROLES } = require('../constants');

const router = express.Router();

router.use(protect, authorize(ROLES.ADMIN));

router.get('/', sessionController.listSessions);
router.post('/', validate(createSessionSchema), sessionController.createSession);
router.get('/:id', sessionController.getSession);
router.patch('/:id', validate(updateSessionSchema), sessionController.updateSession);
router.delete('/:id', sessionController.deleteSession);
router.patch('/:id/publish', sessionController.publishSession);
router.patch('/:id/close', sessionController.closeSession);
router.patch(
  '/:id/assign',
  validate(z.object({ participantIds: z.array(z.string()) })),
  sessionController.assignParticipants
);

module.exports = router;
