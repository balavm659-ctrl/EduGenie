import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import {
  History as HistoryIcon,
  MessageSquare,
  Lightbulb,
  CheckSquare,
  FileText,
  Compass,
  Search,
  Calendar,
  Clock,
} from 'lucide-react';

const FILTER_TABS = [
  { id: '', label: 'All History' },
  { id: 'qa', label: 'Q&A Questions' },
  { id: 'explain', label: 'Explanations' },
  { id: 'quiz', label: 'Quiz Tests' },
  { id: 'summary', label: 'Summaries' },
  { id: 'learning_path', label: 'Learning Paths' },
];

export default function HistoryPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentFilter, setCurrentFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchHistory();
  }, [currentFilter]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getActivity(1, 40, currentFilter);
      setActivities(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = activities.filter(a => {
    if (!searchQuery) return true;
    const term = searchQuery.toLowerCase();
    return (
      (a.topic && a.topic.toLowerCase().includes(term)) ||
      (a.details && a.details.toLowerCase().includes(term))
    );
  });

  const getIcon = (type) => {
    switch (type) {
      case 'qa': return <MessageSquare className="w-4 h-4 text-primary-500" />;
      case 'explain': return <Lightbulb className="w-4 h-4 text-violetAccent-500" />;
      case 'quiz': return <CheckSquare className="w-4 h-4 text-emerald-500" />;
      case 'summary': return <FileText className="w-4 h-4 text-amber-500" />;
      case 'learning_path': return <Compass className="w-4 h-4 text-sky-500" />;
      default: return <HistoryIcon className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold mb-2">
          <HistoryIcon className="w-3.5 h-3.5" />
          <span>Complete Study Timeline</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Learning & Activity History
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review your past questions, quiz submissions, explanations, and generated notes.
        </p>
      </div>

      {/* Filter Tabs & Search */}
      <div className="glass-panel p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
            {FILTER_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setCurrentFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  currentFilter === tab.id
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search history..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Timeline List */}
      {loading ? (
        <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
          <LoadingSkeleton lines={5} />
        </div>
      ) : filtered.length > 0 ? (
        <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-md divide-y divide-slate-100 dark:divide-slate-800">
          {filtered.map((item) => (
            <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                {getIcon(item.activity_type)}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white capitalize">
                    {item.topic || item.activity_type}
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    {new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {item.details && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {item.details}
                  </p>
                )}

                <div className="mt-2 flex items-center gap-3 text-[11px]">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                    +{item.xp_earned} XP
                  </span>
                  <span className="text-slate-400 capitalize">
                    Module: {item.activity_type}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={HistoryIcon}
          title="No activity history found"
          description="Your questions, quiz submissions, and summary interactions will show up here."
        />
      )}

    </div>
  );
}
