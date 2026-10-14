import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import menuRoutes from './routes/menu.routes.js';
import orderRoutes from './routes/order.routes.js';
import { authRoutes } from './routes/auth.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

export const app = express();

// Security and CORS configuration
const allowedOrigins = [
  config.CORS_ORIGIN,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (e.g. mobile apps, curl, tests)
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in preview/local
    },
    credentials: true,
  })
);

app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'CraveRoute API',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);

// Global Error Handler
app.use(errorHandler);
