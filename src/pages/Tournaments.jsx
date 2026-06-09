// src/pages/Tournaments.jsx
import React, { useState } from 'react';
import { Calendar, Users, Trophy, Play, Plus, Trash2, LayoutGrid, Award, Link, Edit2, Check, X, ShieldAlert } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Tournaments() {
  const {
    user,
    tournaments,
    teams,
    players,
    matches,
    addTournament,
    updateTournament,
    deleteTournament,
    addMatch,
    updateMatch,
    deleteMatch
  } = useAppContext();

  // Create Tournament states
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [format, setFormat] = useState('Team VS Team');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [teamASelection, setTeamASelection] = useState('');
  const [teamBSelection, setTeamBSelection] = useState('');
  const [error, setError] = useState('');

  // Add Match states
  const [showAddMatchForm, setShowAddMatchForm] = useState(false);
  const [matchRound, setMatchRound] = useState(1);
  const [matchNum, setMatchNum] = useState(1);
  const [matchPlayerA, setMatchPlayerA] = useState('');
  const [matchPlayerB, setMatchPlayerB] = useState('');
  const [matchTimeControl, setMatchTimeControl] = useState('10+6');
  const [matchVariant, setMatchVariant] = useState('Standard');
  const [matchLink, setMatchLink] = useState('');
  const [matchDate, setMatchDate] = useState('');
  const [matchError, setMatchError] = useState('');

  // Edit Match states
  const [editingMatchId, setEditingMatchId] = useState(null);
  const [editPlayerA, setEditPlayerA] = useState('');
  const [editPlayerB, setEditPlayerB] = useState('');
  const [editTimeControl, setEditTimeControl] = useState('10+6');
  const [editVariant, setEditVariant] = useState('Standard');
  const [editMatchLink, setEditMatchLink] = useState('');
  const [editGame1, setEditGame1] = useState('');
  const [editGame2, setEditGame2] = useState('');
  const [editCompleted, setEditCompleted] = useState(false);
  const [editMvp, setEditMvp] = useState('');
  const [editRound, setEditRound] = useState(1);
  const [editMatchNum, setEditMatchNum] = useState(1);
  const [editDate, setEditDate] = useState('');
  const [editCrazyGame, setEditCrazyGame] = useState(false);
  const [editGreatestGame, setEditGreatestGame] = useState(false);
  const [editError, setEditError] = useState('');

  // End Tournament states
  const [showEndTournamentForm, setShowEndTournamentForm] = useState(false);
  const [mvpAward, setMvpAward] = useState('');
  const [goldAward, setGoldAward] = useState('');
  const [silverAward, setSilverAward] = useState('');
  const [bronzeAward, setBronzeAward] = useState('');
  const [endTournamentError, setEndTournamentError] = useState('');

  // Selected tournament details
  const [selectedTourId, setSelectedTourId] = useState(tournaments[0]?.id || tournaments[0]?._id || null);
  const activeTournament = tournaments.find(t => (t.id === selectedTourId || t._id === selectedTourId)) || tournaments[0] || null;

  // Roster lists for Team A and Team B
  const teamAId = activeTournament?.teams[0];
  const teamBId = activeTournament?.teams[1];
  const teamA = teams.find(t => (t.id === teamAId || t._id === teamAId));
  const teamB = teams.find(t => (t.id === teamBId || t._id === teamBId));

  const rosterA = teamA ? players.filter(p => (p.teamId === teamA.id || p.teamId === teamA._id)) : [];
  const rosterB = teamB ? players.filter(p => (p.teamId === teamB.id || p.teamId === teamB._id)) : [];

  // Filter matches for active tournament
  const tourMatches = activeTournament
    ? matches.filter(m => (m.tournamentId === activeTournament.id || m.tournamentId === activeTournament._id))
    : [];

  // 1. Group matches by round and calculate scoreboard
  const rounds = {};
  tourMatches.forEach(m => {
    const key = m.round;
    if (!rounds[key]) rounds[key] = [];
    rounds[key].push(m);
  });

  let gamePtsA = 0;
  let gamePtsB = 0;
  let roundPtsA = 0;
  let roundPtsB = 0;

  const roundDetails = {}; // round -> { scoreA, scoreB, resultText }

  Object.keys(rounds).sort((a,b) => Number(a) - Number(b)).forEach(roundNum => {
    let rBoardPtsA = 0;
    let rBoardPtsB = 0;
    let hasGames = false;

    rounds[roundNum].forEach(m => {
      if (!m.isCompleted) return;

      // Game 1
      if (m.game1Result && m.game1Result !== 'NP') {
        hasGames = true;
        if (m.game1Result === 'playerA') {
          rBoardPtsA += 1;
          gamePtsA += 1;
        } else if (m.game1Result === 'playerB') {
          rBoardPtsB += 1;
          gamePtsB += 1;
        } else if (m.game1Result === 'draw') {
          rBoardPtsA += 0.5;
          rBoardPtsB += 0.5;
          gamePtsA += 0.5;
          gamePtsB += 0.5;
        }
      }

      // Game 2
      if (m.game2Result && m.game2Result !== 'NP') {
        hasGames = true;
        if (m.game2Result === 'playerA') {
          rBoardPtsA += 1;
          gamePtsA += 1;
        } else if (m.game2Result === 'playerB') {
          rBoardPtsB += 1;
          gamePtsB += 1;
        } else if (m.game2Result === 'draw') {
          rBoardPtsA += 0.5;
          rBoardPtsB += 0.5;
          gamePtsA += 0.5;
          gamePtsB += 0.5;
        }
      }
    });

    let resultText = "Pending";
    if (hasGames) {
      if (rBoardPtsA > rBoardPtsB) {
        roundPtsA += 1;
        resultText = `Winner: ${teamA?.name || 'Team A'} (+1) (${rBoardPtsA} - ${rBoardPtsB})`;
      } else if (rBoardPtsB > rBoardPtsA) {
        roundPtsB += 1;
        resultText = `Winner: ${teamB?.name || 'Team B'} (+1) (${rBoardPtsB} - ${rBoardPtsA})`;
      } else {
        roundPtsA += 0.5;
        roundPtsB += 0.5;
        resultText = `Draw (${rBoardPtsA} - ${rBoardPtsB})`;
      }
    }
    roundDetails[roundNum] = { scoreA: rBoardPtsA, scoreB: rBoardPtsB, resultText };
  });

  const totalScoreA = gamePtsA + roundPtsA;
  const totalScoreB = gamePtsB + roundPtsB;

  // 2. Individual player points inside this tournament
  const playerTournamentScores = {};
  tourMatches.forEach(m => {
    if (!m.isCompleted) return;

    if (m.playerAId) {
      if (!playerTournamentScores[m.playerAId]) playerTournamentScores[m.playerAId] = 0;
      if (m.game1Result === 'playerA') playerTournamentScores[m.playerAId] += 1;
      else if (m.game1Result === 'draw') playerTournamentScores[m.playerAId] += 0.5;

      if (m.game2Result === 'playerA') playerTournamentScores[m.playerAId] += 1;
      else if (m.game2Result === 'draw') playerTournamentScores[m.playerAId] += 0.5;
    }

    if (m.playerBId) {
      if (!playerTournamentScores[m.playerBId]) playerTournamentScores[m.playerBId] = 0;
      if (m.game1Result === 'playerB') playerTournamentScores[m.playerBId] += 1;
      else if (m.game1Result === 'draw') playerTournamentScores[m.playerBId] += 0.5;

      if (m.game2Result === 'playerB') playerTournamentScores[m.playerBId] += 1;
      else if (m.game2Result === 'draw') playerTournamentScores[m.playerBId] += 0.5;
    }
  });

  const rankedPlayers = Object.keys(playerTournamentScores)
    .map(pId => {
      const p = players.find(pl => (pl.id === pId || pl._id === pId));
      return {
        id: pId,
        name: p ? p.name : 'Unknown Player',
        score: playerTournamentScores[pId],
        teamLogo: p ? teams.find(t => (t.id === p.teamId || t._id === p.teamId))?.logo : '♟',
        teamName: p ? teams.find(t => (t.id === p.teamId || t._id === p.teamId))?.name : 'Free Agent'
      };
    })
    .sort((a,b) => b.score - a.score);

  // Operations
  const handleCreateTournament = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) return setError("Name is required");
    if (!teamASelection || !teamBSelection) return setError("Please select both Team A and Team B");
    if (teamASelection === teamBSelection) return setError("Team A and Team B must be different");
    if (!startDate || !endDate) return setError("Dates are required");

    try {
      const created = await addTournament({
        name,
        format,
        startDate,
        endDate,
        teams: [teamASelection, teamBSelection]
      });
      setName('');
      setFormat('Team VS Team');
      setTeamASelection('');
      setTeamBSelection('');
      setShowAddForm(false);
      setSelectedTourId(created.id || created._id);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEndTournament = async (e) => {
    e.preventDefault();
    setEndTournamentError('');

    if (!goldAward || !silverAward || !bronzeAward || !mvpAward) {
      return setEndTournamentError("Please select players for all awards (MVP, Gold, Silver, Bronze)");
    }

    try {
      await updateTournament(activeTournament.id || activeTournament._id, {
        status: 'COMPLETED',
        mvpPlayerId: mvpAward,
        goldPlayerId: goldAward,
        silverPlayerId: silverAward,
        bronzePlayerId: bronzeAward
      });
      setShowEndTournamentForm(false);
      setMvpAward('');
      setGoldAward('');
      setSilverAward('');
      setBronzeAward('');
    } catch (err) {
      setEndTournamentError(err.message);
    }
  };

  const handleCreateMatch = async (e) => {
    e.preventDefault();
    setMatchError('');

    if (!matchPlayerA || !matchPlayerB) {
      return setMatchError("Please select both Player A and Player B");
    }

    try {
      await addMatch({
        tournamentId: activeTournament.id || activeTournament._id,
        round: Number(matchRound) || 1,
        matchNumber: Number(matchNum) || 1,
        playerAId: matchPlayerA,
        playerBId: matchPlayerB,
        timeControl: matchTimeControl,
        variant: matchVariant,
        matchLink,
        date: matchDate || new Date().toISOString().split('T')[0]
      });
      setMatchPlayerA('');
      setMatchPlayerB('');
      setMatchTimeControl('10+6');
      setMatchVariant('Standard');
      setMatchLink('');
      setMatchDate('');
      setShowAddMatchForm(false);
    } catch (err) {
      setMatchError(err.message);
    }
  };

  const handleOpenEdit = (m) => {
    setEditingMatchId(m.id || m._id);
    setEditPlayerA(m.playerAId || '');
    setEditPlayerB(m.playerBId || '');
    setEditTimeControl(m.timeControl || '10+6');
    setEditVariant(m.variant || 'Standard');
    setEditMatchLink(m.matchLink || '');
    setEditGame1(m.game1Result || '');
    setEditGame2(m.game2Result || '');
    setEditCompleted(m.isCompleted || false);
    setEditMvp(m.mvpPlayerId || '');
    setEditRound(m.round || 1);
    setEditMatchNum(m.matchNumber || 1);
    setEditDate(m.date || '');
    setEditCrazyGame(m.isCrazyGame || false);
    setEditGreatestGame(m.isGreatestGame || false);
    setEditError('');
  };

  const handleSaveEdit = async (e, matchId) => {
    e.preventDefault();
    setEditError('');

    try {
      await updateMatch(matchId, {
        playerAId: editPlayerA,
        playerBId: editPlayerB,
        timeControl: editTimeControl,
        variant: editVariant,
        matchLink: editMatchLink,
        game1Result: editGame1 || null,
        game2Result: editGame2 || null,
        isCompleted: editCompleted,
        mvpPlayerId: editMvp || null,
        round: Number(editRound),
        matchNumber: Number(editMatchNum),
        date: editDate,
        isCrazyGame: editCrazyGame,
        isGreatestGame: editGreatestGame
      });
      setEditingMatchId(null);
    } catch (err) {
      setEditError(err.message);
    }
  };

  const handleDeleteMatch = async (matchId) => {
    if (window.confirm("Are you sure you want to delete this match fixture? All points and standings will be updated accordingly.")) {
      try {
        await deleteMatch(matchId);
        setEditingMatchId(null);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleDeleteTournament = async (id, tourName) => {
    if (window.confirm(`Are you sure you want to delete the tournament "${tourName}"? All its scheduled matches will be permanently deleted.`)) {
      try {
        await deleteTournament(id);
        if (selectedTourId === id) {
          setSelectedTourId(null);
        }
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="tournaments-container">
      <style>{`
        .tournaments-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .tour-grid {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 1.5rem;
        }
        @media (max-width: 900px) {
          .tour-grid {
            grid-template-columns: 1fr;
          }
        }
        .tour-list-bar {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .tour-item-btn {
          width: 100%;
          text-align: left;
          padding: 1rem;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          color: var(--text-primary);
          cursor: pointer;
          position: relative;
          transition: all 0.2s;
        }
        .tour-item-btn.active {
          border-color: var(--primary);
          background-color: rgba(255,215,0,0.02);
          box-shadow: 0 0 12px rgba(255,215,0,0.03);
        }
        .tour-item-btn:hover:not(.active) {
          border-color: var(--border-hover);
        }
        .delete-tour-btn {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          color: var(--text-secondary);
          background: transparent;
          border: none;
          cursor: pointer;
        }
        .delete-tour-btn:hover {
          color: var(--accent-rose);
        }
        
        /* Esports Scoreboard styles */
        .scoreboard-panel {
          background: radial-gradient(circle at top, rgba(255,215,0,0.05) 0%, rgba(20,20,22,0.6) 100%);
          border: 1px solid rgba(255,215,0,0.15);
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        }
        .scoreboard-vs-grid {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          text-align: center;
          margin-bottom: 1rem;
        }
        .team-score-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        .team-score-name {
          font-size: 1.1rem;
          font-weight: 800;
          letter-spacing: 0.5px;
          color: var(--text-primary);
        }
        .team-score-logo {
          font-size: 2rem;
          filter: drop-shadow(0 0 8px rgba(255,215,0,0.2));
        }
        .score-display-number {
          font-size: 3rem;
          font-weight: 900;
          color: var(--primary);
          text-shadow: 0 0 15px rgba(255,215,0,0.3);
          line-height: 1;
        }
        .scoreboard-versus-tag {
          font-weight: bold;
          font-size: 0.75rem;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--text-secondary);
          background: rgba(255,255,255,0.02);
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          border: 1px solid var(--border-color);
        }
        .scoreboard-details-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          border-top: 1px solid rgba(255,255,255,0.05);
          padding-top: 1rem;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
        
        /* Rounds & Match row styling */
        .rounds-scroller {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .round-box {
          border: 1px solid var(--border-color);
          border-radius: 10px;
          background: var(--bg-card);
          overflow: hidden;
        }
        .round-header-banner {
          background-color: rgba(255,255,255,0.015);
          padding: 0.85rem 1.25rem;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--primary);
          text-transform: uppercase;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .match-row-item {
          display: flex;
          flex-direction: column;
          border-bottom: 1px solid var(--border-color);
        }
        .match-row-item:last-child {
          border-bottom: none;
        }
        .match-row-core {
          display: grid;
          grid-template-columns: 60px 110px 1fr auto 1fr 120px 80px;
          align-items: center;
          padding: 0.85rem 1.25rem;
          gap: 0.75rem;
        }
        @media (max-width: 1024px) {
          .match-row-core {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 0.5rem;
            padding: 1rem;
          }
        }
        .match-number-tag {
          font-size: 0.75rem;
          font-weight: bold;
          color: var(--text-secondary);
        }
        .match-spec-badge {
          font-size: 0.7rem;
          color: var(--text-secondary);
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
          width: fit-content;
        }
        @media (max-width: 1024px) {
          .match-spec-badge {
            margin: 0 auto;
          }
        }
        .player-team-node {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          font-size: 0.875rem;
        }
        @media (max-width: 1024px) {
          .player-team-node {
            justify-content: center;
          }
        }
        .vs-middle-node {
          font-size: 0.7rem;
          font-weight: 900;
          color: var(--text-secondary);
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border-color);
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
        }
        .match-game-results {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          font-size: 0.75rem;
        }
        .result-subrow {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
          align-items: center;
          color: var(--text-secondary);
        }
        @media (max-width: 1024px) {
          .result-subrow {
            justify-content: center;
            margin-top: 0.25rem;
          }
        }
        .result-outcome-badge {
          font-weight: bold;
          padding: 0.1rem 0.3rem;
          border-radius: 3px;
          font-size: 0.65rem;
        }
        .outcome-win { background-color: rgba(16,185,129,0.1); color: var(--accent-emerald); }
        .outcome-lose { background-color: rgba(244,63,94,0.1); color: var(--accent-rose); }
        .outcome-draw { background-color: rgba(255,255,255,0.05); color: var(--text-secondary); }
        .outcome-np { background-color: rgba(255,255,255,0.02); color: rgba(255,255,255,0.2); }
        .outcome-pending { background-color: rgba(255,215,0,0.05); color: var(--primary); }

        .edit-collapsible-panel {
          background-color: rgba(255,255,255,0.01);
          border-top: 1px solid var(--border-color);
          padding: 1.25rem;
        }
      `}</style>

      {/* Admin Action: Create Tournament */}
      {user?.role === 'admin' && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
            <Plus size={16} /> {showAddForm ? 'Cancel Creation' : 'Create Tournament'}
          </button>
        </div>
      )}

      {showAddForm && (
        <div className="card">
          <h3 className="mb-3">Create New Tournament</h3>
          {error && <p className="text-rose mb-3" style={{ fontSize: '0.85rem' }}>{error}</p>}
          <form onSubmit={handleCreateTournament} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Tournament Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Tournament 6"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tournament Format / Template</label>
              <select className="form-select" value={format} onChange={(e) => setFormat(e.target.value)}>
                <option value="Team VS Team">Team VS Team (Standard Round Robin)</option>
                <option value="Two Team Nomination">Two Team Nomination (Nominate players per match)</option>
                <option value="Two Team Revival">Two Team Revival (Loser goes to revival, winner stays)</option>
              </select>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Team A (Home)</label>
                <select className="form-select" value={teamASelection} onChange={(e) => setTeamASelection(e.target.value)}>
                  <option value="">Select Team A...</option>
                  {teams.map(t => (
                    <option key={t.id || t._id} value={t.id || t._id}>{t.logo} {t.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Team B (Away)</label>
                <select className="form-select" value={teamBSelection} onChange={(e) => setTeamBSelection(e.target.value)}>
                  <option value="">Select Team B...</option>
                  {teams.map(t => (
                    <option key={t.id || t._id} value={t.id || t._id}>{t.logo} {t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
              Create Tournament
            </button>
          </form>
        </div>
      )}

      {/* Main Grid */}
      <div className="tour-grid">
        {/* Sidebar Tournaments Selector */}
        <div className="tour-list-bar">
          <span className="card-title-sub" style={{ fontSize: '0.8rem' }}>Tournaments Directory</span>
          {tournaments.length > 0 ? (
            tournaments.map(t => (
              <div
                key={t.id || t._id}
                className={`tour-item-btn ${selectedTourId === (t.id || t._id) || (!selectedTourId && (activeTournament?.id || activeTournament?._id) === (t.id || t._id)) ? 'active' : ''}`}
                onClick={() => setSelectedTourId(t.id || t._id)}
              >
                {user?.role === 'admin' && (
                  <button className="delete-tour-btn" onClick={(e) => { e.stopPropagation(); handleDeleteTournament(t.id || t._id, t.name); }} title="Delete Tournament">
                    <Trash2 size={14} />
                  </button>
                )}
                <div style={{ fontWeight: '800', fontSize: '0.95rem', paddingRight: '1.5rem' }}>{t.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                  <Trophy size={12} /> <span>{t.format}</span>
                  <span>•</span>
                  <Calendar size={12} /> <span>{t.startDate}</span>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No tournaments registered.</p>
          )}
        </div>

        {/* Tournament Management Workspace */}
        <div>
          {activeTournament ? (
            <div>
              {/* Header card details */}
              <div className="card mb-3">
                <div className="flex-between mb-3" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.45rem', fontWeight: '900' }}>{activeTournament.name}</h2>
                    <div style={{ display: 'flex', gap: '0.8rem', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      <span>Format: <strong>{activeTournament.format}</strong></span>
                      <span>•</span>
                      <span>Dates: <strong>{activeTournament.startDate} to {activeTournament.endDate}</strong></span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {user?.role === 'admin' && activeTournament.status !== 'COMPLETED' && (
                      <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: 'var(--accent-rose)', borderColor: 'rgba(244,63,94,0.3)' }} onClick={() => setShowEndTournamentForm(!showEndTournamentForm)}>
                        {showEndTournamentForm ? 'Cancel End' : 'End Tournament'}
                      </button>
                    )}
                    <span className={`badge ${activeTournament.status === 'ACTIVE' ? 'badge-active' : activeTournament.status === 'UPCOMING' ? 'badge-upcoming' : 'badge-completed'}`}>
                      {activeTournament.status}
                    </span>
                  </div>
                </div>

                {activeTournament.status === 'COMPLETED' && (
                  <div className="medals-showcase-row mt-2" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.85rem' }}>
                      🏆 MVP: <strong>{players.find(p => (p.id === activeTournament.mvpPlayerId || p._id === activeTournament.mvpPlayerId))?.name || 'N/A'}</strong>
                    </div>
                    <div style={{ fontSize: '0.85rem' }}>
                      🥇 Gold: <strong>{players.find(p => (p.id === activeTournament.goldPlayerId || p._id === activeTournament.goldPlayerId))?.name || 'N/A'}</strong>
                    </div>
                    <div style={{ fontSize: '0.85rem' }}>
                      🥈 Silver: <strong>{players.find(p => (p.id === activeTournament.silverPlayerId || p._id === activeTournament.silverPlayerId))?.name || 'N/A'}</strong>
                    </div>
                    <div style={{ fontSize: '0.85rem' }}>
                      🥉 Bronze: <strong>{players.find(p => (p.id === activeTournament.bronzePlayerId || p._id === activeTournament.bronzePlayerId))?.name || 'N/A'}</strong>
                    </div>
                  </div>
                )}

                {/* Scoreboard Panel */}
                <div className="scoreboard-panel">
                  <div className="scoreboard-vs-grid">
                    {/* Team A */}
                    <div className="team-score-block">
                      <span className="team-score-logo">{teamA?.logo || '♟'}</span>
                      <span className="team-score-name">{teamA?.name || 'Team A'}</span>
                    </div>

                    {/* Scores */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <span className="score-display-number">{totalScoreA.toFixed(1)}</span>
                      <span className="scoreboard-versus-tag">VS</span>
                      <span className="score-display-number">{totalScoreB.toFixed(1)}</span>
                    </div>

                    {/* Team B */}
                    <div className="team-score-block">
                      <span className="team-score-logo">{teamB?.logo || '♟'}</span>
                      <span className="team-score-name">{teamB?.name || 'Team B'}</span>
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div className="scoreboard-details-grid">
                    <div>
                      <p><strong>Game Wins</strong>: {gamePtsA.toFixed(1)} pts</p>
                      <p><strong>Round Wins</strong>: {roundPtsA.toFixed(1)} pts</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p><strong>Game Wins</strong>: {gamePtsB.toFixed(1)} pts</p>
                      <p><strong>Round Wins</strong>: {roundPtsB.toFixed(1)} pts</p>
                    </div>
                  </div>
                </div>

                {/* MVP & Rankings Breakdown */}
                {rankedPlayers.length > 0 && (
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Award size={16} /> Tournament Standings & Rankings
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                      {rankedPlayers.slice(0, 5).map((p, idx) => (
                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', background: 'var(--bg-secondary)', padding: '0.3rem 0.6rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                          <span style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>#{idx+1}</span>
                          <span>{p.name}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>({p.teamLogo})</span>
                          <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{p.score.toFixed(1)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Revival List for Two Team Revival format */}
                {activeTournament.format === 'Two Team Revival' && (
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', marginTop: '0.75rem' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      🔄 Revival List (Losers)
                    </h4>
                    {activeTournament.revivalList && activeTournament.revivalList.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                        {activeTournament.revivalList.map((pId, idx) => {
                          const p = players.find(pl => (pl.id === pId || pl._id === pId));
                          const team = p ? teams.find(t => (t.id === p.teamId || t._id === p.teamId)) : null;
                          return (
                            <div key={pId + '-' + idx} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', background: 'var(--bg-secondary)', padding: '0.3rem 0.6rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                              <span style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>#{idx+1}</span>
                              <span>{p ? p.name : 'Unknown Player'}</span>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>({team?.logo || '♟'} {team?.name || 'Free Agent'})</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>No players in the revival list yet.</p>
                    )}
                  </div>
                )}
              </div>

              {/* End Tournament Award Selection Form */}
              {showEndTournamentForm && activeTournament.status !== 'COMPLETED' && (
                <div className="card mb-3" style={{ border: '1px solid rgba(244,63,94,0.35)', boxShadow: '0 0 15px rgba(244,63,94,0.04)' }}>
                  <h3 className="mb-3" style={{ color: 'var(--accent-rose)', fontWeight: '800' }}>End Tournament & Award Achievements</h3>
                  {endTournamentError && <p className="text-rose mb-3" style={{ fontSize: '0.85rem' }}>{endTournamentError}</p>}
                  <form onSubmit={handleEndTournament} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>🏆 Tournament MVP</label>
                        <select className="form-select" value={mvpAward} onChange={(e) => setMvpAward(e.target.value)}>
                          <option value="">Select MVP Player...</option>
                          {[...rosterA, ...rosterB].map(p => (
                            <option key={p.id || p._id} value={p.id || p._id}>
                              {p.name} ({teams.find(t => (t.id === p.teamId || t._id === p.teamId))?.logo} {teams.find(t => (t.id === p.teamId || t._id === p.teamId))?.name})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>🥇 Gold Medalist</label>
                        <select className="form-select" value={goldAward} onChange={(e) => setGoldAward(e.target.value)}>
                          <option value="">Select Gold Medalist...</option>
                          {[...rosterA, ...rosterB].map(p => (
                            <option key={p.id || p._id} value={p.id || p._id}>
                              {p.name} ({teams.find(t => (t.id === p.teamId || t._id === p.teamId))?.logo} {teams.find(t => (t.id === p.teamId || t._id === p.teamId))?.name})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>🥈 Silver Medalist</label>
                        <select className="form-select" value={silverAward} onChange={(e) => setSilverAward(e.target.value)}>
                          <option value="">Select Silver Medalist...</option>
                          {[...rosterA, ...rosterB].map(p => (
                            <option key={p.id || p._id} value={p.id || p._id}>
                              {p.name} ({teams.find(t => (t.id === p.teamId || t._id === p.teamId))?.logo} {teams.find(t => (t.id === p.teamId || t._id === p.teamId))?.name})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>🥉 Bronze Medalist</label>
                        <select className="form-select" value={bronzeAward} onChange={(e) => setBronzeAward(e.target.value)}>
                          <option value="">Select Bronze Medalist...</option>
                          {[...rosterA, ...rosterB].map(p => (
                            <option key={p.id || p._id} value={p.id || p._id}>
                              {p.name} ({teams.find(t => (t.id === p.teamId || t._id === p.teamId))?.logo} {teams.find(t => (t.id === p.teamId || t._id === p.teamId))?.name})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'var(--accent-rose)', borderColor: 'var(--accent-rose)', color: '#fff', alignSelf: 'flex-start' }}>
                      Confirm & Finalize Tournament
                    </button>
                  </form>
                </div>
              )}

              {/* Add Match Quick Section */}
              {user?.role === 'admin' && activeTournament.status !== 'COMPLETED' && (
                <div className="card mb-3">
                  <button className="btn btn-secondary" onClick={() => setShowAddMatchForm(!showAddMatchForm)}>
                    <Plus size={16} /> {showAddMatchForm ? 'Close Scheduler' : 'New Match'}
                  </button>

                  {showAddMatchForm && (
                    <form onSubmit={handleCreateMatch} style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Schedule Custom Match</h4>
                      {matchError && <p className="text-rose" style={{ fontSize: '0.8rem', marginBottom: 0 }}>{matchError}</p>}
                      
                      <div className="grid-3" style={{ gap: '1rem' }}>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '0.75rem' }}>Round</label>
                          <input type="number" min="1" className="form-input" value={matchRound} onChange={(e) => setMatchRound(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '0.75rem' }}>Match Number</label>
                          <input type="number" min="1" className="form-input" value={matchNum} onChange={(e) => setMatchNum(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '0.75rem' }}>Date</label>
                          <input type="date" className="form-input" value={matchDate} onChange={(e) => setMatchDate(e.target.value)} />
                        </div>
                      </div>

                      <div className="grid-2" style={{ gap: '1rem' }}>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '0.75rem' }}>Player A ({teamA?.name || 'Home'})</label>
                          <select className="form-select" value={matchPlayerA} onChange={(e) => setMatchPlayerA(e.target.value)}>
                            <option value="">Select Player A...</option>
                            {rosterA.map(p => (
                              <option key={p.id || p._id} value={p.id || p._id}>{p.name} ({p.elo})</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '0.75rem' }}>Player B ({teamB?.name || 'Away'})</label>
                          <select className="form-select" value={matchPlayerB} onChange={(e) => setMatchPlayerB(e.target.value)}>
                            <option value="">Select Player B...</option>
                            {rosterB.map(p => (
                              <option key={p.id || p._id} value={p.id || p._id}>{p.name} ({p.elo})</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid-2" style={{ gap: '1rem' }}>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '0.75rem' }}>Time Control</label>
                          <input type="text" className="form-input" placeholder="e.g. 10+6, 9+2, 3+2" value={matchTimeControl} onChange={(e) => setMatchTimeControl(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '0.75rem' }}>Variant</label>
                          <select className="form-select" value={matchVariant} onChange={(e) => setMatchVariant(e.target.value)}>
                            <option value="Standard">Standard</option>
                            <option value="960">Chess960</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Match Link (Optional)</label>
                        <input type="url" className="form-input" placeholder="e.g. https://lichess.org/match-url" value={matchLink} onChange={(e) => setMatchLink(e.target.value)} />
                      </div>

                      <button type="submit" className="btn btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', alignSelf: 'flex-start' }}>
                        Add Match
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Rounds Fixtures Sections */}
              <div className="rounds-scroller">
                {Object.keys(rounds).length > 0 ? (
                  Object.keys(rounds)
                    .sort((a,b) => Number(a) - Number(b))
                    .map(roundNum => {
                      const roundInfo = roundDetails[roundNum];
                      return (
                        <div key={roundNum} className="round-box">
                          <div className="round-header-banner">
                            <span>Round {roundNum}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              {roundInfo ? roundInfo.resultText : 'Pending'}
                            </span>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {rounds[roundNum]
                              .sort((a,b) => a.matchNumber - b.matchNumber)
                              .map(m => {
                                const pA = players.find(p => p.id === m.playerAId);
                                const pB = players.find(p => p.id === m.playerBId);
                                const isEditing = editingMatchId === m.id;

                                // Format Results output
                                let g1Text = "Pending";
                                let g1Class = "outcome-pending";
                                if (m.isCompleted) {
                                  if (m.game1Result === 'playerA') { g1Text = `${pA ? pA.name.split(' ').pop() : 'A'} Wins`; g1Class = "outcome-win"; }
                                  else if (m.game1Result === 'playerB') { g1Text = `${pB ? pB.name.split(' ').pop() : 'B'} Wins`; g1Class = "outcome-lose"; }
                                  else if (m.game1Result === 'draw') { g1Text = "Draw"; g1Class = "outcome-draw"; }
                                  else if (m.game1Result === 'NP') { g1Text = "NP (Not Played)"; g1Class = "outcome-np"; }
                                }

                                let g2Text = "Pending";
                                let g2Class = "outcome-pending";
                                if (m.isCompleted) {
                                  if (m.game2Result === 'playerA') { g2Text = `${pA ? pA.name.split(' ').pop() : 'A'} Wins`; g2Class = "outcome-win"; }
                                  else if (m.game2Result === 'playerB') { g2Text = `${pB ? pB.name.split(' ').pop() : 'B'} Wins`; g2Class = "outcome-lose"; }
                                  else if (m.game2Result === 'draw') { g2Text = "Draw"; g2Class = "outcome-draw"; }
                                  else if (m.game2Result === 'NP') { g2Text = "NP (Not Played)"; g2Class = "outcome-np"; }
                                }

                                return (
                                  <div key={m.id} className="match-row-item">
                                    <div className="match-row-core">
                                      {/* Match Tag */}
                                      <span className="match-number-tag">M {m.matchNumber}</span>

                                      {/* Spec badge */}
                                      <div className="match-spec-badge" style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                                        <span>{m.timeControl} • {m.variant}</span>
                                        {m.isCrazyGame && <span title="Crazy Game" style={{ cursor: 'help' }}>🤪</span>}
                                        {m.isGreatestGame && <span title="Greatest Game" style={{ cursor: 'help' }}>⭐</span>}
                                      </div>

                                      {/* Player A */}
                                      <div className="player-team-node">
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{teamA?.logo}</span>
                                        <span style={{ color: m.isCompleted && m.game1Result === 'playerA' ? 'var(--primary)' : 'inherit' }}>
                                          {pA ? pA.name : 'Choose Player A'}
                                        </span>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>({pA?.elo})</span>
                                      </div>

                                      {/* VS Node */}
                                      <span className="vs-middle-node">VS</span>

                                      {/* Player B */}
                                      <div className="player-team-node" style={{ justifyContent: 'flex-end' }}>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>({pB?.elo})</span>
                                        <span style={{ color: m.isCompleted && m.game1Result === 'playerB' ? 'var(--primary)' : 'inherit' }}>
                                          {pB ? pB.name : 'Choose Player B'}
                                        </span>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{teamB?.logo}</span>
                                      </div>

                                      {/* Games outcomes / Link */}
                                      <div className="match-game-results">
                                        {m.isCompleted ? (
                                          <>
                                            <div className="result-subrow">
                                              <span>G1:</span>
                                              <span className={`result-outcome-badge ${g1Class}`}>{g1Text}</span>
                                            </div>
                                            <div className="result-subrow">
                                              <span>G2:</span>
                                              <span className={`result-outcome-badge ${g2Class}`}>{g2Text}</span>
                                            </div>
                                          </>
                                        ) : (
                                          <div className="result-subrow">
                                            <span className="result-outcome-badge outcome-pending">Scheduled</span>
                                          </div>
                                        )}
                                      </div>

                                      {/* Link & Edit controls */}
                                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                                        {m.matchLink ? (
                                          <a href={m.matchLink} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ padding: '0.35rem 0.5rem' }} title="Join/Watch Match">
                                            <Link size={12} />
                                          </a>
                                        ) : (
                                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>no link</span>
                                        )}
                                        {user?.role === 'admin' && activeTournament.status !== 'COMPLETED' && (
                                          <button className="btn btn-outline" style={{ padding: '0.35rem 0.5rem' }} onClick={() => handleOpenEdit(m)}>
                                            <Edit2 size={12} />
                                          </button>
                                        )}
                                      </div>
                                    </div>

                                    {/* Inline Editing Expanded Panel */}
                                    {isEditing && (
                                      <div className="edit-collapsible-panel">
                                        <h5 style={{ fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '0.75rem', textTransform: 'uppercase', color: 'var(--primary)' }}>Edit Match Details</h5>
                                        {editError && <p className="text-rose" style={{ fontSize: '0.8rem' }}>{editError}</p>}
                                        
                                        <form onSubmit={(e) => handleSaveEdit(e, m.id)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                          <div className="grid-3" style={{ gap: '0.75rem' }}>
                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                              <label className="form-label" style={{ fontSize: '0.7rem' }}>Round</label>
                                              <input type="number" min="1" className="form-input" style={{ padding: '0.4rem 0.6rem' }} value={editRound} onChange={(e) => setEditRound(e.target.value)} />
                                            </div>
                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                              <label className="form-label" style={{ fontSize: '0.7rem' }}>Match #</label>
                                              <input type="number" min="1" className="form-input" style={{ padding: '0.4rem 0.6rem' }} value={editMatchNum} onChange={(e) => setEditMatchNum(e.target.value)} />
                                            </div>
                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                              <label className="form-label" style={{ fontSize: '0.7rem' }}>Date</label>
                                              <input type="date" className="form-input" style={{ padding: '0.4rem 0.6rem' }} value={editDate} onChange={(e) => setEditDate(e.target.value)} />
                                            </div>
                                          </div>

                                          <div className="grid-2" style={{ gap: '0.75rem' }}>
                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                              <label className="form-label" style={{ fontSize: '0.7rem' }}>Player A</label>
                                              <select className="form-select" style={{ padding: '0.4rem 0.6rem' }} value={editPlayerA} onChange={(e) => setEditPlayerA(e.target.value)}>
                                                <option value="">-- To Be Decided --</option>
                                                {rosterA.map(p => (
                                                  <option key={p.id || p._id} value={p.id || p._id}>{p.name} ({p.elo})</option>
                                                ))}
                                              </select>
                                            </div>
                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                              <label className="form-label" style={{ fontSize: '0.7rem' }}>Player B</label>
                                              <select className="form-select" style={{ padding: '0.4rem 0.6rem' }} value={editPlayerB} onChange={(e) => setEditPlayerB(e.target.value)}>
                                                <option value="">-- To Be Decided --</option>
                                                {rosterB.map(p => (
                                                  <option key={p.id || p._id} value={p.id || p._id}>{p.name} ({p.elo})</option>
                                                ))}
                                              </select>
                                            </div>
                                          </div>

                                          <div className="grid-3" style={{ gap: '0.75rem' }}>
                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                              <label className="form-label" style={{ fontSize: '0.7rem' }}>Time Control</label>
                                              <input type="text" className="form-input" style={{ padding: '0.4rem 0.6rem' }} value={editTimeControl} onChange={(e) => setEditTimeControl(e.target.value)} />
                                            </div>
                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                              <label className="form-label" style={{ fontSize: '0.7rem' }}>Variant</label>
                                              <select className="form-select" style={{ padding: '0.4rem 0.6rem' }} value={editVariant} onChange={(e) => setEditVariant(e.target.value)}>
                                                <option value="Standard">Standard</option>
                                                <option value="960">Chess960</option>
                                              </select>
                                            </div>
                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                              <label className="form-label" style={{ fontSize: '0.7rem' }}>Match Link</label>
                                              <input type="url" className="form-input" style={{ padding: '0.4rem 0.6rem' }} value={editMatchLink} onChange={(e) => setEditMatchLink(e.target.value)} />
                                            </div>
                                          </div>

                                          <div className="grid-2" style={{ gap: '0.75rem' }}>
                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                              <label className="form-label" style={{ fontSize: '0.7rem' }}>Game 1 Outcome (A vs B)</label>
                                              <select className="form-select" style={{ padding: '0.4rem 0.6rem' }} value={editGame1} onChange={(e) => setEditGame1(e.target.value)}>
                                                <option value="">Pending...</option>
                                                <option value="playerA">Winner: Player A ({pA?.name})</option>
                                                <option value="playerB">Winner: Player B ({pB?.name})</option>
                                                <option value="draw">Draw</option>
                                                <option value="NP">NP (Not Played)</option>
                                              </select>
                                            </div>
                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                              <label className="form-label" style={{ fontSize: '0.7rem' }}>Game 2 Outcome (B vs A)</label>
                                              <select className="form-select" style={{ padding: '0.4rem 0.6rem' }} value={editGame2} onChange={(e) => setEditGame2(e.target.value)}>
                                                <option value="">Pending...</option>
                                                <option value="playerA">Winner: Player A ({pA?.name})</option>
                                                <option value="playerB">Winner: Player B ({pB?.name})</option>
                                                <option value="draw">Draw</option>
                                                <option value="NP">NP (Not Played)</option>
                                              </select>
                                            </div>
                                          </div>

                                          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                                              <input type="checkbox" checked={editCompleted} onChange={(e) => setEditCompleted(e.target.checked)} />
                                              <span>Finalize Match & Process Elo Ratings</span>
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                                              <input type="checkbox" checked={editCrazyGame} onChange={(e) => setEditCrazyGame(e.target.checked)} />
                                              <span>🤪 Crazy Game</span>
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                                              <input type="checkbox" checked={editGreatestGame} onChange={(e) => setEditGreatestGame(e.target.checked)} />
                                              <span>⭐ Greatest Game</span>
                                            </label>
                                          </div>

                                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}>
                                              <Check size={14} /> Save Changes
                                            </button>
                                            <button type="button" className="btn btn-outline" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }} onClick={() => setEditingMatchId(null)}>
                                              <X size={14} /> Cancel
                                            </button>
                                            <button type="button" className="btn btn-outline" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', color: 'var(--accent-rose)', border: '1px solid rgba(244,63,94,0.3)', marginLeft: 'auto' }} onClick={() => handleDeleteMatch(m.id)}>
                                              <Trash2 size={14} /> Delete Fixture
                                            </button>
                                          </div>
                                        </form>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No matches generated for this tournament.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="card text-center" style={{ padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
              <LayoutGrid size={32} style={{ margin: '0 auto 1rem', opacity: '0.5' }} />
              <p>No tournament selected. Choose or create a tournament from the sidebar directory.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
