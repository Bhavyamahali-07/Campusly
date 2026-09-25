import User from '../models/User.js';
import ClubMember from '../models/ClubMember.js';
import Event from '../models/Event.js';
import DiscussionMessage from '../models/DiscussionMessage.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { uploadFile } from '../services/uploadService.js';

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user public profile
 */
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password')
    .populate('college', 'name code');

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  ApiResponse.success(res, { user });
});

/**
 * @route   PUT /api/v1/users/profile
 * @desc    Update own profile
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'bio', 'department', 'year', 'skills', 'interests', 'socialLinks'];
  const updates = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    { new: true, runValidators: true }
  ).select('-password').populate('college', 'name code');

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Recalculate profile completion
  user.profileCompletion = user.calcProfileCompletion();
  await user.save({ validateBeforeSave: false });

  ApiResponse.success(res, { user }, 'Profile updated successfully');
});

/**
 * @route   PUT /api/v1/users/avatar
 * @desc    Upload/update avatar
 */
export const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('Please upload an image');
  }

  const imageUrl = await uploadFile(req.file);

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: imageUrl },
    { new: true }
  ).select('-password');

  // Recalculate profile completion
  user.profileCompletion = user.calcProfileCompletion();
  await user.save({ validateBeforeSave: false });

  ApiResponse.success(res, { user }, 'Avatar updated successfully');
});

/**
 * @route   GET /api/v1/users/search
 * @desc    Search users by skill, name, or department
 */
export const searchUsers = asyncHandler(async (req, res) => {
  const { q, skill, department, page = 1, limit = 20 } = req.query;
  const query = { college: req.user.college._id || req.user.college, isActive: true };

  if (q) {
    query.$or = [
      { name: { $regex: q, $options: 'i' } },
      { skills: { $regex: q, $options: 'i' } },
      { department: { $regex: q, $options: 'i' } },
    ];
  }

  if (skill) {
    query.skills = { $regex: skill, $options: 'i' };
  }

  if (department) {
    query.department = { $regex: department, $options: 'i' };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .select('name avatar department year skills activityPoints badges')
    .sort({ activityPoints: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  ApiResponse.paginated(res, users, {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    pages: Math.ceil(total / parseInt(limit)),
  });
});

/**
 * @route   GET /api/v1/users/campus/stats
 * @desc    Get personalized dashboard stats for the logged-in student
 */
export const getCampusStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const collegeId = req.user.college._id || req.user.college;

  // 1. Joined Clubs — count of clubs the student is an active member of
  const joinedClubs = await ClubMember.countDocuments({
    user: userId,
    status: 'ACTIVE',
  });

  // 2. Upcoming Events — events with future dates in the student's college
  const upcomingEvents = await Event.countDocuments({
    college: collegeId,
    date: { $gte: new Date() },
    status: { $in: ['UPCOMING', 'ONGOING'] },
  });

  // 3. Discussions — total unread messages across the student's clubs
  // Get all clubs the student is a member of
  const memberClubs = await ClubMember.find({
    user: userId,
    status: 'ACTIVE',
  }).select('club');

  const clubIds = memberClubs.map(m => m.club);

  let totalDiscussions = 0;
  if (clubIds.length > 0) {
    // Count messages in the student's clubs that were posted by others
    // (since there's no read tracking, we count recent messages from the last 7 days from others)
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    totalDiscussions = await DiscussionMessage.countDocuments({
      club: { $in: clubIds },
      user: { $ne: userId },
      isDeleted: false,
      createdAt: { $gte: oneWeekAgo },
    });
  }

  // 4. Campus Rank — rank the student by activityPoints among all students in the college
  let campusRank = 0;
  const userPoints = req.user.activityPoints || 0;
  if (userPoints > 0) {
    // Count how many students have more points
    const studentsAbove = await User.countDocuments({
      college: collegeId,
      isActive: true,
      activityPoints: { $gt: userPoints },
    });
    campusRank = studentsAbove + 1;
  }

  ApiResponse.success(res, {
    stats: {
      joinedClubs,
      upcomingEvents,
      totalDiscussions,
      campusRank,
    },
  });
});
