// src/pages/LandingPage.jsx
import React from 'react';
import { Award, Shield, Users, Calendar, ArrowRight, Play } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function LandingPage({ setActiveTab }) {
  const { players, teams, tournaments } = useAppContext();

  // Get Top 3 Players
  const topPlayers = [...players]
    .sort((a, b) => b.elo - a.elo)
    .slice(0, 3);

  // Get active or upcoming tournaments
  const activeTours = tournaments.slice(0, 2);

  // Calculate some analytics
  const totalElo = players.reduce((sum, p) => sum + p.elo, 0);
  const avgElo = players.length ? Math.round(totalElo / players.length) : 1500;
  const grandmastersCount = players.filter(p => p.elo >= 2500).length;

  return (
    <div className="landing-container chess-bg-overlay">
      <style>{`
        .landing-container {
          display: flex;
          flex-direction: column;
          gap: 3rem;
          padding-bottom: 4rem;
        }
        .hero-section {
          position: relative;
          background: linear-gradient(135deg, rgba(20, 20, 25, 0.95), rgba(10, 10, 12, 0.98)),
                      url('https://images.unsplash.com/photo-1529699211952-734e80c4d42b?q=80&w=1200&auto=format&fit=crop') no-repeat center/cover;
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 4rem 2rem;
          text-align: left;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          overflow: hidden;
          box-shadow: var(--shadow-lg);
        }
        @media (max-width: 768px) {
          .hero-section {
            padding: 2.5rem 1.5rem;
          }
        }
        .hero-badge {
          background-color: rgba(var(--primary-rgb), 0.15);
          border: 1px solid rgba(var(--primary-rgb), 0.3);
          color: var(--primary);
          padding: 0.35rem 1rem;
          border-radius: 30px;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          align-self: flex-start;
        }
        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -1px;
          max-width: 700px;
        }
        @media (max-width: 600px) {
          .hero-title {
            font-size: 2.25rem;
          }
        }
        .hero-desc {
          color: var(--text-secondary);
          font-size: 1.15rem;
          max-width: 600px;
        }
        .hero-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }
        @media (max-width: 480px) {
          .hero-actions {
            flex-direction: column;
          }
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }
        @media (max-width: 900px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
        .stat-card {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .stat-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          background-color: rgba(var(--primary-rgb), 0.08);
          border: 1px solid rgba(var(--primary-rgb), 0.15);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .grid-sections {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 2rem;
        }
        @media (max-width: 900px) {
          .grid-sections {
            grid-template-columns: 1fr;
          }
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
        }
        .section-title {
          font-size: 1.25rem;
          font-weight: 700;
        }
        .tour-list-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem;
          border-bottom: 1px solid var(--border-color);
        }
        .tour-list-item:last-child {
          border-bottom: none;
        }
        .tour-info-main {
          display: flex;
          flex-direction: column;
        }
        .tour-name-sub {
          font-weight: 600;
          color: var(--text-primary);
        }
        .tour-meta-sub {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-top: 0.25rem;
        }
        .top-player-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 0;
          border-bottom: 1px solid var(--border-color);
        }
        .top-player-row:last-child {
          border-bottom: none;
        }
        .player-rank {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--primary);
          width: 24px;
        }
        .player-mini-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border-color);
        }
      `}</style>

      {/* Hero Header Banner */}
      <div className="hero-section">
        <span className="hero-badge">Esports Arena</span>
        <h1 className="hero-title">Chess Tournament & Auction Arena</h1>
        <p className="hero-desc">
          Manage leagues, calculate chess-based ratings automatically, track team rosters, and execute bidding auctions on a premium esports dashboard.
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={() => setActiveTab('dashboard')}>
            View Dashboard <ArrowRight size={16} />
          </button>
          <button className="btn btn-secondary" onClick={() => setActiveTab('auction')}>
            <Play size={14} fill="currentColor" /> Enter Player Auction
          </button>
        </div>
      </div>

      {/* Overall Stats Cards */}
      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon-wrapper">
            <Users size={20} />
          </div>
          <div>
            <div className="page-subtitle">Active Masters</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{players.length}</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrapper">
            <Shield size={20} />
          </div>
          <div>
            <div className="page-subtitle">Registered Teams</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{teams.length}</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrapper">
            <Calendar size={20} />
          </div>
          <div>
            <div className="page-subtitle">Tournaments</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{tournaments.length}</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrapper">
            <Award size={20} />
          </div>
          <div>
            <div className="page-subtitle">GMs Registered</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{grandmastersCount}</div>
          </div>
        </div>
      </div>

      {/* Grid: Tournaments List & Top Players */}
      <div className="grid-sections">
        {/* Left Side: Recent Tournaments */}
        <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
          <div className="section-header">
            <h2 className="section-title">Current Tournaments</h2>
            <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setActiveTab('tournaments')}>
              View All
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {activeTours.length > 0 ? (
              activeTours.map((t) => (
                <div key={t.id} className="tour-list-item">
                  <div className="tour-info-main">
                    <span className="tour-name-sub">{t.name}</span>
                    <span className="tour-meta-sub">
                      Format: <strong>{t.format}</strong> | Date: {t.startDate} to {t.endDate}
                    </span>
                  </div>
                  <div>
                    <span className={`badge ${t.status === 'ACTIVE' ? 'badge-active' : 'badge-completed'}`}>
                      {t.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-secondary)', padding: '2rem 0' }}>No active tournaments.</p>
            )}
          </div>
        </div>

        {/* Right Side: Top Players Showcase */}
        <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
          <div className="section-header">
            <h2 className="section-title">Top Chess Masters</h2>
            <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setActiveTab('players')}>
              Leaderboard
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {topPlayers.length > 0 ? (
              topPlayers.map((p, index) => (
                <div key={p.id} className="top-player-row">
                  <span className="player-rank">#{index + 1}</span>
                  <img
                    src={p.photo}
                    alt={p.name}
                    className="player-mini-avatar"
                    onError={(e) => {
                      e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(p.name)}`;
                    }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{p.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Country: {p.country}
                    </span>
                  </div>
                  <div className="text-right">
                    <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--primary)' }}>
                      {p.elo}
                    </span>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                      Elo Rating
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-secondary)', padding: '2rem 0' }}>No players registered.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
