import { beforeAll, afterAll, beforeEach } from 'vitest';
import path from 'path';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Ensure MongoMemoryServer always uses the local backend cache regardless of execution cwd
const cacheDir = path.resolve(__dirname, '../node_modules/.cache/mongodb-memory-server');
process.env.MONGOMS_DOWNLOAD_DIR = cacheDir;

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({
    instance: {
      dbName: 'craveroute_test',
    },
  });
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
}, 60000);

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});
