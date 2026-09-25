import { Router } from 'express';
import { globalSearch } from '../controllers/searchController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();

router.use(authenticateUser);
router.get('/', globalSearch);

export default router;
