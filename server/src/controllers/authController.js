import User from '../models/User.js';
import College from '../models/College.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { generateToken, setTokenCookie, clearTokenCookie } from '../utils/helpers.js';
import crypto from 'crypto';

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new student
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, department, year, securityQuestion, securityAnswer } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.conflict('An account with this email already exists');
  }

  // Extract email domain and find matching college
  const emailDomain = email.split('@')[1];
  let college = await College.findOne({ emailDomain });

  // If no college found, check for a wildcard/default college
  if (!college) {
    college = await College.findOne({ emailDomain: 'college.edu' });
  }

  if (!college) {
    throw ApiError.badRequest(
      'Your email domain is not associated with any registered college. Please use your college email.',
      'INVALID_COLLEGE_EMAIL'
    );
  }

  if (!college.settings.registrationEnabled) {
    throw ApiError.badRequest('Registration is currently disabled for this college');
  }

  const user = await User.create({
    name,
    email,
    password,
    department: department || '',
    year: year || '',
    securityQuestion,
    securityAnswer,
    college: college._id,
  });

  // Generate JWT
  const token = generateToken(user._id);
  setTokenCookie(res, token);

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  ApiResponse.created(res, { user: userResponse, token }, 'Registration successful');
});

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user and include password for comparison
  const user = await User.findOne({ email }).select('+password').populate('college', 'name code');

  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (!user.isActive) {
    throw ApiError.forbidden('Your account has been suspended. Contact your college admin.');
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Update last active
  user.lastActive = new Date();
  await user.save({ validateBeforeSave: false });

  // Generate JWT
  const token = generateToken(user._id);
  setTokenCookie(res, token);

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  ApiResponse.success(res, { user: userResponse, token }, 'Login successful');
});

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user
 */
export const logout = asyncHandler(async (req, res) => {
  clearTokenCookie(res);
  ApiResponse.success(res, null, 'Logged out successfully');
});

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('college', 'name code logo');
  ApiResponse.success(res, { user });
});

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Get security question for password reset
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw ApiError.notFound('No account found with that email address');
  }

  ApiResponse.success(res, { securityQuestion: user.securityQuestion }, 'Security question retrieved');
});

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password using security answer
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, securityAnswer, password } = req.body;

  const user = await User.findOne({ email }).select('+securityAnswer');

  if (!user) {
    throw ApiError.badRequest('Invalid email');
  }
  
  const isMatch = await user.compareSecurityAnswer(securityAnswer);
  if (!isMatch) {
    throw ApiError.badRequest('Incorrect security answer');
  }

  // Set new password
  user.password = password;
  await user.save();

  // Log user in automatically after reset
  const token = generateToken(user._id);
  setTokenCookie(res, token);

  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.securityAnswer;

  ApiResponse.success(res, { user: userResponse, token }, 'Password reset successful');
});

/**
 * @route   PATCH /api/v1/auth/change-password
 * @desc    Change password (requires being logged in)
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw ApiError.unauthorized('Incorrect current password');
  }

  user.password = newPassword;
  await user.save();

  ApiResponse.success(res, null, 'Password changed successfully');
});

/**
 * @route   PATCH /api/v1/auth/update-email
 * @desc    Update email address
 */
export const updateEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const existingUser = await User.findOne({ email, _id: { $ne: req.user._id } });
  if (existingUser) {
    throw ApiError.conflict('Email is already in use');
  }

  const user = await User.findById(req.user._id);
  user.email = email;
  await user.save({ validateBeforeSave: false });

  ApiResponse.success(res, { email: user.email }, 'Email updated successfully');
});
