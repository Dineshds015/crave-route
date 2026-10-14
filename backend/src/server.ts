import { app } from './app.js';
import { config } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { MenuItem } from './models/MenuItem.js';
import { User } from './models/User.js';
import { defaultMenuItems, defaultSeedUsers } from './config/seed-data.js';

async function startServer() {
  try {
    await connectDB();

    // Ensure menu has items available in dev or standalone mode
    try {
      const count = await MenuItem.countDocuments();
      if (count === 0) {
        console.log('No menu items found. Auto-seeding initial culinary collection...');
        await MenuItem.insertMany(defaultMenuItems);
        console.log(`Auto-seeded ${defaultMenuItems.length} menu items.`);
      }
    } catch (seedErr: any) {
      if (seedErr.code === 11000) {
        console.log('Menu items already seeded by another process.');
      } else {
        console.warn('Auto-seed notice:', seedErr.message);
      }
    }

    // Ensure users exist with OTP
    try {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('No users found. Auto-seeding default demo accounts with OTP...');
        await User.insertMany(
          defaultSeedUsers.map((u) => ({
            phone: u.phone.replace(/[\s\-\(\)]/g, '').trim(),
            name: u.name,
            otp: u.otp,
            otpExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          }))
        );
        console.log(`Auto-seeded ${defaultSeedUsers.length} user accounts with OTP.`);
      }
    } catch (uErr: any) {
      if (uErr.code !== 11000) {
        console.warn('User auto-seed notice:', uErr.message);
      }
    }

    const server = app.listen(config.PORT, () => {
      console.log(`CraveRoute Backend API listening on port ${config.PORT}`);
    });

    const shutdown = async () => {
      console.log('Shutting down server gracefully...');
      server.close(async () => {
        await disconnectDB();
        console.log('Server and database connections terminated.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}
