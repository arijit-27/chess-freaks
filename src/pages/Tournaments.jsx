// src/pages/Tournaments.jsx
import React, { useState } from 'react';
import { Calendar, Users, Trophy, Play, Plus, Trash2, LayoutGrid } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Tournaments() {
  const { user, tournaments, teams, matches, addTournament, deleteTournament, addMatch } = useAppContext();
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [format, setFormat] = useState('Round Robin');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [error, setError] = useState('');

  // Long Format custom match states
  const [showAddMatchForm, setShowAddMatchForm] = useState(false);
  const [matchTeamA, setMatchTeamA] = useState('');
  const [matchTeamB, setMatchTeamB] = useState('');
  const [matchRound, setMatchRound] = useState(1);
  const [matchDate, setMatchDate] = useState('');
  const [matchError, setMatchError] = useState('');

  // Selected tournament details
  const [selectedTourId, setSelectedTourId] = useState(tournaments[0]?.id || null);
  const activeTournament = tournaments.find(t => t.id === selectedTourId) || tournaments[0] || null;

  const activeTourTeams = activeTournament
    ? teams.filter(t => activeTournament.teams.includes(t.id))
    : [];

  const handleCreateMatch = async (e) => {
    e.preventDefault();
    setMatchError('');

    if (!matchTeamA || !matchTeamB) {
      return setMatchError("Please select both Team A and Team B");
    }
    if (matchTeamA === matchTeamB) {
      return setMatchError("Team A and Team B cannot be the same");
    }

    try {
      await addMatch({
        tournamentId: activeTournament.id,
        teamAId: matchTeamA,
        teamBId: matchTeamB,
        round: Number(matchRound) || 1,
        date: matchDate || new Date().toISOString().split('T')[0],
        stage: `Round ${matchRound}`
      });
      setMatchTeamA('');
      setMatchTeamB('');
      setMatchRound(1);
      setMatchDate('');
      setShowAddMatchForm(false);
    } catch (err) {
      setMatchError(err.message);
    }
  };

  const handleTeamToggle = (teamId) => {
    setSelectedTeams(prev =>
      prev.includes(teamId) ? prev.filter(id => id !== teamId) : [...prev, teamId]
    );
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) return setError("Name is required");
    if (selectedTeams.length < 2) return setError("Select at least 2 teams");
    if (!startDate || !endDate) return setError("Dates are required");

    try {
      const created = await addTournament({
        name,
        format,
        startDate,
        endDate,
        teams: selectedTeams
      });
      setName('');
      setSelectedTeams([]);
      setShowAddForm(false);
      setSelectedTourId(created.id);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This will clear all its match fixtures.`)) {
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

  // Filter matches for the active tournament
  const tourMatches = activeTournament
    ? matches.filter(m => m.tournamentId === activeTournament.id)
    : [];

  // Group matches by round/stage
  const rounds = {};
  tourMatches.forEach(m => {
    const key = m.stage || `Round ${m.round}`;
    if (!rounds[key]) rounds[key] = [];
    rounds[key].push(m);
  });

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
          grid-template-columns: 320px 1fr;
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
          background-color: rgba(var(--primary-rgb), 0.04);
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
        .teams-check-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
          padding: 0.5rem;
          background: var(--bg-secondary);
          border-radius: 8px;
          border: 1px solid var(--border-color);
          max-height: 150px;
          overflow-y: auto;
        }
        .team-checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          cursor: pointer;
          padding: 0.25rem;
        }
        .rounds-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .round-box {
          border: 1px solid var(--border-color);
          border-radius: 8px;
          overflow: hidden;
        }
        .round-header-banner {
          background-color: rgba(255,255,255,0.02);
          padding: 0.75rem 1rem;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--primary);
          text-transform: uppercase;
          border-bottom: 1px solid var(--border-color);
        }
        .match-row-item {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid var(--border-color);
        }
        .match-row-item:last-child {
          border-bottom: none;
        }
        .match-team-display {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
        }
        .match-vs-node {
          padding: 0.25rem 0.75rem;
          background-color: var(--bg-tertiary);
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: bold;
          color: var(--text-secondary);
        }
      `}</style>

      {/* Admin Quick Action - Create Tournament Modal/Form */}
      {user && user.role === 'admin' && (
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
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Tournament Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Grand Masters Open 2026"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tournament Format</label>
                <select className="form-select" value={format} onChange={(e) => setFormat(e.target.value)}>
                  <option value="Round Robin">Round Robin (Single Cycle)</option>
                  <option value="League Format">League Format (Double Round Robin)</option>
                  <option value="Swiss System">Swiss System (Points Matching)</option>
                  <option value="Knockout">Knockout (Bracket Tree)</option>
                  <option value="Long Format">Long Format (Custom Match Creation)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Participating Teams</label>
              <div className="teams-check-grid">
                {teams.map(t => (
                  <label key={t.id} className="team-checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedTeams.includes(t.id)}
                      onChange={() => handleTeamToggle(t.id)}
                    />
                    <span>{t.logo} {t.name}</span>
                  </label>
                ))}
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
              Generate Fixtures & Create
            </button>
          </form>
        </div>
      )}

      {/* Main Tournaments Columns */}
      <div className="tour-grid">
        {/* Left Side: Tournament Lists Selector */}
        <div className="tour-list-bar">
          <span className="card-title-sub" style={{ fontSize: '0.8rem' }}>Tournaments Directory</span>
          {tournaments.length > 0 ? (
            tournaments.map(t => (
              <div
                key={t.id}
                className={`tour-item-btn ${selectedTourId === t.id || (!selectedTourId && activeTournament?.id === t.id) ? 'active' : ''}`}
                onClick={() => setSelectedTourId(t.id)}
              >
                {user && user.role === 'admin' && (
                  <button className="delete-tour-btn" onClick={(e) => { e.stopPropagation(); handleDelete(t.id, t.name); }} title="Delete Tournament">
                    <Trash2 size={14} />
                  </button>
                )}
                <div style={{ fontWeight: '700', fontSize: '0.95rem', paddingRight: '1.5rem' }}>{t.name}</div>
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

        {/* Right Side: Active Tournament Match Fixtures List */}
        <div>
          {activeTournament ? (
            <div className="card">
              <div className="flex-between mb-3" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>{activeTournament.name}</h2>
                  <div style={{ display: 'flex', gap: '0.8rem', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    <span>Format: <strong>{activeTournament.format}</strong></span>
                    <span>•</span>
                    <span>Teams: <strong>{activeTournament.teams.length}</strong></span>
                    <span>•</span>
                    <span>Dates: <strong>{activeTournament.startDate} to {activeTournament.endDate}</strong></span>
                  </div>
                </div>
                <span className={`badge ${activeTournament.status === 'ACTIVE' ? 'badge-active' : 'badge-completed'}`}>
                  {activeTournament.status}
                </span>
              </div>

              {/* If it's a Long Format, allow manual match creation */}
              {user && user.role === 'admin' && activeTournament.format === 'Long Format' && (
                <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem' }}>
                  <button className="btn btn-secondary" onClick={() => setShowAddMatchForm(!showAddMatchForm)}>
                    <Plus size={16} /> {showAddMatchForm ? 'Close Match Form' : 'New Match'}
                  </button>

                  {showAddMatchForm && (
                    <form onSubmit={handleCreateMatch} className="card" style={{ marginTop: '1rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Schedule Custom Match</h4>
                      {matchError && <p className="text-rose" style={{ fontSize: '0.8rem', marginBottom: 0 }}>{matchError}</p>}
                      <div className="grid-2" style={{ gap: '1rem' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" style={{ fontSize: '0.75rem' }}>Team A</label>
                          <select className="form-select" value={matchTeamA} onChange={(e) => setMatchTeamA(e.target.value)}>
                            <option value="">Select Team A...</option>
                            {activeTourTeams.map(t => (
                              <option key={t.id} value={t.id}>{t.logo} {t.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" style={{ fontSize: '0.75rem' }}>Team B</label>
                          <select className="form-select" value={matchTeamB} onChange={(e) => setMatchTeamB(e.target.value)}>
                            <option value="">Select Team B...</option>
                            {activeTourTeams.map(t => (
                              <option key={t.id} value={t.id}>{t.logo} {t.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="grid-2" style={{ gap: '1rem' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" style={{ fontSize: '0.75rem' }}>Round</label>
                          <input type="number" min="1" className="form-input" value={matchRound} onChange={(e) => setMatchRound(e.target.value)} />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" style={{ fontSize: '0.75rem' }}>Date</label>
                          <input type="date" className="form-input" value={matchDate} onChange={(e) => setMatchDate(e.target.value)} />
                        </div>
                      </div>
                      <button type="submit" className="btn btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', alignSelf: 'flex-start' }}>
                        Create Match
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Match Round Groupings */}
              <div className="rounds-section">
                <span className="card-title-sub" style={{ fontSize: '0.8rem', display: 'block' }}>Match Fixtures & Opponent Pairings</span>
                {Object.keys(rounds).length > 0 ? (
                  Object.keys(rounds).sort().map(roundKey => (
                    <div key={roundKey} className="round-box">
                      <div className="round-header-banner">{roundKey}</div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {rounds[roundKey].map(m => {
                          const tA = teams.find(team => team.id === m.teamAId);
                          const tB = teams.find(team => team.id === m.teamBId);
                          
                          // Get completed status and board point aggregates if finished
                          let matchResultText = "Scheduled";
                          let highlightResult = false;
                          if (m.isCompleted) {
                            // Fetch result from board points
                            let ptsA = 0; let ptsB = 0;
                            m.boards.forEach(b => {
                              if (b.result === '1-0') ptsA += 1;
                              else if (b.result === '0-1') ptsB += 1;
                              else if (b.result === '0.5-0.5') { ptsA += 0.5; ptsB += 0.5; }
                            });
                            matchResultText = `${ptsA} - ${ptsB}`;
                            highlightResult = true;
                          }

                          return (
                            <div key={m.id} className="match-row-item">
                              {/* Team A */}
                              <div className="match-team-display">
                                <span style={{ fontSize: '1.15rem' }}>{tA ? tA.logo : '♟'}</span>
                                <span style={{ fontSize: '0.9rem' }}>{tA ? tA.name : 'Unknown Team'}</span>
                              </div>

                              {/* VS Box / Result */}
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div className={`match-vs-node ${highlightResult ? 'text-gold' : ''}`} style={{ fontSize: highlightResult ? '0.85rem' : '0.7rem', padding: '0.3rem 0.6rem' }}>
                                  {matchResultText}
                                </div>
                                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                                  {m.date}
                                </span>
                              </div>

                              {/* Team B */}
                              <div className="match-team-display" style={{ justifyContent: 'flex-end' }}>
                                <span style={{ fontSize: '0.9rem' }}>{tB ? tB.name : 'Unknown Team'}</span>
                                <span style={{ fontSize: '1.15rem' }}>{tB ? tB.logo : '♟'}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
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
