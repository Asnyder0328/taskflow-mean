const mongoose = require('mongoose');
async function connectDB(uri) {
  const mongoUri = uri || process.env.MONGO_URI;
  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri);
      console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);
      return { mode: 'mongo' };
    } catch (e) {
      console.warn(`⚠️  Mongo URI failed (${e.message}), falling back to in-memory Mongo`);
    }
  }
  // Dev fallback so the app runs anywhere with zero setup
  const { MongoMemoryServer } = require('mongodb-memory-server');
  const mem = await MongoMemoryServer.create();
  await mongoose.connect(mem.getUri());
  console.log('✅ In-memory MongoDB started (dev mode — data resets on restart)');
  return { mode: 'memory', mem };
}
module.exports = connectDB;
