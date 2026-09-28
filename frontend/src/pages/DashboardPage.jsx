import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import VoiceInput from '../components/VoiceInput';
import { LoadingSkeleton, CardSkeleton } from '../components/LoadingSkeleton';
import {
  Sparkles,
  Flame,
  Award,
  BarChart2,
  CheckCircle,
  Clock,
  ArrowRight,
  Lightbulb,
  CheckSquare,
  FileText,
  Compass,
  Send,
  AlertTriangle,
  Play,
  TrendingUp,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quickPrompt, setQuickPrompt] = useState('');

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const data = await api.getDashboard();
        setDashboardData(data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  const handleQuickAsk = (e) => {
    e.preventDefault();
    if (!quickPrompt.trim()) return;
    navigate(`/chat?q=${encodeURIComponent(quickPrompt)}`);
  };

  const handleVoiceTranscript = (transcript) => {
    setQuickPrompt(transcript);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton lines={3} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  const d = dashboardData || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* 1. Header & Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {d.greeting || 'Welcome'}, {user?.name || 'Student'}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            What would you like to master today? Your AI learning engine is ready.
          </p>
        </div>

        {/* Level & Style Pill */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
            Level: {user?.current_level || 'Intermediate'}
          </span>
          <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-violet-50 dark:bg-violet-950/60 text-violetAccent-700 dark:text-violetAccent-300 border border-violet-200 dark:border-violet-800 capitalize">
            {user?.learning_style || 'Mixed'} Style
          </span>
        </div>
      </div>

      {/* 2. Central AI Quick Prompt Input */}
      <div className="glass-panel p-3 sm:p-4 rounded-3xl shadow-lg border border-slate-200/80 dark:border-slate-800/80">
        <form onSubmit={handleQuickAsk} className="flex items-center gap-2">
          <div className="pl-3 text-primary-500">
            <Sparkles className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={quickPrompt}
            onChange={(e) => setQuickPrompt(e.target.value)}
            placeholder="Ask EduGenie anything... (e.g. 'Explain recursion with call stack analogy' or 'Quiz me on SQL joins')"
            className="flex-1 bg-transparent py-2 px-1 text-sm sm:text-base focus:outline-none placeholder:text-slate-400 text-slate-800 dark:text-slate-100 font-medium"
          />
          <VoiceInput onTranscript={handleVoiceTranscript} />
          <button
            type="submit"
            disabled={!quickPrompt.trim()}
            className="px-4 py-2.5 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-primary-500/25 flex items-center gap-2 transition-all disabled:opacity-40 disabled:pointer-events-none"
          >
            <span>Ask AI</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick Action Buttons */}
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-400 mr-1">Quick Tools:</span>
          <Link
            to="/chat"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-950/50 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary-500" />
            <span>AI Tutor Chat</span>
          </Link>
          <Link
            to="/explain"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-violet-50 hover:text-violetAccent-600 dark:hover:bg-violet-950/50 transition-colors"
          >
            <Lightbulb className="w-3.5 h-3.5 text-violetAccent-500" />
            <span>Explain Concept</span>
          </Link>
          <Link
            to="/quiz"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/50 transition-colors"
          >
            <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
            <span>Generate Quiz</span>
          </Link>
          <Link
            to="/summary"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950/50 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-amber-500" />
            <span>Summarize Document</span>
          </Link>
          <Link
            to="/learning-path"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-sky-950/50 transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-sky-500" />
            <span>Learning Path</span>
          </Link>
        </div>
      </div>

      {/* 3. Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Streak */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 text-amber-500 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 fill-amber-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {d.streak || 0} <span className="text-xs font-normal text-slate-400">Days</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Learning Streak</div>
          </div>
        </div>

        {/* XP */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-800/60 text-violetAccent-500 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {d.xp || 0} <span className="text-xs font-normal text-slate-400">XP</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Experience Points</div>
          </div>
        </div>

        {/* Quiz Avg */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-500 flex items-center justify-center shrink-0">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {d.quiz_average || 0}%
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Quiz Average ({d.quizzes_completed || 0} taken)
            </div>
          </div>
        </div>

        {/* Questions Asked */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800/60 text-sky-500 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {d.questions_asked || 0}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Doubt Inquiries Resolved</div>
          </div>
        </div>

      </div>

      {/* 4. Active Roadmap & Today's Goal Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Continue Learning Course (2 cols) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-primary-500" />
              <span>Continue Learning</span>
            </h2>
            <Link to="/learning-path" className="text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline">
              View all roadmaps →
            </Link>
          </div>

          {d.active_paths && d.active_paths.length > 0 ? (
            <div className="space-y-4">
              {d.active_paths.map((p) => (
                <div key={p.id} className="p-4 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 capitalize">
                        {p.level}
                      </span>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{p.topic}</h3>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mt-3 max-w-md">
                      <div
                        className="bg-primary-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(5, p.progress)}%` }}
                      ></div>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">{Math.round(p.progress)}% Completed</span>
                  </div>
                  
                  <Link
                    to={`/learning-path?id=${p.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-primary-600 hover:bg-primary-700 text-white shadow-sm transition-all shrink-0 self-start sm:self-center"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Resume</span>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Compass className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No active learning paths created yet.</p>
              <Link
                to="/learning-path"
                className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-primary-600 text-white"
              >
                Create First Learning Path
              </Link>
            </div>
          )}
        </div>

        {/* Today's Goals (1 col) */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Today's Study Goal</span>
            </h2>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-2.5">
                <input type="checkbox" defaultChecked className="mt-1 rounded text-primary-600 focus:ring-primary-500" />
                <div className="text-xs">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">Daily Login & Streak</div>
                  <div className="text-slate-400 text-[10px]">Claim +10 XP streak bonus</div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-2.5">
                <input type="checkbox" className="mt-1 rounded text-primary-600 focus:ring-primary-500" />
                <div className="text-xs">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">Take 1 Practice Quiz</div>
                  <div className="text-slate-400 text-[10px]">Reinforce your weak topics</div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-2.5">
                <input type="checkbox" className="mt-1 rounded text-primary-600 focus:ring-primary-500" />
                <div className="text-xs">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">Review Concept Explanation</div>
                  <div className="text-slate-400 text-[10px]">Master 1 core concept in-depth</div>
                </div>
              </div>
            </div>
          </div>
          <Link
            to="/quiz"
            className="mt-6 w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-center text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Launch Daily Quiz Challenge
          </Link>
        </div>

      </div>

      {/* 5. Weak Topic Alerts & Recommended for You */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Weak Topic Detection Alert */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Targeted Weak Area Detection</span>
            </h2>
            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60">
              Adaptive Feedback
            </span>
          </div>

          {d.weak_topics && d.weak_topics.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Based on your past quiz performance, our AI identified these areas where extra review will boost your scores:
              </p>
              {d.weak_topics.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{item.topic}</span>
                    <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                      Current Mastery: {item.score}%
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/explain?concept=${encodeURIComponent(item.topic)}`}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-primary-600"
                    >
                      Explain
                    </Link>
                    <Link
                      to={`/quiz?topic=${encodeURIComponent(item.topic)}`}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                    >
                      Practice
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="font-semibold text-slate-700 dark:text-slate-200">No weak topics detected!</p>
              <p className="mt-1">Keep completing quizzes to generate targeted adaptive feedback.</p>
            </div>
          )}
        </div>

        {/* Recent Activity Timeline */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary-500" />
              <span>Recent Activity</span>
            </h2>
            <Link to="/history" className="text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline">
              Full history →
            </Link>
          </div>

          {d.recent_activity && d.recent_activity.length > 0 ? (
            <div className="space-y-3">
              {d.recent_activity.map((act, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0 text-xs">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                      {act.type.replace('_', ' ')}
                    </span>
                    <span className="text-slate-400 ml-1.5 font-normal truncate max-w-[200px] inline-block align-bottom">
                      — {act.topic || act.details || 'Session'}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                    +{act.xp} XP
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-slate-400">
              No recent activity recorded yet today.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
