import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { api } from '../services/api';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import {
  Bookmark,
  Search,
  Trash2,
  Copy,
  Check,
  Lightbulb,
  FileText,
  HelpCircle,
  CheckSquare,
  Compass,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Saved' },
  { id: 'explanation', label: 'Explanations' },
  { id: 'question', label: 'Q&A Answers' },
  { id: 'summary', label: 'Summaries' },
  { id: 'quiz', label: 'Quizzes' },
  { id: 'learning_path', label: 'Learning Paths' },
];

export default function SavedPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchSaved();
  }, [category]);

  const fetchSaved = async () => {
    setLoading(true);
    try {
      const data = await api.getSavedItems(category, search);
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteSavedItem(id);
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error("Failed to delete saved item:", err);
    }
  };

  const handleCopy = (content, id) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCategoryBadge = (type) => {
    switch (type) {
      case 'explanation':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-100 dark:bg-violet-950 text-violetAccent-700 dark:text-violetAccent-300">Explanation</span>;
      case 'question':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300">Q&A Answer</span>;
      case 'summary':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">Summary</span>;
      case 'quiz':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">Quiz</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">Saved</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-slide-up">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-950 text-violetAccent-700 dark:text-violetAccent-300 text-xs font-semibold mb-2">
          <Bookmark className="w-3.5 h-3.5" />
          <span>Personal Knowledge Base</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Saved Study Materials
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Access your bookmarks, concept references, summaries, and exam flash notes anytime.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  category === cat.id
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchSaved()}
              placeholder="Search saved..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LoadingSkeleton lines={4} />
          <LoadingSkeleton lines={4} />
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-md flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  {getCategoryBadge(item.item_type)}
                  <span className="text-[10px] text-slate-400">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2">
                  {item.title}
                </h3>

                <div className="markdown-body mt-3 max-h-48 overflow-y-auto p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs border border-slate-100 dark:border-slate-800">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {item.content}
                  </ReactMarkdown>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleCopy(item.content, item.id)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-primary-600"
                >
                  {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === item.id ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                  title="Remove from saved"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bookmark}
          title="No saved materials found"
          description="Bookmark useful AI responses, explanations, summaries, or quizzes to build your personal library."
        />
      )}

    </div>
  );
}
