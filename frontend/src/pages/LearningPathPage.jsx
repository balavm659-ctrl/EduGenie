import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import {
  Compass,
  Sparkles,
  CheckCircle,
  Circle,
  Clock,
  BookOpen,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Award,
  Loader2,
  AlertCircle,
  Plus,
} from 'lucide-react';

export default function LearningPathPage() {
  const [searchParams] = useSearchParams();
  const pathIdParam = searchParams.get('id');

  const [pathsList, setPathsList] = useState([]);
  const [selectedPath, setSelectedPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expandedWeek, setExpandedWeek] = useState(1);
  const [error, setError] = useState('');

  // Form State for creating new path
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('beginner');
  const [goal, setGoal] = useState('Pass university exams and build projects');
  const [hoursPerDay, setHoursPerDay] = useState(1.5);
  const [duration, setDuration] = useState('4 weeks');

  useEffect(() => {
    loadPaths();
  }, [pathIdParam]);

  const loadPaths = async () => {
    setLoading(true);
    try {
      const paths = await api.getLearningPaths();
      setPathsList(paths);

      if (pathIdParam) {
        const detail = await api.getLearningPathDetail(pathIdParam);
        setSelectedPath(detail);
      } else if (paths.length > 0) {
        const detail = await api.getLearningPathDetail(paths[0].id);
        setSelectedPath(detail);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPath = async (id) => {
    try {
      setLoading(true);
      const detail = await api.getLearningPathDetail(id);
      setSelectedPath(detail);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePath = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setError('');
    setGenerating(true);
    try {
      const newPath = await api.generateLearningPath({
        topic,
        current_level: level,
        goal,
        hours_per_day: parseFloat(hoursPerDay),
        duration,
      });

      setShowCreateModal(false);
      setTopic('');
      await loadPaths();
      handleSelectPath(newPath.path_id);
    } catch (err) {
      setError(err.message || 'Failed to generate learning path. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleItem = async (itemId) => {
    if (!selectedPath) return;

    const currentCompleted = selectedPath.completed_items || [];
    const isCompleted = currentCompleted.includes(itemId);
    const updatedCompleted = isCompleted
      ? currentCompleted.filter(id => id !== itemId)
      : [...currentCompleted, itemId];

    // Calculate total topics across all weeks
    let totalTopics = 0;
    (selectedPath.content || []).forEach(w => {
      totalTopics += (w.topics || []).length;
    });

    const newProgress = totalTopics > 0
      ? Math.round((updatedCompleted.length / totalTopics) * 100)
      : 0;

    // Update local state optimistically
    setSelectedPath(prev => ({
      ...prev,
      completed_items: updatedCompleted,
      progress: newProgress,
    }));

    // Update on backend
    try {
      await api.updatePathProgress(selectedPath.id, newProgress, itemId);
    } catch (err) {
      console.error("Failed to sync path progress:", err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200">
      
      {/* Top Header & Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-xs font-semibold mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Personalized Curriculum Roadmap</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Custom Learning Paths
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Adaptive, week-by-week educational roadmap tailored to your target subject and schedule.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-primary-500/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Learning Path</span>
        </button>
      </div>

      {/* Path Tabs / Selector */}
      {pathsList.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {pathsList.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectPath(p.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedPath?.id === p.id
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <span>{p.topic}</span>
              <span className="text-[10px] opacity-80">({Math.round(p.progress)}%)</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Roadmap Display */}
      {loading ? (
        <div className="glass-panel p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-md">
          <LoadingSkeleton lines={6} />
        </div>
      ) : selectedPath ? (
        <div className="space-y-6">
          
          {/* Path Overview Banner */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300">
                    {selectedPath.level} Level
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Duration: {selectedPath.duration} ({selectedPath.hours_per_day} hrs/day)
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {selectedPath.topic}
                </h2>
                {selectedPath.goal && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    🎯 Goal: {selectedPath.goal}
                  </p>
                )}
              </div>

              {/* Progress Metric Ring / Bar */}
              <div className="flex items-center gap-4 bg-white/60 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {Math.round(selectedPath.progress)}%
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Overall Progress</div>
                </div>
                <div className="w-24 bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-primary-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${selectedPath.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Milestones Timeline */}
          <div className="space-y-4">
            {(selectedPath.content || []).map((weekObj, wIdx) => {
              const weekNum = weekObj.week || wIdx + 1;
              const isExpanded = expandedWeek === weekNum;

              return (
                <div
                  key={wIdx}
                  className="glass-panel rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-md overflow-hidden transition-all"
                >
                  {/* Week Header */}
                  <div
                    onClick={() => setExpandedWeek(isExpanded ? null : weekNum)}
                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 font-bold text-xs flex items-center justify-center shrink-0">
                        W{weekNum}
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
                          {weekObj.title}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {(weekObj.topics || []).length} Topics • Practice Exercise Included
                        </p>
                      </div>
                    </div>

                    <div className="p-1 rounded-lg text-slate-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>

                  {/* Expanded Week Content */}
                  {isExpanded && (
                    <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800/60 space-y-4">
                      
                      {/* Topic Checklist */}
                      <div className="space-y-2.5 mt-3">
                        {(weekObj.topics || []).map((t, tIdx) => {
                          const itemId = t.id || `w${weekNum}_t${tIdx}`;
                          const isDone = (selectedPath.completed_items || []).includes(itemId);

                          return (
                            <div
                              key={tIdx}
                              className={`p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                                isDone
                                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
                                  : 'bg-white/60 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/60'
                              }`}
                            >
                              <button
                                onClick={() => handleToggleItem(itemId)}
                                className="mt-0.5 text-primary-600 dark:text-primary-400 focus:outline-none"
                              >
                                {isDone ? (
                                  <CheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                                ) : (
                                  <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                                )}
                              </button>

                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs sm:text-sm font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                                    {t.name}
                                  </span>
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500">
                                    ~{t.estimated_hours || 2}h
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                  {t.description}
                                </p>

                                {/* Action Shortcuts: Explain concept or quiz */}
                                <div className="flex items-center gap-2 mt-2">
                                  <Link
                                    to={`/explain?concept=${encodeURIComponent(t.name)}`}
                                    className="text-[11px] font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                                  >
                                    <BookOpen className="w-3 h-3" />
                                    <span>Learn Concept</span>
                                  </Link>
                                  <span>•</span>
                                  <Link
                                    to={`/quiz?topic=${encodeURIComponent(t.name)}`}
                                    className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                                  >
                                    <CheckSquare className="w-3 h-3" />
                                    <span>Practice Quiz</span>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Practical Task */}
                      {weekObj.practice_task && (
                        <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 text-xs text-slate-700 dark:text-slate-300">
                          <span className="font-bold text-amber-700 dark:text-amber-400 block mb-1">
                            🛠️ Weekly Practical Task:
                          </span>
                          {weekObj.practice_task}
                        </div>
                      )}

                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      ) : (
        <div className="glass-panel p-12 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 text-center space-y-4">
          <Compass className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
            No Learning Paths Generated Yet
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Choose a subject you want to master and EduGenie will assemble a structured curriculum.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs shadow-md"
          >
            Create Your First Learning Path
          </button>
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Generate Personalized Learning Path
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-xs text-red-600 border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleCreatePath} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  What do you want to learn?
                </label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Python Full Stack, Operating Systems, Machine Learning"
                  className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Current Level
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Hours / Day
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="8"
                    value={hoursPerDay}
                    onChange={(e) => setHoursPerDay(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="2 weeks">2 Weeks (Crash Course)</option>
                  <option value="4 weeks">4 Weeks (Standard Month)</option>
                  <option value="6 weeks">6 Weeks (In-Depth Semester)</option>
                  <option value="8 weeks">8 Weeks (Comprehensive Mastery)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Primary Learning Goal
                </label>
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g. Prepare for campus placements, Build final year project"
                  className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>Generate Curriculum</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
