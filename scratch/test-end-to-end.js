// Using global fetch
async function runTest() {
  const BASE_URL = 'http://localhost:5000/api';
  console.log("=== End-to-End Match Completion and Elo recertification test ===");

  const timestamp = Date.now();

  try {
    // 1. Login as Admin
    console.log("Logging in as Admin...");
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    
    if (!loginRes.ok) {
      const errText = await loginRes.text();
      throw new Error(`Login failed: ${loginRes.status} - ${errText}`);
    }

    const { token } = await loginRes.json();
    console.log("Login successful! Token acquired.");

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // 2. Create two teams with unique names
    const teamAName = `Knight Riders ${timestamp}`;
    const teamBName = `Pawn Stormers ${timestamp}`;

    console.log(`Creating Team A: ${teamAName}...`);
    const teamARes = await fetch(`${BASE_URL}/teams`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: teamAName, logo: "♞", owner: "Garry" })
    });
    if (!teamARes.ok) {
      throw new Error(`Failed to create Team A: ${teamARes.status} - ${await teamARes.text()}`);
    }
    const teamA = await teamARes.json();
    console.log(`Created Team A: ${teamA.name} (id: ${teamA.id})`);

    console.log(`Creating Team B: ${teamBName}...`);
    const teamBRes = await fetch(`${BASE_URL}/teams`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: teamBName, logo: "♟", owner: "Judit" })
    });
    if (!teamBRes.ok) {
      throw new Error(`Failed to create Team B: ${teamBRes.status} - ${await teamBRes.text()}`);
    }
    const teamB = await teamBRes.json();
    console.log(`Created Team B: ${teamB.name} (id: ${teamB.id})`);

    // 3. Create players and assign to teams
    console.log("Creating Player 1 (Team A)...");
    const p1Res = await fetch(`${BASE_URL}/players`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: `Magnus ${timestamp}`, country: "NOR", teamId: teamA.id, elo: 2800 })
    });
    const p1 = await p1Res.json();
    console.log(`Created Player 1: ${p1.name} (id: ${p1.id}, Elo: ${p1.elo})`);

    console.log("Creating Player 2 (Team A)...");
    const p2Res = await fetch(`${BASE_URL}/players`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: `Hikaru ${timestamp}`, country: "USA", teamId: teamA.id, elo: 2750 })
    });
    const p2 = await p2Res.json();
    console.log(`Created Player 2: ${p2.name} (id: ${p2.id}, Elo: ${p2.elo})`);

    console.log("Creating Player 3 (Team B)...");
    const p3Res = await fetch(`${BASE_URL}/players`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: `Pragg ${timestamp}`, country: "IND", teamId: teamB.id, elo: 2700 })
    });
    const p3 = await p3Res.json();
    console.log(`Created Player 3: ${p3.name} (id: ${p3.id}, Elo: ${p3.elo})`);

    console.log("Creating Player 4 (Team B)...");
    const p4Res = await fetch(`${BASE_URL}/players`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: `Gukesh ${timestamp}`, country: "IND", teamId: teamB.id, elo: 2750 })
    });
    const p4 = await p4Res.json();
    console.log(`Created Player 4: ${p4.name} (id: ${p4.id}, Elo: ${p4.elo})`);

    // 4. Create Tournament
    const tourName = `Grand Showdown ${timestamp}`;
    console.log(`Creating Tournament: ${tourName}...`);
    const tourRes = await fetch(`${BASE_URL}/tournaments`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: tourName,
        format: "Round Robin",
        startDate: "2026-06-03",
        endDate: "2026-06-05",
        teams: [teamA.id, teamB.id]
      })
    });
    if (!tourRes.ok) {
      throw new Error(`Failed to create tournament: ${tourRes.status} - ${await tourRes.text()}`);
    }
    const tour = await tourRes.json();
    console.log(`Created Tournament: ${tour.name} (id: ${tour.id})`);

    // 5. Get Match Fixtures
    console.log("Fetching Matches...");
    const matchesRes = await fetch(`${BASE_URL}/matches`, { headers });
    const matches = await matchesRes.json();
    console.log(`Fetched ${matches.length} matches.`);

    // Select the match generated for our specific tournament
    const tourIdStr = tour.id || tour._id;
    const match = matches.find(m => m.tournamentId === tourIdStr);
    if (!match) {
      throw new Error(`No match generated for tournament ${tourIdStr}!`);
    }
    console.log(`Selected Match ID: ${match.id || match._id} (${teamA.name} vs ${teamB.name})`);

    // 6. Save Board match pairings and outcomes
    console.log("Saving Board 1...");
    await fetch(`${BASE_URL}/matches/${match.id || match._id}/boards`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ boardNumber: 1, playerAId: p1.id, playerBId: p3.id, result: '1-0' })
    });

    console.log("Saving Board 2...");
    await fetch(`${BASE_URL}/matches/${match.id || match._id}/boards`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ boardNumber: 2, playerAId: p2.id, playerBId: p4.id, result: '0-1' })
    });

    console.log("Saving Board 3...");
    await fetch(`${BASE_URL}/matches/${match.id || match._id}/boards`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ boardNumber: 3, playerAId: p1.id, playerBId: p4.id, result: '0.5-0.5' })
    });

    console.log("Saving Board 4...");
    await fetch(`${BASE_URL}/matches/${match.id || match._id}/boards`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ boardNumber: 4, playerAId: p2.id, playerBId: p3.id, result: '1-0' })
    });

    console.log("All boards saved.");

    // 7. Finalize Match
    console.log("Finalizing match and recalculating ratings...");
    const completeRes = await fetch(`${BASE_URL}/matches/${match.id || match._id}/complete`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ mvpPlayerId: p1.id })
    });

    if (!completeRes.ok) {
      const errText = await completeRes.text();
      throw new Error(`Match finalization failed: ${completeRes.status} - ${errText}`);
    }

    const completeData = await completeRes.json();
    console.log("Match finalized response:", completeData);

    // 8. Fetch player data again to see if Elo updated
    console.log("\nFetching players post-match to check Elo ratings...");
    const playersRes = await fetch(`${BASE_URL}/players`, { headers });
    const updatedPlayers = await playersRes.json();

    const testPlayerIds = [p1.id, p2.id, p3.id, p4.id];
    updatedPlayers.forEach(p => {
      if (testPlayerIds.includes(p.id)) {
        const initialElo = [p1, p2, p3, p4].find(x => x.id === p.id)?.elo;
        console.log(`Player: ${p.name}, Team: ${p.teamId ? (p.teamId.name || p.teamId) : 'None'}, Elo Before: ${initialElo}, Elo After: ${p.elo}, Diff: ${p.elo - initialElo}`);
      }
    });

  } catch (error) {
    console.error("Test error:", error);
  }
}

runTest();
