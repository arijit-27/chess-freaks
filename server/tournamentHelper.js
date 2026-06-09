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

  // 2. Put the loser on the tournament's revival list
  const currentRevivalList = tournament.revivalList ? [...tournament.revivalList] : [];
  
  // Add to revival list if not already present, or add anyway to track sequence
  currentRevivalList.push(loserId);
  await db.tournaments.update(tournament._id, { revivalList: currentRevivalList });

  // 3. Create or update the next match (Match Number + 1)
  const nextMatchNum = match.matchNumber + 1;
  const allMatches = await db.matches.getByTournament(tournament._id);
  const nextMatch = allMatches.find(m => m.matchNumber === nextMatchNum);

  // Determine if the winner is from Team A
  const isWinnerTeamA = winnerId.toString() === playerAId.toString();

  if (nextMatch) {
    // Next match already exists, update the winner in their correct slot
    const nextUpdates = {};
    if (isWinnerTeamA) {
      nextUpdates.playerAId = winnerId;
    } else {
      nextUpdates.playerBId = winnerId;
    }
    await db.matches.update(nextMatch._id, nextUpdates);
    console.log(`Updated existing match ${nextMatchNum} with winner ${winnerId}`);
  } else {
    // Create new next match
    await db.matches.create({
      tournamentId: tournament._id,
      teamAId: match.teamAId,
      teamBId: match.teamBId,
      round: 1,
      matchNumber: nextMatchNum,
      playerAId: isWinnerTeamA ? winnerId : null,
      playerBId: !isWinnerTeamA ? winnerId : null,
      timeControl: match.timeControl || '10+6',
      variant: match.variant || 'Standard',
      stage: `Revival Match ${nextMatchNum}`,
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    console.log(`Created new match ${nextMatchNum} with winner ${winnerId} in its slot.`);
  }
}

module.exports = {
  handleRevivalMatchCompletion
};
