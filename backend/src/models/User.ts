import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  phone: string;
  name: string;
  otp?: string;
  otpExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      default: 'CraveRoute Guest',
      trim: true,
    },
    otp: {
      type: String,
      default: '123456',
    },
    otpExpiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Active for testing
    },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
