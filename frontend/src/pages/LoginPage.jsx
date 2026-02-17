import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useLogin from '../hooks/useLogin.js';

const roleConfig = {
  ADMIN: {
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.35)',
    glow: 'rgba(245,158,11,0.25)',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
  },
  MANAGER: {
    color: '#6ee7b7',
    bg: 'rgba(110,231,183,0.10)',
    border: 'rgba(110,231,183,0.30)',
    glow: 'rgba(110,231,183,0.20)',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  },
  MEMBER: {
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.10)',
    border: 'rgba(167,139,250,0.28)',
    glow: 'rgba(167,139,250,0.18)',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
};

const countryFlag = { INDIA: '🇮🇳', AMERICA: '🇺🇸' };

const LoginPage = () => {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [hoveredUser, setHoveredUser] = useState(null);
  const [activeSection, setActiveSection] = useState('demo'); // 'demo' | 'manual'
  const { mutate, isPending, error } = useLogin();

  const demoUsers = [
    {
      name: 'Santosh Kumar Dash',
      email: 'dashsantosh2004@gmail.com',
      password: 'Admin@123',
      role: 'ADMIN',
      country: 'INDIA',
    },
    {
      name: 'Captain Marvel',
      email: 'captainmarvel@india.com',
      password: 'Manager@123',
      role: 'MANAGER',
      country: 'INDIA',
    },
    {
      name: 'Captain America',
      email: 'captainamerica@america.com',
      password: 'Manager@123',
      role: 'MANAGER',
      country: 'AMERICA',
    },
    {
      name: 'Thanos',
      email: 'thanos@india.com',
      password: 'Member@123',
      role: 'MEMBER',
      country: 'INDIA',
    },
    {
      name: 'Thor',
      email: 'thor@india.com',
      password: 'Member@123',
      role: 'MEMBER',
      country: 'INDIA',
    },
    {
      name: 'Travis',
      email: 'travis@america.com',
      password: 'Member@123',
      role: 'MEMBER',
      country: 'AMERICA',
    },
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    const user =
      userString && userString !== 'undefined' ? JSON.parse(userString) : null;
    if (token && user) {
      const routes = {
        ADMIN: '/admin',
        MANAGER: '/manager',
        MEMBER: '/member',
      };
      if (routes[user.role]) navigate(routes[user.role]);
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate(loginData);
  };

  const handleDemoLogin = (user) => {
    setLoginData({ email: user.email, password: user.password });
    mutate({ email: user.email, password: user.password });
  };

  const initials = (name) =>
    name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; }

        .login-root {
          min-height: 100vh;
          background: #0d0d0f;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* Ambient orbs */
        .orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
          z-index: 0;
        }
        .orb-1 {
          width: 520px; height: 520px;
          background: radial-gradient(circle, rgba(251,146,60,0.18) 0%, transparent 70%);
          top: -120px; right: -100px;
          animation: floatOrb1 12s ease-in-out infinite;
        }
        .orb-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 70%);
          bottom: -80px; left: -80px;
          animation: floatOrb2 16s ease-in-out infinite;
        }
        .orb-3 {
          width: 280px; height: 280px;
          background: radial-gradient(circle, rgba(16,185,129,0.10) 0%, transparent 70%);
          top: 40%; left: 20%;
          animation: floatOrb3 20s ease-in-out infinite;
        }

        @keyframes floatOrb1 {
          0%, 100% { transform: translate(0,0) scale(1); }
          50%       { transform: translate(-30px, 40px) scale(1.08); }
        }
        @keyframes floatOrb2 {
          0%, 100% { transform: translate(0,0) scale(1); }
          50%       { transform: translate(40px, -30px) scale(1.1); }
        }
        @keyframes floatOrb3 {
          0%, 100% { transform: translate(0,0); }
          33%       { transform: translate(20px, -25px); }
          66%       { transform: translate(-15px, 15px); }
        }

        /* Grid texture */
        .grid-bg {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 48px 48px;
        }

        /* Card */
        .card {
          position: relative; z-index: 1;
          width: 100%; max-width: 480px;
          background: rgba(18,18,22,0.92);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 40px 36px;
          backdrop-filter: blur(24px);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.04),
            0 32px 80px rgba(0,0,0,0.6),
            0 0 80px rgba(251,146,60,0.05);
          animation: cardIn 0.5s cubic-bezier(0.16,1,0.3,1) both;
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Header */
        .logo-icon {
          width: 52px; height: 52px;
          background: linear-gradient(135deg, #f97316, #fb923c);
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px;
          box-shadow: 0 8px 24px rgba(249,115,22,0.35);
        }

        .title {
          font-family: 'Syne', sans-serif;
          font-size: 28px; font-weight: 800;
          color: #fff;
          letter-spacing: -0.5px;
          line-height: 1.1;
          margin-bottom: 6px;
        }
        .subtitle {
          font-size: 14px;
          color: rgba(255,255,255,0.38);
          font-weight: 400;
          margin-bottom: 28px;
        }

        /* Tab switcher */
        .tab-bar {
          display: flex;
          background: rgba(255,255,255,0.05);
          border-radius: 12px;
          padding: 4px;
          margin-bottom: 24px;
        }
        .tab-btn {
          flex: 1;
          padding: 9px 12px;
          border: none; outline: none; cursor: pointer;
          border-radius: 9px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 500;
          transition: all 0.2s ease;
          background: transparent;
          color: rgba(255,255,255,0.4);
        }
        .tab-btn.active {
          background: rgba(255,255,255,0.1);
          color: #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }

        /* Demo user cards */
        .demo-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 4px;
        }

        .user-card {
          position: relative;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16,1,0.3,1);
          background: transparent;
          text-align: left;
          overflow: hidden;
        }
        .user-card::before {
          content: '';
          position: absolute; inset: 0;
          background: var(--card-glow);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .user-card:hover::before { opacity: 1; }
        .user-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px var(--card-shadow);
        }
        .user-card:active { transform: translateY(0) scale(0.98); }

        .user-card-top {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }

        .avatar {
          width: 34px; height: 34px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif;
          font-size: 12px; font-weight: 700;
          flex-shrink: 0;
          letter-spacing: 0.5px;
        }

        .user-name {
          font-size: 13px; font-weight: 500;
          color: #fff;
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-meta {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .role-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          padding: 2px 7px;
          border-radius: 5px;
        }

        .country-flag {
          font-size: 13px;
          line-height: 1;
        }

        /* Loading shimmer on card */
        .user-card.loading-card {
          pointer-events: none;
          opacity: 0.5;
        }

        /* Form inputs */
        .field { margin-bottom: 16px; }
        .field label {
          display: block;
          font-size: 12px; font-weight: 500;
          color: rgba(255,255,255,0.45);
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .input-wrap { position: relative; }

        .field input {
          width: 100%;
          padding: 13px 16px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          outline: none;
          transition: all 0.2s;
        }
        .field input::placeholder { color: rgba(255,255,255,0.2); }
        .field input:focus {
          border-color: rgba(251,146,60,0.5);
          background: rgba(255,255,255,0.08);
          box-shadow: 0 0 0 3px rgba(251,146,60,0.1);
        }

        .pw-toggle {
          position: absolute; right: 14px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.3);
          padding: 4px;
          transition: color 0.2s;
          display: flex; align-items: center;
        }
        .pw-toggle:hover { color: rgba(255,255,255,0.7); }

        /* Error */
        .error-box {
          display: flex; align-items: center; gap-8px;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 10px;
          padding: 10px 14px;
          margin-bottom: 14px;
          font-size: 13px;
          color: #fca5a5;
          gap: 8px;
        }

        /* Submit button */
        .submit-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
          border: none; outline: none; cursor: pointer;
          border-radius: 12px;
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-size: 15px; font-weight: 700;
          letter-spacing: 0.3px;
          transition: all 0.2s ease;
          box-shadow: 0 4px 20px rgba(249,115,22,0.35);
          position: relative;
          overflow: hidden;
        }
        .submit-btn::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .submit-btn:hover::after { opacity: 1; }
        .submit-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(249,115,22,0.45);
        }
        .submit-btn:active { transform: scale(0.99); }
        .submit-btn:disabled {
          opacity: 0.5; cursor: not-allowed; transform: none;
          box-shadow: none;
        }

        /* Divider */
        .divider {
          display: flex; align-items: center; gap: 12px;
          margin: 20px 0;
        }
        .divider::before, .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.08);
        }
        .divider span {
          font-size: 11px;
          color: rgba(255,255,255,0.25);
          text-transform: uppercase;
          letter-spacing: 1px;
          white-space: nowrap;
        }

        /* Footer */
        .footer-text {
          text-align: center;
          font-size: 11px;
          color: rgba(255,255,255,0.18);
          margin-top: 24px;
          letter-spacing: 0.3px;
        }

        /* Spinner */
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          display: inline-block;
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          vertical-align: middle;
          margin-right: 8px;
        }

        /* Pulse on active card */
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 var(--card-shadow); }
          70%  { box-shadow: 0 0 0 6px transparent; }
          100% { box-shadow: 0 0 0 0 transparent; }
        }
        .user-card.selected {
          animation: pulse-ring 0.5s ease-out;
        }
      `}</style>

      <div className="login-root">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="grid-bg" />

        <div className="card">
          {/* Logo + Title */}
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
              <path d="M18.364 5.636A9 9 0 1 1 5.636 18.364 9 9 0 0 1 18.364 5.636zm-1.414 1.414A7 7 0 1 0 7.05 16.95 7 7 0 0 0 16.95 7.05zM12 7a1 1 0 0 1 1 1v3.586l2.707 2.707a1 1 0 0 1-1.414 1.414l-3-3A1 1 0 0 1 11 12V8a1 1 0 0 1 1-1z" />
            </svg>
          </div>

          <div className="title">Welcome back</div>
          <div className="subtitle">
            Sign in to your food delivery dashboard
          </div>

          {/* Tab switcher */}
          <div className="tab-bar">
            <button
              className={`tab-btn ${activeSection === 'demo' ? 'active' : ''}`}
              onClick={() => setActiveSection('demo')}
            >
              ⚡ Quick Demo Login
            </button>
            <button
              className={`tab-btn ${activeSection === 'manual' ? 'active' : ''}`}
              onClick={() => setActiveSection('manual')}
            >
              ✉️ Email & Password
            </button>
          </div>

          {/* ── DEMO SECTION ── */}
          {activeSection === 'demo' && (
            <>
              <div className="demo-grid">
                {demoUsers.map((user) => {
                  const cfg = roleConfig[user.role];
                  const isLoading = isPending && loginData.email === user.email;
                  return (
                    <button
                      key={user.email}
                      className={`user-card ${isLoading ? 'loading-card' : ''}`}
                      style={{
                        borderColor: cfg.border,
                        '--card-glow': cfg.bg,
                        '--card-shadow': cfg.glow,
                      }}
                      onClick={() => handleDemoLogin(user)}
                      disabled={isPending}
                    >
                      <div className="user-card-top">
                        <div
                          className="avatar"
                          style={{
                            background: cfg.bg,
                            color: cfg.color,
                            border: `1px solid ${cfg.border}`,
                          }}
                        >
                          {initials(user.name)}
                        </div>
                        <span className="user-name" style={{ color: '#fff' }}>
                          {user.name.split(' ')[0]}
                        </span>
                      </div>
                      <div className="user-meta">
                        <span
                          className="role-badge"
                          style={{
                            background: cfg.bg,
                            color: cfg.color,
                            border: `1px solid ${cfg.border}`,
                          }}
                        >
                          <span style={{ color: cfg.color }}>{cfg.icon}</span>
                          {user.role}
                        </span>
                        <span className="country-flag">
                          {countryFlag[user.country] || '🌍'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {error && (
                <div className="error-box" style={{ marginTop: 12 }}>
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    style={{ width: 15, flexShrink: 0 }}
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {error.response?.data?.message ||
                    'Login failed. Please try again.'}
                </div>
              )}

              <div className="divider">
                <span>or sign in manually</span>
              </div>
              <button
                className="submit-btn"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  boxShadow: 'none',
                  color: 'rgba(255,255,255,0.6)',
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 500,
                }}
                onClick={() => setActiveSection('manual')}
              >
                Use email & password instead →
              </button>
            </>
          )}

          {/* ── MANUAL SECTION ── */}
          {activeSection === 'manual' && (
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={loginData.email}
                  onChange={(e) =>
                    setLoginData({ ...loginData, email: e.target.value })
                  }
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="field">
                <label>Password</label>
                <div className="input-wrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                    placeholder="••••••••"
                    required
                    style={{ paddingRight: 44 }}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="pw-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        style={{ width: 16 }}
                      >
                        <path d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" />
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        style={{ width: 16 }}
                      >
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                          fillRule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="error-box">
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    style={{ width: 15, flexShrink: 0 }}
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {error.response?.data?.message ||
                    'Login failed. Please try again.'}
                </div>
              )}

              <button type="submit" className="submit-btn" disabled={isPending}>
                {isPending ? (
                  <>
                    <span className="spinner" /> Authenticating...
                  </>
                ) : (
                  'Sign In →'
                )}
              </button>

              <div className="divider">
                <span>or use a demo account</span>
              </div>
              <button
                type="button"
                className="submit-btn"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  boxShadow: 'none',
                  color: 'rgba(255,255,255,0.6)',
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 500,
                }}
                onClick={() => setActiveSection('demo')}
              >
                ← Browse demo users
              </button>
            </form>
          )}

          <p className="footer-text">
            RBAC Food Delivery System &nbsp;·&nbsp; Demo Environment
          </p>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
