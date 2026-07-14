const asyncHandler = require('express-async-handler');
const analyticsService = require('../services/analyticsService');
const { Parser } = require('../utils/csv');

const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await analyticsService.buildDashboardStats();
  res.status(200).json({ success: true, stats });
});

const getLeaderboard = asyncHandler(async (req, res) => {
  const leaderboard = await analyticsService.buildLeaderboard();
  res.status(200).json({ success: true, leaderboard });
});

const getFestivalPerformance = asyncHandler(async (req, res) => {
  const data = await analyticsService.buildFestivalPerformance();
  res.status(200).json({ success: true, data });
});

const getPromptDifficulty = asyncHandler(async (req, res) => {
  const data = await analyticsService.buildPromptDifficulty();
  res.status(200).json({ success: true, ...data });
});

const exportLeaderboardCsv = asyncHandler(async (req, res) => {
  const leaderboard = await analyticsService.buildLeaderboard();
  const fields = ['rank', 'company', 'model', 'averageOverallRating', 'winRate', 'promptAdherence', 'culturalScore', 'regionalScore', 'totalEvaluations'];
  const csv = new Parser(fields).parse(leaderboard);
  res.header('Content-Type', 'text/csv');
  res.attachment('bharatvision-leaderboard.csv');
  res.send(csv);
});

module.exports = { getDashboardStats, getLeaderboard, getFestivalPerformance, getPromptDifficulty, exportLeaderboardCsv };
