import { Router } from 'express';
import { getWeeklyLeaderboard, getAllTimeLeaderboard, getClubLeaderboard } from '../controllers/leaderboardController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();

router.use(authenticateUser);

router.get('/weekly', getWeeklyLeaderboard);
router.get('/alltime', getAllTimeLeaderboard);
router.get('/clubs', getClubLeaderboard);

export default router;
