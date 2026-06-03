// src/pages/Players.jsx
import React, { useState } from 'react';
import { Search, UserPlus, SlidersHorizontal, Eye } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import PlayerCard from '../components/PlayerCard';

export default function Players() {
  const { user, players, teams, addPlayer, updatePlayer } = useAppContext();
  
  // Filtering states
  const [searchName, setSearchName] = useState('');
  const [filterTeam, setFilterTeam] = useState('ALL');
  const [filterTitle, setFilterTitle] = useState('ALL');
  const [eloMin, setEloMin] = useState(1000);
  const [eloMax, setEloMax] = useState(3000);
  const [showFilters, setShowFilters] = useState(false);

  // Admin add/edit states
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [country, setCountry] = useState('USA');
  const [elo, setElo] = useState(1500);
  const [teamId, setTeamId] = useState('');
  const [photo, setPhoto] = useState('');
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [draws, setDraws] = useState(0);
  const [mvps, setMvps] = useState(0);
  const [error, setError] = useState('');

  const resetForm = () => {
    setName('');
    setCountry('USA');
    setElo(1500);
    setTeamId('');
    setPhoto('');
    setWins(0);
    setLosses(0);
    setDraws(0);
    setMvps(0);
    setError('');
    setIsEditing(false);
    setEditingPlayerId(null);
  };

  const handleEditClick = (player) => {
    setIsEditing(true);
    setEditingPlayerId(player.id);
    setName(player.name);
    setCountry(player.country);
    setElo(player.elo);
    setTeamId(player.teamId || '');
    setPhoto(player.photo || '');
    setWins(player.wins || 0);
    setLosses(player.losses || 0);
    setDraws(player.draws || 0);
    setMvps(player.mvps || 0);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) return setError("Player name is required");

    const playerData = {
      name,
      country,
      elo: Number(elo) || 1500,
      teamId: teamId || null,
      photo: photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`
    };

    try {
      if (isEditing) {
        // Include stats when editing
        const editData = {
          ...playerData,
          wins: Number(wins),
          losses: Number(losses),
          draws: Number(draws),
          mvps: Number(mvps)
        };
        await updatePlayer(editingPlayerId, editData);
      } else {
        await addPlayer(playerData);
      }
      resetForm();
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    }
  };

  // Filter application
  const filteredPlayers = players.filter(p => {
    // Name filter
    if (searchName && !p.name.toLowerCase().includes(searchName.toLowerCase())) return false;
    
    // Team filter
    if (filterTeam !== 'ALL') {
      if (filterTeam === 'FREE' && p.teamId !== null) return false;
      if (filterTeam !== 'FREE' && p.teamId !== filterTeam) return false;
    }

    // Title filter
    if (filterTitle !== 'ALL') {
      const elo = p.elo;
      let title = "NONE";
      if (elo >= 2500) title = "GM";
      else if (elo >= 2300) title = "IM";
      else if (elo >= 2000) title = "CFM";

      if (filterTitle !== title) return false;
    }

    // Elo Range filter
    if (p.elo < eloMin || p.elo > eloMax) return false;

    return true;
  });

  return (
    <div className="players-container">
      <style>{`
        .players-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .filter-header-bar {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        @media (max-width: 600px) {
          .filter-header-bar {
            flex-direction: column;
            align-items: stretch;
          }
        }
        .search-wrapper {
          position: relative;
          flex-grow: 1;
        }
        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-secondary);
        }
        .search-input {
          padding-left: 2.75rem;
        }
        .advanced-filters-panel {
          padding: 1.25rem;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.25rem;
        }
        .elo-range-values {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-top: 0.25rem;
        }
        .players-grid-layout {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }
      `}</style>

      {/* Action Header bar: search & filters toggle */}
      <div className="filter-header-bar">
        <div className="search-wrapper">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search chess masters by name..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
        </div>

        <button className="btn btn-secondary" onClick={() => setShowFilters(!showFilters)}>
          <SlidersHorizontal size={16} /> Filters
        </button>

        {user && user.role === 'admin' && (
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
            <UserPlus size={16} /> Add Player
          </button>
        )}
      </div>

      {/* Advanced filters Panel */}
      {showFilters && (
        <div className="advanced-filters-panel">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Franchise Team</label>
            <select className="form-select" value={filterTeam} onChange={(e) => setFilterTeam(e.target.value)}>
              <option value="ALL">All Players</option>
              <option value="FREE">Free Agents (Unsold)</option>
              {teams.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Title Badge</label>
            <select className="form-select" value={filterTitle} onChange={(e) => setFilterTitle(e.target.value)}>
              <option value="ALL">All Titles</option>
              <option value="GM">GM (Grandmaster)</option>
              <option value="IM">IM (International Master)</option>
              <option value="CFM">CFM (Chess Freaks Master)</option>
              <option value="NONE">No Title (&lt; 2000)</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0, gridColumn: 'span 2' }}>
            <label className="form-label">Elo Rating Range: {eloMin} - {eloMax}</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input
                type="range"
                min="1000"
                max="3000"
                step="50"
                value={eloMin}
                onChange={(e) => setEloMin(Math.min(Number(e.target.value), eloMax))}
                style={{ flexGrow: 1 }}
              />
              <input
                type="range"
                min="1000"
                max="3000"
                step="50"
                value={eloMax}
                onChange={(e) => setEloMax(Math.max(Number(e.target.value), eloMin))}
                style={{ flexGrow: 1 }}
              />
            </div>
            <div className="elo-range-values">
              <span>Min: 1000 Elo</span>
              <span>Max: 3000 Elo</span>
            </div>
          </div>
        </div>
      )}

      {/* Admin Add/Edit Player Modal */}
      {showForm && (
        <div className="card">
          <h3 className="mb-3">{isEditing ? 'Modify Player Profile' : 'Register New Player'}</h3>
          {error && <p className="text-rose mb-3" style={{ fontSize: '0.85rem' }}>{error}</p>}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Levon Aronian"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Country Code (3 letters)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. ARM"
                  value={country}
                  onChange={(e) => setCountry(e.target.value.toUpperCase())}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Elo Rating (Default: 1500)</label>
                <input
                  type="number"
                  className="form-input"
                  value={elo}
                  onChange={(e) => setElo(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Franchise (Optional)</label>
                <select className="form-select" value={teamId} onChange={(e) => setTeamId(e.target.value)}>
                  <option value="">No Franchise (Free Agent)</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Profile Image URL (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="https://example.com/photo.png"
                value={photo}
                onChange={(e) => setPhoto(e.target.value)}
              />
            </div>

            {isEditing && (
              <fieldset style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <legend style={{ padding: '0 0.5rem', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 'bold' }}>Career Statistics</legend>
                <div className="grid-4">
                  <div className="form-group">
                    <label className="form-label">Wins</label>
                    <input type="number" className="form-input" value={wins} onChange={(e) => setWins(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Losses</label>
                    <input type="number" className="form-input" value={losses} onChange={(e) => setLosses(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Draws</label>
                    <input type="number" className="form-input" value={draws} onChange={(e) => setDraws(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">MVPs</label>
                    <input type="number" className="form-input" value={mvps} onChange={(e) => setMvps(e.target.value)} />
                  </div>
                </div>
              </fieldset>
            )}

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary">
                {isEditing ? 'Save Changes' : 'Create Player'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); resetForm(); }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Players Grid layout */}
      {filteredPlayers.length > 0 ? (
        <div className="players-grid-layout">
          {filteredPlayers.map(p => (
            <PlayerCard
              key={p.id}
              player={p}
              onEdit={handleEditClick}
            />
          ))}
        </div>
      ) : (
        <div className="card text-center" style={{ padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
          <Eye size={32} style={{ margin: '0 auto 1rem', opacity: '0.5' }} />
          <p>No chess players match your search criteria. Try modifying your filters above.</p>
        </div>
      )}
    </div>
  );
}
