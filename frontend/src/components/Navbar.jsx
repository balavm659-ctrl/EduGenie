import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import LanguageSelector from './LanguageSelector';
import { 
  Sparkles, GraduationCap, Flame, Award, Sun, Moon, 
  Menu, X, LogOut, User as UserIcon, BookOpen, Settings
} from 'lucide-react';

export default function Navbar({ onToggleSidebar, isSidebarOpen }) {
  const { user, logout, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const handleLanguageChange = (newLang) => {
    // Save to user settings if authenticated
    if (user) {
      user.preferred_language = newLang;
    }
  };

  // Close dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && userMenuOpen) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [userMenuOpen]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Mobile hamburger & Logo */}
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label={isSidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isSidebarOpen}
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 via-primary-500 to-violetAccent-500 flex items-center justify-center text-white shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform duration-200">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary-600 to-violetAccent-500 bg-clip-text text-transparent">
                  EduGenie
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                  AI
                </span>
              </div>
              <p className="hidden sm:block text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-none">
                Learn Smarter. Understand Faster.
              </p>
            </div>
          </Link>
        </div>

        {/* Right: Gamification metrics, Language, Theme, Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {isAuthenticated && user && (
            <div className="hidden md:flex items-center gap-2">
              {/* Streak Counter */}
              <div 
                title={`${user.streak_count || 0} Day Learning Streak`}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 text-xs font-semibold transition-colors"
              >
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
                <span>{user.streak_count || 0}d</span>
              </div>

              {/* XP Counter */}
              <div 
                title={`${user.xp || 0} Total Experience Points`}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 text-violetAccent-600 dark:text-violet-300 text-xs font-semibold transition-colors"
              >
                <Award className="w-3.5 h-3.5 text-violetAccent-500" />
                <span>{user.xp || 0} XP</span>
              </div>
            </div>
          )}

          {/* Multilingual Selector */}
          <LanguageSelector 
            value={user?.preferred_language || 'english'} 
            onChange={handleLanguageChange} 
          />

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Auth Controls or Profile dropdown */}
          {isAuthenticated && user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
                aria-label="User menu"
              >
                <div className="w-7 h-7 rounded-lg bg-primary-600 text-white font-semibold text-xs flex items-center justify-center shadow-sm">
                  {user.name ? user.name[0].toUpperCase() : 'S'}
                </div>
                <div className="hidden sm:block text-xs">
                  <div className="font-semibold text-slate-800 dark:text-slate-100 line-clamp-1 max-w-[100px]">
                    {user.name.split(' ')[0]}
                  </div>
                </div>
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-scale-in"
                  role="menu"
                  aria-orientation="vertical"
                >
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{user.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    role="menuitem"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    Student Profile
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    role="menuitem"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Settings
                  </Link>
                  <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                      navigate('/');
                    }}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    role="menuitem"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow-sm hover:shadow transition-all active:scale-[0.97]"
              >
                Get Started
              </Link>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
