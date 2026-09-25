import { Router } from 'express';
import {
  getDashboard, getStudents, updateStudent, approveClub,
  getReports, resolveReport, createAnnouncement, getAnnouncements,
  getPendingClubs,
} from '../controllers/adminController.js';
import { authenticateUser, authorizeRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticateUser);
router.use(authorizeRole('COLLEGE_ADMIN', 'SUPER_ADMIN'));

router.get('/dashboard', getDashboard);
router.get('/students', getStudents);
router.patch('/students/:id', updateStudent);
router.get('/pending-clubs', getPendingClubs);
router.patch('/clubs/:id/approve', approveClub);
router.get('/reports', getReports);
router.patch('/reports/:id', resolveReport);
router.post('/announcements', createAnnouncement);

export default router;

// Announcements (public, auth-only route — moved to separate export)
export const announcementRouter = Router();
announcementRouter.use(authenticateUser);
announcementRouter.get('/', getAnnouncements);
