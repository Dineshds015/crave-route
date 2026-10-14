import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';

export class AuthController {
  async sendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone } = req.body;
      if (!phone) {
        return res.status(400).json({ success: false, error: 'Mobile number is required.' });
      }

      const result = await authService.sendOtp(phone);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone, otp } = req.body;
      if (!phone || !otp) {
        return res.status(400).json({ success: false, error: 'Both phone and OTP are required.' });
      }

      const result = await authService.verifyOtp(phone, otp);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDemoUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await authService.getSeedUsers();
      return res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
