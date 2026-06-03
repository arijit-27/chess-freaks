// src/pages/Teams.jsx
import React, { useState } from 'react';
import { DollarSign, Shield, ShieldAlert, Award, Star, Users, Trash2, Plus } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Teams() {
  const { user, teams, players, addTeam, deleteTeam } = useAppContext();
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('♞');
  const [owner, setOwner] = useState('');
  const [budget, setBudget] = useState(1000);
  const [error, setError] = useState('');

  // Selected Team profile details
  const [selectedTeamId, setSelectedTeamId] = useState(teams[0]?.id || null);
  const activeTeam = teams.find(t => t.id === selectedTeamId) || teams[0] || null;

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) return setError("Team name is required");
    if (!owner.trim()) return setError("Owner/Manager name is required");

    try {
      const created = await addTeam({
        name,
        logo,
        owner,
        budget: Number(budget) || 1000
      });
      setName('');
      setOwner('');
      setBudget(1000);
      setShowAddForm(false);
      setSelectedTeamId(created.id);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}? All its players will be released to the Free Agent pool.`)) {
      try {
        await deleteTeam(id);
        if (selectedTeamId === id) {
          setSelectedTeamId(null);
        }
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // Get players belonging to active team
  const roster = activeTeam
    ? players.filter(p => p.teamId === activeTeam.id)
    : [];

  const logoOptions = ["♞", "♟", "♚", "♝", "♛", "♜", "🛡", "⚔", "🔥", "⚡"];

  return (
    <div className="teams-container">
      <style>{`
        .teams-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .team-split-grid {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 1.5rem;
        }
        @media (max-width: 900px) {
          .team-split-grid {
            grid-template-columns: 1fr;
          }
        }
        .team-list-column {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .team-btn-item {
          width: 100%;
          text-align: left;
          padding: 1rem;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          color: var(--text-primary);
          cursor: pointer;
          position: relative;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.2s;
        }
        .team-btn-item.active {
          border-color: var(--primary);
          background-color: rgba(var(--primary-rgb), 0.04);
        }
        .team-btn-item:hover:not(.active) {
          border-color: var(--border-hover);
        }
        .delete-team-overlay {
          position: absolute;
          top: 50%;
          right: 1rem;
          transform: translateY(-50%);
          color: var(--text-secondary);
          background: transparent;
          border: none;
          cursor: pointer;
        }
        .delete-team-overlay:hover {
          color: var(--accent-rose);
        }
        .team-logo-display {
          font-size: 2.25rem;
          line-height: 1;
        }
        .team-details-header {
          display: flex;
          align-items: center;
          gap: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 1.5rem;
        }
        @media (max-width: 600px) {
          .team-details-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }
        }
        .team-badges-strip {
          display: flex;
          gap: 1.5rem;
        }
        .roster-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }
        .roster-mini-card {
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .logo-select-grid {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          padding: 0.5rem;
          background: var(--bg-tertiary);
          border-radius: 8px;
          border: 1px solid var(--border-color);
        }
        .logo-select-btn {
          width: 36px;
          height: 36px;
          font-size: 1.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          cursor: pointer;
        }
        .logo-select-btn.selected {
          border-color: var(--primary);
          background-color: rgba(var(--primary-rgb), 0.1);
        }
      `}</style>

      {/* Admin Action: Create Team */}
      {user && user.role === 'admin' && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
            <Plus size={16} /> {showAddForm ? 'Cancel Creation' : 'Register New Team'}
          </button>
        </div>
      )}

      {showAddForm && (
        <div className="card">
          <h3 className="mb-3">Register New Chess Franchise</h3>
          {error && <p className="text-rose mb-3" style={{ fontSize: '0.85rem' }}>{error}</p>}
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Team Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Gotham Knight Riders"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Franchise Owner / Manager</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Viswanathan Anand"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Initial Auction Budget (Credits)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 1000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Select Franchise Crest</label>
                <div className="logo-select-grid">
                  {logoOptions.map(l => (
                    <button
                      key={l}
                      type="button"
                      className={`logo-select-btn ${logo === l ? 'selected' : ''}`}
                      onClick={() => setLogo(l)}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
              Add Team
            </button>
          </form>
        </div>
      )}

      {/* Main Grid split */}
      <div className="team-split-grid">
        {/* Left Side: Team List Directory */}
        <div className="team-list-column">
          <span className="card-title-sub" style={{ fontSize: '0.8rem' }}>Franchises Directory</span>
          {teams.length > 0 ? (
            teams.map(t => (
              <div
                key={t.id}
                className={`team-btn-item ${selectedTeamId === t.id || (!selectedTeamId && activeTeam?.id === t.id) ? 'active' : ''}`}
                onClick={() => setSelectedTeamId(t.id)}
              >
                {user && user.role === 'admin' && (
                  <button className="delete-team-overlay" onClick={(e) => { e.stopPropagation(); handleDelete(t.id, t.name); }} title="Delete Team">
                    <Trash2 size={14} />
                  </button>
                )}
                <div className="team-logo-display">{t.logo}</div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem', paddingRight: '2rem' }}>{t.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Budget: {t.budget} Cr</div>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No franchises registered.</p>
          )}
        </div>

        {/* Right Side: Active Team Dashboard profile */}
        <div>
          {activeTeam ? (
            <div className="card">
              {/* Header Profile details */}
              <div className="team-details-header">
                <div className="team-logo-display" style={{ fontSize: '4.5rem', backgroundColor: 'var(--bg-tertiary)', width: '96px', height: '96px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)' }}>
                  {activeTeam.logo}
                </div>
                <div style={{ flexGrow: 1 }}>
                  <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>{activeTeam.name}</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Owner/Manager: <strong>{activeTeam.owner}</strong>
                  </p>
                  <div className="team-badges-strip mt-2">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <DollarSign size={16} className="text-gold" />
                      <span style={{ fontSize: '0.95rem', fontWeight: '700' }}>{activeTeam.budget} Cr <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 'normal' }}>Budget</span></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Award size={16} className="text-emerald" />
                      <span style={{ fontSize: '0.95rem', fontWeight: '700' }}>{activeTeam.points} <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 'normal' }}>League Pts</span></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Star size={16} className="text-gold" />
                      <span style={{ fontSize: '0.95rem', fontWeight: '700' }}>{activeTeam.wins}W - {activeTeam.draws}D - {activeTeam.losses}L</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Roster Listing */}
              <div>
                <span className="card-title-sub" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={16} /> Signed Team Roster ({roster.length} Players)
                </span>
                
                {roster.length > 0 ? (
                  <div className="roster-grid">
                    {roster.map(p => {
                      let titleBadge = "";
                      if (p.elo >= 2500) titleBadge = "GM";
                      else if (p.elo >= 2300) titleBadge = "IM";
                      else if (p.elo >= 2000) titleBadge = "CFM";
                      return (
                        <div key={p.id} className="roster-mini-card">
                          <img src={p.photo} alt={p.name} style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)' }} />
                          <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                            <span style={{ fontWeight: '700', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              {p.name}
                              {titleBadge && (
                                <span style={{ fontSize: '0.6rem', color: 'var(--primary)', fontWeight: 'bold' }}>[{titleBadge}]</span>
                              )}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Elo: {p.elo} | Cost: {p.auctionValue} Cr</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-secondary)', padding: '2rem 0', fontSize: '0.875rem' }}>
                    No players currently signed. Go to the Auction panel to sign new players!
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="card text-center" style={{ padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
              <ShieldAlert size={32} style={{ margin: '0 auto 1rem', opacity: '0.5' }} />
              <p>No franchise selected. Choose or register a franchise from the sidebar directory.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
