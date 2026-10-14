import dotenv from 'dotenv';
dotenv.config();

export const config = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/craveroute',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  SIMULATION_STEP_DELAY_MS: parseInt(process.env.SIMULATION_STEP_DELAY_MS || '4000', 10),
};
