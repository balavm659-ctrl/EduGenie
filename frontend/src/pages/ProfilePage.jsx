import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import {
  User,
  Mail,
  GraduationCap,
  Globe,
  Award,
  Flame,
  Check,
  Moon,
  Sun,
  Shield,
  Loader2,
  BookOpen,
} from 'lucide-react';
import { useToast } from '../components/Toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    education_level: user?.education_level || '',
    current_level: user?.current_level || 'beginner',
    preferred_language: user?.preferred_language || 'english',
    learning_style: user?.learning_style || 'mixed',
    interests: user?.interests || [],
  });

  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.interests.includes(tagInput.trim())) {
        setFormData(prev => ({ ...prev, interests: [...prev.interests, tagInput.trim()] }));
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(t => t !== tag),
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const updated = await api.updateProfile(formData);
      updateUser(updated);
      setSuccess(true);
      toast.success('Profile Updated', 'Your learning preferences have been saved successfully.');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
      toast.error('Update Failed', err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-slide-up">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 text-xs font-semibold mb-2">
          <User className="w-3.5 h-3.5" />
          <span>Student Account Settings</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Student Profile & Learning Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure your academic details, language models, and pedagogical preferences.
        </p>
      </div>

      {/* Main Settings Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl space-y-6">
        
        {/* Banner with Avatar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-600 to-violetAccent-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-primary-500/25">
              {user?.name ? user.name[0].toUpperCase() : 'S'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{user?.name}</h2>
              <p className="text-xs text-slate-400">{user?.email}</p>
              <div className="flex items-center gap-3 mt-1 text-[11px] font-semibold text-slate-500">
                <span className="flex items-center gap-1 text-amber-500"><Flame className="w-3 h-3 fill-amber-500" /> {user?.streak_count || 0} Day Streak</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-violetAccent-500"><Award className="w-3 h-3" /> {user?.xp || 0} Total XP</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50"
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
              <span>{isDark ? 'Dark Theme' : 'Light Theme'}</span>
            </button>
          </div>
        </div>

        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>Profile and learning preferences updated successfully!</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 text-xs text-red-600 border border-red-200">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Education Level / Degree
              </label>
              <input
                type="text"
                name="education_level"
                value={formData.education_level}
                onChange={handleChange}
                placeholder="e.g. B.Tech Computer Science, Anna University"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Current Level
              </label>
              <select
                name="current_level"
                value={formData.current_level}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Preferred AI Language
              </label>
              <select
                name="preferred_language"
                value={formData.preferred_language}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70"
              >
                <option value="english">English</option>
                <option value="tamil">தமிழ் (Tamil)</option>
                <option value="tanglish">Tamil + English (Tanglish)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Learning Style
              </label>
              <select
                name="learning_style"
                value={formData.learning_style}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70"
              >
                <option value="explanations">Explanations First</option>
                <option value="practice">Hands-On Practice</option>
                <option value="quizzes">Quiz & Self-Testing</option>
                <option value="mixed">Balanced Mix</option>
              </select>
            </div>
          </div>

          {/* Interests Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Academic Interests & Target Subjects (Type and press Enter)
            </label>
            <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 space-y-2">
              <div className="flex flex-wrap gap-2">
                {formData.interests.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-primary-100 dark:bg-primary-950 text-primary-800 dark:text-primary-200"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-primary-500 hover:text-red-500"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Add a topic (e.g. Python, Operating Systems, Machine Learning)..."
                className="w-full bg-transparent text-xs focus:outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400 pt-1"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-primary-500/25 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>Save Preferences</span>
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}
