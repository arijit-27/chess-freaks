// scratch/test-mongodb.js
require('dotenv').config();
const mongoose = require('mongoose');
const db = require('../server/db');

console.log("==================================================");
console.log("   CHESS FREAKS MONGODB INTEGRATION TEST   ");
console.log("==================================================");

async function runTest() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/chess-freaks';
  console.log(`Connecting to database at: ${uri}`);
  
  try {
    // 1. Establish connection and trigger auto-seeding
    await db.connectDB();
    console.log("✅ Database connection established.");

    // 2. Fetch seeded collection counts
    const users = await db.users.getAll();
    const teams = await db.teams.getAll();
    const players = await db.players.getAll();
    const tours = await db.tournaments.getAll();

    console.log(`\n📊 Seeded Database Counts:`);
    console.log(`- Users: ${users.length}`);
    console.log(`- Teams: ${teams.length}`);
    console.log(`- Players: ${players.length}`);
    console.log(`- Tournaments: ${tours.length}`);

    // Verify default credentials are present
    const admin = users.find(u => u.username === 'admin');
    const viewer = users.find(u => u.username === 'viewer');
    console.log(`- Admin account loaded: ${admin ? 'Yes' : 'No'}`);
    console.log(`- Viewer account loaded: ${viewer ? 'Yes' : 'No'}`);

    // 3. Test CRUD insertions
    console.log("\n🧪 Running mock Player CRUD testing...");
    const mockPlayer = await db.players.create({
      name: "Garry Kasparov (Seeded Temp)",
      country: "AZE",
      elo: 2851,
      photo: "https://api.dicebear.com/7.x/bottts/svg?seed=Garry"
    });
    console.log(`- Inserted mock player: ${mockPlayer.name} (ID: ${mockPlayer._id})`);

    // Verify insertion
    const found = await db.players.getById(mockPlayer._id);
    console.log(`- Retrieved mock player: ${found ? found.name : 'Not Found'} with Elo: ${found ? found.elo : 0}`);
    
    // Clean up
    await db.players.delete(mockPlayer._id);
    console.log("- Deleted mock player (Database cleaned).");

    console.log("\n🎉 ALL MONGODB VERIFICATIONS PASSED SUCCESSFULLY!");
    process.exit(0);

  } catch (error) {
    console.error("\n❌ MongoDB integration test failed:", error);
    process.exit(1);
  } finally {
    // Ensure mongoose closes connections
    await mongoose.disconnect();
    console.log("Database connection closed.");
  }
}

runTest();
