// scratch/test-api.js
const assert = require('assert');

console.log("==================================================");
console.log("   CHESS FREAKS AUTOMATED TESTING SUITE   ");
console.log("==================================================");

// --- ELO RATING CALCULATION TEST ---
function calculateEloChange(ratingA, ratingB, scoreA, K = 32) {
  const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  const expectedB = 1 / (1 + Math.pow(10, (ratingA - ratingB) / 400));
  
  const scoreB = 1 - scoreA; // Draw is 0.5 and 0.5, win is 1 and 0, loss is 0 and 1
  
  const newRatingA = Math.round(ratingA + K * (scoreA - expectedA));
  const newRatingB = Math.round(ratingB + K * (scoreB - expectedB));
  
  return { newRatingA, newRatingB };
}

function testEloRatings() {
  console.log("\n🧪 Running Elo rating formula tests...");
  
  // Test Case 1: Equal strength players, Player A wins
  const test1 = calculateEloChange(1500, 1500, 1);
  console.log(`- Equal ratings (1500 vs 1500), A wins: A=${test1.newRatingA} (expected 1516), B=${test1.newRatingB} (expected 1484)`);
  assert.strictEqual(test1.newRatingA, 1516);
  assert.strictEqual(test1.newRatingB, 1484);
  
  // Test Case 2: Unequal strength, Underdog wins
  // Player A (1600 Elo) vs Player B (2000 Elo). Player A wins.
  const test2 = calculateEloChange(1600, 2000, 1);
  console.log(`- Underdog wins (1600 vs 2000), A wins: A=${test2.newRatingA} (expected 1629), B=${test2.newRatingB} (expected 1971)`);
  assert.strictEqual(test2.newRatingA, 1629);
  assert.strictEqual(test2.newRatingB, 1971);

  // Test Case 3: Unequal strength, Favourite wins
  // Player A (2400 Elo) vs Player B (1600 Elo). Player A wins.
  const test3 = calculateEloChange(2400, 1600, 1);
  console.log(`- Favourite wins (2400 vs 1600), A wins: A=${test3.newRatingA} (expected 2400), B=${test3.newRatingB} (expected 1600)`);
  assert.strictEqual(test3.newRatingA, 2400); // Change is less than 0.5, rounds to 2400
  assert.strictEqual(test3.newRatingB, 1600);
  
  // Test Case 4: Draw
  const test4 = calculateEloChange(1800, 1800, 0.5);
  console.log(`- Equal ratings (1800 vs 1800), Draw: A=${test4.newRatingA} (expected 1800), B=${test4.newRatingB} (expected 1800)`);
  assert.strictEqual(test4.newRatingA, 1800);
  assert.strictEqual(test4.newRatingB, 1800);
  
  console.log("✅ Elo rating formulas verified successfully!");
}

// --- ROUND ROBIN SCHEDULER TEST ---
function simulateRoundRobinPairings(teams) {
  const list = [...teams];
  if (list.length % 2 !== 0) {
    list.push('BYE');
  }
  const rounds = list.length - 1;
  const half = list.length / 2;
  const pairings = [];

  for (let round = 0; round < rounds; round++) {
    for (let i = 0; i < half; i++) {
      const home = list[i];
      const away = list[list.length - 1 - i];
      if (home !== 'BYE' && away !== 'BYE') {
        pairings.push({ round: round + 1, home, away });
      }
    }
    // Rotate list (fixed first element)
    const last = list.pop();
    list.splice(1, 0, last);
  }
  return pairings;
}

function testRoundRobinScheduler() {
  console.log("\n🧪 Running Round Robin scheduling pairings tests...");
  
  const testTeams = ["team-1", "team-2", "team-3", "team-4"];
  const pairings = simulateRoundRobinPairings(testTeams);
  
  console.log(`- Pairings generated for 4 teams: ${pairings.length} fixtures (expected 6)`);
  assert.strictEqual(pairings.length, 6);
  
  // Check if every team plays exactly 3 matches
  const matchCounts = {};
  testTeams.forEach(t => matchCounts[t] = 0);
  
  pairings.forEach(p => {
    matchCounts[p.home]++;
    matchCounts[p.away]++;
  });
  
  testTeams.forEach(t => {
    console.log(`  * Team ${t} plays ${matchCounts[t]} fixtures (expected 3)`);
    assert.strictEqual(matchCounts[t], 3);
  });
  
  // Check that no team plays the same opponent twice
  const playedOpponents = {};
  testTeams.forEach(t => playedOpponents[t] = new Set());
  
  pairings.forEach(p => {
    assert.ok(!playedOpponents[p.home].has(p.away), `Repeat pairing found: ${p.home} vs ${p.away}`);
    playedOpponents[p.home].add(p.away);
    playedOpponents[p.away].add(p.home);
  });

  console.log("✅ Round Robin scheduler logic verified successfully!");
}

try {
  testEloRatings();
  testRoundRobinScheduler();
  console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY!");
} catch (e) {
  console.error("\n❌ TEST FAILURE OBSERVED:", e);
  process.exit(1);
}
