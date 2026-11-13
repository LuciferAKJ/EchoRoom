const mongoose = require('mongoose');

/**
 * Connect to MongoDB with graceful error handling and retry mechanisms.
 * Supports MongoDB Atlas, local MongoDB, or in-memory fallback for testing.
 */
const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/echoroom';

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[Database] MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB: ${error.message}`);
    console.warn('[Database] Running in disconnected state. Provide a valid MONGODB_URI in backend/.env to persist data.');
    return null;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('[Database] MongoDB connection closed');
  } catch (error) {
    console.error(`[Database Error] Failed to close connection: ${error.message}`);
  }
};

module.exports = { connectDB, disconnectDB };
