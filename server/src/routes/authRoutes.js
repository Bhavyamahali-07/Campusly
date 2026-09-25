import { Router } from 'express';
import { register, login, logout, getMe, forgotPassword, resetPassword, changePassword, updateEmail } from '../controllers/authController.js';
import { authenticateUser } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema, updateEmailSchema } from '../validators/authValidator.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', authenticateUser, getMe);

// OTP Password Reset
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), resetPassword);

// Settings
router.patch('/change-password', authenticateUser, validate(changePasswordSchema), changePassword);
router.patch('/update-email', authenticateUser, validate(updateEmailSchema), updateEmail);

export default router;
