const { Response, Prompt, Image, Participant, EvaluationSession } = require('../models');
const { IMAGE_SLOTS } = require('../constants');

const SCORE_FIELDS = [
  'overallQuality',
  'promptAdherence',
  'culturalAuthenticity',
  'regionalAccuracy',
  'visualRealism',
  'overallPreference',
];

/**
 * Flattens responses into per-image-per-model rows so we can aggregate by model
 * (company/model identity is only ever joined in here, server-side, for admin analytics).
 */
const getFlattenedModelScores = async (filter = {}) => {
  const responses = await Response.find(filter).populate('assignment');
  const rows = [];

  const assignmentIds = responses.map((r) => r.assignment?._id).filter(Boolean);
  const Assignment = require('../models/Assignment');
  const assignments = await Assignment.find({ _id: { $in: assignmentIds } });
  const assignmentMap = new Map(assignments.map((a) => [String(a._id), a]));

  const allImageIds = assignments.flatMap((a) => IMAGE_SLOTS.map((slot) => a.slotMap[slot]));
  const images = await Image.find({ _id: { $in: allImageIds } });
  const imageMap = new Map(images.map((img) => [String(img._id), img]));

  responses.forEach((response) => {
    const assignment = assignmentMap.get(String(response.assignment?._id || response.assignment));
    if (!assignment) return;
    IMAGE_SLOTS.forEach((slot) => {
      const imageId = assignment.slotMap[slot];
      const image = imageMap.get(String(imageId));
      const scores = response.scores[slot];
      if (!image || !scores) return;
      rows.push({
        modelKey: image.modelKey,
        company: image.company,
        model: image.model,
        prompt: response.prompt,
        isBest: response.bestImage === slot,
        overallQuality: scores.overallQuality,
        promptAdherence: scores.promptAdherence,
        culturalAuthenticity: scores.culturalAuthenticity,
        regionalAccuracy: scores.regionalAccuracy,
        visualRealism: scores.visualRealism,
        overallPreference: scores.overallPreference,
      });
    });
  });

  return rows;
};

const average = (arr) => {
  if (!arr.length) return 0;
  const sum = arr.reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0);
  const result = sum / arr.length;
  return Number.isFinite(result) ? result : 0;
};

const buildLeaderboard = async () => {
  const rows = await getFlattenedModelScores({});
  const byModel = new Map();

  rows.forEach((row) => {
    if (!byModel.has(row.modelKey)) {
      byModel.set(row.modelKey, { company: row.company, model: row.model, modelKey: row.modelKey, rows: [] });
    }
    byModel.get(row.modelKey).rows.push(row);
  });

  const leaderboard = Array.from(byModel.values()).map((entry) => {
    const totalRows = entry.rows.length;
    const winCount = entry.rows.filter((r) => r.isBest).length;
    const avgOf = (field) => average(entry.rows.map((r) => r[field]));
    return {
      company: entry.company,
      model: entry.model,
      modelKey: entry.modelKey,
      totalEvaluations: totalRows,
      winRate: totalRows ? Number(((winCount / totalRows) * 100).toFixed(1)) : 0,
      averageOverallRating: Number(avgOf('overallQuality').toFixed(2)),
      promptAdherence: Number(avgOf('promptAdherence').toFixed(2)),
      culturalScore: Number(avgOf('culturalAuthenticity').toFixed(2)),
      regionalScore: Number(avgOf('regionalAccuracy').toFixed(2)),
      visualRealism: Number(avgOf('visualRealism').toFixed(2)),
      overallPreference: Number(avgOf('overallPreference').toFixed(2)),
    };
  });

  leaderboard.sort((a, b) => b.averageOverallRating - a.averageOverallRating);
  leaderboard.forEach((entry, idx) => {
    entry.rank = idx + 1;
  });

  return leaderboard;
};

