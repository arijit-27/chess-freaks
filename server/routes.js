// server/routes.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db');
const socket = require('./socket');

const JWT_SECRET = 'chessfreaks_secret_key_2026';

// Middleware to authenticate JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: "Access token required" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token" });
    req.user = user;
    next();
  });
}

// Middleware to restrict to Admin
function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: "Administrator privileges required" });
  }
}

// --- AUTH ROUTES ---
router.post('/auth/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const existing = await db.users.getByUsername(username);
    if (existing) {
      return res.status(400).json({ error: "Username already taken" });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const newUser = await db.users.create({
      username,
      passwordHash,
      role: role || 'viewer'
    });

    const token = jwt.sign({ id: newUser._id, username: newUser.username, role: newUser.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: newUser._id, username: newUser.username, role: newUser.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const user = await db.users.getByUsername(username);
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await db.users.getById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ id: user._id, username: user.username, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- TEAMS ROUTES ---
router.get('/teams', async (req, res) => {
  try {
    const list = await db.teams.getAll();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/teams/:id', async (req, res) => {
  try {
    const team = await db.teams.getById(req.params.id);
    if (!team) return res.status(404).json({ error: "Team not found" });
    
    // Get roster
    const allPlayers = await db.players.getAll();
    const roster = allPlayers.filter(p => p.teamId && p.teamId.toString() === team._id.toString());
    res.json({
      id: team._id,
      name: team.name,
      logo: team.logo,
      owner: team.owner,
      budget: team.budget,
      points: team.points,
      wins: team.wins,
      losses: team.losses,
      draws: team.draws,
      boardPoints: team.boardPoints,
      roster
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/teams', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, logo, owner, budget } = req.body;
    if (!name) return res.status(400).json({ error: "Team name is required" });

    const newTeam = await db.teams.create({ name, logo, owner, budget: Number(budget) || 1000 });
    res.status(201).json(newTeam);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/teams/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const updated = await db.teams.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Team not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/teams/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await db.teams.delete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- PLAYERS ROUTES ---
router.get('/players', async (req, res) => {
  try {
    let list = await db.players.getAll();

    // Simple query parameter search/filtering
    const { name, team, eloMin, eloMax, title } = req.query;

    if (name) {
      list = list.filter(p => p.name.toLowerCase().includes(name.toLowerCase()));
    }
    if (team) {
      list = list.filter(p => p.teamId && p.teamId.toString() === team);
    }
    if (eloMin) {
      list = list.filter(p => p.elo >= Number(eloMin));
    }
    if (eloMax) {
      list = list.filter(p => p.elo <= Number(eloMax));
    }
    if (title) {
      list = list.filter(p => {
        const elo = p.elo;
        let t = "";
        if (elo >= 2500) t = "GM";
        else if (elo >= 2300) t = "IM";
        else if (elo >= 2000) t = "CFM";
        return t === title;
      });
    }

    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/players', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, country, teamId, elo, photo } = req.body;
    if (!name) return res.status(400).json({ error: "Player name is required" });

    const newPlayer = await db.players.create({
      name,
      country,
      teamId: teamId || null,
      elo: Number(elo) || 1500,
      photo
    });
    res.status(201).json(newPlayer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/players/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const updated = await db.players.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Player not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/players/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await db.players.delete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- TOURNAMENTS ROUTES ---
router.get('/tournaments', async (req, res) => {
  try {
    const list = await db.tournaments.getAll();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/tournaments', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, format, startDate, endDate, teams } = req.body;
    if (!name || !format || !teams || teams.length < 2) {
      return res.status(400).json({ error: "Name, format, and at least 2 teams are required" });
    }

    const tour = await db.tournaments.create({ name, format, startDate, endDate, teams });
    
    // Auto-generate matches based on format
    await generateTournamentFixtures(tour);

    res.status(201).json(tour);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/tournaments/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await db.tournaments.delete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- MATCHES ROUTES ---
// --- HELPER FUNCTION FOR DYNAMIC TEAM STANDINGS ---
async function recalculateTeamStandings() {
  try {
    const teams = await db.teams.getAll();
    const tournaments = await db.tournaments.getAll();
    const matches = await db.matches.getAll();

    const teamStats = {};
    teams.forEach(t => {
      teamStats[t._id.toString()] = {
        points: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        boardPoints: 0
      };
    });

    for (const tour of tournaments) {
      const tourMatches = matches.filter(m => m.tournamentId.toString() === tour._id.toString());
      const teamAId = tour.teams[0]?.toString();
      const teamBId = tour.teams[1]?.toString();

      if (!teamAId || !teamBId) continue;

      // Group matches by round
      const rounds = {};
      tourMatches.forEach(m => {
        if (!rounds[m.round]) rounds[m.round] = [];
        rounds[m.round].push(m);
      });

      let tourPointsA = 0;
      let tourPointsB = 0;
      let tourBoardPointsA = 0;
      let tourBoardPointsB = 0;

      for (const roundNum in rounds) {
        let roundBoardPointsA = 0;
        let roundBoardPointsB = 0;
        let hasGames = false;

        rounds[roundNum].forEach(m => {
          if (!m.isCompleted) return;

          // Game 1
          if (m.game1Result && m.game1Result !== 'NP') {
            hasGames = true;
            if (m.game1Result === 'playerA') {
              roundBoardPointsA += 1;
              tourBoardPointsA += 1;
            } else if (m.game1Result === 'playerB') {
              roundBoardPointsB += 1;
              tourBoardPointsB += 1;
            } else if (m.game1Result === 'draw') {
              roundBoardPointsA += 0.5;
              roundBoardPointsB += 0.5;
              tourBoardPointsA += 0.5;
              tourBoardPointsB += 0.5;
            }
          }

          // Game 2
          if (m.game2Result && m.game2Result !== 'NP') {
            hasGames = true;
            if (m.game2Result === 'playerA') {
              roundBoardPointsA += 1;
              tourBoardPointsA += 1;
            } else if (m.game2Result === 'playerB') {
              roundBoardPointsB += 1;
              tourBoardPointsB += 1;
            } else if (m.game2Result === 'draw') {
              roundBoardPointsA += 0.5;
              roundBoardPointsB += 0.5;
              tourBoardPointsA += 0.5;
              tourBoardPointsB += 0.5;
            }
          }
        });

        if (hasGames) {
          if (roundBoardPointsA > roundBoardPointsB) {
            tourPointsA += 1;
          } else if (roundBoardPointsB > roundBoardPointsA) {
            tourPointsB += 1;
          } else {
            tourPointsA += 0.5;
            tourPointsB += 0.5;
          }
        }
      }

      const finalScoreA = tourBoardPointsA + tourPointsA;
      const finalScoreB = tourBoardPointsB + tourPointsB;

      if (teamStats[teamAId]) teamStats[teamAId].boardPoints += tourBoardPointsA;
      if (teamStats[teamBId]) teamStats[teamBId].boardPoints += tourBoardPointsB;

      if (teamStats[teamAId]) teamStats[teamAId].points += finalScoreA;
      if (teamStats[teamBId]) teamStats[teamBId].points += finalScoreB;

      if (tour.status === 'COMPLETED') {
        if (finalScoreA > finalScoreB) {
          if (teamStats[teamAId]) teamStats[teamAId].wins += 1;
          if (teamStats[teamBId]) teamStats[teamBId].losses += 1;
        } else if (finalScoreB > finalScoreA) {
          if (teamStats[teamBId]) teamStats[teamBId].wins += 1;
          if (teamStats[teamAId]) teamStats[teamAId].losses += 1;
        } else {
          if (teamStats[teamAId]) teamStats[teamAId].draws += 1;
          if (teamStats[teamBId]) teamStats[teamBId].draws += 1;
        }
      }
    }

    for (const teamId in teamStats) {
      const stats = teamStats[teamId];
      await db.teams.update(teamId, stats);
    }
  } catch (err) {
    console.error("Error in recalculateTeamStandings:", err);
  }
}

// --- MATCHES ROUTES ---
router.get('/matches', async (req, res) => {
  try {
    const list = await db.matches.getAll();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/matches', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { tournamentId, round, matchNumber, playerAId, playerBId, timeControl, variant, matchLink, date } = req.body;
    if (!tournamentId || !round) {
      return res.status(400).json({ error: "tournamentId and round are required" });
    }

    const tournament = await db.tournaments.getById(tournamentId);
    if (!tournament) return res.status(404).json({ error: "Tournament not found" });

    const teamAId = tournament.teams[0];
    const teamBId = tournament.teams[1];

    if (!teamAId || !teamBId) {
      return res.status(400).json({ error: "Tournament must have at least 2 teams assigned" });
    }

    const newMatch = await db.matches.create({
      tournamentId,
      teamAId,
      teamBId,
      round: Number(round),
      matchNumber: Number(matchNumber) || 1,
      playerAId: playerAId || null,
      playerBId: playerBId || null,
      timeControl: timeControl || '10+6',
      variant: variant || 'Standard',
      matchLink: matchLink || '',
      game1Result: null,
      game2Result: null,
      isCompleted: false,
      eloProcessed: false,
      date: date || new Date().toISOString().split('T')[0]
    });

    await recalculateTeamStandings();
    const allTeams = await db.teams.getAll();
    socket.broadcast("SCOREBOARD_UPDATE", {
      match: newMatch,
      standings: allTeams
    });

    res.status(201).json(newMatch);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/matches/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      playerAId,
      playerBId,
      timeControl,
      variant,
      matchLink,
      game1Result,
      game2Result,
      isCompleted,
      mvpPlayerId,
      round,
      matchNumber,
      date
    } = req.body;

    const match = await db.matches.getById(req.params.id);
    if (!match) return res.status(404).json({ error: "Match not found" });

    const updates = {};
    if (playerAId !== undefined) updates.playerAId = playerAId;
    if (playerBId !== undefined) updates.playerBId = playerBId;
    if (timeControl !== undefined) updates.timeControl = timeControl;
    if (variant !== undefined) updates.variant = variant;
    if (matchLink !== undefined) updates.matchLink = matchLink;
    if (game1Result !== undefined) updates.game1Result = game1Result;
    if (game2Result !== undefined) updates.game2Result = game2Result;
    if (isCompleted !== undefined) updates.isCompleted = isCompleted;
    if (mvpPlayerId !== undefined) updates.mvpPlayerId = mvpPlayerId;
    if (round !== undefined) updates.round = Number(round);
    if (matchNumber !== undefined) updates.matchNumber = Number(matchNumber);
    if (date !== undefined) updates.date = date;

    // Process Elo calculations
    if (isCompleted && !match.eloProcessed) {
      const K = 32;
      const pA = await db.players.getById(playerAId || match.playerAId);
      const pB = await db.players.getById(playerBId || match.playerBId);

      if (pA && pB) {
        let eloA = pA.elo;
        let eloB = pB.elo;

        let winsA = 0, lossesA = 0, drawsA = 0;
        let winsB = 0, lossesB = 0, drawsB = 0;

        const g1 = game1Result !== undefined ? game1Result : match.game1Result;
        if (g1 && g1 !== 'NP') {
          const E_A = 1 / (1 + Math.pow(10, (eloB - eloA) / 400));
          const E_B = 1 / (1 + Math.pow(10, (eloA - eloB) / 400));

          let S_A = 0.5, S_B = 0.5;
          if (g1 === 'playerA') { S_A = 1; S_B = 0; winsA++; lossesB++; }
          else if (g1 === 'playerB') { S_A = 0; S_B = 1; lossesA++; winsB++; }
          else if (g1 === 'draw') { drawsA++; drawsB++; }

          eloA = Math.round(eloA + K * (S_A - E_A));
          eloB = Math.round(eloB + K * (S_B - E_B));
        }

        const g2 = game2Result !== undefined ? game2Result : match.game2Result;
        if (g2 && g2 !== 'NP') {
          const E_A = 1 / (1 + Math.pow(10, (eloB - eloA) / 400));
          const E_B = 1 / (1 + Math.pow(10, (eloA - eloB) / 400));

          let S_A = 0.5, S_B = 0.5;
          if (g2 === 'playerA') { S_A = 1; S_B = 0; winsA++; lossesB++; }
          else if (g2 === 'playerB') { S_A = 0; S_B = 1; lossesA++; winsB++; }
          else if (g2 === 'draw') { drawsA++; drawsB++; }

          eloA = Math.round(eloA + K * (S_A - E_A));
          eloB = Math.round(eloB + K * (S_B - E_B));
        }

        // Update database records
        await db.players.update(pA._id, {
          elo: eloA,
          wins: (pA.wins || 0) + winsA,
          losses: (pA.losses || 0) + lossesA,
          draws: (pA.draws || 0) + drawsA,
        });

        await db.players.update(pB._id, {
          elo: eloB,
          wins: (pB.wins || 0) + winsB,
          losses: (pB.losses || 0) + lossesB,
          draws: (pB.draws || 0) + drawsB,
        });
      }
      updates.eloProcessed = true;
    }

    const updatedMatch = await db.matches.update(req.params.id, updates);

    await recalculateTeamStandings();
    const allTeams = await db.teams.getAll();
    socket.broadcast("SCOREBOARD_UPDATE", {
      match: updatedMatch,
      standings: allTeams
    });

    res.json(updatedMatch);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/matches/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const match = await db.matches.getById(req.params.id);
    if (!match) return res.status(404).json({ error: "Match not found" });

    await db.matches.delete(req.params.id);

    await recalculateTeamStandings();
    const allTeams = await db.teams.getAll();
    socket.broadcast("SCOREBOARD_UPDATE", {
      standings: allTeams
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- AUCTION ROUTES ---
router.get('/auctions/active', async (req, res) => {
  try {
    const active = await db.auctions.getActive();
    if (!active) return res.json(null);
    
    const player = await db.players.getById(active.playerId);
    res.json({ auction: active, player });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/auctions/start', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { playerId } = req.body;
    if (!playerId) return res.status(400).json({ error: "playerId is required" });

    const player = await db.players.getById(playerId);
    if (!player) return res.status(404).json({ error: "Player not found" });
    if (player.teamId) return res.status(400).json({ error: "Player is already signed to a team" });

    const newAuction = await db.auctions.start(playerId);
    
    // Broadcast live auction start
    socket.broadcast("AUCTION_STATUS", {
      type: 'START',
      auction: newAuction,
      player
    });

    res.json(newAuction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/auctions/bid', authenticateToken, async (req, res) => {
  try {
    const { auctionId, teamId, amount } = req.body;
    if (!auctionId || !teamId || !amount) {
      return res.status(400).json({ error: "auctionId, teamId, and amount are required" });
    }

    const result = await db.auctions.placeBid(auctionId, teamId, Number(amount));
    if (result.error) return res.status(400).json({ error: result.error });

    // Broadcast live bid
    socket.broadcast("AUCTION_BID", {
      auction: result.auction,
      newBid: { teamId, amount }
    });

    res.json(result.auction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/auctions/complete', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { auctionId, unsold } = req.body;
    if (!auctionId) return res.status(400).json({ error: "auctionId is required" });

    const completed = await db.auctions.complete(auctionId, unsold);
    if (!completed) return res.status(404).json({ error: "Auction not found" });

    const player = await db.players.getById(completed.playerId);
    const team = completed.currentBidderTeamId ? await db.teams.getById(completed.currentBidderTeamId) : null;

    // Broadcast live auction completion
    socket.broadcast("AUCTION_STATUS", {
      type: 'COMPLETE',
      auction: completed,
      player,
      team,
      unsold: !!unsold
    });

    res.json({ success: true, auction: completed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- HELPER FUNCTION FOR SCHEDULING FIXTURES ---
async function generateTournamentFixtures(tour) {
  const format = tour.format;
  if (format === 'Long Format') {
    // No initial fixtures generated, matches will be added manually
    return;
  }
  const teams = tour.teams; // Team ObjectIds list
  const numTeams = teams.length;

  await db.matches.deleteByTournament(tour._id);

  let scheduledMatches = [];

  if (format === 'Round Robin' || format === 'League Format') {
    // Round Robin Scheduler (Circle Method)
    const list = [...teams];
    if (list.length % 2 !== 0) {
      list.push('BYE'); // If odd, add BYE (we will ignore BYE matches in Express)
    }
    const rounds = list.length - 1;
    const half = list.length / 2;

    const totalIterations = format === 'League Format' ? 2 : 1; // League plays double round-robin

    for (let iteration = 0; iteration < totalIterations; iteration++) {
      for (let round = 0; round < rounds; round++) {
        const roundNumber = iteration * rounds + round + 1;
        for (let i = 0; i < half; i++) {
          const home = list[i];
          const away = list[list.length - 1 - i];

          if (home !== 'BYE' && away !== 'BYE') {
            scheduledMatches.push({
              tournamentId: tour._id,
              teamAId: iteration % 2 === 0 ? home : away,
              teamBId: iteration % 2 === 0 ? away : home,
              round: roundNumber,
              stage: `Round ${roundNumber}`,
              date: new Date(Date.now() + roundNumber * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Offset days
            });
          }
        }
        // Rotate circle
        const last = list.pop();
        list.splice(1, 0, last);
      }
    }
  } else if (format === 'Knockout') {
    // Generate Semifinals if 4 teams, or Finals if 2 teams
    if (numTeams === 4) {
      // Pair 1 vs 4, 2 vs 3 (simulated)
      scheduledMatches.push({
        tournamentId: tour._id,
        teamAId: teams[0],
        teamBId: teams[3],
        round: 1,
        stage: "Semifinals - Match 1",
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      scheduledMatches.push({
        tournamentId: tour._id,
        teamAId: teams[1],
        teamBId: teams[2],
        round: 1,
        stage: "Semifinals - Match 2",
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    } else {
      // Standard pair matching for knockout
      for (let i = 0; i < numTeams; i += 2) {
        if (i + 1 < numTeams) {
          scheduledMatches.push({
            tournamentId: tour._id,
            teamAId: teams[i],
            teamBId: teams[i + 1],
            round: 1,
            stage: "Knockout Stage",
            date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          });
        }
      }
    }
  } else if (format === 'Swiss System') {
    // Round 1 is generated randomly or in roster order. Subsequent rounds generated dynamically after completion.
    for (let i = 0; i < numTeams; i += 2) {
      if (i + 1 < numTeams) {
        scheduledMatches.push({
          tournamentId: tour._id,
          teamAId: teams[i],
          teamBId: teams[i + 1],
          round: 1,
          stage: "Swiss - Round 1",
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
      }
    }
  }

  await db.matches.createMany(scheduledMatches);
}

module.exports = router;
