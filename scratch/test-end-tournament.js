// scratch/test-end-tournament.js
require('dotenv').config();
const mongoose = require('mongoose');
const db = require('../server/db');

async function run() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/chess-freaks';
  console.log("=== STARTING TOURNAMENT AWARDS SYSTEM TEST ===");
  console.log("Connecting to MongoDB at:", uri);
  
  try {
    await db.connectDB();
    console.log("Connected successfully.");

    // 1. Create temporary teams and players for test
    console.log("\n1. Seeding test teams & players...");
    const teamA = await db.teams.create({ name: `Alpha Team ${Date.now()}`, logo: "🅰️" });
    const teamB = await db.teams.create({ name: `Beta Team ${Date.now()}`, logo: "🅱️" });

    const player1 = await db.players.create({ name: "Player MVP", teamId: teamA._id, elo: 1600 });
    const player2 = await db.players.create({ name: "Player Gold", teamId: teamA._id, elo: 1550 });
    const player3 = await db.players.create({ name: "Player Silver", teamId: teamB._id, elo: 1500 });
    const player4 = await db.players.create({ name: "Player Bronze", teamId: teamB._id, elo: 1450 });

    console.log(`- Created Players:`);
    console.log(`  - MVP: ${player1.name} (ID: ${player1._id})`);
    console.log(`  - Gold: ${player2.name} (ID: ${player2._id})`);
    console.log(`  - Silver: ${player3.name} (ID: ${player3._id})`);
    console.log(`  - Bronze: ${player4.name} (ID: ${player4._id})`);

    // 2. Create Tournament
    console.log("\n2. Creating a test tournament...");
    const tour = await db.tournaments.create({
      name: `Championship Cup ${Date.now()}`,
      format: "Team VS Team",
      startDate: "2026-06-04",
      endDate: "2026-06-08",
      teams: [teamA._id, teamB._id]
    });
    console.log(`- Created Tournament: ${tour.name} (ID: ${tour._id})`);

    // 3. Update Tournament (simulate Ending it with medals)
    console.log("\n3. Ending tournament and assigning medals...");
    const updatedTour = await db.tournaments.update(tour._id, {
      status: 'COMPLETED',
      mvpPlayerId: player1._id,
      goldPlayerId: player2._id,
      silverPlayerId: player3._id,
      bronzePlayerId: player4._id
    });

    console.log(`- Tournament Status updated to: ${updatedTour.status}`);
    console.log(`- Stored Award IDs:`);
    console.log(`  - MVP ID: ${updatedTour.mvpPlayerId}`);
    console.log(`  - Gold ID: ${updatedTour.goldPlayerId}`);
    console.log(`  - Silver ID: ${updatedTour.silverPlayerId}`);
    console.log(`  - Bronze ID: ${updatedTour.bronzePlayerId}`);

    // 4. Verify in DB
    console.log("\n4. Verifying DB values...");
    const fetchedTour = await db.tournaments.getById(tour._id);
    
    let ok = true;
    if (fetchedTour.status !== 'COMPLETED') { ok = false; console.error("❌ FAILED: Status is not COMPLETED"); }
    if (String(fetchedTour.mvpPlayerId) !== String(player1._id)) { ok = false; console.error("❌ FAILED: MVP player ID mismatch"); }
    if (String(fetchedTour.goldPlayerId) !== String(player2._id)) { ok = false; console.error("❌ FAILED: Gold player ID mismatch"); }
    if (String(fetchedTour.silverPlayerId) !== String(player3._id)) { ok = false; console.error("❌ FAILED: Silver player ID mismatch"); }
    if (String(fetchedTour.bronzePlayerId) !== String(player4._id)) { ok = false; console.error("❌ FAILED: Bronze player ID mismatch"); }

    if (ok) {
      console.log("✅ SUCCESS: Tournament successfully completed and medals persistent!");
    } else {
      console.log("❌ FAILURE: Medal persistence failed verification.");
    }

    // Clean up temporary test data
    console.log("\nCleaning up test records...");
    await db.teams.delete(teamA._id);
    await db.teams.delete(teamB._id);
    await db.players.delete(player1._id);
    await db.players.delete(player2._id);
    await db.players.delete(player3._id);
    await db.players.delete(player4._id);
    await db.tournaments.delete(tour._id);
    console.log("Cleanup finished.");

  } catch (err) {
    console.error("Test error encountered:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from database.");
  }
}

run();
