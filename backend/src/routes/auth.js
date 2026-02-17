import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Public routes — no token needed
router.post('/register', register);
router.post('/login', login);

// Protected route — must have a valid JWT token
router.get('/me', requireAuth, getMe);

export default router;
