// src/pages/Matches.jsx
import React, { useState } from 'react';
import { Trophy, Award, User, RefreshCcw, Link, Calendar, Check, X, Trash2, ShieldAlert } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Matches() {
  const {
    user,
    matches,
    teams,
    players,
    tournaments,
    updateMatch,
    deleteMatch
  } = useAppContext();

  const [selectedMatchId, setSelectedMatchId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingState, setLoadingState] = useState(false);

  // Editing state fields
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

  const activeMatch = matches.find(m => (m.id === selectedMatchId || m._id === selectedMatchId)) || null;
  const activeTournament = activeMatch ? tournaments.find(t => (t.id === activeMatch.tournamentId || t._id === activeMatch.tournamentId)) : null;
  const teamA = activeMatch ? teams.find(t => (t.id === activeMatch.teamAId || t._id === activeMatch.teamAId)) : null;
  const teamB = activeMatch ? teams.find(t => (t.id === activeMatch.teamBId || t._id === activeMatch.teamBId)) : null;

  const rosterA = teamA ? players.filter(p => (p.teamId === teamA.id || p.teamId === teamA._id)) : [];
  const rosterB = teamB ? players.filter(p => (p.teamId === teamB.id || p.teamId === teamB._id)) : [];

  const handleSelectMatch = (m) => {
    setSelectedMatchId(m.id || m._id);
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
    setError('');
    setSuccess('');
  };

  const handleSaveMatch = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoadingState(true);

    try {
      await updateMatch(activeMatch.id || activeMatch._id, {
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
      setSuccess("Match details and scores successfully updated!");
      // Reload match details from updated state
      const updated = matches.find(m => (m.id === (activeMatch.id || activeMatch._id) || m._id === (activeMatch.id || activeMatch._id)));
      if (updated) handleSelectMatch(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingState(false);
    }
  };

  const handleDeleteFixture = async () => {
    if (window.confirm("Are you sure you want to delete this match? Standings and player ratings will not be rolled back automatically, but the fixture will be removed.")) {
      try {
        await deleteMatch(activeMatch.id || activeMatch._id);
        setSelectedMatchId(null);
      } catch (err) {
        setError(err.message);
      }
    }
  };

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
          max-height: 75vh;
          overflow-y: auto;
          padding-right: 0.25rem;
        }
        .fixture-group-header {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--primary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 0.75rem;
          margin-bottom: 0.25rem;
          padding-bottom: 0.15rem;
          border-bottom: 1px solid var(--border-color);
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
          background-color: rgba(255,215,0,0.02);
        }
        .fixture-card-selector:hover:not(.active) {
          border-color: var(--border-hover);
        }
        .fixture-teams-line {
          font-weight: 700;
          font-size: 0.85rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .game-card-box {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .player-vs-headline {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1.5rem;
          font-size: 1.1rem;
          font-weight: 800;
          padding: 1rem 0;
        }
        .player-head-detail {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          flex: 1;
        }
        .player-vs-vs {
          font-weight: 900;
          font-size: 0.75rem;
          color: var(--text-secondary);
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border-color);
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
        }
      `}</style>

      <div className="match-panels-split">
        {/* Left Side: Fixtures List Grouped by Tournament */}
        <div>
          <span className="card-title-sub" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem' }}>League Matches Directory</span>
          <div className="fixtures-list-scroller">
            {tournaments.map(tour => {
              const tourFixtures = matches.filter(m => (m.tournamentId === tour.id || m.tournamentId === tour._id));
              if (tourFixtures.length === 0) return null;

              return (
                <div key={tour.id || tour._id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div className="fixture-group-header">{tour.name}</div>
                  {tourFixtures
                    .sort((a,b) => a.round - b.round || a.matchNumber - b.matchNumber)
                    .map(m => {
                      const tA = teams.find(t => (t.id === m.teamAId || t._id === m.teamAId));
                      const tB = teams.find(t => (t.id === m.teamBId || t._id === m.teamBId));
                      const pA = players.find(p => (p.id === m.playerAId || p._id === m.playerAId));
                      const pB = players.find(p => (p.id === m.playerBId || p._id === m.playerBId));

                      let resultStatus = "Scheduled";
                      if (m.isCompleted) {
                        let ptsA = 0; let ptsB = 0;
                        if (m.game1Result === 'playerA') ptsA += 1;
                        else if (m.game1Result === 'playerB') ptsB += 1;
                        else if (m.game1Result === 'draw') { ptsA += 0.5; ptsB += 0.5; }

                        if (m.game2Result === 'playerA') ptsA += 1;
                        else if (m.game2Result === 'playerB') ptsB += 1;
                        else if (m.game2Result === 'draw') { ptsA += 0.5; ptsB += 0.5; }
                        resultStatus = `${ptsA} - ${ptsB}`;
                      }

                      return (
                        <div
                          key={m.id || m._id}
                          className={`fixture-card-selector ${selectedMatchId === (m.id || m._id) ? 'active' : ''}`}
                          onClick={() => handleSelectMatch(m)}
                        >
                          <div className="flex-between" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', alignItems: 'center' }}>
                            <span style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                              Round {m.round} • Match {m.matchNumber}
                              {m.isCrazyGame && <span title="Crazy Game" style={{ cursor: 'help' }}>🤪</span>}
                              {m.isGreatestGame && <span title="Greatest Game" style={{ cursor: 'help' }}>⭐</span>}
                            </span>
                            <span className={`badge ${m.isCompleted ? 'badge-completed' : 'badge-active'}`} style={{ scale: '0.85' }}>
                              {m.isCompleted ? 'Finished' : 'Pending'}
                            </span>
                          </div>
                          
                          <div className="fixture-teams-line">
                            <span style={{ color: m.isCompleted && m.game1Result === 'playerA' ? 'var(--primary)' : 'inherit' }}>
                              {pA ? pA.name.split(' ').pop() : 'Player A'}
                            </span>
                            <span className="text-gold" style={{ fontSize: '0.75rem', backgroundColor: 'var(--bg-tertiary)', padding: '0.05rem 0.4rem', borderRadius: '4px' }}>
                              {resultStatus}
                            </span>
                            <span style={{ color: m.isCompleted && m.game1Result === 'playerB' ? 'var(--primary)' : 'inherit' }}>
                              {pB ? pB.name.split(' ').pop() : 'Player B'}
                            </span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                            <span>{tA ? tA.logo : ''} {tA ? tA.name : ''} vs {tB ? tB.name : ''} {tB ? tB.logo : ''}</span>
                            <span>{m.date}</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              );
            })}
            {matches.length === 0 && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No matches registered yet.</p>
            )}
          </div>
        </div>

        {/* Right Side: Detailed Match Setup and Score Recording Workspace */}
        <div>
          {activeMatch && teamA && teamB ? (
            <div className="card">
              <div className="flex-between mb-3" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <div>
                  <span className="page-subtitle" style={{ textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 'bold' }}>
                    {activeTournament ? activeTournament.name : 'Chess Freaks Match'}
                  </span>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: '900', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    Round {activeMatch.round} • Match {activeMatch.matchNumber} Fixture
                    {activeMatch.isCrazyGame && <span title="Crazy Game" style={{ cursor: 'help' }}>🤪</span>}
                    {activeMatch.isGreatestGame && <span title="Greatest Game" style={{ cursor: 'help' }}>⭐</span>}
                  </h2>
                </div>

                <div style={{ padding: '0.5rem 1rem', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span className="card-title-sub" style={{ fontSize: '0.6rem' }}>Status</span>
                  <span className={`badge ${activeMatch.isCompleted ? 'badge-completed' : 'badge-active'}`} style={{ marginTop: '0.2rem' }}>
                    {activeMatch.isCompleted ? 'Finished' : 'Pending'}
                  </span>
                </div>
              </div>

              {error && <p className="text-rose mb-3" style={{ fontSize: '0.85rem' }}>{error}</p>}
              {success && <p className="text-emerald mb-3" style={{ fontSize: '0.85rem' }}>{success}</p>}

              {/* Roster & Specs Panel */}
              <form onSubmit={handleSaveMatch} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="game-card-box">
                  <span className="card-title-sub" style={{ fontSize: '0.75rem', display: 'block' }}>Match Opponents Pairing</span>

                  <div className="player-vs-headline">
                    <div className="player-head-detail">
                      <span style={{ fontSize: '1.5rem' }}>{teamA.logo}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{teamA.name}</span>
                      {user?.role === 'admin' && !activeMatch.isCompleted ? (
                        <select className="form-select mt-1" value={editPlayerA} onChange={(e) => setEditPlayerA(e.target.value)}>
                          {rosterA.map(p => (
                            <option key={p.id || p._id} value={p.id || p._id}>{p.name} ({p.elo})</option>
                          ))}
                        </select>
                      ) : (
                        <span style={{ fontWeight: 'bold', marginTop: '0.25rem' }}>
                          {players.find(p => (p.id === activeMatch.playerAId || p._id === activeMatch.playerAId))?.name || 'N/A'}
                        </span>
                      )}
                    </div>

                    <span className="player-vs-vs">VS</span>

                    <div className="player-head-detail">
                      <span style={{ fontSize: '1.5rem' }}>{teamB.logo}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{teamB.name}</span>
                      {user?.role === 'admin' && !activeMatch.isCompleted ? (
                        <select className="form-select mt-1" value={editPlayerB} onChange={(e) => setEditPlayerB(e.target.value)}>
                          {rosterB.map(p => (
                            <option key={p.id || p._id} value={p.id || p._id}>{p.name} ({p.elo})</option>
                          ))}
                        </select>
                      ) : (
                        <span style={{ fontWeight: 'bold', marginTop: '0.25rem' }}>
                          {players.find(p => (p.id === activeMatch.playerBId || p._id === activeMatch.playerBId))?.name || 'N/A'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Match Specifications */}
                <div className="grid-3" style={{ gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Time Control</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editTimeControl}
                      onChange={(e) => setEditTimeControl(e.target.value)}
                      disabled={activeMatch.isCompleted || (!user || user.role !== 'admin')}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Variant</label>
                    <select
                      className="form-select"
                      value={editVariant}
                      onChange={(e) => setEditVariant(e.target.value)}
                      disabled={activeMatch.isCompleted || (!user || user.role !== 'admin')}
                    >
                      <option value="Standard">Standard</option>
                      <option value="960">Chess960</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      disabled={activeMatch.isCompleted || (!user || user.role !== 'admin')}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Match Link (optional)</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="e.g. https://lichess.org/..."
                      value={editMatchLink}
                      onChange={(e) => setEditMatchLink(e.target.value)}
                      disabled={activeMatch.isCompleted || (!user || user.role !== 'admin')}
                    />
                    {activeMatch.matchLink && (
                      <a href={activeMatch.matchLink} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center' }}>
                        <Link size={16} />
                      </a>
                    )}
                  </div>
                </div>

                {/* Game Outcomes */}
                <div className="grid-2" style={{ gap: '1rem' }}>
                  <div className="game-card-box">
                    <span className="card-title-sub" style={{ fontSize: '0.7rem' }}>Game 1: Player A vs Player B</span>
                    {user?.role === 'admin' && !activeMatch.isCompleted ? (
                      <select className="form-select" value={editGame1} onChange={(e) => setEditGame1(e.target.value)}>
                        <option value="">Pending...</option>
                        <option value="playerA">Winner: Player A ({players.find(p => (p.id === editPlayerA || p._id === editPlayerA))?.name})</option>
                        <option value="playerB">Winner: Player B ({players.find(p => (p.id === editPlayerB || p._id === editPlayerB))?.name})</option>
                        <option value="draw">Draw</option>
                        <option value="NP">NP (Not Played)</option>
                      </select>
                    ) : (
                      <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--primary)' }}>
                        {activeMatch.game1Result === 'playerA' ? 'Winner: Player A' : activeMatch.game1Result === 'playerB' ? 'Winner: Player B' : activeMatch.game1Result === 'draw' ? 'Draw' : activeMatch.game1Result === 'NP' ? 'NP (Not Played)' : 'Pending'}
                      </div>
                    )}
                  </div>

                  <div className="game-card-box">
                    <span className="card-title-sub" style={{ fontSize: '0.7rem' }}>Game 2: Player B vs Player A</span>
                    {user?.role === 'admin' && !activeMatch.isCompleted ? (
                      <select className="form-select" value={editGame2} onChange={(e) => setEditGame2(e.target.value)}>
                        <option value="">Pending...</option>
                        <option value="playerA">Winner: Player A ({players.find(p => (p.id === editPlayerA || p._id === editPlayerA))?.name})</option>
                        <option value="playerB">Winner: Player B ({players.find(p => (p.id === editPlayerB || p._id === editPlayerB))?.name})</option>
                        <option value="draw">Draw</option>
                        <option value="NP">NP (Not Played)</option>
                      </select>
                    ) : (
                      <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--primary)' }}>
                        {activeMatch.game2Result === 'playerA' ? 'Winner: Player A' : activeMatch.game2Result === 'playerB' ? 'Winner: Player B' : activeMatch.game2Result === 'draw' ? 'Draw' : activeMatch.game2Result === 'NP' ? 'NP (Not Played)' : 'Pending'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Finalize and Complete Panels */}
                {user?.role === 'admin' && !activeMatch.isCompleted && (
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input
                          type="checkbox"
                          checked={editCompleted}
                          onChange={(e) => setEditCompleted(e.target.checked)}
                        />
                        <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>Finalize Match & Trigger Elo Rating Recalculation</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input
                          type="checkbox"
                          checked={editCrazyGame}
                          onChange={(e) => setEditCrazyGame(e.target.checked)}
                        />
                        <span>🤪 Crazy Game</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input
                          type="checkbox"
                          checked={editGreatestGame}
                          onChange={(e) => setEditGreatestGame(e.target.checked)}
                        />
                        <span>⭐ Greatest Game</span>
                      </label>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button type="submit" className="btn btn-primary" disabled={loadingState}>
                        <Check size={16} /> {loadingState ? 'Saving...' : 'Save & Update Outcomes'}
                      </button>
                      <button type="button" className="btn btn-outline" style={{ color: 'var(--accent-rose)', border: '1px solid rgba(244,63,94,0.3)', marginLeft: 'auto' }} onClick={handleDeleteFixture}>
                        <Trash2 size={16} /> Delete Match Fixture
                      </button>
                    </div>
                  </div>
                )}
              </form>

              {/* Show completed details summary */}
              {activeMatch.isCompleted && (
                <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '1.25rem', paddingTop: '1.25rem', backgroundColor: 'rgba(255,255,255,0.01)', padding: '1rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary)', textTransform: 'uppercase' }}>Match Completion details</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <Calendar size={14} style={{ color: 'var(--text-secondary)' }} /> Completed Date: <strong>{activeMatch.date}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <User size={14} style={{ color: 'var(--text-secondary)' }} /> Player A Rating: <strong>{players.find(p => (p.id === activeMatch.playerAId || p._id === activeMatch.playerAId))?.elo} Elo</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <User size={14} style={{ color: 'var(--text-secondary)' }} /> Player B Rating: <strong>{players.find(p => (p.id === activeMatch.playerBId || p._id === activeMatch.playerBId))?.elo} Elo</strong>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card text-center" style={{ padding: '5rem 2rem', color: 'var(--text-secondary)' }}>
              <RefreshCcw size={36} style={{ margin: '0 auto 1.25rem', opacity: '0.5' }} />
              <p>No fixture selected. Select a pending or finished matchup from the sidebar log to record scores or review ratings.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
