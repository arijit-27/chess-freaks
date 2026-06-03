// scratch/cleanup-admin.js
require('dotenv').config();
const mongoose = require('mongoose');
const db = require('../server/db');

async function cleanup() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/chess-freaks';
  try {
    await db.connectDB();
    console.log("Connected to MongoDB for cleanup.");

    const res = await mongoose.connection.db.collection('users').deleteOne({ username: 'admin' });
    console.log(`Deleted user 'admin':`, res.deletedCount);

  } catch (err) {
    console.error("Cleanup error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

cleanup();
