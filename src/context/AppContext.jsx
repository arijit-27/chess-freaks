// src/context/AppContext.jsx
import React, { createContext, useState, useEffect, useContext, useRef } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [matches, setMatches] = useState([]);
  const [activeAuction, setActiveAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const wsRef = useRef(null);

  // Helper for API headers
  const getHeaders = () => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  // Fetch all core resources
  const fetchAllData = async () => {
    try {
      const [resPlayers, resTeams, resTournaments, resMatches, resAuction] = await Promise.all([
        fetch('/api/players'),
        fetch('/api/teams'),
        fetch('/api/tournaments'),
        fetch('/api/matches'),
        fetch('/api/auctions/active')
      ]);

      if (resPlayers.ok) setPlayers(await resPlayers.json());
      if (resTeams.ok) setTeams(await resTeams.json());
      if (resTournaments.ok) setTournaments(await resTournaments.json());
      if (resMatches.ok) setMatches(await resMatches.json());
      if (resAuction.ok) {
        const active = await resAuction.json();
        setActiveAuction(active);
      }
    } catch (error) {
      console.error("Error fetching application data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch logged in profile on startup
  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await fetch('/api/auth/me', { headers: getHeaders() });
          if (res.ok) {
            const userData = await res.json();
            setUser(userData);
          } else {
            // Expired or bad token
            logout();
          }
        } catch (e) {
          console.error("Auth verification failed", e);
        }
      }
      fetchAllData();
    };

    verifyUser();
  }, [token]);

  // WebSocket Connection Handler
  useEffect(() => {
    // Relative URL works with Vite Proxy and production static serving
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;
    
    let reconnectTimeout = null;

    const connectWS = () => {
      console.log("Connecting to WebSocket at", wsUrl);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected successfully");
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const { type, payload } = message;
          console.log("WS message received:", type, payload);

          switch (type) {
            case 'AUCTION_SYNC':
              setActiveAuction(payload);
              break;
            case 'AUCTION_BID':
              setActiveAuction(prev => prev ? {
                ...prev,
                auction: payload
              } : null);
              break;
            case 'AUCTION_STATUS':
              if (payload.type === 'START') {
                setActiveAuction({
                  auction: payload.auction,
                  player: payload.player
                });
              } else if (payload.type === 'COMPLETE') {
                setActiveAuction(null);
                // Reload players and teams budgets
                fetch('/api/players').then(res => res.json()).then(setPlayers);
                fetch('/api/teams').then(res => res.json()).then(setTeams);
              }
              break;
            case 'SCOREBOARD_UPDATE':
              // Refresh matches
              fetch('/api/matches').then(res => res.json()).then(setMatches);
              // Refresh teams points/wins/losses
              fetch('/api/teams').then(res => res.json()).then(setTeams);
              // Refresh players statistics
              fetch('/api/players').then(res => res.json()).then(setPlayers);
              break;
            default:
              break;
          }
        } catch (e) {
          console.error("Error parsing WS message", e);
        }
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected, scheduling reconnect...");
        reconnectTimeout = setTimeout(connectWS, 3000);
      };

      ws.onerror = (err) => {
        console.error("WebSocket error observed:", err);
        ws.close();
      };
    };

    connectWS();

    return () => {
      if (wsRef.current) {
        wsRef.current.onclose = null; // Prevent reconnect loops
        wsRef.current.close();
      }
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  // Auth Operations
  const login = async (username, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");

    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (username, password, role) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");

    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // Player Operations
  const addPlayer = async (playerData) => {
    const res = await fetch('/api/players', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(playerData)
    });
    const newPlayer = await res.json();
    if (!res.ok) throw new Error(newPlayer.error || "Failed to add player");
    setPlayers(prev => [...prev, newPlayer]);
    return newPlayer;
  };

  const updatePlayer = async (id, updateData) => {
    const res = await fetch(`/api/players/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updateData)
    });
    const updated = await res.json();
    if (!res.ok) throw new Error(updated.error || "Failed to update player");
    setPlayers(prev => prev.map(p => p.id === id ? updated : p));
    return updated;
  };

  const deletePlayer = async (id) => {
    const res = await fetch(`/api/players/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to delete player");
    }
    setPlayers(prev => prev.filter(p => p.id !== id));
  };

  // Team Operations
  const addTeam = async (teamData) => {
    const res = await fetch('/api/teams', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(teamData)
    });
    const newTeam = await res.json();
    if (!res.ok) throw new Error(newTeam.error || "Failed to create team");
    setTeams(prev => [...prev, newTeam]);
    return newTeam;
  };

  const deleteTeam = async (id) => {
    const res = await fetch(`/api/teams/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to delete team");
    }
    setTeams(prev => prev.filter(t => t.id !== id));
    // Refresh players list as their team assignments were cleared by db.js
    fetch('/api/players').then(res => res.json()).then(setPlayers);
  };

  // Tournament Operations
  const addTournament = async (tourData) => {
    const res = await fetch('/api/tournaments', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(tourData)
    });
    const newTour = await res.json();
    if (!res.ok) throw new Error(newTour.error || "Failed to create tournament");
    setTournaments(prev => [...prev, newTour]);
    // Generating tournament matches creates them in the backend DB, let's pull them
    fetch('/api/matches').then(res => res.json()).then(setMatches);
    return newTour;
  };

  const deleteTournament = async (id) => {
    const res = await fetch(`/api/tournaments/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to delete tournament");
    }
    setTournaments(prev => prev.filter(t => t.id !== id));
    // Reload matches as they are cascade deleted
    fetch('/api/matches').then(res => res.json()).then(setMatches);
  };

  // Match Operations
  const updateMatchBoard = async (matchId, boardNumber, playerAId, playerBId, result) => {
    const res = await fetch(`/api/matches/${matchId}/boards`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ boardNumber, playerAId, playerBId, result })
    });
    const updatedMatch = await res.json();
    if (!res.ok) throw new Error(updatedMatch.error || "Failed to save board score");
    setMatches(prev => prev.map(m => m.id === matchId ? updatedMatch : m));
    return updatedMatch;
  };

  const completeMatch = async (matchId, mvpPlayerId) => {
    const res = await fetch(`/api/matches/${matchId}/complete`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ mvpPlayerId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to complete match");
    
    // Explicitly refresh all data immediately on successful complete
    await fetchAllData();
    return data;
  };

  const addMatch = async (matchData) => {
    const res = await fetch('/api/matches', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(matchData)
    });
    const newMatch = await res.json();
    if (!res.ok) throw new Error(newMatch.error || "Failed to create match");
    setMatches(prev => [...prev, newMatch]);
    return newMatch;
  };

  // Auction Operations
  const startAuction = async (playerId) => {
    const res = await fetch('/api/auctions/start', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ playerId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to start auction");
    return data;
  };

  const placeBid = async (auctionId, teamId, amount) => {
    const res = await fetch('/api/auctions/bid', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ auctionId, teamId, amount })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to place bid");
    return data;
  };

  const completeAuction = async (auctionId, unsold = false) => {
    const res = await fetch('/api/auctions/complete', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ auctionId, unsold })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to finalize auction");
    return data;
  };

  const value = {
    user,
    token,
    players,
    teams,
    tournaments,
    matches,
    activeAuction,
    loading,
    login,
    register,
    logout,
    addPlayer,
    updatePlayer,
    deletePlayer,
    addTeam,
    deleteTeam,
    addTournament,
    deleteTournament,
    updateMatchBoard,
    addMatch,
    completeMatch,
    startAuction,
    placeBid,
    completeAuction,
    refreshData: fetchAllData
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
