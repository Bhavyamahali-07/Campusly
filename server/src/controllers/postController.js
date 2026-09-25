import Post from '../models/Post.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { uploadFile } from '../services/uploadService.js';
import { trackActivity } from '../services/activityService.js';
import { createNotification } from '../services/notificationService.js';
import { checkAndAwardBadges } from '../services/badgeService.js';

/**
 * @route   POST /api/v1/posts
 * @desc    Create a post
 */
export const createPost = asyncHandler(async (req, res) => {
  const { content, category, club } = req.body;

  // Handle image uploads
  const images = [];
  if (req.files?.length > 0) {
    for (const file of req.files) {
      const url = await uploadFile(file);
      if (url) images.push(url);
    }
  }

  const post = await Post.create({
    author: req.user._id,
    college: req.user.college._id || req.user.college,
    content,
    category: category || 'GENERAL',
    images,
    club: club || null,
  });

  await post.populate('author', 'name avatar department year');

  // Track activity
  await trackActivity(req.user._id, post.college, 'POST_CREATED', { postId: post._id });

  // Check for badges
  checkAndAwardBadges(req.user._id);

  ApiResponse.created(res, { post }, 'Post created successfully');
});

/**
 * @route   GET /api/v1/posts
 * @desc    Get feed posts
 */
export const getFeed = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, category, sort = 'recent', club } = req.query;
  const collegeId = req.user.college._id || req.user.college;

  const query = {
    college: collegeId,
    isDeleted: false,
  };

  if (category && category !== 'ALL') {
    query.category = category;
  }

  if (club) {
    query.club = club;
  }

  let sortOption = { createdAt: -1 }; // Default: recent
  if (sort === 'popular') {
    sortOption = { likesCount: -1, createdAt: -1 };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Post.countDocuments(query);

  const posts = await Post.find(query)
    .populate('author', 'name avatar department year')
    .populate('club', 'name logo')
    .sort(sortOption)
    .skip(skip)
    .limit(parseInt(limit));

  ApiResponse.paginated(res, posts, {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    pages: Math.ceil(total / parseInt(limit)),
  });
});

/**
 * @route   GET /api/v1/posts/:id
 * @desc    Get single post
 */
export const getPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate('author', 'name avatar department year')
    .populate('club', 'name logo');

  if (!post || post.isDeleted) {
    throw ApiError.notFound('Post not found');
  }

  ApiResponse.success(res, { post });
});

/**
 * @route   POST /api/v1/posts/:id/like
 * @desc    Toggle like on a post
 */
export const toggleLike = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post || post.isDeleted) {
    throw ApiError.notFound('Post not found');
  }

  const userId = req.user._id;
  const isLiked = post.likes.includes(userId);

  if (isLiked) {
    // Unlike
    post.likes.pull(userId);
    post.likesCount = Math.max(0, post.likesCount - 1);
  } else {
    // Like
    post.likes.push(userId);
    post.likesCount += 1;

    // Track activity
    await trackActivity(req.user._id, post.college, 'POST_LIKED', { postId: post._id });

    // Notify post author
    await createNotification({
      recipient: post.author,
      sender: req.user._id,
      type: 'LIKE',
      message: `${req.user.name} liked your post`,
      entityType: 'post',
      entityId: post._id,
    });
  }

  await post.save();

  ApiResponse.success(res, { liked: !isLiked, likesCount: post.likesCount });
});

/**
 * @route   DELETE /api/v1/posts/:id
 * @desc    Soft delete a post
 */
export const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    throw ApiError.notFound('Post not found');
  }

  // Only author or admin can delete
  if (post.author.toString() !== req.user._id.toString() && req.user.role === 'STUDENT') {
    throw ApiError.forbidden('You can only delete your own posts');
  }

  post.isDeleted = true;
  await post.save();

  ApiResponse.success(res, null, 'Post deleted successfully');
});
