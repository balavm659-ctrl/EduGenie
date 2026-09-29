import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  Lightbulb,
  CheckSquare,
  FileText,
  Compass,
  BarChart3,
  History,
  Bookmark,
  User,
  Sparkles,
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/chat', label: 'AI Tutor Q&A', icon: MessageSquare, badge: 'AI' },
  { path: '/explain', label: 'Explain Concept', icon: Lightbulb },
  { path: '/quiz', label: 'Practice Quiz', icon: CheckSquare },
  { path: '/summary', label: 'Smart Summarizer', icon: FileText },
  { path: '/learning-path', label: 'Learning Path', icon: Compass },
  { path: '/progress', label: 'Progress & Analytics', icon: BarChart3 },
  { path: '/history', label: 'History', icon: History },
  { path: '/saved', label: 'Saved Materials', icon: Bookmark },
  { path: '/profile', label: 'Student Profile', icon: User },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden animate-fade-in"
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 glass-panel border-r border-slate-200/80 dark:border-slate-800/80 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between overflow-y-auto p-4`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="space-y-6">
          {/* Main Navigation */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Learning Suite
            </div>
            <nav className="space-y-1" role="menubar" aria-label="Learning tools">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20 font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      }`
                    }
                    role="menuitem"
                    aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-violetAccent-500/20 text-violetAccent-600 dark:text-violetAccent-300">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Pro / Nan Mudhalvan Academic Badge Card */}
        <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-primary-900/10 via-violetAccent-500/10 to-transparent border border-primary-200/50 dark:border-primary-800/50 text-left">
          <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold text-xs mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>EduGenie AI Core</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Nan Mudhalvan Project Edition powered by Google Gemini.
          </p>
        </div>
      </aside>
    </>
  );
}
