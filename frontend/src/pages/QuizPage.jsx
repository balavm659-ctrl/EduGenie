import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import {
  CheckSquare,
  Sparkles,
  Timer,
  Award,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Loader2,
  ChevronRight,
  TrendingDown,
} from 'lucide-react';

export default function QuizPage() {
  const [searchParams] = useSearchParams();
  const initialTopic = searchParams.get('topic');

  // Generator Config
  const [topic, setTopic] = useState(initialTopic || '');
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');

  // Quiz Execution States
  const [quizState, setQuizState] = useState('config'); // 'config' | 'loading' | 'active' | 'results'
  const [quizData, setQuizData] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [timeTaken, setTimeTaken] = useState(0);
  const [quizResult, setQuizResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialTopic) {
      handleGenerateQuiz(initialTopic);
    }
  }, [initialTopic]);

  const handleGenerateQuiz = async (overrideTopic) => {
    const targetTopic = overrideTopic || topic;
    if (!targetTopic.trim()) return;

    setError('');
    setQuizState('loading');
    try {
      const data = await api.generateQuiz({
        topic: targetTopic,
        num_questions: parseInt(numQuestions),
        difficulty,
      });

      setQuizData(data);
      setSelectedAnswers(new Array(data.questions.length).fill(''));
      setCurrentQIndex(0);
      setStartTime(Date.now());
      setQuizState('active');
    } catch (err) {
      setError(err.message || 'Failed to generate quiz questions. Please check Gemini API or try another topic.');
      setQuizState('config');
    }
  };

  const handleSelectOption = (optionKey) => {
    const updated = [...selectedAnswers];
    updated[currentQIndex] = optionKey;
    setSelectedAnswers(updated);
  };

  const handleNext = () => {
    if (currentQIndex < quizData.questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    // Check if any unanswered
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    setTimeTaken(elapsed);
    setQuizState('loading');

    try {
      const results = await api.submitQuiz({
        quiz_id: quizData.quiz_id,
        answers: selectedAnswers.map(a => a || 'A'), // fallback if skipped
        time_taken: elapsed,
      });

      setQuizResult(results);
      setQuizState('results');

      // Trigger celebratory confetti for good score
      if (results.percentage >= 70) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to submit quiz results.');
      setQuizState('active');
    }
  };

  const handleReset = () => {
    setQuizState('config');
    setQuizData(null);
    setQuizResult(null);
    setSelectedAnswers([]);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-slide-up">
      
      {/* Header */}
      <div className="text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2">
          <CheckSquare className="w-3.5 h-3.5" />
          <span>Interactive Knowledge Assessment</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          AI Practice Quiz Generator
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Validate your understanding, earn XP, and immediately detect your weak study topics.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STATE 1: CONFIGURATION */}
      {quizState === 'config' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Topic or Subject
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Python List Comprehensions, Database Indexing, Binary Search, AWS S3"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                Number of Questions
              </label>
              <select
                value={numQuestions}
                onChange={(e) => setNumQuestions(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value={3}>3 Questions (Quick Sprint)</option>
                <option value={5}>5 Questions (Standard)</option>
                <option value={10}>10 Questions (Comprehensive)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value="easy">Easy (Fundamentals)</option>
                <option value="medium">Medium (Application)</option>
                <option value="hard">Hard (Advanced / Tricky)</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => handleGenerateQuiz()}
            disabled={!topic.trim()}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-[0.97]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Quiz Questions</span>
          </button>
        </div>
      )}

      {/* STATE 2: LOADING SKELETON */}
      {quizState === 'loading' && (
        <div className="glass-panel p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-md text-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-4" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
            Synthesizing Pedagogical Quiz Questions...
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Validating distractors and generating accurate explanations using Pydantic JSON validation.
          </p>
        </div>
      )}

      {/* STATE 3: ACTIVE TEST TAKING */}
      {quizState === 'active' && quizData && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl space-y-6">
          
          {/* Progress Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-slate-400">
                Question {currentQIndex + 1} of {quizData.questions.length}
              </span>
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {quizData.topic}
              </h2>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              <Timer className="w-3.5 h-3.5 text-emerald-500" />
              <span>In Progress</span>
            </div>
          </div>

          {/* Question Text */}
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
              {quizData.questions[currentQIndex].question}
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {Object.entries(quizData.questions[currentQIndex].options).map(([key, val]) => {
              const isSelected = selectedAnswers[currentQIndex] === key;
              return (
                <button
                  key={key}
                  onClick={() => handleSelectOption(key)}
                  className={`w-full p-4 rounded-2xl text-left border transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 shadow-sm ring-1 ring-emerald-500'
                      : 'border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 hover:border-slate-400'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                    isSelected
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {key}
                  </span>
                  <span className="text-xs sm:text-sm font-medium mt-0.5">{val}</span>
                </button>
              );
            })}
          </div>

          {/* Footer Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={handlePrev}
              disabled={currentQIndex === 0}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 disabled:opacity-30"
            >
              Previous
            </button>

            {currentQIndex === quizData.questions.length - 1 ? (
              <button
                onClick={handleSubmitQuiz}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-500/25 flex items-center gap-2 active:scale-[0.97]"
              >
                <span>Submit Quiz</span>
                <CheckSquare className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5"
              >
                <span>Next Question</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      )}

      {/* STATE 4: RESULTS & WEAK TOPIC RECOMMENDATION */}
      {quizState === 'results' && quizResult && (
        <div className="space-y-6">
          
          {/* Score Summary Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-500 flex items-center justify-center mx-auto shadow-sm">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {quizResult.score} / {quizResult.total}
              </h2>
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                {quizResult.percentage}% Score Achieved • Completed in {quizResult.time_taken}s
              </p>
            </div>

            <div className="flex justify-center gap-4 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 className="w-4 h-4" /> {quizResult.correct_answers.length} Correct</span>
              <span className="flex items-center gap-1 text-red-500"><XCircle className="w-4 h-4" /> {quizResult.wrong_answers.length} Incorrect</span>
              <span className="flex items-center gap-1 text-violetAccent-600">+{quizResult.percentage === 100 ? 50 : 20} XP Earned</span>
            </div>

            <div className="pt-2">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Take Another Quiz</span>
              </button>
            </div>
          </div>

          {/* Weak Topic Alert if score < 70 */}
          {quizResult.weak_areas && quizResult.weak_areas.length > 0 && (
            <div className="p-6 rounded-3xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 space-y-3">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm">
                <TrendingDown className="w-4 h-4" />
                <span>Adaptive Weak Area Alert: {quizResult.topic}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Your score on this quiz indicates that <strong>{quizResult.topic}</strong> may need review before exams.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Link
                  to={`/explain?concept=${encodeURIComponent(quizResult.topic)}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Review {quizResult.topic} Concept</span>
                </Link>
                <button
                  onClick={() => {
                    setDifficulty('easy');
                    handleGenerateQuiz(quizResult.topic);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry on Easy Level</span>
                </button>
              </div>
            </div>
          )}

          {/* Question by Question Review */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Answer Review & Explanations
            </h3>

            {quizResult.questions.map((q, idx) => {
              const userAns = quizResult.user_answers[idx];
              const isCorrect = userAns === q.correct_answer;

              return (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border text-xs sm:text-sm space-y-3 ${
                    isCorrect
                      ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20'
                      : 'border-red-200 dark:border-red-900/60 bg-red-50/30 dark:bg-red-950/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {idx + 1}. {q.question}
                    </span>
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 shrink-0">
                        <CheckCircle2 className="w-4 h-4" /> Correct
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-red-500 shrink-0">
                        <XCircle className="w-4 h-4" /> Incorrect
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-400 block text-[10px]">Your Answer:</span>
                      <span className={isCorrect ? 'text-emerald-600 font-semibold' : 'text-red-500 font-semibold'}>
                        {userAns}: {q.options[userAns] || 'None'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-400 block text-[10px]">Correct Answer:</span>
                      <span className="text-emerald-600 font-semibold">
                        {q.correct_answer}: {q.options[q.correct_answer]}
                      </span>
                    </div>
                  </div>

                  {/* Explanation */}
                  <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Explanation: </span>
                    {q.explanation}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
}
