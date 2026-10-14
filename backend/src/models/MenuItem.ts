import mongoose, { Schema, Document } from 'mongoose';

export interface IMenuItem extends Document {
  name: string;
  description: string;
  price: number;
  currency?: string;
  category: string;
  imageUrl: string;
  isAvailable: boolean;
  dietary: string[];
  preparationTimeMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

const MenuItemSchema = new Schema<IMenuItem>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    category: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true },
    isAvailable: { type: Boolean, default: true, index: true },
    dietary: { type: [String], default: [] },
    preparationTimeMinutes: { type: Number, default: 15 },
  },
  { timestamps: true }
);

MenuItemSchema.index({ category: 1, isAvailable: 1 });

export const MenuItem = mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);
