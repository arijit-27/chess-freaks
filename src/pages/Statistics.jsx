// src/pages/Statistics.jsx
import React, { useState } from 'react';
import { Award, Trophy, Users, Search, Star, Medal } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Statistics() {
  const { players, teams, tournaments, matches, playerAchievements } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [teamFilter, setTeamFilter] = useState('');

  // 1. Calculate general stats summaries
  const totalTourneys = tournaments.length;
  const completedTourneys = tournaments.filter(t => t.status === 'COMPLETED').length;
  
  // Sort players by Elo for overall ranking
  const sortedPlayers = [...players].sort((a, b) => b.elo - a.elo);

  // Filter rankings
  const filteredRankings = sortedPlayers.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTeam = teamFilter ? p.teamId === teamFilter : true;
    return matchesSearch && matchesTeam;
  });

  return (
    <div className="statistics-page-container">
      <style>{`
        .statistics-page-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .stats-top-panels {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }
        @media (max-width: 1024px) {
          .stats-top-panels {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 600px) {
          .stats-top-panels {
            grid-template-columns: 1fr;
          }
        }
        .stats-summary-box {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 8px;
        }
        .stats-summary-icon {
          width: 42px;
          height: 42px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .medal-badge-display {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-weight: bold;
          font-size: 0.85rem;
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border-color);
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
        }
        .medal-gold { color: #ffd700; text-shadow: 0 0 6px rgba(255,215,0,0.3); }
        .medal-silver { color: #c0c0c0; text-shadow: 0 0 6px rgba(192,192,192,0.3); }
        .medal-bronze { color: #cd7f32; text-shadow: 0 0 6px rgba(205,127,50,0.3); }
        .medal-mvp { color: #3b82f6; text-shadow: 0 0 6px rgba(59,130,246,0.3); }

        .search-filter-row {
          display: flex;
          gap: 1rem;
          background: var(--bg-card);
          padding: 1rem;
          border: 1px solid var(--border-color);
          border-radius: 8px;
        }
        @media (max-width: 600px) {
          .search-filter-row {
            flex-direction: column;
          }
        }
        .search-box-wrapper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 0.5rem 0.75rem;
          flex: 1;
        }
        .search-box-wrapper input {
          background: transparent;
          border: none;
          color: var(--text-primary);
          outline: none;
          width: 100%;
          font-size: 0.875rem;
        }
      `}</style>

      {/* Overview summaries */}
      <div className="stats-top-panels">
        <div className="stats-summary-box">
          <div className="stats-summary-icon" style={{ backgroundColor: 'rgba(255, 215, 0, 0.08)', color: 'var(--primary)' }}>
            <Trophy size={18} />
          </div>
          <div>
            <span className="card-title-sub">Tournaments Run</span>
            <div className="card-value" style={{ fontSize: '1.25rem' }}>{totalTourneys} Active</div>
          </div>
        </div>

        <div className="stats-summary-box">
          <div className="stats-summary-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', color: 'var(--accent-emerald)' }}>
            <Award size={18} />
          </div>
          <div>
            <span className="card-title-sub">Finished Leagues</span>
            <div className="card-value" style={{ fontSize: '1.25rem' }}>{completedTourneys} Completed</div>
          </div>
        </div>

        <div className="stats-summary-box">
          <div className="stats-summary-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', color: 'var(--accent-cobalt)' }}>
            <Users size={18} />
          </div>
          <div>
            <span className="card-title-sub">Ranked Masters</span>
            <div className="card-value" style={{ fontSize: '1.25rem' }}>{players.length} Players</div>
          </div>
        </div>

        <div className="stats-summary-box">
          <div className="stats-summary-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.08)', color: 'var(--accent-amber)' }}>
            <Star size={18} />
          </div>
          <div>
            <span className="card-title-sub">Highest Elo Rating</span>
            <div className="card-value" style={{ fontSize: '1.25rem' }}>{sortedPlayers[0] ? `${sortedPlayers[0].name} (${sortedPlayers[0].elo})` : 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* Filter panel */}
      <div className="search-filter-row">
        <div className="search-box-wrapper">
          <Search size={16} style={{ color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Search by player name or country..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select
          className="form-select"
          style={{ maxWidth: '240px' }}
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
        >
          <option value="">All Teams / Free Agents</option>
          {teams.map(t => (
            <option key={t.id} value={t.id}>{t.logo} {t.name}</option>
          ))}
        </select>
      </div>

      {/* Rankings Leaderboard Table */}
      <div className="card">
        <span className="card-title-sub" style={{ fontSize: '0.9rem', display: 'block', marginBottom: '1rem' }}>
          Esports Masters Statistics & Achievement Directory
        </span>
        
        <div className="table-container">
          <table className="esports-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Rank</th>
                <th>Player</th>
                <th>Team</th>
                <th style={{ textAlign: 'center' }}>Elo Rating</th>
                <th style={{ textAlign: 'center' }}>W - D - L</th>
                <th style={{ textAlign: 'center' }}>Win %</th>
                <th style={{ textAlign: 'right', paddingRight: '2rem' }}>Achievements / Medals</th>
              </tr>
            </thead>
            <tbody>
              {filteredRankings.length > 0 ? (
                filteredRankings.map((p, idx) => {
                  const team = teams.find(t => t.id === p.teamId);
                  const ach = playerAchievements[p.id] || { gold: 0, silver: 0, bronze: 0, mvps: 0 };
                  
                  // Combine baseline DB MVP counts with dynamic tournament MVPs
                  const totalMVPs = (p.mvps || 0) + (ach.mvps || 0);

                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 'bold' }}>#{idx + 1}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img src={p.photo} alt={p.name} style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)' }} />
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: '700' }}>{p.name}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{p.country}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontWeight: '600' }}>
                        {team ? (
                          <span>{team.logo} {team.name}</span>
                        ) : (
                          <span style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>Free Agent</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: '800', color: 'var(--primary)' }}>
                        {p.elo}
                      </td>
                      <td style={{ textAlign: 'center', fontSize: '0.85rem' }}>
                        {p.wins || 0}W - {p.draws || 0}D - {p.losses || 0}L
                      </td>
                      <td style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: '500' }}>
                        {p.winPercent || 0}%
                      </td>
                      <td style={{ textAlign: 'right', paddingRight: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          {ach.gold > 0 && (
                            <span className="medal-badge-display medal-gold" title="Gold Medals (Tournament 1st Place)">
                              🥇 {ach.gold}
                            </span>
                          )}
                          {ach.silver > 0 && (
                            <span className="medal-badge-display medal-silver" title="Silver Medals (Tournament 2nd Place)">
                              🥈 {ach.silver}
                            </span>
                          )}
                          {ach.bronze > 0 && (
                            <span className="medal-badge-display medal-bronze" title="Bronze Medals (Tournament 3rd Place)">
                              🥉 {ach.bronze}
                            </span>
                          )}
                          {totalMVPs > 0 && (
                            <span className="medal-badge-display medal-mvp" title="Tournament/Match MVP Awards">
                              🏆 {totalMVPs}
                            </span>
                          )}
                          {ach.gold === 0 && ach.silver === 0 && ach.bronze === 0 && totalMVPs === 0 && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>no medals</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No player rankings found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
