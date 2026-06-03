// src/pages/Auction.jsx
import React, { useState } from 'react';
import { DollarSign, Star, Play, CircleDollarSign, CheckCircle2, XCircle, Clock, Volume2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Auction() {
  const {
    user,
    players,
    teams,
    activeAuction,
    startAuction,
    placeBid,
    completeAuction
  } = useAppContext();

  const [bidAmount, setBidAmount] = useState('');
  const [selectedBidderTeamId, setSelectedBidderTeamId] = useState('');
  const [error, setError] = useState('');

  // 1. Group players
  const unsoldPlayers = players.filter(p => p.status === 'UNSOLD');

  // 2. Fetch active auction items
  const activeAuctionData = activeAuction?.auction || null;
  const activePlayer = activeAuction?.player || null;

  // Find bidder team name
  const currentBidderTeam = activeAuctionData
    ? teams.find(t => t.id === activeAuctionData.currentBidderTeamId)
    : null;

  const handleStartAuction = async (playerId) => {
    setError('');
    try {
      await startAuction(playerId);
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    setError('');

    if (!activeAuctionData) return;
    if (!selectedBidderTeamId) return setError("Please select a team to bid for");
    
    const amount = Number(bidAmount);
    if (isNaN(amount) || amount <= 0) return setError("Please enter a valid bid amount");

    try {
      await placeBid(activeAuctionData.id, selectedBidderTeamId, amount);
      setBidAmount('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleQuickBid = async (amount) => {
    setError('');
    if (!activeAuctionData || !selectedBidderTeamId) {
      return setError("Please select a team first");
    }
    try {
      await placeBid(activeAuctionData.id, selectedBidderTeamId, amount);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFinalize = async (unsold = false) => {
    setError('');
    if (!activeAuctionData) return;

    if (!unsold && !activeAuctionData.currentBidderTeamId) {
      return setError("Cannot sell without any bids. Mark as Unsold/Passed instead.");
    }

    const actionText = unsold ? "mark this player as UNSOLD" : `sell this player to ${currentBidderTeam?.name} for ${activeAuctionData.currentBid}`;
    if (window.confirm(`Are you sure you want to ${actionText}?`)) {
      try {
        await completeAuction(activeAuctionData.id, unsold);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="auction-container">
      <style>{`
        .auction-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .auction-main-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 1.5rem;
        }
        @media (max-width: 900px) {
          .auction-main-grid {
            grid-template-columns: 1fr;
          }
        }
        .bidding-card-inner {
          display: grid;
          grid-template-columns: 200px 1fr;
          gap: 1.5rem;
        }
        @media (max-width: 600px) {
          .bidding-card-inner {
            grid-template-columns: 1fr;
            text-align: center;
          }
        }
        .bid-log-box {
          height: 180px;
          overflow-y: auto;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .bid-log-entry {
          display: flex;
          justify-content: space-between;
          font-size: 0.825rem;
          padding: 0.25rem 0.5rem;
          background-color: var(--bg-tertiary);
          border-radius: 4px;
        }
        .quick-bid-buttons {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
          flex-wrap: wrap;
        }
        .quick-bid-btn {
          flex: 1;
          min-width: 60px;
          padding: 0.5rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.85rem;
        }
        .quick-bid-btn:hover {
          border-color: var(--primary);
        }
        .budgets-sidebar {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .team-budget-bar {
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 0.75rem;
        }
        .budget-progress-bg {
          height: 6px;
          background-color: rgba(255,255,255,0.05);
          border-radius: 4px;
          margin-top: 0.35rem;
          overflow: hidden;
        }
        .budget-progress-fill {
          height: 100%;
          background-color: var(--primary);
          border-radius: 4px;
        }
        .pool-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }
        .pool-card-mini {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0.5rem;
        }
      `}</style>

      {/* Main Auction Block */}
      <div className="auction-main-grid">
        {/* Left Column: Bidding Block Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {activeAuctionData && activePlayer ? (
            <div className="card" style={{ border: '2px solid rgba(var(--primary-rgb), 0.35)', boxShadow: 'var(--shadow-glow)' }}>
              {/* Header: Live Indicator */}
              <div className="flex-between mb-3" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '800', color: 'var(--accent-rose)', textTransform: 'uppercase', fontSize: '0.9rem' }}>
                  <span className="live-dot"></span> LIVE BIDDING ARENA
                </span>
                <span className="page-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={14} /> Bid Increment: +10 Cr
                </span>
              </div>

              {/* Bidding Inner info */}
              <div className="bidding-card-inner">
                {/* Player Profile block */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <img
                    src={activePlayer.photo}
                    alt={activePlayer.name}
                    style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', border: '3px solid var(--primary)', padding: '6px' }}
                    onError={(e) => {
                      e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(activePlayer.name)}`;
                    }}
                  />
                  <div style={{ fontWeight: '800', fontSize: '1.2rem', textAlign: 'center' }}>{activePlayer.name}</div>
                  <span className="badge badge-solid" style={{ fontSize: '0.7rem' }}>
                    {activePlayer.country} • {activePlayer.elo} Elo
                  </span>
                </div>

                {/* Bidding Core State */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="grid-2">
                    <div style={{ padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <span className="card-title-sub" style={{ fontSize: '0.7rem' }}>Current Bid</span>
                      <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <DollarSign size={28} /> {activeAuctionData.currentBid} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Credits</span>
                      </div>
                    </div>

                    <div style={{ padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <span className="card-title-sub" style={{ fontSize: '0.7rem' }}>Highest Bidder</span>
                      <div style={{ fontSize: '1.25rem', fontWeight: '700', marginTop: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {currentBidderTeam ? (
                          <>
                            <span style={{ marginRight: '0.35rem' }}>{currentBidderTeam.logo}</span>
                            {currentBidderTeam.name}
                          </>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)', fontWeight: 'normal', fontSize: '1rem' }}>No bids placed</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bidding Form (Authenticated Users can bid) */}
                  {user ? (
                    <div>
                      {error && <p className="text-rose mb-2" style={{ fontSize: '0.8rem' }}>{error}</p>}
                      <form onSubmit={handlePlaceBid} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <select
                            className="form-select"
                            style={{ flex: 1.2 }}
                            value={selectedBidderTeamId}
                            onChange={(e) => setSelectedBidderTeamId(e.target.value)}
                          >
                            <option value="">Select Bidding Team...</option>
                            {teams.map(t => (
                              <option key={t.id} value={t.id} disabled={t.budget < activeAuctionData.currentBid + 10}>
                                {t.logo} {t.name} (Budget: {t.budget} Cr)
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            className="form-input"
                            style={{ flex: 0.8 }}
                            placeholder={`Min ${activeAuctionData.currentBid + 10}`}
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                          />
                          <button type="submit" className="btn btn-primary">
                            Place Bid
                          </button>
                        </div>

                        {selectedBidderTeamId && (
                          <div className="quick-bid-buttons">
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', alignSelf: 'center', marginRight: '0.5rem' }}>Quick Bid:</span>
                            <button type="button" className="quick-bid-btn" onClick={() => handleQuickBid(activeAuctionData.currentBid + 10)}>
                              +{10} Cr
                            </button>
                            <button type="button" className="quick-bid-btn" onClick={() => handleQuickBid(activeAuctionData.currentBid + 25)}>
                              +{25} Cr
                            </button>
                            <button type="button" className="quick-bid-btn" onClick={() => handleQuickBid(activeAuctionData.currentBid + 50)}>
                              +{50} Cr
                            </button>
                          </div>
                        )}
                      </form>
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', backgroundColor: 'var(--bg-tertiary)', padding: '0.5rem', borderRadius: '4px' }}>
                      Login to bid.
                    </p>
                  )}

                  {/* Admin Finalizing Overlays */}
                  {user && user.role === 'admin' && (
                    <div style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                      <button className="btn btn-emerald" style={{ flex: 1 }} onClick={() => handleFinalize(false)}>
                        <CheckCircle2 size={16} /> Sold to Highest Bidder
                      </button>
                      <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => handleFinalize(true)}>
                        <XCircle size={16} /> Mark Unsold / Passed
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Bidding log History feed */}
              <div className="mt-4">
                <span className="card-title-sub" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
                  <Volume2 size={14} /> Bid Announcements Log
                </span>
                <div className="bid-log-box">
                  {activeAuctionData.bidHistory.length > 0 ? (
                    [...activeAuctionData.bidHistory].reverse().map((bid, i) => (
                      <div key={i} className="bid-log-entry">
                        <span style={{ fontWeight: '600' }}>{bid.teamName}</span>
                        <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{bid.amount} Cr</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{bid.timestamp}</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ margin: 'auto', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      Waiting for the opening bid...
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="card text-center" style={{ padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
              <CircleDollarSign size={40} style={{ margin: '0 auto 1rem', opacity: '0.5' }} />
              <h3>Bidding Block is Quiet</h3>
              <p className="mt-1" style={{ fontSize: '0.9rem' }}>
                {user && user.role === 'admin'
                  ? 'Put a player up for bid using the Available Pool below.'
                  : 'Waiting for the league commissioner to put a player on the bidding block.'}
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Budgets Progress Monitor */}
        <div className="budgets-sidebar">
          <span className="card-title-sub" style={{ fontSize: '0.8rem' }}>Franchise Budget Tracker</span>
          {teams.map(t => {
            const rosterCount = players.filter(p => p.teamId === t.id).length;
            const pct = Math.round((t.budget / 1000) * 100);
            return (
              <div key={t.id} className="team-budget-bar">
                <div className="flex-between" style={{ fontSize: '0.875rem' }}>
                  <span style={{ fontWeight: '700' }}>{t.logo} {t.name}</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{t.budget} Cr</span>
                </div>
                <div className="budget-progress-bg">
                  <div className="budget-progress-fill" style={{ width: `${pct}%` }}></div>
                </div>
                <div className="flex-between mt-1" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  <span>Signed: {rosterCount} Masters</span>
                  <span>Max Limit: 1000 Cr</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Available Players Pool Section */}
      <div className="card mt-2">
        <span className="card-title-sub" style={{ fontSize: '0.8rem' }}>Unsigned Auction Pool ({unsoldPlayers.length} Players Available)</span>
        
        {unsoldPlayers.length > 0 ? (
          <div className="pool-grid">
            {unsoldPlayers.map(p => (
              <div key={p.id} className="pool-card-mini">
                <img
                  src={p.photo}
                  alt={p.name}
                  style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)' }}
                  onError={(e) => {
                    e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(p.name)}`;
                  }}
                />
                <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>{p.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>{p.elo} Elo</div>
                
                {user && user.role === 'admin' && !activeAuctionData && (
                  <button className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', width: '100%', marginTop: '0.25rem' }} onClick={() => handleStartAuction(p.id)}>
                    <Play size={10} fill="currentColor" /> Put on Block
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-secondary)', padding: '2rem 0', textAlign: 'center', fontSize: '0.875rem' }}>
            No players remaining in the auction pool. Roster drafts are complete!
          </p>
        )}
      </div>
    </div>
  );
}
