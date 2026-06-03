// src/components/PlayerCard.jsx
import React from 'react';
import { Award, TrendingUp, DollarSign, Edit, Trash2, Globe, Shield } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function PlayerCard({ player, onEdit }) {
  const { user, deletePlayer, teams } = useAppContext();
  
  // Find player's team name and logo
  const team = teams.find(t => t.id === player.teamId);
  const teamName = team ? team.name : "Free Agent";
  const teamLogo = team ? team.logo : "♟";

  // Determine Title Badges
  let titleBadge = null;
  let borderClass = "";
  if (player.elo >= 2500) {
    titleBadge = { text: "GM", class: "badge-gm" };
    borderClass = "border-gm-glow";
  } else if (player.elo >= 2300) {
    titleBadge = { text: "IM", class: "badge-im" };
    borderClass = "border-im-glow";
  } else if (player.elo >= 2000) {
    titleBadge = { text: "CFM", class: "badge-cfm" };
    borderClass = "border-cfm-glow";
  }

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to remove ${player.name}?`)) {
      try {
        await deletePlayer(player.id);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className={`card glow-hover player-card-container ${borderClass}`}>
      <style>{`
        .player-card-container {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .border-gm-glow {
          border-color: rgba(255, 69, 0, 0.4);
          box-shadow: 0 0 10px rgba(255, 69, 0, 0.1);
        }
        .border-im-glow {
          border-color: rgba(138, 43, 226, 0.4);
          box-shadow: 0 0 10px rgba(138, 43, 226, 0.1);
        }
        .border-cfm-glow {
          border-color: rgba(0, 206, 209, 0.4);
          box-shadow: 0 0 10px rgba(0, 206, 209, 0.1);
        }
        .player-header {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .player-avatar {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background-color: var(--bg-tertiary);
          border: 2px solid var(--border-color);
          padding: 4px;
          object-fit: cover;
        }
        .border-gm-glow .player-avatar { border-color: #ff4500; }
        .border-im-glow .player-avatar { border-color: #8a2be2; }
        .border-cfm-glow .player-avatar { border-color: #00ced1; }
        
        .player-info {
          flex-grow: 1;
        }
        .player-name {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .player-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
        .player-stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          padding: 0.75rem 0;
          border-top: 1px solid var(--border-color);
          border-bottom: 1px solid var(--border-color);
        }
        .stat-item {
          display: flex;
          flex-direction: column;
        }
        .stat-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
          text-transform: uppercase;
        }
        .stat-value {
          font-size: 0.95rem;
          font-weight: 600;
        }
        .win-bar-bg {
          height: 6px;
          background-color: var(--bg-tertiary);
          border-radius: 4px;
          overflow: hidden;
          margin-top: 0.25rem;
        }
        .win-bar-fill {
          height: 100%;
          background: linear-gradient(to right, var(--accent-rose), var(--accent-emerald));
          border-radius: 4px;
          transition: width 0.3s ease;
        }
        .player-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.85rem;
        }
        .admin-actions {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          display: flex;
          gap: 0.25rem;
        }
        .btn-mini {
          padding: 0.3rem;
          border-radius: 4px;
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          cursor: pointer;
        }
        .btn-mini:hover {
          color: var(--text-primary);
          border-color: var(--border-hover);
        }
      `}</style>

      {/* Admin Actions Overlay */}
      {user && user.role === 'admin' && (
        <div className="admin-actions">
          <button className="btn-mini" onClick={() => onEdit(player)} title="Edit Player">
            <Edit size={14} />
          </button>
          <button className="btn-mini" onClick={handleDelete} title="Delete Player">
            <Trash2 size={14} />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="player-header">
        <img
          src={player.photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(player.name)}`}
          alt={player.name}
          className="player-avatar"
          onError={(e) => {
            e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(player.name)}`;
          }}
        />
        <div className="player-info">
          <div className="player-name">
            {player.name}
            {titleBadge && (
              <span className={`badge ${titleBadge.class}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.3rem' }}>
                {titleBadge.text}
              </span>
            )}
          </div>
          <div className="player-meta">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Globe size={12} /> {player.country}
            </span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Shield size={12} /> {teamLogo} {teamName}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Middle section */}
      <div className="player-stats-grid">
        <div className="stat-item">
          <span className="stat-label">Rating</span>
          <span className="stat-value text-gold" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {player.elo} <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Elo</span>
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">MVP Awards</span>
          <span className="stat-value text-emerald" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Award size={14} /> {player.mvps || 0}
          </span>
        </div>
        <div className="stat-item" style={{ gridColumn: 'span 2' }}>
          <div className="flex-between">
            <span className="stat-label">Win Rate</span>
            <span className="stat-value text-emerald">{player.winPercent || 0}%</span>
          </div>
          <div className="win-bar-bg">
            <div className="win-bar-fill" style={{ width: `${player.winPercent || 0}%` }}></div>
          </div>
          <div className="flex-between" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
            <span>Wins: {player.wins || 0}</span>
            <span>Losses: {player.losses || 0}</span>
            <span>Draws: {player.draws || 0}</span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="player-footer">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span className="stat-label" style={{ fontSize: '0.65rem' }}>Status</span>
          <span className={`badge ${player.status === 'SOLD' ? 'badge-active' : 'badge-upcoming'}`} style={{ fontSize: '0.65rem', alignSelf: 'flex-start', marginTop: '0.1rem' }}>
            {player.status}
          </span>
        </div>
        <div className="text-right" style={{ display: 'flex', flexDirection: 'column' }}>
          <span className="stat-label" style={{ fontSize: '0.65rem' }}>Value</span>
          <span className="stat-value text-gold" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.1rem' }}>
            <DollarSign size={14} /> {player.auctionValue || 0}
          </span>
        </div>
      </div>
    </div>
  );
}
