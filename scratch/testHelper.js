// scratch/testHelper.js

// Mock players with team assignments
const mockPlayers = {
  playerA1: { _id: 'playerA1', name: 'Alice (Team A)', teamId: 'teamA_id', elo: 1500 },
  playerA2: { _id: 'playerA2', name: 'Andy (Team A)', teamId: 'teamA_id', elo: 1600 },
  playerB1: { _id: 'playerB1', name: 'Bob (Team B)', teamId: 'teamB_id', elo: 1500 },
  playerB2: { _id: 'playerB2', name: 'Ben (Team B)', teamId: 'teamB_id', elo: 1600 }
};

const mockTournament = {
  _id: 'tour123',
  name: 'Revival Test Tourney',
  format: 'Two Team Revival',
  teams: ['teamA_id', 'teamB_id'],
  revivalList: [],
  revivalListA: [],
  revivalListB: [],
  allOutCountA: 0,
  allOutCountB: 0
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
  players: {
    getById: async (id) => {
      console.log(`[DB Mock] Fetching player by id: ${id}`);
      return mockPlayers[id];
    },
    getAll: async () => {
      console.log(`[DB Mock] Fetching all players`);
      return Object.values(mockPlayers);
    }
  },
  matches: {
    getByTournament: async (tourId) => {
      console.log(`[DB Mock] Fetching matches for tournament: ${tourId}`);
      return [];
    },
    create: async (data) => {
      console.log('[DB Mock] Creating new match with data:', data);
      return { _id: 'next_match_id', ...data };
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
  console.log("=== SCENARIO 1: Player A1 loses to Player B1 ===");
  mockTournament.revivalList = [];
  mockTournament.revivalListA = [];
  mockTournament.revivalListB = [];
  mockTournament.allOutCountA = 0;
  mockTournament.allOutCountB = 0;

  const match1 = {
    _id: 'match1',
    tournamentId: 'tour123',
    teamAId: 'teamA_id',
    teamBId: 'teamB_id',
    round: 1,
    matchNumber: 1,
    playerAId: 'playerA1',
    playerBId: 'playerB1',
    timeControl: '10+6',
    variant: 'Standard',
    isCompleted: false
  };

  const updates1 = {
    game1Result: 'playerB', // Bob wins
    game2Result: 'playerB',
    isCompleted: true
  };

  await handleRevivalMatchCompletion(match1, updates1);

  console.log("\nTournament after Match 1:", mockTournament);
  if (mockTournament.revivalListA.includes('playerA1')) {
    console.log("✅ SUCCESS: Player A1 added to Team A revival list.");
  } else {
    console.log("❌ FAILURE: Player A1 not in Team A revival list.");
  }

  console.log("\n=== SCENARIO 2: Player A2 loses to Player B1 (Team A All-Out) ===");
  // Team A is currently [playerA1, playerA2].
  // Since playerA1 is already in revivalListA, if playerA2 loses now, Team A goes all out!
  
  const match2 = {
    _id: 'match2',
    tournamentId: 'tour123',
    teamAId: 'teamA_id',
    teamBId: 'teamB_id',
    round: 1,
    matchNumber: 2,
    playerAId: 'playerA2',
    playerBId: 'playerB1',
    timeControl: '10+6',
    variant: 'Standard',
    isCompleted: false
  };

  const updates2 = {
    game1Result: 'playerB', // Bob wins again
    game2Result: 'playerB',
    isCompleted: true
  };

  await handleRevivalMatchCompletion(match2, updates2);

  console.log("\nTournament after Match 2 (All-Out):", mockTournament);
  if (mockTournament.allOutCountA === 1) {
    console.log("✅ SUCCESS: Team A allOutCountA incremented to 1 (Team B gets +1 point).");
  } else {
    console.log("❌ FAILURE: Team A allOutCountA is " + mockTournament.allOutCountA);
  }

  // Under LIFO stack, playerA2 lost last, so playerA2 should be popped and revived
  // So revivalListA should be left with only 'playerA1', and 'playerA2' should be popped
  if (!mockTournament.revivalListA.includes('playerA2') && mockTournament.revivalListA.includes('playerA1')) {
    console.log("✅ SUCCESS: playerA2 (last in) was revived (popped) from revivalListA.");
  } else {
    console.log("❌ FAILURE: LIFO stack popping failed. revivalListA:", mockTournament.revivalListA);
  }
}

runTest().catch(console.error);
