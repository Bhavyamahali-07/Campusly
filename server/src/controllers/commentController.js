import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { trackActivity } from '../services/activityService.js';
import { createNotification } from '../services/notificationService.js';

/**
 * @route   POST /api/v1/posts/:postId/comments
 * @desc    Add a comment to a post
 */
export const createComment = asyncHandler(async (req, res) => {
  const { content, parentComment } = req.body;
  const post = await Post.findById(req.params.postId);

  if (!post || post.isDeleted) {
    throw ApiError.notFound('Post not found');
  }

  const comment = await Comment.create({
    post: post._id,
    author: req.user._id,
    content,
    parentComment: parentComment || null,
  });

  // Increment post comment count
  post.commentsCount += 1;
  await post.save();

  await comment.populate('author', 'name avatar');

  // Track activity
  await trackActivity(req.user._id, post.college, 'COMMENT_CREATED', {
    postId: post._id,
    commentId: comment._id,
  });

  // Notify post author
  await createNotification({
    recipient: post.author,
    sender: req.user._id,
    type: 'COMMENT',
    message: `${req.user.name} commented on your post`,
    entityType: 'post',
    entityId: post._id,
  });

  ApiResponse.created(res, { comment }, 'Comment added');
});

/**
 * @route   GET /api/v1/posts/:postId/comments
 * @desc    Get comments for a post
 */
export const getComments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const query = { post: req.params.postId, isDeleted: false, parentComment: null };
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Comment.countDocuments(query);

  const comments = await Comment.find(query)
    .populate('author', 'name avatar')
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Get replies for each comment
  const commentsWithReplies = await Promise.all(
    comments.map(async (comment) => {
      const replies = await Comment.find({
        parentComment: comment._id,
        isDeleted: false,
      })
        .populate('author', 'name avatar')
        .sort({ createdAt: 1 })
        .limit(5);

      return { ...comment.toObject(), replies };
    })
  );

  ApiResponse.paginated(res, commentsWithReplies, {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    pages: Math.ceil(total / parseInt(limit)),
  });
});

/**
 * @route   DELETE /api/v1/comments/:id
 * @desc    Delete a comment
 */
export const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    throw ApiError.notFound('Comment not found');
  }

  if (comment.author.toString() !== req.user._id.toString() && req.user.role === 'STUDENT') {
    throw ApiError.forbidden('You can only delete your own comments');
  }

  comment.isDeleted = true;
  await comment.save();

  // Decrement post comment count
  await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } });

  ApiResponse.success(res, null, 'Comment deleted');
});
