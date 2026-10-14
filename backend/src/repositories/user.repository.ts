import { User, IUser } from '../models/User.js';

export function normalizePhone(rawPhone: string): string {
  // Normalize whitespace and common separators
  return rawPhone.replace(/[\s\-\(\)]/g, '').trim();
}

export class UserRepository {
  async findByPhone(phone: string): Promise<IUser | null> {
    const clean = normalizePhone(phone);
    // Flexible regex search to match formatted or unformatted versions
    const escaped = clean.replace(/^\+/, '\\+');
    return User.findOne({
      $or: [
        { phone: clean },
        { phone: phone.trim() },
        { phone: { $regex: new RegExp(escaped, 'i') } }
      ]
    }).exec();
  }

  async findById(id: string): Promise<IUser | null> {
    return User.findById(id).exec();
  }

  async upsertOtp(phone: string, otp: string, expiresAt: Date, name?: string): Promise<IUser> {
    const clean = normalizePhone(phone);
    const updateData: any = {
      phone: clean,
      otp,
      otpExpiresAt: expiresAt,
    };
    if (name) {
      updateData.name = name;
    }

    return User.findOneAndUpdate(
      { phone: clean },
      { $set: updateData },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).exec();
  }

  async findAll(): Promise<IUser[]> {
    return User.find().sort({ createdAt: -1 }).exec();
  }
}

export const userRepository = new UserRepository();
