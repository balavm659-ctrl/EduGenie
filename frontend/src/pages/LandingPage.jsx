import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  Brain,
  Lightbulb,
  CheckSquare,
  FileText,
  Compass,
  Zap,
  Globe,
  Award,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

export default function LandingPage() {
  const { loginDemo } = useAuth();

  const handleDemoLaunch = async () => {
    try {
      await loginDemo();
      window.location.href = '/dashboard';
    } catch (err) {
      window.location.href = '/login';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkBg-main text-slate-800 dark:text-slate-100 flex flex-col justify-between selection:bg-primary-500 selection:text-white">
      
      {/* Hero Section */}
      <main className="flex-1">
        <div className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
          
          {/* Subtle Background Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-primary-500/15 via-violetAccent-500/15 to-transparent blur-3xl pointer-events-none rounded-full" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            
            {/* Academic Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-100/80 dark:bg-primary-950/70 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 text-xs font-semibold mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-primary-500" />
              <span>Nan Mudhalvan Project • AI-Powered Learning Assistant</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto text-slate-900 dark:text-white leading-[1.15]">
              Your Personal{' '}
              <span className="bg-gradient-to-r from-primary-600 via-violetAccent-500 to-primary-500 bg-clip-text text-transparent">
                AI Learning Companion
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Understand tough concepts, generate smart quizzes, build personalized roadmaps, and identify weak topics with Google Gemini.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/25 transition-all hover:scale-[1.02] active:scale-95 text-base"
              >
                <span>Start Learning Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              <button
                onClick={handleDemoLaunch}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 shadow-sm transition-all hover:scale-[1.02] active:scale-95 text-base"
              >
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Instant Demo Account</span>
              </button>
            </div>

            {/* Trust highlights */}
            <div className="mt-8 flex flex-wrap justify-center items-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> English & Tamil Support</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> PDF & Document Learner</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Weak Topic Analytics</span>
            </div>

            {/* Futuristic Dashboard Preview Mock */}
            <div className="mt-16 max-w-5xl mx-auto rounded-2xl glass-panel p-2 sm:p-4 shadow-2xl border border-slate-200/80 dark:border-slate-800/80">
              <div className="rounded-xl overflow-hidden bg-slate-900 border border-slate-800 p-4 sm:p-6 text-left">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="ml-2 text-xs font-mono text-slate-400">EduGenie Interactive Learning Workspace</span>
                  </div>
                  <span className="text-xs text-primary-400 font-semibold px-2 py-0.5 rounded bg-primary-950/80">
                    Live Demo Mode
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                    <p className="text-xs text-slate-400">Active Course</p>
                    <p className="text-sm font-bold text-white mt-1">Data Structures: Recursion & Trees</p>
                    <div className="mt-3 w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-primary-500 h-full w-3/4 rounded-full"></div>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                    <p className="text-xs text-slate-400">AI Weak Area Analysis</p>
                    <p className="text-sm font-bold text-amber-400 mt-1">Recursion Call Stack (45% Score)</p>
                    <p className="text-[11px] text-slate-400 mt-2">Recommended: 3-step analogy + practice quiz</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                    <p className="text-xs text-slate-400">Gamification & Streak</p>
                    <p className="text-sm font-bold text-emerald-400 mt-1">🔥 7-Day Streak • 420 XP</p>
                    <p className="text-[11px] text-slate-400 mt-2">Badge Earned: "First Question Master"</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 5 Core Capabilities Section */}
        <section className="py-16 bg-white dark:bg-darkBg-card border-y border-slate-200/80 dark:border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                Five Core Pedagogical Capabilities
              </h2>
              <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm sm:text-base">
                Engineered specifically to transform student doubt into clear mastery.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:shadow-lg transition-all group">
                <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Brain className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-base mb-2">1. AI Q&A</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Interactive ChatGPT-style educational tutor. Resolves questions with step-by-step code and proofs.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:shadow-lg transition-all group">
                <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950 text-violetAccent-600 dark:text-violetAccent-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-base mb-2">2. Concept Explainer</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Breaks down difficult concepts into simple analogies, definitions, common mistakes, and examples.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:shadow-lg transition-all group">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-base mb-2">3. Quiz Generator</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Strictly validated MCQs with immediate scoring, feedback explanations, and weak area alerts.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:shadow-lg transition-all group">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-base mb-2">4. Smart Summarizer</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Upload PDF/text notes and extract key terms, bullet points, and 1-minute exam revision notes.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:shadow-lg transition-all group">
                <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-base mb-2">5. Learning Path</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Personalized week-by-week curriculum roadmaps adapted to your current level and daily available study time.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* The Student Workflow: Learn -> Practice -> Test -> Analyze -> Improve */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">
              The EduGenie Learning Lifecycle
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl mx-auto mb-12">
              A continuous feedback loop designed to prevent rote memorization.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold">
              <span className="px-4 py-2 rounded-xl bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300">1. LEARN</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <span className="px-4 py-2 rounded-xl bg-violet-100 dark:bg-violet-950 text-violetAccent-700 dark:text-violetAccent-300">2. PRACTICE</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <span className="px-4 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">3. TEST</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <span className="px-4 py-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">4. ANALYZE</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <span className="px-4 py-2 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">5. IMPROVE</span>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 bg-white dark:bg-darkBg-card text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-primary-600" />
            <span className="font-bold text-slate-800 dark:text-slate-200">EduGenie</span>
            <span>— AI-Powered Learning Assistant</span>
          </div>
          <div>
            Built for Nan Mudhalvan Academic Project Evaluation
          </div>
        </div>
      </footer>

    </div>
  );
}
