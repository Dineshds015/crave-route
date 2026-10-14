import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';

const router = Router();

router.post('/send-otp', (req, res, next) => authController.sendOtp(req, res, next));
router.post('/verify-otp', (req, res, next) => authController.verifyOtp(req, res, next));
router.get('/demo-users', (req, res, next) => authController.getDemoUsers(req, res, next));

export const authRoutes = router;
