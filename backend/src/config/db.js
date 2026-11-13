const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const dns = require('dns');

// On Windows, local ISP / Wi-Fi DNS resolvers frequently fail to resolve Atlas SRV records.
// Explicitly configure public Google & Cloudflare DNS resolvers for Atlas SRV lookups.
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore in environments where setting DNS servers is restricted
}

/**
 * Connect to MongoDB with graceful error handling and retry mechanisms.
 * Supports MongoDB Atlas or local MongoDB.
 */
const connectDB = async () => {
  let mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/echoroom';

  // Ensure database name is set if user provided atlas root URL ending with '/'
  if (mongoURI.includes('mongodb.net/') && (mongoURI.endsWith('mongodb.net/') || mongoURI.endsWith('mongodb.net/?'))) {
    mongoURI = mongoURI.replace('mongodb.net/', 'mongodb.net/echoroom?retryWrites=true&w=majority');
  }

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
