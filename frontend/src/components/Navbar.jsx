import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../api/auth.api';

const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.log(error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
      setIsMenuOpen(false);
    }
  };

  const getRoleConfig = (role) => {
    switch (role) {
      case 'ADMIN':
        return {
          gradient: 'from-purple-500 to-pink-500',
          bg: 'bg-purple-100',
          text: 'text-purple-700',
          icon: '👑',
        };
      case 'MANAGER':
        return {
          gradient: 'from-blue-500 to-cyan-500',
          bg: 'bg-blue-100',
          text: 'text-blue-700',
          icon: '⚡',
        };
      case 'MEMBER':
        return {
          gradient: 'from-emerald-500 to-teal-500',
          bg: 'bg-emerald-100',
          text: 'text-emerald-700',
          icon: '✨',
        };
      default:
        return {
          gradient: 'from-gray-500 to-slate-500',
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          icon: '👤',
        };
    }
  };

  const roleConfig = user ? getRoleConfig(user.role) : null;

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-slate-200'
          : 'bg-white shadow-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <div
            onClick={() => navigate('/')}
            className="flex items-center cursor-pointer group"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl blur-sm opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center font-bold text-lg lg:text-xl shadow-lg">
                R
              </div>
            </div>
            <div className="ml-3">
              <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                RBAC System
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                Role-Based Access Control
              </p>
            </div>
          </div>

          {/* Desktop User Info */}
          {user && (
            <div className="hidden md:flex items-center gap-4">
              {/* User Card */}
              <div className="flex items-center gap-3 bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                {/* Avatar */}
                <div
                  className={`relative w-10 h-10 rounded-full bg-gradient-to-br ${roleConfig.gradient} flex items-center justify-center text-white font-bold shadow-md`}
                >
                  <span className="text-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-xs">{roleConfig.icon}</span>
                  </div>
                </div>

                {/* User Details */}
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-800 leading-tight">
                    {user.name}
                  </p>
                  <span
                    className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mt-1 ${roleConfig.bg} ${roleConfig.text}`}
                  >
                    {user.role}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="group relative px-5 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                <span className="relative flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </span>
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          {user && (
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden relative w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors duration-200 flex items-center justify-center"
              aria-label="Toggle menu"
            >
              <div className="w-5 h-4 flex flex-col justify-between">
                <span
                  className={`w-full h-0.5 bg-slate-700 rounded-full transition-all duration-300 ${
                    isMenuOpen ? 'rotate-45 translate-y-1.5' : ''
                  }`}
                ></span>
                <span
                  className={`w-full h-0.5 bg-slate-700 rounded-full transition-all duration-300 ${
                    isMenuOpen ? 'opacity-0' : ''
                  }`}
                ></span>
                <span
                  className={`w-full h-0.5 bg-slate-700 rounded-full transition-all duration-300 ${
                    isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
                  }`}
                ></span>
              </div>
            </button>
          )}
        </div>

        {/* Mobile Menu */}
        {user && (
          <div
            className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
              isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="py-4 space-y-4 border-t border-slate-200">
              {/* Mobile User Card */}
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`relative w-12 h-12 rounded-full bg-gradient-to-br ${roleConfig.gradient} flex items-center justify-center text-white font-bold shadow-md`}
                  >
                    <span className="text-xl">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-sm">{roleConfig.icon}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-base font-semibold text-slate-800">
                      {user.name}
                    </p>
                    <span
                      className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mt-1 ${roleConfig.bg} ${roleConfig.text}`}
                    >
                      {user.role}
                    </span>
                  </div>
                </div>

                {/* User Email/Info (if available) */}
                {user.email && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 bg-white px-3 py-2 rounded-lg">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="truncate">{user.email}</span>
                  </div>
                )}
              </div>

              {/* Mobile Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full group relative px-5 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                <span className="relative flex items-center justify-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
