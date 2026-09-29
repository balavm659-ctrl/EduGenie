import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { api } from '../services/api';
import { LoadingSkeleton, CardSkeleton } from '../components/LoadingSkeleton';
import {
  BarChart3,
  Award,
  Flame,
  Clock,
  CheckCircle,
  TrendingDown,
  TrendingUp,
  Sparkles,
  BookOpen,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

export default function ProgressPage() {
  const [progressData, setProgressData] = useState(null);
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [prog, stk] = await Promise.all([
          api.getProgress(),
          api.getStreak(),
        ]);
        setProgressData(prog);
        setStreakData(stk);
      } catch (err) {
        console.error("Failed to load progress:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton lines={4} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  const p = progressData || {};
  const s = streakData || {};

  return (
    <div className="space-y-8 animate-slide-up">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-950 text-violetAccent-700 dark:text-violetAccent-300 text-xs font-semibold mb-2">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Student Performance & Pedagogy Analytics</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Learning Analytics & Mastery
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Detailed breakdown of your study hours, topic strengths, quiz mastery, and achievement badges.
        </p>
      </div>

      {/* Top Stat Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        
        <div className="p-4 rounded-2xl glass-panel border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center gap-2 text-violetAccent-600 dark:text-violetAccent-400 text-xs font-semibold mb-1">
            <Award className="w-4 h-4" />
            <span>Total XP</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{p.total_xp || 0}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Level Progress</div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center gap-2 text-amber-500 text-xs font-semibold mb-1">
            <Flame className="w-4 h-4 fill-amber-500" />
            <span>Current Streak</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{p.streak_count || 0} Days</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Consecutive Days</div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-500 text-xs font-semibold mb-1">
            <CheckCircle className="w-4 h-4" />
            <span>Quiz Average</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{p.quiz_average || 0}%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{p.quizzes_completed || 0} Quizzes</div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center gap-2 text-sky-500 text-xs font-semibold mb-1">
            <Clock className="w-4 h-4" />
            <span>Learning Time</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{p.total_learning_hours || 0}h</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Estimated Hours</div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-slate-200/80 dark:border-slate-800/80 shadow-sm col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2 text-primary-500 text-xs font-semibold mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Doubts Solved</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{p.total_questions || 0}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Inquiries Resolved</div>
        </div>

      </div>

      {/* Chart & Streak Heatmap Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Weekly Activity Bar Chart */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary-500" />
              <span>Study Activity (Past 7 Days)</span>
            </h2>
            <span className="text-[11px] text-slate-400">Actions Logged</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={p.weekly_activity || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" name="Learning Sessions" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 28-Day Streak Calendar Grid */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500" />
                <span>Learning Streak Matrix (4 Weeks)</span>
              </h2>
              <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-amber-500" />
                {s.streak_count || p.streak_count || 0} Days Active
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Daily habit tracker. Complete any quiz, explanation, or chat to keep your flame alive.
            </p>

            {/* Calendar Blocks */}
            <div className="grid grid-cols-7 gap-2">
              {(s.calendar || []).map((day, idx) => (
                <div
                  key={idx}
                  title={`${day.date}: ${day.active ? 'Studied' : 'Rest'}`}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center text-[10px] font-bold transition-all ${
                    day.active
                      ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-400'
                  }`}
                >
                  <span>{day.day}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
            <span>🔥 Streak bonus: +10 XP daily</span>
            <span>7-Day Badge Unlocked</span>
          </div>
        </div>

      </div>

      {/* Strong vs Weak Topics Pedagogy Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Strong Topics */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span>Demonstrated Strength Areas (≥ 70%)</span>
            </h2>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
              Mastered
            </span>
          </div>

          {p.strong_topics && p.strong_topics.length > 0 ? (
            <div className="space-y-3">
              {p.strong_topics.map((t, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100">{t.topic}</div>
                    <div className="text-[10px] text-slate-400">{t.attempts} quiz attempts</div>
                  </div>
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {t.score}%
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">
              Complete quizzes with 70%+ to populate your strengths.
            </p>
          )}
        </div>

        {/* Weak Topics */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Needs Practice (&lt; 70%)</span>
            </h2>
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-full">
              AI Recommendations
            </span>
          </div>

          {p.weak_topics && p.weak_topics.length > 0 ? (
            <div className="space-y-3">
              {p.weak_topics.map((t, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100">{t.topic}</div>
                    <div className="text-[10px] text-amber-600 dark:text-amber-400">Score: {t.score}%</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/explain?concept=${encodeURIComponent(t.topic)}`}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 text-slate-700"
                    >
                      Explain
                    </Link>
                    <Link
                      to={`/quiz?topic=${encodeURIComponent(t.topic)}`}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      Practice
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">
              No weak areas identified! Great academic performance.
            </p>
          )}
        </div>

      </div>

      {/* Gamification Badge Showcase */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-violetAccent-500" />
            <span>Achievement Badges & Milestones</span>
          </h2>
          <span className="text-xs text-slate-400">{(p.badges || []).length} Badges Earned</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          {(p.badges && p.badges.length > 0 ? p.badges : [
            { name: "First Question", description: "Asked your first AI question" },
            { name: "Quiz Starter", description: "Completed your first quiz" },
            { name: "7 Day Learner", description: "Maintained a 7-day streak" },
            { name: "Perfect Score", description: "Scored 100% on a quiz" },
          ]).map((b, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-primary-600 text-white flex items-center justify-center mx-auto shadow-md">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">{b.name}</h3>
              <p className="text-[10px] text-slate-400 leading-tight">{b.description}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
