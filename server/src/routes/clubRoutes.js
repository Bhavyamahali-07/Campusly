import { Router } from 'express';
import {
  createClub, getClubs, getClub, joinClub, leaveClub,
  manageMember, getPendingMembers, updateClub,
} from '../controllers/clubController.js';
import { authenticateUser } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { createClubSchema, updateClubSchema } from '../validators/clubValidator.js';
import upload from '../middleware/upload.js';

const router = Router();

router.use(authenticateUser);

router.post('/', validate(createClubSchema), createClub);
router.get('/', getClubs);
router.get('/:id', getClub);
router.post('/:id/join', joinClub);
router.post('/:id/leave', leaveClub);
router.get('/:id/pending', getPendingMembers);
router.patch('/:id/members/:userId', manageMember);
router.put('/:id', upload.single('logo'), validate(updateClubSchema), updateClub);

export default router;
