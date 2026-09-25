import User from '../models/User.js';
import Activity from '../models/Activity.js';
import Club from '../models/Club.js';
import ClubMember from '../models/ClubMember.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @route   GET /api/v1/leaderboard/weekly
 * @desc    Get weekly student leaderboard
 */
export const getWeeklyLeaderboard = asyncHandler(async (req, res) => {
  const { limit = 20 } = req.query;
  const collegeId = req.user.college._id || req.user.college;

  // Get start of current week (Monday)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  startOfWeek.setHours(0, 0, 0, 0);

  const leaderboard = await Activity.aggregate([
    {
      $match: {
        college: collegeId,
        createdAt: { $gte: startOfWeek },
      },
    },
    {
      $group: {
        _id: '$user',
        totalPoints: { $sum: '$points' },
        activityCount: { $sum: 1 },
      },
    },
    { $sort: { totalPoints: -1 } },
    { $limit: parseInt(limit) },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $project: {
        _id: '$user._id',
        name: '$user.name',
        avatar: '$user.avatar',
        department: '$user.department',
        year: '$user.year',
        totalPoints: 1,
        activityCount: 1,
        badges: '$user.badges',
      },
    },
  ]);

  // Add rank
  const rankedLeaderboard = leaderboard.map((entry, index) => ({
    rank: index + 1,
    ...entry,
  }));

  ApiResponse.success(res, { leaderboard: rankedLeaderboard, weekStart: startOfWeek });
});

/**
 * @route   GET /api/v1/leaderboard/alltime
 * @desc    Get all-time student leaderboard
 */
export const getAllTimeLeaderboard = asyncHandler(async (req, res) => {
  const { limit = 20 } = req.query;
  const collegeId = req.user.college._id || req.user.college;

  const students = await User.find({ college: collegeId, isActive: true })
    .select('name avatar department year activityPoints badges')
    .sort({ activityPoints: -1 })
    .limit(parseInt(limit));

  const leaderboard = students.map((student, index) => ({
    rank: index + 1,
    ...student.toObject(),
  }));

  ApiResponse.success(res, { leaderboard });
});

/**
 * @route   GET /api/v1/leaderboard/clubs
 * @desc    Get club leaderboard
 */
export const getClubLeaderboard = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  const collegeId = req.user.college._id || req.user.college;

  // Aggregate member XP per club
  const clubLeaderboard = await ClubMember.aggregate([
    { $match: { status: 'ACTIVE' } },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userData',
      },
    },
    { $unwind: '$userData' },
    { $match: { 'userData.college': collegeId } },
    {
      $group: {
        _id: '$club',
        totalXP: { $sum: '$userData.activityPoints' },
        memberCount: { $sum: 1 },
        avgXP: { $avg: '$userData.activityPoints' },
      },
    },
    { $sort: { totalXP: -1 } },
    { $limit: parseInt(limit) },
    {
      $lookup: {
        from: 'clubs',
        localField: '_id',
        foreignField: '_id',
        as: 'club',
      },
    },
    { $unwind: '$club' },
    {
      $project: {
        _id: '$club._id',
        name: '$club.name',
        logo: '$club.logo',
        category: '$club.category',
        totalXP: 1,
        memberCount: 1,
        avgXP: { $round: ['$avgXP', 0] },
      },
    },
  ]);

  const ranked = clubLeaderboard.map((entry, index) => ({
    rank: index + 1,
    ...entry,
  }));

  ApiResponse.success(res, { leaderboard: ranked });
});
