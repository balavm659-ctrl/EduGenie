import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { api } from '../services/api';
import VoiceInput from '../components/VoiceInput';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import {
  Lightbulb,
  Sparkles,
  Bookmark,
  Copy,
  Check,
  Send,
  Loader2,
  BookOpen,
  HelpCircle,
} from 'lucide-react';
import { useToast } from '../components/Toast';

const DIFFICULTIES = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];

const STYLES = [
  { id: 'simple', label: 'Simple' },
  { id: 'detailed', label: 'Detailed' },
  { id: 'exam', label: 'Exam-Oriented' },
  { id: 'example', label: 'With Code Example' },
  { id: 'analogy', label: 'With Real Analogy' },
];

export default function ExplainPage() {
  const [searchParams] = useSearchParams();
  const initialConcept = searchParams.get('concept');

  const [concept, setConcept] = useState(initialConcept || '');
  const [difficulty, setDifficulty] = useState('beginner');
  const [style, setStyle] = useState('simple');
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  useEffect(() => {
    if (initialConcept) {
      handleExplain(initialConcept);
    }
  }, [initialConcept]);

  const handleExplain = async (overrideConcept) => {
    const target = overrideConcept || concept;
    if (!target.trim() || loading) return;

    setError('');
    setLoading(true);
    try {
      const res = await api.explainConcept({
        concept: target,
        difficulty,
        style,
      });
      setExplanation(res.explanation);
    } catch (err) {
      setError(err.message || 'Failed to generate explanation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!explanation) return;
    navigator.clipboard.writeText(explanation);
    setCopied(true);
    toast.success('Copied!', 'Explanation copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!explanation) return;
    try {
      await api.saveItem({
        item_type: 'explanation',
        title: `Explanation: ${concept}`,
        content: explanation,
        metadata_json: { difficulty, style },
      });
      setSaved(true);
      toast.success('Saved!', 'Explanation saved to your library.');
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-slide-up">
      
      {/* Header */}
      <div className="text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-950 text-violetAccent-700 dark:text-violetAccent-300 text-xs font-semibold mb-2">
          <Lightbulb className="w-3.5 h-3.5" />
          <span>Deep Conceptual Understanding</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          What concept do you want to master?
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          EduGenie breaks down tough concepts from simple intuition to rigorous technical proof.
        </p>
      </div>

      {/* Input Card */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-lg space-y-5">
        
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Target Concept or Topic
          </label>
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 shadow-sm focus-within:ring-2 focus-within:ring-primary-500">
            <input
              type="text"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleExplain()}
              placeholder="e.g. Recursion, Deadlocks in OS, Backpropagation, CAP Theorem, B-Trees"
              className="flex-1 bg-transparent px-3 py-1 text-sm sm:text-base focus:outline-none text-slate-800 dark:text-slate-100 font-medium placeholder:text-slate-400"
            />
            <VoiceInput onTranscript={(t) => setConcept(t)} disabled={loading} />
            <button
              onClick={() => handleExplain()}
              disabled={!concept.trim() || loading}
              className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-primary-500/25 flex items-center gap-2 transition-all disabled:opacity-50 active:scale-[0.97]"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Explain</span>
            </button>
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Difficulty */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
              Complexity Level:
            </label>
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDifficulty(d.id)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    difficulty === d.id
                      ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Style */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
              Teaching Style:
            </label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              {STYLES.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-md">
          <div className="flex items-center gap-2 mb-6 text-sm font-semibold text-primary-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>EduGenie is synthesizing the concept structure...</span>
          </div>
          <LoadingSkeleton lines={6} />
        </div>
      )}

      {/* Output Content */}
      {explanation && !loading && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl space-y-6 animate-slide-up">
          
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-primary-600 dark:text-primary-400">
                Concept Synthesis
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white capitalize">
                {concept}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-[0.97]"
              >
                {saved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                <span>{saved ? 'Saved' : 'Save'}</span>
              </button>
            </div>
          </div>

          <div className="markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {explanation}
            </ReactMarkdown>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs text-slate-400">
            <span>+5 XP awarded for studying concept</span>
            <span>EduGenie Progressive Learning Architecture</span>
          </div>

        </div>
      )}

    </div>
  );
}
