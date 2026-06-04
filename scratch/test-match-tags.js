// scratch/test-match-tags.js
require('dotenv').config();
const mongoose = require('mongoose');
const db = require('../server/db');

async function run() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/chess-freaks';
  console.log("=== STARTING MATCH TAGS SYSTEM TEST ===");
  console.log("Connecting to MongoDB at:", uri);
  
  try {
    await db.connectDB();
    console.log("Connected successfully.");

    // 1. Create temporary teams and tournament for test
    console.log("\n1. Seeding test team & tournament...");
    const teamA = await db.teams.create({ name: `Test Team C ${Date.now()}`, logo: "🅲" });
    const teamB = await db.teams.create({ name: `Test Team D ${Date.now()}`, logo: "🅳" });
    const tour = await db.tournaments.create({
      name: `Test Cup ${Date.now()}`,
      format: "Team VS Team",
      teams: [teamA._id, teamB._id]
    });

    // 2. Create Match
    console.log("\n2. Creating a test match...");
    const match = await db.matches.create({
      tournamentId: tour._id,
      teamAId: teamA._id,
      teamBId: teamB._id,
      round: 1,
      matchNumber: 1
    });
    console.log(`- Created Match ID: ${match._id}`);
    console.log(`- Default isCrazyGame: ${match.isCrazyGame}`);
    console.log(`- Default isGreatestGame: ${match.isGreatestGame}`);

    // 3. Update Match (simulate saving checkboxes)
    console.log("\n3. Tagging match as Crazy & Greatest Game...");
    const updatedMatch = await db.matches.update(match._id, {
      isCrazyGame: true,
      isGreatestGame: true
    });

    console.log(`- Updated values:`);
    console.log(`  - isCrazyGame: ${updatedMatch.isCrazyGame}`);
    console.log(`  - isGreatestGame: ${updatedMatch.isGreatestGame}`);

    // 4. Verify in DB
    console.log("\n4. Verifying DB values...");
    const fetchedMatch = await db.matches.getById(match._id);
    
    let ok = true;
    if (fetchedMatch.isCrazyGame !== true) { ok = false; console.error("❌ FAILED: isCrazyGame is not true"); }
    if (fetchedMatch.isGreatestGame !== true) { ok = false; console.error("❌ FAILED: isGreatestGame is not true"); }

    if (ok) {
      console.log("✅ SUCCESS: Match successfully tagged with custom descriptors!");
    } else {
      console.log("❌ FAILURE: Match tagging failed verification.");
    }

    // Clean up temporary test data
    console.log("\nCleaning up test records...");
    await db.teams.delete(teamA._id);
    await db.teams.delete(teamB._id);
    await db.tournaments.delete(tour._id);
    await db.matches.delete(match._id);
    console.log("Cleanup finished.");

  } catch (err) {
    console.error("Test error encountered:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from database.");
  }
}

run();
