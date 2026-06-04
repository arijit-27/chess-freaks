// src/pages/Dashboard.jsx
import React from 'react';
import { Award, Users, Star, BarChart2, ShieldAlert, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAppContext } from '../context/AppContext';

export default function Dashboard() {
  const { players, teams, matches, tournaments } = useAppContext();

  // Find active ongoing tournament
  const activeTournament = tournaments.find(t => t.status === 'ACTIVE');

  let totalScoreA = 0;
  let totalScoreB = 0;
  let gamePtsA = 0;
  let gamePtsB = 0;
  let roundPtsA = 0;
  let roundPtsB = 0;
  let teamA = null;
  let teamB = null;

  if (activeTournament) {
    const teamAId = activeTournament.teams[0];
    const teamBId = activeTournament.teams[1];
    teamA = teams.find(t => (t.id === teamAId || t._id === teamAId));
    teamB = teams.find(t => (t.id === teamBId || t._id === teamBId));

    const tourMatches = matches.filter(m => (m.tournamentId === activeTournament.id || m.tournamentId === activeTournament._id));

    const rounds = {};
    tourMatches.forEach(m => {
      const key = m.round;
      if (!rounds[key]) rounds[key] = [];
      rounds[key].push(m);
    });

    Object.keys(rounds).sort((a,b) => Number(a) - Number(b)).forEach(roundNum => {
      let rBoardPtsA = 0;
      let rBoardPtsB = 0;
      let hasGames = false;

      rounds[roundNum].forEach(m => {
        if (!m.isCompleted) return;

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

      if (hasGames) {
        if (rBoardPtsA > rBoardPtsB) {
          roundPtsA += 1;
        } else if (rBoardPtsB > rBoardPtsA) {
          roundPtsB += 1;
        } else {
          roundPtsA += 0.5;
          roundPtsB += 0.5;
        }
      }
    });

    totalScoreA = gamePtsA + roundPtsA;
    totalScoreB = gamePtsB + roundPtsB;
  }

  // 1. Calculate General Stats
  const activePlayersCount = players.length;
  const teamStandings = [...teams].sort((a, b) => b.points - a.points || b.boardPoints - a.boardPoints);
  const highestEloPlayer = [...players].sort((a, b) => b.elo - a.elo)[0];
  
  const completedMatches = matches.filter(m => m.isCompleted).length;
  const pendingMatches = matches.filter(m => !m.isCompleted).length;
  
  const totalElo = players.reduce((sum, p) => sum + p.elo, 0);
  const avgElo = players.length ? Math.round(totalElo / players.length) : 1500;

  // 2. Data for Team Standings Chart
  const teamStandingsData = teamStandings.map(t => ({
    name: t.name,
    points: t.points,
    boardPoints: t.boardPoints
  }));

  // 3. Data for Highest Elo Chart
  const topMasters = [...players]
    .sort((a, b) => b.elo - a.elo)
    .slice(0, 5)
    .map((p, idx, arr) => {
      const lastName = p.name.split(' ').pop();
      const hasDuplicateLastName = arr.some((other, otherIdx) => 
        otherIdx !== idx && other.name.split(' ').pop() === lastName
      );
      const displayName = hasDuplicateLastName ? p.name : lastName;
      return {
        name: displayName,
        fullName: p.name,
        elo: p.elo
      };
    });

  // 4. Data for MVP Leaderboard
  const topMvps = [...players]
    .filter(p => p.mvps > 0)
    .sort((a, b) => b.mvps - a.mvps)
    .slice(0, 5);

  const colors = ['#d4af37', '#10b981', '#3b82f6', '#f59e0b', '#f43f5e'];

  return (
    <div className="dashboard-container">
      <style>{`
        .dashboard-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .stats-summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }
        @media (max-width: 1024px) {
          .stats-summary-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 600px) {
          .stats-summary-grid {
            grid-template-columns: 1fr;
          }
        }
        .summary-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
        }
        .summary-icon {
          width: 44px;
          height: 44px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .card-title-sub {
          font-size: 0.8rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          font-weight: 600;
        }
        .card-value {
          font-size: 1.5rem;
          font-weight: 700;
        }
        .charts-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        @media (max-width: 1024px) {
          .charts-row {
            grid-template-columns: 1fr;
          }
        }
        .chart-box {
          height: 320px;
          margin-top: 1rem;
        }
        .leaders-row {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 1.5rem;
        }
        @media (max-width: 1024px) {
          .leaders-row {
            grid-template-columns: 1fr;
          }
        }
        .custom-tooltip {
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          padding: 0.75rem;
          border-radius: 6px;
        }
        .mvp-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 0;
          border-bottom: 1px solid var(--border-color);
        }
        .mvp-item:last-child {
          border-bottom: none;
        }
        /* Esports Scoreboard styles */
        .scoreboard-panel {
          background: radial-gradient(circle at top, rgba(255,215,0,0.05) 0%, rgba(20,20,22,0.6) 100%);
          border: 1px solid rgba(255,215,0,0.15);
          border-radius: 12px;
          padding: 1.5rem;
          margin-top: 0.75rem;
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
      `}</style>

      {/* Live Ongoing Tournament Panel */}
      {activeTournament ? (
        <div className="card" style={{ border: '1px solid rgba(255,215,0,0.25)', padding: '1.5rem', boxShadow: '0 0 20px rgba(255,215,0,0.04)' }}>
          <div className="flex-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <div>
              <span className="card-title-sub" style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                ⚡ LIVE ONGOING TOURNAMENT
              </span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '900', marginTop: '0.25rem' }}>{activeTournament.name}</h2>
              <div style={{ display: 'flex', gap: '0.8rem', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                <span>Format: <strong>{activeTournament.format}</strong></span>
                <span>•</span>
                <span>Dates: <strong>{activeTournament.startDate} to {activeTournament.endDate}</strong></span>
              </div>
            </div>
            <div>
              <span className="badge badge-active" style={{ fontSize: '0.75rem' }}>
                {activeTournament.status}
              </span>
            </div>
          </div>

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
        </div>
      ) : (
        <div className="card text-center" style={{ padding: '2rem 1.5rem', color: 'var(--text-secondary)', border: '1px dashed var(--border-color)' }}>
          <span className="card-title-sub" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: '800' }}>⚡ LIVE ONGOING TOURNAMENT</span>
          <p style={{ fontSize: '0.85rem' }}>No active tournament is currently running. Setup or activate a tournament in the control room!</p>
        </div>
      )}

      {/* Analytics Summary Panels */}
      <div className="stats-summary-grid">
        <div className="card summary-card">
          <div className="summary-icon" style={{ backgroundColor: 'rgba(212, 175, 55, 0.08)', color: 'var(--primary)' }}>
            <Users size={20} />
          </div>
          <div>
            <span className="card-title-sub">Total Pool</span>
            <div className="card-value">{activePlayersCount} Players</div>
          </div>
        </div>

        <div className="card summary-card">
          <div className="summary-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', color: 'var(--accent-emerald)' }}>
            <Star size={20} />
          </div>
          <div>
            <span className="card-title-sub">Average rating</span>
            <div className="card-value">{avgElo} Elo</div>
          </div>
        </div>

        <div className="card summary-card">
          <div className="summary-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', color: 'var(--accent-cobalt)' }}>
            <CheckCircle size={20} />
          </div>
          <div>
            <span className="card-title-sub">Fixtures Played</span>
            <div className="card-value">{completedMatches} Matches</div>
          </div>
        </div>

        <div className="card summary-card">
          <div className="summary-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.08)', color: 'var(--accent-amber)' }}>
            <Award size={20} />
          </div>
          <div>
            <span className="card-title-sub">Top Player</span>
            <div className="card-value" style={{ fontSize: '1.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>
              {highestEloPlayer ? highestEloPlayer.name : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Standings Charts */}
      <div className="charts-row">
        {/* Team Points Standing Chart */}
        <div className="card">
          <div className="flex-between">
            <span className="card-title-sub" style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart2 size={16} /> Team Standings (Points)
            </span>
          </div>
          
          <div className="chart-box">
            {teamStandingsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamStandingsData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="custom-tooltip">
                            <p style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{payload[0].payload.name}</p>
                            <p style={{ color: 'var(--primary)', fontSize: '0.85rem' }}>Tournament Points: {payload[0].value}</p>
                            <p style={{ color: 'var(--accent-cobalt)', fontSize: '0.85rem' }}>Board Game Points: {payload[0].payload.boardPoints}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="points" radius={[4, 4, 0, 0]}>
                    {teamStandingsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                No team standings data available.
              </div>
            )}
          </div>
        </div>

        {/* Highest Rated Masters Chart */}
        <div className="card">
          <div className="flex-between">
            <span className="card-title-sub" style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Star size={16} /> Top 5 Player Ratings (Elo)
            </span>
          </div>
          
          <div className="chart-box">
            {topMasters.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topMasters} margin={{ top: 20, right: 10, left: -10, bottom: 5 }} layout="vertical">
                  <XAxis type="number" domain={[1500, 3000]} stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                  <YAxis type="category" dataKey="name" stroke="var(--text-secondary)" fontSize={11} tickLine={false} width={110} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="custom-tooltip">
                            <p style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{payload[0].payload.fullName}</p>
                            <p style={{ color: 'var(--primary)', fontSize: '0.85rem' }}>Current Elo: {payload[0].value}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="elo" fill="var(--primary)" radius={[0, 4, 4, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                No players registered yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Standings Table and MVP Leaders Row */}
      <div className="leaders-row">
        {/* Full Team Standings Grid */}
        <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
          <span className="card-title-sub" style={{ fontSize: '0.9rem', display: 'block', marginBottom: '1rem' }}>
            League Table Standings
          </span>
          <div className="table-container">
            <table className="esports-table">
              <thead>
                <tr>
                  <th>Pos</th>
                  <th>Team</th>
                  <th>Manager</th>
                  <th style={{ textAlign: 'center' }}>W - D - L</th>
                  <th style={{ textAlign: 'center' }}>Board Pts</th>
                  <th style={{ textAlign: 'right' }}>Pts</th>
                </tr>
              </thead>
              <tbody>
                {teamStandings.length > 0 ? (
                  teamStandings.map((t, idx) => (
                    <tr key={t.id || t._id}>
                      <td style={{ fontWeight: 'bold', width: '40px' }}>#{idx + 1}</td>
                      <td style={{ fontWeight: '600' }}>
                        <span style={{ marginRight: '0.5rem' }}>{t.logo}</span> {t.name}
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t.owner}</td>
                      <td style={{ textAlign: 'center', fontSize: '0.85rem' }}>
                        {t.wins}W - {t.draws}D - {t.losses}L
                      </td>
                      <td style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: '500' }}>
                        {t.boardPoints}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--primary)' }}>
                        {t.points}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No teams configured.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MVP Leaders List */}
        <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
          <span className="card-title-sub" style={{ fontSize: '0.9rem', display: 'block', marginBottom: '1rem' }}>
            MVP Award Leaders
          </span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {topMvps.length > 0 ? (
              topMvps.map((p, idx) => {
                const team = teams.find(t => (t.id === p.teamId || t._id === p.teamId));
                return (
                  <div key={p.id || p._id} className="mvp-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontWeight: '700', color: 'var(--text-secondary)', width: '20px' }}>
                        {idx + 1}
                      </span>
                      <img src={p.photo} alt={p.name} style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)' }} />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>{p.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {team ? team.name : 'Free Agent'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Award size={16} className="text-emerald" />
                      <span style={{ fontWeight: '700' }}>{p.mvps}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-secondary)' }}>
                No MVP awards logged yet. Record matches to award MVPs!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
