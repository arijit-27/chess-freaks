// src/pages/Auth.jsx
import React, { useState } from 'react';
import { Lock, User, UserPlus, LogIn, AlertCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Auth({ setActiveTab }) {
  const { login, register } = useAppContext();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('viewer');
  const [error, setError] = useState('');
  const [loadingState, setLoadingState] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setLoadingState(true);
    try {
      if (isLogin) {
        await login(username, password);
      } else {
        await register(username, password, role);
      }
      // Redirect to dashboard on success
      setActiveTab('dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoadingState(false);
    }
  };


  return (
    <div className="auth-container chess-bg-overlay">
      <style>{`
        .auth-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 80vh;
        }
        .auth-card {
          width: 100%;
          max-width: 420px;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding: 2.5rem 2rem;
        }
        .auth-tabs {
          display: flex;
          border-bottom: 2px solid var(--border-color);
        }
        .auth-tab {
          flex: 1;
          padding: 0.75rem 0;
          text-align: center;
          cursor: pointer;
          font-weight: 600;
          color: var(--text-secondary);
          border-bottom: 2px solid transparent;
          margin-bottom: -2px;
          transition: all 0.2s;
        }
        .auth-tab.active {
          color: var(--primary);
          border-color: var(--primary);
        }

        .input-icon-wrapper {
          position: relative;
        }
        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-secondary);
        }
        .input-with-icon {
          padding-left: 2.75rem;
        }
        .error-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background-color: rgba(244, 63, 94, 0.1);
          border: 1px solid rgba(244, 63, 94, 0.3);
          color: var(--accent-rose);
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
        }
      `}</style>

      <div className="card auth-card">
        {/* Logo and Greeting */}
        <div className="text-center">
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Chess <span style={{ color: 'var(--primary)' }}>Freaks</span>
          </h2>
          <p className="page-subtitle" style={{ marginTop: '0.25rem' }}>
            {isLogin ? 'Sign in to manage and view tournaments' : 'Create an esports manager account'}
          </p>
        </div>

        {/* Login / Register tabs */}
        <div className="auth-tabs">
          <div className={`auth-tab ${isLogin ? 'active' : ''}`} onClick={() => { setIsLogin(true); setError(''); }}>
            Login
          </div>
          <div className={`auth-tab ${!isLogin ? 'active' : ''}`} onClick={() => { setIsLogin(false); setError(''); }}>
            Register
          </div>
        </div>


        {/* Form Error */}
        {error && (
          <div className="error-message">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Main form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Username</label>
            <div className="input-icon-wrapper">
              <User className="input-icon" size={16} />
              <input
                type="text"
                className="form-input input-with-icon"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Password</label>
            <div className="input-icon-wrapper">
              <Lock className="input-icon" size={16} />
              <input
                type="password"
                className="form-input input-with-icon"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>



          <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }} disabled={loadingState}>
            {loadingState ? (
              'Authenticating...'
            ) : isLogin ? (
              <>
                <LogIn size={16} /> Sign In
              </>
            ) : (
              <>
                <UserPlus size={16} /> Create Account
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
