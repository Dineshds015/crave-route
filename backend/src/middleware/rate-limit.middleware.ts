import { rateLimit } from 'express-rate-limit';

export const orderCreationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: process.env.NODE_ENV === 'test' ? 1000 : 30, // 30 orders/minute limit in prod
  message: {
    success: false,
    error: 'Too many order requests from this IP, please try again shortly.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
});
