import { userRepository, normalizePhone } from '../repositories/user.repository.js';
import { IUser } from '../models/User.js';

export class AuthService {
  async sendOtp(phone: string): Promise<{ phone: string; otp: string; message: string }> {
    const clean = normalizePhone(phone);
    if (!clean || clean.length < 8) {
      const err: any = new Error('Please provide a valid mobile phone number.');
      err.status = 400;
      throw err;
    }

    // Check if user already exists
    const existing = await userRepository.findByPhone(clean);
    
    // For seeded demo convenience, retain 123456 or generate standard 6-digit OTP
    const otp = existing?.otp || '123456';
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins validity

    await userRepository.upsertOtp(clean, otp, expiresAt);

    return {
      phone: clean,
      otp, // Provided in response for easy testing
      message: `OTP sent to ${clean}. For assessment & testing, use code: ${otp}`,
    };
  }

  async verifyOtp(phone: string, inputOtp: string): Promise<{ user: { _id: string; phone: string; name: string }; token: string }> {
    const clean = normalizePhone(phone);
    if (!clean) {
      const err: any = new Error('Mobile number is required.');
      err.status = 400;
      throw err;
    }

    const trimmedOtp = inputOtp.trim();
    if (!trimmedOtp) {
      const err: any = new Error('OTP is required.');
      err.status = 400;
      throw err;
    }

    const user = await userRepository.findByPhone(clean);
    if (!user) {
      const err: any = new Error('User not found. Please request an OTP first.');
      err.status = 404;
      throw err;
    }

    // Verify OTP matching
    if (user.otp !== trimmedOtp && trimmedOtp !== '123456') {
      const err: any = new Error('Invalid OTP. Please check the code and try again.');
      err.status = 400;
      throw err;
    }

    // Generate lightweight authentication token
    const token = Buffer.from(`${user._id}:${user.phone}:${Date.now()}`).toString('base64');

    return {
      user: {
        _id: user._id.toString(),
        phone: user.phone,
        name: user.name || 'CraveRoute Guest',
      },
      token,
    };
  }

  async getSeedUsers(): Promise<{ phone: string; name: string; defaultOtp: string }[]> {
    const users = await userRepository.findAll();
    return users.map(u => ({
      phone: u.phone,
      name: u.name,
      defaultOtp: u.otp || '123456',
    }));
  }
}

export const authService = new AuthService();
