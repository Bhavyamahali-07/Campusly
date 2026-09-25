import express from 'express';
import { getClubMessages, postClubMessage, deleteClubMessage } from '../controllers/discussionController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateUser);

router.route('/:clubId')
  .get(getClubMessages)
  .post(postClubMessage);

router.delete('/:clubId/messages/:messageId', deleteClubMessage);

export default router;
