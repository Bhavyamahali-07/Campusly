import User from '../models/User.js';
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
