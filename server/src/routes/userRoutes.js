import { Router } from 'express';
import { getUserProfile, updateProfile, updateAvatar, searchUsers, getCampusStats } from '../controllers/userController.js';
import { authenticateUser } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { updateProfileSchema } from '../validators/authValidator.js';
import upload from '../middleware/upload.js';

const router = Router();

router.use(authenticateUser);

router.get('/search', searchUsers);
router.get('/campus/stats', getCampusStats);
router.get('/:id', getUserProfile);
router.put('/profile', validate(updateProfileSchema), updateProfile);
router.put('/avatar', upload.single('avatar'), updateAvatar);

export default router;
