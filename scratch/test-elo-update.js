// scratch/test-elo-update.js
require('dotenv').config();
const mongoose = require('mongoose');
const db = require('../server/db');

async function testEloUpdate() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/chess-freaks';
  console.log(`Connecting to: ${uri}`);
  
  try {
    await db.connectDB();
    console.log("✅ Connected to MongoDB.");

    // Clean databases and reseed fresh to ensure we have teams, players, tournaments
    await db.reset();
    console.log("✅ Reseeded database.");

    // Create temporary mock teams for testing
    const teamA = await db.teams.create({ name: "Knight Riders Temp", logo: "♞", budget: 1000 });
    const teamB = await db.teams.create({ name: "Pawn Stormers Temp", logo: "♟", budget: 1000 });

    // Create temporary mock players for testing
    const p1 = await db.players.create({
      name: "Magnus Carlsen Temp",
      country: "NOR",
      elo: 2882,
      teamId: teamA._id,
      photo: "https://api.dicebear.com/7.x/bottts/svg?seed=Magnus"
    });
    
    const p2 = await db.players.create({
      name: "Praggnanandhaa Temp",
      country: "IND",
      elo: 2747,
      teamId: teamB._id,
      photo: "https://api.dicebear.com/7.x/bottts/svg?seed=Pragg"
    });

    console.log(`Player 1: ${p1.name} (Elo: ${p1.elo}, _id: ${p1._id}, id: ${p1.id})`);
    console.log(`Player 2: ${p2.name} (Elo: ${p2.elo}, _id: ${p2._id}, id: ${p2.id})`);

    // Create a mock tournament
    const tour = await db.tournaments.create({
      name: "Test Elo Tour",
      format: "Round Robin",
      teams: [teamA._id, teamB._id]
    });
    console.log(`Created tournament: ${tour.name}`);

    // Create a mock match
    const matchDocs = await db.matches.createMany([{
      tournamentId: tour._id,
      teamAId: teamA._id,
      teamBId: teamB._id,
      round: 1,
      stage: "Round 1",
      date: "2026-06-03"
    }]);
    
    const match = matchDocs[0];
    console.log(`Created match: ${match._id}`);

    // Populate Board 1 matchup
    console.log("Saving Board 1 matchup...");
    const updatedMatch = await db.matches.updateBoard(
      match._id,
      1, // boardNumber
      p1._id, // playerAId
      p2._id, // playerBId
      "1-0" // result: Player A wins
    );
    console.log("Board 1 saved. Result in DB:", updatedMatch.boards[0].result);

    // Call completion logic directly (Simulating POST /matches/:id/complete)
    console.log("\n⚡ Simulating match completion and Elo updates...");
    
    const K = 32;
    const board = updatedMatch.boards[0];
    
    // Retrieve players from DB to get fresh state
    const playerA = await db.players.getById(board.playerAId);
    const playerB = await db.players.getById(board.playerBId);

    console.log(`Before: ${playerA.name} Elo=${playerA.elo}, wins=${playerA.wins}`);
    console.log(`Before: ${playerB.name} Elo=${playerB.elo}, losses=${playerB.losses}`);

    // Elo Calculations
    const R_A = playerA.elo;
    const R_B = playerB.elo;
    const E_A = 1 / (1 + Math.pow(10, (R_B - R_A) / 400));
    const E_B = 1 / (1 + Math.pow(10, (R_A - R_B) / 400));

    let S_A = 1; // Win for A
    let S_B = 0; // Loss for B

    const newEloA = Math.round(R_A + K * (S_A - E_A));
    const newEloB = Math.round(R_B + K * (S_B - E_B));

    console.log(`Calculated new Elo: ${playerA.name}=${newEloA} (diff: ${newEloA - R_A}), ${playerB.name}=${newEloB} (diff: ${newEloB - R_B})`);

    // Run updates using player._id
    console.log("Running db.players.update using _id...");
    await db.players.update(playerA._id, {
      elo: newEloA,
      wins: playerA.wins + 1,
      losses: playerA.losses,
      draws: playerA.draws
    });

    await db.players.update(playerB._id, {
      elo: newEloB,
      wins: playerB.wins,
      losses: playerB.losses + 1,
      draws: playerB.draws
    });

    // Retrieve and verify
    const afterPlayerA = await db.players.getById(playerA._id);
    const afterPlayerB = await db.players.getById(playerB._id);

    console.log(`\nAfter: ${afterPlayerA.name} Elo=${afterPlayerA.elo}, wins=${afterPlayerA.wins} (Matches: ${afterPlayerA.matchesPlayed}, winPercent: ${afterPlayerA.winPercent}%)`);
    console.log(`After: ${afterPlayerB.name} Elo=${afterPlayerB.elo}, losses=${afterPlayerB.losses} (Matches: ${afterPlayerB.matchesPlayed}, winPercent: ${afterPlayerB.winPercent}%)`);

    if (afterPlayerA.elo === newEloA && afterPlayerB.elo === newEloB) {
      console.log("\n✅ ELO RATING UPDATES WORK CORRECTLY IN MONGO!");
    } else {
      console.log("\n❌ ERROR: RATING DATA NOT SAVED PROPERLY!");
    }

  } catch (err) {
    console.error("Test failed with error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

testEloUpdate();
