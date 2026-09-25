import { Router } from 'express';
import { deleteComment } from '../controllers/commentController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();

router.use(authenticateUser);
router.delete('/:id', deleteComment);

export default router;
