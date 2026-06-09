// scratch/testHelper.js

// Mock data
const mockTournament = {
  _id: 'tour123',
  name: 'Revival Test Tourney',
  format: 'Two Team Revival',
  teams: ['teamA_id', 'teamB_id'],
  revivalList: []
};

const mockMatch = {
  _id: 'match1',
  tournamentId: 'tour123',
  teamAId: 'teamA_id',
  teamBId: 'teamB_id',
  round: 1,
  matchNumber: 5,
  playerAId: 'playerA_id', // Team A player
  playerBId: 'playerB_id', // Team B player
  timeControl: '10+6',
  variant: 'Standard',
  isCompleted: false,
  game1Result: null,
  game2Result: null
};

// Mock dbClient
const mockDb = {
  tournaments: {
    getById: async (id) => {
      console.log(`[DB Mock] Fetching tournament by id: ${id}`);
      return mockTournament;
    },
    update: async (id, updates) => {
      console.log(`[DB Mock] Updating tournament ${id} with:`, updates);
      Object.assign(mockTournament, updates);
      return mockTournament;
    }
  },
  matches: {
    getByTournament: async (tourId) => {
      console.log(`[DB Mock] Fetching matches for tournament: ${tourId}`);
      return []; // Return empty so a new match is created
    },
    create: async (data) => {
      console.log('[DB Mock] Creating new match with data:', data);
      return { _id: 'match2', ...data };
    },
    update: async (id, updates) => {
      console.log(`[DB Mock] Updating match ${id} with:`, updates);
      return { _id: id, ...updates };
    }
  }
};

// Mock the DB module in the require cache BEFORE requiring tournamentHelper
require.cache[require.resolve('../server/db')] = {
  id: require.resolve('../server/db'),
  filename: require.resolve('../server/db'),
  loaded: true,
  exports: mockDb
};

// Now import the helper
const { handleRevivalMatchCompletion } = require('../server/tournamentHelper');

async function runTest() {
  console.log("--- START TEST: Player A Wins ---");
  // Reset tournament revival list
  mockTournament.revivalList = [];
  
  const updates = {
    game1Result: 'playerA',
    game2Result: 'draw',
    isCompleted: true
  };

  await handleRevivalMatchCompletion(mockMatch, updates);

  console.log("\nTournament after progression:", mockTournament);
  if (mockTournament.revivalList.includes('playerB_id')) {
    console.log("✅ SUCCESS: Player B (loser) added to revival list.");
  } else {
    console.log("❌ FAILURE: Player B not added to revival list.");
  }

  console.log("\n--- START TEST: Player B Wins ---");
  mockTournament.revivalList = [];
  
  const updatesB = {
    game1Result: 'playerB',
    game2Result: 'playerB',
    isCompleted: true
  };

  await handleRevivalMatchCompletion(mockMatch, updatesB);

  console.log("\nTournament after progression:", mockTournament);
  if (mockTournament.revivalList.includes('playerA_id')) {
    console.log("✅ SUCCESS: Player A (loser) added to revival list.");
  } else {
    console.log("❌ FAILURE: Player A not added to revival list.");
  }
}

runTest().catch(console.error);
