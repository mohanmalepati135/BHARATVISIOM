const express = require('express');
const evaluationController = require('../controllers/evaluationController');
const participantController = require('../controllers/participantController');
const validate = require('../middlewares/validate');
const { protect, authorize } = require('../middlewares/auth');
const { submitResponseSchema, consentSchema } = require('../validators/responseValidators');
const { ROLES } = require('../constants');

const router = express.Router();

router.use(protect, authorize(ROLES.PARTICIPANT));

router.post('/consent', validate(consentSchema), participantController.submitConsent);
router.get('/me/profile', participantController.getMyProfile);
router.get('/me/sessions', evaluationController.myAssignedSessions);
router.get('/sessions/:sessionId/current', evaluationController.getCurrentPrompt);
router.post('/responses', validate(submitResponseSchema), evaluationController.submitResponse);

module.exports = router;
