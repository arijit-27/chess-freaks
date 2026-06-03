// src/pages/Matches.jsx
import React, { useState } from 'react';
import { Trophy, CheckSquare, Sparkles, Award, User, RefreshCcw } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Matches() {
  const {
    user,
    matches,
    teams,
    players,
    updateMatchBoard,
    completeMatch
  } = useAppContext();

  const [selectedMatchId, setSelectedMatchId] = useState(null);
  const [mvpId, setMvpId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingState, setLoadingState] = useState(false);

  // Form selections for the 4 boards
  // Structure: { 1: { playerAId, playerBId, result }, 2: ... }
  const [boardSetups, setBoardSetups] = useState({});

  const activeMatch = matches.find(m => m.id === selectedMatchId) || null;
  const teamA = activeMatch ? teams.find(t => t.id === activeMatch.teamAId) : null;
  const teamB = activeMatch ? teams.find(t => t.id === activeMatch.teamBId) : null;

  // Roster lists on both sides
  const rosterA = teamA ? players.filter(p => p.teamId === teamA.id) : [];
  const rosterB = teamB ? players.filter(p => p.teamId === teamB.id) : [];

  // When match is selected, initialize form fields
  const handleSelectMatch = (match) => {
    setSelectedMatchId(match.id);
    setMvpId(match.mvpPlayerId || '');
    setError('');
    setSuccess('');

    const setups = {};
    match.boards.forEach(b => {
      setups[b.boardNumber] = {
        playerAId: b.playerAId || '',
        playerBId: b.playerBId || '',
        result: b.result || ''
      };
    });
    setBoardSetups(setups);
  };

  const handleBoardFieldChange = (boardNum, field, value) => {
    setBoardSetups(prev => ({
      ...prev,
      [boardNum]: {
        ...prev[boardNum],
        [field]: value
      }
    }));
  };

  const handleSaveBoard = async (boardNum) => {
    setError('');
    setSuccess('');
    const setup = boardSetups[boardNum];

    if (!setup.playerAId || !setup.playerBId) {
      return setError(`Please select players for Board ${boardNum} first.`);
    }

    try {
      await updateMatchBoard(
        activeMatch.id,
        boardNum,
        setup.playerAId,
        setup.playerBId,
        setup.result || null
      );
      setSuccess(`Board ${boardNum} matchup successfully saved!`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCompleteMatch = async () => {
    setError('');
    setSuccess('');

    // Verify all boards are played
    let allBoardsPlayed = true;
    activeMatch.boards.forEach(b => {
      if (!b.playerAId || !b.playerBId || !b.result) {
        allBoardsPlayed = false;
      }
    });

    if (!allBoardsPlayed) {
      return setError("All 4 boards must be played and scored before finalizing the match.");
    }

    setLoadingState(true);
    try {
      await completeMatch(activeMatch.id, mvpId || null);
      setSuccess("Match finalized! Elo ratings and team standings updated.");
      setSelectedMatchId(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingState(false);
    }
  };

  // Calculate live Board Points aggregate
  let livePointsA = 0;
  let livePointsB = 0;
  if (activeMatch) {
    activeMatch.boards.forEach(b => {
      const setup = boardSetups[b.boardNumber];
      if (setup) {
        if (setup.result === '1-0') livePointsA += 1;
        else if (setup.result === '0-1') livePointsB += 1;
        else if (setup.result === '0.5-0.5') { livePointsA += 0.5; livePointsB += 0.5; }
      }
    });
  }

  // Get active roster list of players who have boarded in this match
  const playedPlayers = [];
  if (activeMatch) {
    activeMatch.boards.forEach(b => {
      const pA = rosterA.find(p => p.id === b.playerAId);
      const pB = rosterB.find(p => p.id === b.playerBId);
      if (pA) playedPlayers.push(pA);
      if (pB) playedPlayers.push(pB);
    });
  }

  return (
    <div className="matches-view-container">
      <style>{`
        .matches-view-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .match-panels-split {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 1.5rem;
        }
        @media (max-width: 900px) {
          .match-panels-split {
            grid-template-columns: 1fr;
          }
        }
        .fixtures-list-scroller {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          max-height: 70vh;
          overflow-y: auto;
          padding-right: 0.25rem;
        }
        .fixture-card-selector {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 0.75rem 1rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .fixture-card-selector.active {
          border-color: var(--primary);
          background-color: rgba(var(--primary-rgb), 0.04);
        }
        .fixture-card-selector:hover:not(.active) {
          border-color: var(--border-hover);
        }
        .fixture-teams-line {
          font-weight: 700;
          font-size: 0.9rem;
          display: flex;
          justify-content: space-between;
        }
        .board-card-row {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 1rem;
          display: grid;
          grid-template-columns: 0.8fr 1fr 0.4fr 1fr auto;
          gap: 0.75rem;
          align-items: center;
        }
        @media (max-width: 768px) {
          .board-card-row {
            grid-template-columns: 1fr;
            text-align: center;
          }
        }
        .board-tag-indicator {
          font-weight: bold;
          font-size: 0.85rem;
          color: var(--primary);
          background: rgba(var(--primary-rgb), 0.08);
          border: 1px solid rgba(var(--primary-rgb), 0.2);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          text-align: center;
          width: fit-content;
        }
        @media (max-width: 768px) {
          .board-tag-indicator {
            margin: 0 auto;
          }
        }
      `}</style>

      <div className="match-panels-split">
        {/* Left Side: Scheduled fixtures directory */}
        <div>
          <span className="card-title-sub" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.75rem' }}>League Fixtures</span>
          <div className="fixtures-list-scroller">
            {matches.length > 0 ? (
              [...matches]
                .sort((a, b) => a.round - b.round || a.isCompleted - b.isCompleted)
                .map(m => {
                  const tA = teams.find(t => t.id === m.teamAId);
                  const tB = teams.find(t => t.id === m.teamBId);
                  
                  let scoreLabel = "vs";
                  if (m.isCompleted) {
                    let ptsA = 0; let ptsB = 0;
                    m.boards.forEach(b => {
                      if (b.result === '1-0') ptsA += 1;
                      else if (b.result === '0-1') ptsB += 1;
                      else if (b.result === '0.5-0.5') { ptsA += 0.5; ptsB += 0.5; }
                    });
                    scoreLabel = `${ptsA} - ${ptsB}`;
                  }

                  return (
                    <div
                      key={m.id}
                      className={`fixture-card-selector ${selectedMatchId === m.id ? 'active' : ''}`}
                      onClick={() => handleSelectMatch(m)}
                    >
                      <div className="flex-between" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        <span>{m.stage || `Round ${m.round}`}</span>
                        <span className={`badge ${m.isCompleted ? 'badge-completed' : 'badge-active'}`} style={{ scale: '0.85' }}>
                          {m.isCompleted ? 'Finished' : 'Pending'}
                        </span>
                      </div>
                      <div className="fixture-teams-line">
                        <span>{tA ? tA.logo : '♟'} {tA ? tA.name : 'Team A'}</span>
                        <span className="text-gold" style={{ fontSize: '0.8rem', backgroundColor: 'var(--bg-tertiary)', padding: '0.05rem 0.4rem', borderRadius: '4px' }}>
                          {scoreLabel}
                        </span>
                        <span style={{ textAlign: 'right' }}>{tB ? tB.name : 'Team B'} {tB ? tB.logo : '♟'}</span>
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', alignSelf: 'flex-start' }}>
                        Date: {m.date}
                      </div>
                    </div>
                  );
                })
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No fixtures generated. Setup a tournament first.</p>
            )}
          </div>
        </div>

        {/* Right Side: Active matchup board setup/results */}
        <div>
          {activeMatch && teamA && teamB ? (
            <div className="card">
              {/* Header card details */}
              <div className="flex-between mb-3" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>
                    {teamA.logo} {teamA.name} <span className="text-gold">vs</span> {teamB.name} {teamB.logo}
                  </h2>
                  <span className="page-subtitle">{activeMatch.stage || `Round ${activeMatch.round}`} Match Fixture</span>
                </div>
                
                {/* Aggregate live board Points Display */}
                <div style={{ padding: '0.5rem 1rem', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span className="card-title-sub" style={{ fontSize: '0.6rem' }}>Board Score</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary)' }}>
                    {livePointsA} - {livePointsB}
                  </span>
                </div>
              </div>

              {error && <p className="text-rose mb-3" style={{ fontSize: '0.85rem' }}>{error}</p>}
              {success && <p className="text-emerald mb-3" style={{ fontSize: '0.85rem' }}>{success}</p>}

              {/* Board pairings config (Only editable if match is pending) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <span className="card-title-sub" style={{ fontSize: '0.75rem' }}>Individual boards Pairing & results</span>
                {Array.from({ length: 4 }, (_, i) => i + 1).map(boardNum => {
                  const setup = boardSetups[boardNum] || { playerAId: '', playerBId: '', result: '' };
                  const isSavedInDB = activeMatch.boards.find(b => b.boardNumber === boardNum)?.playerAId !== null;

                  return (
                    <div key={boardNum} className="board-card-row">
                      <span className="board-tag-indicator">Board {boardNum}</span>
                      
                      {/* Player A selection */}
                      <select
                        className="form-select"
                        value={setup.playerAId}
                        onChange={(e) => handleBoardFieldChange(boardNum, 'playerAId', e.target.value)}
                        disabled={activeMatch.isCompleted || (!user || user.role !== 'admin')}
                      >
                        <option value="">Choose Player A...</option>
                        {rosterA.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.elo})</option>
                        ))}
                      </select>

                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)', textAlign: 'center' }}>VS</span>

                      {/* Player B selection */}
                      <select
                        className="form-select"
                        value={setup.playerBId}
                        onChange={(e) => handleBoardFieldChange(boardNum, 'playerBId', e.target.value)}
                        disabled={activeMatch.isCompleted || (!user || user.role !== 'admin')}
                      >
                        <option value="">Choose Player B...</option>
                        {rosterB.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.elo})</option>
                        ))}
                      </select>

                      {/* Board Outcome Result */}
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <select
                          className="form-select"
                          value={setup.result}
                          onChange={(e) => handleBoardFieldChange(boardNum, 'result', e.target.value)}
                          disabled={activeMatch.isCompleted || (!user || user.role !== 'admin')}
                        >
                          <option value="">Pending...</option>
                          <option value="1-0">Win for A (1-0)</option>
                          <option value="0-1">Win for B (0-1)</option>
                          <option value="0.5-0.5">Draw (1/2-1/2)</option>
                        </select>

                        {user && user.role === 'admin' && !activeMatch.isCompleted && (
                          <button className="btn btn-outline" style={{ padding: '0.55rem 0.75rem' }} onClick={() => handleSaveBoard(boardNum)} title="Save Board Pairings">
                            <CheckSquare size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* MVP award + Complete button panel */}
              {user && user.role === 'admin' && !activeMatch.isCompleted && (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Award size={16} className="text-emerald" /> Match MVP Nomination
                    </label>
                    <select className="form-select" value={mvpId} onChange={(e) => setMvpId(e.target.value)}>
                      <option value="">Nominate Match MVP...</option>
                      {playedPlayers.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (Elo: {p.elo})</option>
                      ))}
                    </select>
                  </div>

                  <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={handleCompleteMatch} disabled={loadingState}>
                    <Sparkles size={16} /> {loadingState ? 'Calculating ratings...' : 'Finalize Match & Recalculate Ratings'}
                  </button>
                </div>
              )}

              {/* Show completed details */}
              {activeMatch.isCompleted && (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', backgroundColor: 'rgba(255,255,255,0.01)', padding: '1rem', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--primary)', textTransform: 'uppercase' }}>Match Report summary</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                    <User size={14} /> MVP Award: <strong>{players.find(p => p.id === activeMatch.mvpPlayerId)?.name || 'None awarded'}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                    <Trophy size={14} /> Winner Franchise: <strong>
                      {activeMatch.winnerTeamId === 'draw' ? 'Match Draw' : teams.find(t => t.id === activeMatch.winnerTeamId)?.name || 'N/A'}
                    </strong>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card text-center" style={{ padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
              <RefreshCcw size={32} style={{ margin: '0 auto 1rem', opacity: '0.5' }} />
              <p>No fixture selected. Select a pending or finished matchup from the fixtures list to view details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
