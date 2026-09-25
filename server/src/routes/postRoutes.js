import { Router } from 'express';
import { createPost, getFeed, getPost, toggleLike, deletePost } from '../controllers/postController.js';
import { createComment, getComments, deleteComment } from '../controllers/commentController.js';
import { authenticateUser } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { createPostSchema, createCommentSchema } from '../validators/postValidator.js';
import { interactionLimiter } from '../middleware/rateLimiter.js';
import upload from '../middleware/upload.js';

const router = Router();

router.use(authenticateUser);

// Posts
router.post('/', upload.array('images', 4), validate(createPostSchema), createPost);
router.get('/', getFeed);
router.get('/:id', getPost);
router.post('/:id/like', interactionLimiter, toggleLike);
router.delete('/:id', deletePost);

// Comments
router.post('/:postId/comments', validate(createCommentSchema), createComment);
router.get('/:postId/comments', getComments);

export default router;
