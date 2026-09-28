import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight, Check, Loader2 } from 'lucide-react';

const TOPIC_OPTIONS = [
  'Python',
  'Java',
  'C / C++',
  'JavaScript',
  'SQL & Databases',
  'Data Structures & Algorithms',
  'AI & Machine Learning',
  'Cloud Computing',
  'Cybersecurity',
  'Web Development',
  'Mathematics',
  'Physics',
];

const LEVEL_OPTIONS = [
  { id: 'beginner', label: 'Beginner', desc: 'Starting from scratch' },
  { id: 'intermediate', label: 'Intermediate', desc: 'Comfortable with fundamentals' },
  { id: 'advanced', label: 'Advanced', desc: 'Seeking deep mastery & projects' },
];

const STYLE_OPTIONS = [
  { id: 'explanations', label: 'Conceptual Explanations', desc: 'Deep analogies & theory' },
  { id: 'practice', label: 'Hands-on Practice', desc: 'Code examples & exercises' },
  { id: 'quizzes', label: 'Quizzes & Testing', desc: 'Frequent self-assessments' },
  { id: 'projects', label: 'Project-Based', desc: 'Building practical apps' },
  { id: 'mixed', label: 'Balanced Mix', desc: 'Learn, practice & test together' },
];

export default function OnboardingPage() {
  const { user, completeOnboarding } = useAuth();
  const navigate = useNavigate();

  const [selectedTopics, setSelectedTopics] = useState(user?.interests || ['Python', 'SQL & Databases']);
  const [currentLevel, setCurrentLevel] = useState(user?.current_level || 'beginner');
  const [learningStyle, setLearningStyle] = useState(user?.learning_style || 'mixed');
  const [preferredLang, setPreferredLang] = useState(user?.preferred_language || 'english');
  const [loading, setLoading] = useState(false);

  const toggleTopic = (topic) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter(t => t !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await completeOnboarding({
        interests: selectedTopics,
        current_level: currentLevel,
        learning_style: learningStyle,
        preferred_language: preferredLang,
      });
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkBg-main py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-2xl w-full glass-panel rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-200/80 dark:border-slate-800/80">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Personalize Your Experience</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            How would you like to learn, {user?.name?.split(' ')[0] || 'Student'}?
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            EduGenie adapts quizzes, paths, and explanations to your goals.
          </p>
        </div>

        <div className="space-y-8">
          
          {/* 1. Topics */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              1. What topics do you want to learn? (Select all that apply)
            </label>
            <div className="flex flex-wrap gap-2">
              {TOPIC_OPTIONS.map((topic) => {
                const active = selectedTopics.includes(topic);
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => toggleTopic(topic)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      active
                        ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary-400'
                    }`}
                  >
                    {active && <Check className="w-3.5 h-3.5" />}
                    <span>{topic}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Level */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              2. What is your current proficiency level?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {LEVEL_OPTIONS.map((lvl) => {
                const active = currentLevel === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setCurrentLevel(lvl.id)}
                    className={`p-3.5 rounded-2xl text-left border transition-all ${
                      active
                        ? 'border-primary-500 bg-primary-50/60 dark:bg-primary-950/40 text-primary-900 dark:text-white shadow-sm ring-1 ring-primary-500'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-semibold text-xs mb-1">{lvl.label}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{lvl.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Style */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              3. How do you prefer to learn?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {STYLE_OPTIONS.map((stl) => {
                const active = learningStyle === stl.id;
                return (
                  <button
                    key={stl.id}
                    type="button"
                    onClick={() => setLearningStyle(stl.id)}
                    className={`p-3 rounded-xl text-left border transition-all ${
                      active
                        ? 'border-primary-500 bg-primary-50/60 dark:bg-primary-950/40 text-primary-900 dark:text-white ring-1 ring-primary-500'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-semibold text-xs">{stl.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{stl.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Language */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              4. Preferred Language for AI Responses
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'english', label: 'English' },
                { id: 'tamil', label: 'தமிழ் (Tamil)' },
                { id: 'tanglish', label: 'Tamil + English' },
              ].map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setPreferredLang(lang.id)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold border text-center transition-all ${
                    preferredLang === lang.id
                      ? 'border-primary-500 bg-primary-600 text-white shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Submit */}
        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={handleFinish}
            disabled={loading || selectedTopics.length === 0}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm shadow-md shadow-primary-500/25 transition-all disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Complete & Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
