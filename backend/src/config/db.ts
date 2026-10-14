import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { config } from './env.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
process.env.MONGOMS_DOWNLOAD_DIR = path.resolve(__dirname, '../../node_modules/.cache/mongodb-memory-server');

let mongodInstance: MongoMemoryServer | null = null;

export async function connectDB(uri?: string): Promise<string> {
  const targetUri = uri || config.MONGODB_URI;

  if (mongoose.connection.readyState >= 1) {
    return targetUri;
  }

  try {
    // Use 15s timeout for cloud Atlas clusters (TLS/DNS), or 3s for local fallback
    const isCloudCluster = targetUri.includes('+srv') || targetUri.includes('mongodb.net');
    await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: isCloudCluster ? 15000 : 3000,
    });
    console.log(`Connected to MongoDB at ${targetUri}`);
    return targetUri;
  } catch (error) {
    if (config.NODE_ENV !== 'test') {
      console.warn(`Could not connect to external MongoDB at ${targetUri}. Initializing embedded MongoMemoryServer for standalone execution...`);
      mongodInstance = await MongoMemoryServer.create();
      const memoryUri = mongodInstance.getUri();
      await mongoose.connect(memoryUri);
      console.log(`Connected to in-memory MongoDB at ${memoryUri}`);
      return memoryUri;
    }
    throw error;
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
    mongodInstance = null;
  }
}
