const express = require('express');
const resultsController = require('../controllers/resultsController');
const { protect, authorize } = require('../middlewares/auth');
const { ROLES } = require('../constants');

const router = express.Router();

router.use(protect, authorize(ROLES.ADMIN));
router.get('/sessions/:sessionId', resultsController.getSessionResults);

module.exports = router;
