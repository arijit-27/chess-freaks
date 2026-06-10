// server/tournamentHelper.js
const db = require('./db');

/**
 * Handle match progression for 'Two Team Revival' format when a match is completed.
 * @param {Object} match - The match before updates
 * @param {Object} updates - The updates applied to the match (containing game1Result, game2Result, isCompleted)
 */
async function handleRevivalMatchCompletion(match, updates) {
  // Only run progression logic when the match transitions to completed
  if (match.isCompleted || updates.isCompleted !== true) return;

  // Fetch the tournament format to ensure we only apply this logic to 'Two Team Revival'
  const tournament = await db.tournaments.getById(match.tournamentId);
  if (!tournament || tournament.format !== 'Two Team Revival') return;

  // 1. Get the final game results to determine the winner
  const g1 = updates.game1Result !== undefined ? updates.game1Result : match.game1Result;
  const g2 = updates.game2Result !== undefined ? updates.game2Result : match.game2Result;

  if (!g1 && !g2) return; // No results yet

  const playerAId = updates.playerAId !== undefined ? updates.playerAId : match.playerAId;
  const playerBId = updates.playerBId !== undefined ? updates.playerBId : match.playerBId;

  if (!playerAId || !playerBId) {
    console.log("Cannot process revival match progression: players are not set for both slots.");
    return;
  }

  // Calculate scores: wins = 1pt, draws = 0.5pt
  let scoreA = 0;
  let scoreB = 0;

  if (g1 && g1 !== 'NP') {
    if (g1 === 'playerA') scoreA += 1;
    else if (g1 === 'playerB') scoreB += 1;
    else if (g1 === 'draw') { scoreA += 0.5; scoreB += 0.5; }
  }
  if (g2 && g2 !== 'NP') {
    if (g2 === 'playerA') scoreA += 1;
    else if (g2 === 'playerB') scoreB += 1;
    else if (g2 === 'draw') { scoreA += 0.5; scoreB += 0.5; }
  }

  let winnerId = null;
  let loserId = null;

  if (scoreA > scoreB) {
    winnerId = playerAId;
    loserId = playerBId;
  } else if (scoreB > scoreA) {
    winnerId = playerBId;
    loserId = playerAId;
  } else {
    // It's a draw. Progression is not automatic. Admin can manually resolve.
    console.log(`Match ${match.matchNumber} is a draw (${scoreA} - ${scoreB}). No automatic progression.`);
    return;
  }

  // 2. Determine which team the loser belongs to
  const loserPlayer = await db.players.getById(loserId);
  if (!loserPlayer) {
    console.log(`Loser player ${loserId} not found.`);
    return;
  }

  const isLoserTeamA = loserPlayer.teamId && loserPlayer.teamId.toString() === match.teamAId.toString();

  // Get current revival lists
  let listA = tournament.revivalListA ? [...tournament.revivalListA] : [];
  let listB = tournament.revivalListB ? [...tournament.revivalListB] : [];
  let listAll = tournament.revivalList ? [...tournament.revivalList] : [];

  // Add the loser to the appropriate team's list
  if (isLoserTeamA) {
    listA.push(loserId);
  } else {
    listB.push(loserId);
  }
  listAll.push(loserId);

  // Fetch rosters for Team A and Team B to check for "all out"
  const allPlayers = await db.players.getAll();
  const rosterA = allPlayers.filter(p => p.teamId && p.teamId.toString() === match.teamAId.toString());
  const rosterB = allPlayers.filter(p => p.teamId && p.teamId.toString() === match.teamBId.toString());

  const rosterAIds = rosterA.map(p => p._id.toString());
  const rosterBIds = rosterB.map(p => p._id.toString());

  const listAIds = listA.map(id => id.toString());
  const listBIds = listB.map(id => id.toString());

  // Check if either team is now "all out"
  const isTeamAAllOut = rosterAIds.length > 0 && rosterAIds.every(id => listAIds.includes(id));
  const isTeamBAllOut = rosterBIds.length > 0 && rosterBIds.every(id => listBIds.includes(id));

  let nextPlayerAId = null;
  let nextPlayerBId = null;
  let updatedAllOutCountA = tournament.allOutCountA || 0;
  let updatedAllOutCountB = tournament.allOutCountB || 0;

  const isWinnerTeamA = winnerId.toString() === playerAId.toString();

  if (isTeamAAllOut && isLoserTeamA) {
    // Team A is all out! Team B gets +1 point.
    updatedAllOutCountA += 1;
    console.log("Team A is ALL OUT! Team B gets +1 point.");

    // Revive the player added last to listA (LIFO pop)
    const revivedId = listA.pop();
    const lastIdx = listAll.lastIndexOf(revivedId);
    if (lastIdx !== -1) listAll.splice(lastIdx, 1);

    nextPlayerAId = revivedId; // Revived Team A player
    nextPlayerBId = winnerId;  // Winner stays (Team B player)
  } else if (isTeamBAllOut && !isLoserTeamA) {
    // Team B is all out! Team A gets +1 point.
    updatedAllOutCountB += 1;
    console.log("Team B is ALL OUT! Team A gets +1 point.");

    // Revive the player added last to listB (LIFO pop)
    const revivedId = listB.pop();
    const lastIdx = listAll.lastIndexOf(revivedId);
    if (lastIdx !== -1) listAll.splice(lastIdx, 1);

    nextPlayerAId = winnerId;  // Winner stays (Team A player)
    nextPlayerBId = revivedId; // Revived Team B player
  } else {
    // Standard progression: winner stays, opponent is null (to be nominated)
    if (isWinnerTeamA) {
      nextPlayerAId = winnerId;
      nextPlayerBId = null;
    } else {
      nextPlayerAId = null;
      nextPlayerBId = winnerId;
    }
  }

  // Update tournament with new lists and counters
  await db.tournaments.update(tournament._id, {
    revivalList: listAll,
    revivalListA: listA,
    revivalListB: listB,
    allOutCountA: updatedAllOutCountA,
    allOutCountB: updatedAllOutCountB
  });

  // 3. Create or update the next match (Match Number + 1)
  const nextMatchNum = match.matchNumber + 1;
  const allMatches = await db.matches.getByTournament(tournament._id);
  const nextMatch = allMatches.find(m => m.matchNumber === nextMatchNum);

  if (nextMatch) {
    const nextUpdates = {};
    if (nextPlayerAId !== null) nextUpdates.playerAId = nextPlayerAId;
    if (nextPlayerBId !== null) nextUpdates.playerBId = nextPlayerBId;
    await db.matches.update(nextMatch._id, nextUpdates);
    console.log(`Updated existing match ${nextMatchNum} with players A:${nextPlayerAId} B:${nextPlayerBId}`);
  } else {
    await db.matches.create({
      tournamentId: tournament._id,
      teamAId: match.teamAId,
      teamBId: match.teamBId,
      round: 1,
      matchNumber: nextMatchNum,
      playerAId: nextPlayerAId,
      playerBId: nextPlayerBId,
      timeControl: match.timeControl || '10+6',
      variant: match.variant || 'Standard',
      stage: `Revival Match ${nextMatchNum}`,
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    console.log(`Created new match ${nextMatchNum} with players A:${nextPlayerAId} B:${nextPlayerBId}`);
  }
}

module.exports = {
  handleRevivalMatchCompletion
};
