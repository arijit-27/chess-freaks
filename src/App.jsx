// src/App.jsx
import React, { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';

// Import Pages
import LandingPage from './pages/LandingPage';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Tournaments from './pages/Tournaments';
import Teams from './pages/Teams';
import Players from './pages/Players';
import Auction from './pages/Auction';
import Matches from './pages/Matches';
import Statistics from './pages/Statistics';

// Icons
import {
  Home,
  LayoutDashboard,
  Trophy,
  Shield,
  Users,
  CircleDollarSign,
  Gamepad2,
  LogIn,
  LogOut,
  Sun,
  Moon,
  ChevronRight,
  Award
} from 'lucide-react';

function AppInner() {
  const { user, logout, activeAuction } = useAppContext();
  const [activeTab, setActiveTab] = useState('landing');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    // Sync theme class to document body
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'landing':
        return <LandingPage setActiveTab={setActiveTab} />;
      case 'dashboard':
        return <Dashboard />;
      case 'tournaments':
        return <Tournaments />;
      case 'teams':
        return <Teams />;
      case 'players':
        return <Players />;
      case 'auction':
        return <Auction />;
      case 'matches':
        return <Matches />;
      case 'statistics':
        return <Statistics />;
      case 'auth':
        return <Auth setActiveTab={setActiveTab} />;
      default:
        return <LandingPage setActiveTab={setActiveTab} />;
    }
  };

  const getPageMeta = () => {
    switch (activeTab) {
      case 'landing':
        return { title: "Welcome to Chess Freaks", desc: "The ultimate esport tournament and player auction manager" };
      case 'dashboard':
        return { title: "Dashboard", desc: "Live standings, stats and highest-rated master charts" };
      case 'tournaments':
        return { title: "Tournament Control Room", desc: "Configure formats, generate brackets, and schedule match fixtures" };
      case 'teams':
        return { title: "Franchise Roster Hub", desc: "Browse manager rosters, remaining budgets, and franchise points" };
      case 'players':
        return { title: "Master Player Database", desc: "Filter and search master profiles, Elo ratings, and career records" };
      case 'auction':
        return { title: "Bidding Block & Drafts", desc: "Sign free agents to franchise rosters in real-time auctions" };
      case 'matches':
        return { title: "Match Control Center", desc: "Pair board matchups, record game results, and recalculate ratings" };
      case 'statistics':
        return { title: "Medals & Statistics Hub", desc: "Browse dynamic player rankings, tournament MVPs, and individual medal achievements" };
      case 'auth':
        return { title: "Franchise Sign In", desc: "Access administrator controls or viewer boards" };
      default:
        return { title: "Chess Freaks", desc: "" };
    }
  };

  const meta = getPageMeta();

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="logo-container" onClick={() => setActiveTab('landing')} style={{ cursor: 'pointer' }}>
          <span style={{ fontSize: '1.75rem', lineHeight: 1 }}>👑</span>
          <span className="logo-text">Chess Freaks</span>
        </div>

        <nav className="sidebar-nav">
          <span className="sidebar-section-header">Lobby</span>
          <button
            className={`nav-link ${activeTab === 'landing' ? 'active' : ''}`}
            onClick={() => setActiveTab('landing')}
          >
            <Home size={18} />
            <span>Arena Lobby</span>
          </button>

          <span className="sidebar-section-header">Tournament Hub</span>
          <button
            className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard Stats</span>
          </button>

          <button
            className={`nav-link ${activeTab === 'statistics' ? 'active' : ''}`}
            onClick={() => setActiveTab('statistics')}
          >
            <Award size={18} />
            <span>Statistics Hub</span>
          </button>

          <button
            className={`nav-link ${activeTab === 'tournaments' ? 'active' : ''}`}
            onClick={() => setActiveTab('tournaments')}
          >
            <Trophy size={18} />
            <span>Tournaments</span>
          </button>

          <span className="sidebar-section-header">Drafts & Teams</span>
          <button
            className={`nav-link ${activeTab === 'teams' ? 'active' : ''}`}
            onClick={() => setActiveTab('teams')}
          >
            <Shield size={18} />
            <span>Franchises</span>
          </button>

          <button
            className={`nav-link ${activeTab === 'players' ? 'active' : ''}`}
            onClick={() => setActiveTab('players')}
          >
            <Users size={18} />
            <span>Chess Masters</span>
          </button>

          <button
            className={`nav-link ${activeTab === 'auction' ? 'active' : ''}`}
            onClick={() => setActiveTab('auction')}
            style={{ position: 'relative' }}
          >
            <CircleDollarSign size={18} />
            <span>Draft Auctions</span>
            {activeAuction && (
              <span className="live-dot" style={{ position: 'absolute', top: '12px', right: '12px', width: '6px', height: '6px' }}></span>
            )}
          </button>

          <span className="sidebar-section-header">Fixtures Control</span>
          <button
            className={`nav-link ${activeTab === 'matches' ? 'active' : ''}`}
            onClick={() => setActiveTab('matches')}
          >
            <Gamepad2 size={18} />
            <span>Matches & Elo</span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <button
            className="btn btn-outline"
            onClick={toggleTheme}
            style={{ display: 'flex', gap: '0.5rem', width: '100%', justifyContent: 'center' }}
            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === 'dark' ? (
              <>
                <Sun size={16} className="text-gold" /> Light Mode
              </>
            ) : (
              <>
                <Moon size={16} /> Dark Mode
              </>
            )}
          </button>

          {user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
              <div className="user-badge" style={{ justifyContent: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{user.username}</span>
                <span className="role-tag">{user.role}</span>
              </div>
              <button
                className="btn btn-secondary"
                style={{ width: '100%' }}
                onClick={() => {
                  logout();
                  setActiveTab('landing');
                }}
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          ) : (
            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={() => setActiveTab('auth')}
            >
              <LogIn size={16} /> Staff Sign In
            </button>
          )}
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="main-content">
        <header className="header">
          <div className="page-title-area">
            <h1 className="page-title">{meta.title}</h1>
            <p className="page-subtitle">{meta.desc}</p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              Chess Freaks v1.0.0 <ChevronRight size={12} />
            </span>
          </div>
        </header>

        <div className="content-body">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
