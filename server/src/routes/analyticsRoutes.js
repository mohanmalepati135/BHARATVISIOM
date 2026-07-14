const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const { protect, authorize } = require('../middlewares/auth');
const { ROLES } = require('../constants');

const router = express.Router();

router.use(protect, authorize(ROLES.ADMIN));

router.get('/dashboard', analyticsController.getDashboardStats);
router.get('/leaderboard', analyticsController.getLeaderboard);
router.get('/leaderboard/export/csv', analyticsController.exportLeaderboardCsv);
router.get('/festival-performance', analyticsController.getFestivalPerformance);
router.get('/prompt-difficulty', analyticsController.getPromptDifficulty);

module.exports = router;
