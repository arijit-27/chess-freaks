// Using global fetch
async function runTest() {
  const BASE_URL = 'http://localhost:5000/api';
  console.log("=== Long Format Tournament and Custom Match Creation Test ===");

  const timestamp = Date.now();

  try {
    // 1. Login
    console.log("Logging in...");
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    const loginData = await loginRes.json();
    console.log("Login response data:", loginData);
    const { token } = loginData;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // 2. Create Teams
    const teamAName = `Long Team A ${timestamp}`;
    const teamBName = `Long Team B ${timestamp}`;
    
    const tARes = await fetch(`${BASE_URL}/teams`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: teamAName, logo: "♞", owner: "Garry" })
    });
    const teamA = await tARes.json();

    const tBRes = await fetch(`${BASE_URL}/teams`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: teamBName, logo: "♟", owner: "Judit" })
    });
    const teamB = await tBRes.json();

    console.log(`Created Teams: ${teamA.name} and ${teamB.name}`);

    // Create a player for each team
    const p1Res = await fetch(`${BASE_URL}/players`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: `Long Player A ${timestamp}`, country: "NOR", teamId: teamA.id, elo: 2500 })
    });
    const p1 = await p1Res.json();

    const p2Res = await fetch(`${BASE_URL}/players`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: `Long Player B ${timestamp}`, country: "USA", teamId: teamB.id, elo: 2400 })
    });
    const p2 = await p2Res.json();

    // 3. Create Long Format Tournament
    const tourName = `Long League ${timestamp}`;
    console.log(`Creating Long Format Tournament: ${tourName}...`);
    const tourRes = await fetch(`${BASE_URL}/tournaments`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: tourName,
        format: "Long Format",
        startDate: "2026-06-04",
        endDate: "2026-06-10",
        teams: [teamA.id, teamB.id]
      })
    });
    const tour = await tourRes.json();
    console.log(`Created Tournament ID: ${tour.id || tour._id}. Format: ${tour.format}`);

    // 4. Verify no matches were auto-generated
    const matchesRes = await fetch(`${BASE_URL}/matches`, { headers });
    const matches = await matchesRes.json();
    const tourMatchesBefore = matches.filter(m => m.tournamentId === (tour.id || tour._id));
    console.log(`Auto-generated matches count (should be 0): ${tourMatchesBefore.length}`);
    if (tourMatchesBefore.length !== 0) {
      throw new Error("Fixtures were auto-generated for Long Format!");
    }

    // 5. Manually create a match
    console.log("Creating manual match...");
    const createMatchRes = await fetch(`${BASE_URL}/matches`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        tournamentId: tour.id || tour._id,
        teamAId: teamA.id,
        teamBId: teamB.id,
        round: 1,
        stage: "Custom Round 1",
        date: "2026-06-04"
      })
    });
    
    if (!createMatchRes.ok) {
      throw new Error(`Failed to create manual match: ${createMatchRes.status} - ${await createMatchRes.text()}`);
    }
    const match = await createMatchRes.json();
    console.log(`Manually created Match ID: ${match.id || match._id}`);

    // 6. Save boards and complete the match
    console.log("Setting board matchups...");
    // Just play Board 1 for simplicity of testing, and let's play other boards as null/pending?
    // Wait, the completeMatch endpoint requires all 4 boards to have playerA, playerB, and result!
    // So we must set all 4 boards.
    for (let boardNum = 1; boardNum <= 4; boardNum++) {
      await fetch(`${BASE_URL}/matches/${match.id || match._id}/boards`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ boardNumber: boardNum, playerAId: p1.id, playerBId: p2.id, result: '1-0' }) // Win for A
      });
    }

    console.log("Finalizing match...");
    const completeRes = await fetch(`${BASE_URL}/matches/${match.id || match._id}/complete`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ mvpPlayerId: p1.id })
    });
    const completeData = await completeRes.json();
    console.log("Match finalized. Winner team ID:", completeData.winnerTeamId);

    // 7. Verify standings points increased
    console.log("Checking team standings points...");
    const teamsRes = await fetch(`${BASE_URL}/teams`);
    const allTeams = await teamsRes.json();
    const updatedTeamA = allTeams.find(t => t.id === teamA.id);
    const updatedTeamB = allTeams.find(t => t.id === teamB.id);

    console.log(`Team A points: ${updatedTeamA.points} (expected 3)`);
    console.log(`Team B points: ${updatedTeamB.points} (expected 0)`);

    if (updatedTeamA.points === 3 && updatedTeamB.points === 0) {
      console.log("✅ LONG FORMAT AND CUSTOM MATCH CREATION VERIFICATION SUCCESSFUL!");
    } else {
      console.log("❌ VERIFICATION FAILED: Points mismatch!");
    }

  } catch (err) {
    console.error("Test failed:", err);
  }
}

runTest();