const buildDashboardStats = async () => {
  const [
    totalParticipants,
    totalPrompts,
    totalImages,
    totalResponses,
    completedParticipants,
    sessions,
  ] = await Promise.all([
    Participant.countDocuments({}),
    Prompt.countDocuments({}),
    Image.countDocuments({}),
    Response.countDocuments({}),
    Participant.countDocuments({ $expr: { $gt: [{ $size: '$completedSessions' }, 0] } }),
    EvaluationSession.find({}),
  ]);

  const rows = await getFlattenedModelScores({});
  const avgScore = average(rows.map((r) => r.overallQuality));

  const modelWinCounts = {};
  rows.forEach((r) => {
    if (r.isBest) modelWinCounts[r.model] = (modelWinCounts[r.model] || 0) + 1;
  });
  const mostPreferredModel = Object.entries(modelWinCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  const totalAssignedSlots = await Participant.aggregate([
    { $project: { assignedCount: { $size: '$assignedSessions' } } },
    { $group: { _id: null, total: { $sum: '$assignedCount' } } },
  ]);
  const totalAssigned = totalAssignedSlots[0]?.total || 0;
  const totalCompleted = await Participant.aggregate([
    { $project: { completedCount: { $size: '$completedSessions' } } },
    { $group: { _id: null, total: { $sum: '$completedCount' } } },
  ]);
  const completedCount = totalCompleted[0]?.total || 0;
  const completionRate = totalAssigned ? Number(((completedCount / totalAssigned) * 100).toFixed(1)) : 0;

  const recentResponses = await Response.find({})
    .sort({ createdAt: -1 })
    .limit(8)
    .populate('participant', 'fullName')
    .populate('prompt', 'promptTitle festivalName');

  return {
    totalParticipants,
    completedEvaluations: totalResponses,
    pendingEvaluations: Math.max(totalAssigned - completedCount, 0),
    totalPrompts,
    totalUploadedImages: totalImages,
    averageEvaluationScore: Number(avgScore.toFixed(2)),
    mostPreferredModel,
    completionRate,
    totalSessions: sessions.length,
    completedParticipants,
    latestResponses: recentResponses.map((r) => ({
      id: r._id,
      participantName: r.participant?.fullName,
      promptTitle: r.prompt?.promptTitle,
      festivalName: r.prompt?.festivalName,
      submittedAt: r.submittedAt,
    })),
  };
};

const buildFestivalPerformance = async () => {
  const rows = await getFlattenedModelScores({});
  const promptIds = [...new Set(rows.map((r) => String(r.prompt)))];
  const prompts = await Prompt.find({ _id: { $in: promptIds } }).select('festivalName state');
  const promptMap = new Map(prompts.map((p) => [String(p._id), p]));

  const byFestival = new Map();
  rows.forEach((row) => {
    const prompt = promptMap.get(String(row.prompt));
    if (!prompt) return;
    const key = prompt.festivalName;
    if (!byFestival.has(key)) byFestival.set(key, { festivalName: key, state: prompt.state, scores: [] });
    byFestival.get(key).scores.push(row.overallQuality);
  });

  return Array.from(byFestival.values())
    .map((f) => ({ festivalName: f.festivalName, state: f.state, averageScore: Number(average(f.scores).toFixed(2)), responseCount: f.scores.length }))
    .sort((a, b) => b.averageScore - a.averageScore);
};

const buildPromptDifficulty = async () => {
  const rows = await getFlattenedModelScores({});
  const byPrompt = new Map();
  rows.forEach((row) => {
    const key = String(row.prompt);
    if (!byPrompt.has(key)) byPrompt.set(key, []);
    byPrompt.get(key).push(row.overallQuality);
  });

  const prompts = await Prompt.find({ _id: { $in: Array.from(byPrompt.keys()) } }).select('promptTitle festivalName');
  const promptMap = new Map(prompts.map((p) => [String(p._id), p]));

  const scored = Array.from(byPrompt.entries()).map(([promptId, scores]) => ({
    promptId,
    promptTitle: promptMap.get(promptId)?.promptTitle,
    festivalName: promptMap.get(promptId)?.festivalName,
    averageScore: Number(average(scores).toFixed(2)),
  }));

  scored.sort((a, b) => a.averageScore - b.averageScore);
  return {
    mostDifficult: scored.slice(0, 5),
    highestRated: [...scored].sort((a, b) => b.averageScore - a.averageScore).slice(0, 5),
  };
};

module.exports = {
  getFlattenedModelScores,
  buildLeaderboard,
  buildDashboardStats,
  buildFestivalPerformance,
  buildPromptDifficulty,
  SCORE_FIELDS,
};