import User from '../models/User.js';
import Post from '../models/Post.js';
import Club from '../models/Club.js';
import Event from '../models/Event.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @route   GET /api/v1/search
 * @desc    Global search across students, clubs, events, projects, posts
 */
export const globalSearch = asyncHandler(async (req, res) => {
  const { q, type } = req.query;

  if (!q || q.trim().length < 2) {
    return ApiResponse.success(res, { results: {} }, 'Search requires at least 2 characters');
  }

  const collegeId = req.user.college._id || req.user.college;
  const regex = { $regex: q, $options: 'i' };
  const results = {};

  if (!type || type === 'students') {
    results.students = await User.find({
      college: collegeId,
      isActive: true,
      $or: [{ name: regex }, { skills: regex }, { department: regex }],
    })
      .select('name avatar department year skills activityPoints')
      .limit(5);
  }

  if (!type || type === 'clubs') {
    results.clubs = await Club.find({
      college: collegeId,
      isApproved: true,
      $or: [{ name: regex }, { description: regex }, { tags: regex }],
    })
      .select('name logo category membersCount')
      .limit(5);
  }

  if (!type || type === 'events') {
    results.events = await Event.find({
      college: collegeId,
      $or: [{ title: regex }, { description: regex }, { tags: regex }],
    })
      .select('title poster date status registrationCount')
      .limit(5);
  }

  if (!type || type === 'posts') {
    results.posts = await Post.find({
      college: collegeId,
      isDeleted: false,
      content: regex,
    })
      .select('content category author likesCount commentsCount createdAt')
      .populate('author', 'name avatar')
      .limit(5);
  }

  ApiResponse.success(res, { results });
});
