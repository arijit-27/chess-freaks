// scratch/explore-db.js
require('dotenv').config();
const mongoose = require('mongoose');
const db = require('../server/db');

async function explore() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/chess-freaks';
  console.log("Connecting to:", uri);
  try {
    await db.connectDB();
    console.log("Connected to MongoDB.\n");

    const teams = await db.teams.getAll();
    console.log(`Teams Count: ${teams.length}`);
    teams.forEach(t => {
      console.log(`- Team: ${t.name} (ID: ${t._id}), Points: ${t.points}, Wins: ${t.wins}, Losses: ${t.losses}`);
    });

    const players = await db.players.getAll();
    console.log(`\nPlayers Count: ${players.length}`);
    players.forEach(p => {
      console.log(`- Player: ${p.name} (ID: ${p._id}), TeamId: ${p.teamId}, Elo: ${p.elo}, Wins: ${p.wins}, Losses: ${p.losses}, Draws: ${p.draws}`);
    });

    const matches = await db.matches.getAll();
    console.log(`\nMatches Count: ${matches.length}`);
    matches.forEach(m => {
      console.log(`- Match ID: ${m._id}, Round: ${m.round}, Completed: ${m.isCompleted}`);
      m.boards.forEach(b => {
        console.log(`  * Board ${b.boardNumber}: playerA=${b.playerAId}, playerB=${b.playerBId}, result=${b.result}`);
      });
    });

  } catch (err) {
    console.error("Error exploring DB:", err);
  } finally {
    await mongoose.disconnect();
  }
}

explore();
