const express = require('express');

const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/prompts', require('./promptRoutes'));
router.use('/images', require('./imageRoutes'));
router.use('/sessions', require('./sessionRoutes'));
router.use('/participants', require('./participantRoutes'));
router.use('/evaluation', require('./evaluationRoutes'));
router.use('/analytics', require('./analyticsRoutes'));
router.use('/settings', require('./settingsRoutes'));
router.use('/results', require('./resultsRoutes'));

router.get('/health', (req, res) => res.status(200).json({ success: true, message: 'BharatVision API is running.' }));

module.exports = router;
