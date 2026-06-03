// scratch/create-admin.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const db = require('../server/db');

async function create() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/chess-freaks';
  console.log("Connecting to:", uri);
  try {
    await db.connectDB();
    console.log("Connected to MongoDB.\n");

    // Print all users
    const users = await db.users.getAll();
    console.log(`Current Users Count: ${users.length}`);
    users.forEach(u => {
      console.log(`- User: ${u.username}, Role: ${u.role}, Hash: ${u.passwordHash}`);
    });

    // Hash password 'admin123'
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('admin123', salt);
    console.log(`Generated new hash for 'admin123': ${hash}`);

    // Check if admin exists
    let admin = await db.users.getByUsername('admin');
    if (admin) {
      console.log("Admin exists. Updating password hash...");
      admin.passwordHash = hash;
      admin.role = 'admin';
      await admin.save();
      console.log("Admin updated.");
    } else {
      console.log("Admin does not exist. Creating...");
      admin = await db.users.create({
        username: 'admin',
        passwordHash: hash,
        role: 'admin'
      });
      console.log("Admin created.");
    }

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

create();
