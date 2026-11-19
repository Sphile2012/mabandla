import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Bookmark, BookmarkCheck, CheckCircle2, Clock, FileText, Flame, Lightbulb, RotateCcw, Trophy, XCircle } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { PRACTICE_QUESTIONS, PRACTICE_TOPICS, PAPERS } from '@/lib/practiceQuestions';

const STORE_KEY = 'prince-practice-v1';
const GRADES = ['Grade 10', 'Grade 11', 'Grade 12'];
const TABS = [
  { id: 'mcq', label: 'Multiple Choice' },
  { id: 'short', label: 'Short Answer' },
  { id: 'paper', label: 'Past Papers' },
];

function loadStore() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORE_KEY));
    return { done: parsed?.done || {}, bookmarks: parsed?.bookmarks || [] };
  } catch {
    return { done: {}, bookmarks: [] };
  }
}

const normalise = (value) => String(value).toLowerCase().replace(/[\s°]/g, '').replace(',', '.');

export default function Practice() {
  const [tab, setTab] = useState('mcq');
  const [grade, setGrade] = useState('Grade 10');
  const [topic, setTopic] = useState('All');
  const [store, setStore] = useState(loadStore);
  const [session, setSession] = useState(null);

  const persist = (next) => {
    setStore(next);
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(next));
    } catch {
      // Progress simply won't persist if storage is unavailable.
    }
  };

  const gradeQuestions = useMemo(() => PRACTICE_QUESTIONS.filter((q) => q.grade === grade), [grade]);
  const stats = useMemo(() => {
    const ids = Object.keys(store.done);
    const correct = ids.filter((id) => store.done[id]).length;
    return { attempted: ids.length, correct, accuracy: ids.length ? Math.round((correct / ids.length) * 100) : 0 };
  }, [store.done]);

  const start = (questions, label) => {
    if (!questions.length) return;
    setSession({ questions, label, index: 0, results: [] });
  };

  const record = (question, correct) => {
    persist({ ...store, done: { ...store.done, [question.id]: correct } });
    setSession((s) => ({ ...s, results: [...s.results, correct] }));
  };

  const toggleBookmark = (id) => {
    const bookmarks = store.bookmarks.includes(id) ? store.bookmarks.filter((b) => b !== id) : [...store.bookmarks, id];
    persist({ ...store, bookmarks });
  };

  if (session) {
    return (
      <QuizRunner
        session={session}
        bookmarks={store.bookmarks}
        onBookmark={toggleBookmark}
        onRecord={record}
        onNext={() => setSession((s) => ({ ...s, index: s.index + 1 }))}
        onExit={() => setSession(null)}
        onRestart={() => start(session.questions, session.label)}
        mode={tab === 'short' ? 'short' : 'mcq'}
      />
    );
  }

  const topicQuestions = gradeQuestions.filter((q) => topic === 'All' || q.topic === topic);
  const shortQuestions = topicQuestions.filter((q) => q.numeric);
  const bookmarked = PRACTICE_QUESTIONS.filter((q) => store.bookmarks.includes(q.id));

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <header className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-violet-600 to-violet-500 p-6 text-white shadow-xl shadow-violet-200/60">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-mint-300/30 blur-2xl" />
        <div className="relative">
          <h1 className="text-3xl font-extrabold tracking-tight">Practice</h1>
          <p className="mt-1 text-sm text-violet-100">Sharpen your skills with step-by-step solutions.</p>
          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            {[
              ['Attempted', stats.attempted],
              ['Correct', stats.correct],
              ['Accuracy', `${stats.accuracy}%`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-white/15 p-3 backdrop-blur">
                <div className="text-xl font-bold">{value}</div>
                <div className="text-[11px] uppercase tracking-wide text-violet-100">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      <Link
        to={createPageUrl('DailyChallenge')}
        className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-mint-200 bg-gradient-to-r from-mint-50 to-white p-4 shadow-sm transition-all hover:scale-[1.02]"
      >
        <span className="flex items-center gap-3">
          <span className="rounded-xl bg-mint-100 p-2.5 text-mint-700"><Flame className="h-5 w-5" /></span>
          <span>
            <span className="block font-bold text-slate-900">Daily challenge</span>
            <span className="block text-sm text-slate-500">A new question every day · earn 20 XP</span>
          </span>
        </span>
        <ArrowRight className="h-5 w-5 text-mint-700" />
      </Link>

      <div role="tablist" aria-label="Practice type" className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all ${tab === t.id ? 'bg-violet-600 text-white shadow-md shadow-violet-300/50' : 'bg-violet-50 text-violet-700 hover:bg-violet-100'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Grade">
        {GRADES.map((g) => (
          <button
            key={g}
            aria-pressed={grade === g}
            onClick={() => setGrade(g)}
            className={`rounded-xl border px-3 py-1.5 text-sm font-medium transition-all ${grade === g ? 'border-violet-600 bg-violet-600 text-white' : 'border-violet-100 bg-white text-slate-600 hover:border-violet-300'}`}
          >
            {g}
          </button>
        ))}
      </div>

      {tab !== 'paper' && (
        <>
          <div className="mb-5 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Topic">
            {['All', ...PRACTICE_TOPICS].map((t) => (
              <button
                key={t}
                aria-pressed={topic === t}
                onClick={() => setTopic(t)}
                className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold transition-all ${topic === t ? 'border-mint-500 bg-mint-100 text-mint-800' : 'border-slate-200 bg-white text-slate-600 hover:border-mint-300'}`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={() => start(tab === 'short' ? shortQuestions : topicQuestions, `${grade} · ${topic}`)}
            disabled={!(tab === 'short' ? shortQuestions : topicQuestions).length}
            className="mb-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-mint-500 to-mint-400 text-base font-bold text-white shadow-lg shadow-mint-300/50 transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Start {tab === 'short' ? 'short answer' : 'quiz'} ({(tab === 'short' ? shortQuestions : topicQuestions).length} questions) <ArrowRight className="h-5 w-5" />
          </button>
          {!(tab === 'short' ? shortQuestions : topicQuestions).length && (
            <p className="-mt-3 mb-6 text-center text-sm text-slate-500">No questions for this selection yet. Try another topic.</p>
          )}
        </>
      )}

      {tab === 'paper' && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          {PAPERS.map((paper) => {
            const questions = gradeQuestions.filter((q) => paper.topics.includes(q.topic));
            return (
              <div key={paper.id} className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md">
                <span className="mb-3 inline-flex rounded-xl bg-violet-100 p-2.5 text-violet-700"><FileText className="h-5 w-5" /></span>
                <h2 className="text-lg font-bold text-slate-900">{grade} · {paper.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{paper.blurb}</p>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500"><Clock className="h-3.5 w-3.5" /> {questions.length} questions · untimed</p>
                <button
                  onClick={() => start(questions, `${grade} · ${paper.name}`)}
                  disabled={!questions.length}
                  className="mt-4 h-11 w-full rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 text-sm font-semibold text-white transition-all hover:scale-105 disabled:opacity-50"
                >
                  Start paper
                </button>
              </div>
            );
          })}
        </div>
      )}

      <section aria-labelledby="bookmarks-heading">
        <h2 id="bookmarks-heading" className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-900">
          <BookmarkCheck className="h-5 w-5 text-violet-600" /> Bookmarked questions
        </h2>
        {bookmarked.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-violet-200 bg-white p-5 text-center text-sm text-slate-500">
            Tap the bookmark icon during a quiz to save a question for later.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {bookmarked.map((q) => (
              <button
                key={q.id}
                onClick={() => start([q], 'Bookmarked question')}
                className="rounded-2xl border border-violet-100 bg-white p-4 text-left shadow-sm transition-all hover:scale-105"
              >
                <span className="text-xs font-semibold text-violet-600">{q.grade} · {q.topic}</span>
                <span className="mt-1 block text-sm font-medium text-slate-800">{q.q}</span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function QuizRunner({ session, bookmarks, onBookmark, onRecord, onNext, onExit, onRestart, mode }) {
  const { questions, index, results, label } = session;
  const question = questions[index];
  const finished = index >= questions.length;
  const [selected, setSelected] = useState(null);
  const [typed, setTyped] = useState('');
  const [checked, setChecked] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  if (finished) {
    const score = results.filter(Boolean).length;
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="mx-auto max-w-xl px-4 py-10 text-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-3xl border border-violet-100 bg-white p-8 shadow-lg">
          <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-mint-300 to-mint-500 text-white"><Trophy className="h-8 w-8" /></span>
          <h1 className="text-2xl font-extrabold text-slate-900">{pct >= 70 ? 'Great work!' : pct >= 40 ? 'Good effort!' : 'Keep practising!'}</h1>
          <p className="mt-1 text-slate-500">{label}</p>
          <p className="my-6 text-5xl font-black text-violet-600">{score}/{questions.length}</p>
          <p className="text-sm text-slate-500">{pct}% correct</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button onClick={onRestart} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 font-semibold text-white transition-all hover:scale-105"><RotateCcw className="h-4 w-4" /> Try again</button>
            <button onClick={onExit} className="h-12 flex-1 rounded-xl border border-violet-200 font-semibold text-violet-700 transition-all hover:bg-violet-50">Back to practice</button>
          </div>
        </motion.div>
      </div>
    );
  }

  const isBookmarked = bookmarks.includes(question.id);
  const correctText = question.options[question.answer];
  const isCorrect = mode === 'short' ? normalise(typed) === normalise(correctText) : selected === question.answer;
  const canCheck = mode === 'short' ? typed.trim() !== '' : selected !== null;

  const check = () => {
    setChecked(true);
    onRecord(question, isCorrect);
  };

  const next = () => {
    setSelected(null);
    setTyped('');
    setChecked(false);
    setShowSteps(false);
    onNext();
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-5 sm:px-6">
      <div className="mb-4 flex items-center justify-between">
        <button onClick={onExit} aria-label="Exit quiz" className="rounded-full p-2 text-slate-600 transition-all hover:bg-violet-50"><ArrowLeft className="h-5 w-5" /></button>
        <h1 className="text-base font-bold text-slate-900">{label}</h1>
        <button onClick={() => onBookmark(question.id)} aria-pressed={isBookmarked} aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark question'} className="rounded-full p-2 text-violet-600 transition-all hover:bg-violet-50">
          {isBookmarked ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
        </button>
      </div>

      <div className="mb-1 flex justify-between text-xs font-medium text-slate-500">
        <span>Question {index + 1} of {questions.length}</span>
        <span>{question.topic}</span>
      </div>
      <div className="mb-5 h-2 overflow-hidden rounded-full bg-violet-100" role="progressbar" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={index + 1}>
        <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-mint-400 transition-all duration-500" style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
      </div>

      <h2 className="mb-4 text-xl font-bold leading-snug text-slate-900">{question.q}</h2>

      {mode === 'short' ? (
        <div>
          <label htmlFor="short-answer" className="mb-2 block text-sm font-semibold text-slate-700">Your answer</label>
          <input
            id="short-answer"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            disabled={checked}
            autoComplete="off"
            className="h-12 w-full rounded-xl border border-violet-200 bg-white px-4 text-slate-900 outline-none transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
            placeholder="Type your answer"
          />
        </div>
      ) : (
        <div className="space-y-3" role="radiogroup" aria-label="Answer options">
          {question.options.map((option, i) => {
            const isSelected = selected === i;
            const showCorrect = checked && i === question.answer;
            const showWrong = checked && isSelected && i !== question.answer;
            return (
              <button
                key={option}
                role="radio"
                aria-checked={isSelected}
                disabled={checked}
                onClick={() => setSelected(i)}
                className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left font-medium transition-all ${showCorrect ? 'border-mint-500 bg-mint-100 text-mint-900' : showWrong ? 'border-red-300 bg-red-50 text-red-800' : isSelected ? 'border-violet-500 bg-violet-50 text-violet-900 shadow-sm' : 'border-slate-200 bg-white text-slate-800 hover:border-violet-300 hover:scale-[1.01]'}`}
              >
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${showCorrect ? 'border-mint-500 bg-mint-500 text-white' : isSelected ? 'border-violet-500 bg-violet-500 text-white' : 'border-slate-300 text-slate-400'}`}>
                  {showCorrect ? '✓' : String.fromCharCode(65 + i)}
                </span>
                {option}
              </button>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {checked && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={`mt-5 rounded-2xl border p-4 ${isCorrect ? 'border-mint-300 bg-mint-50' : 'border-red-200 bg-red-50'}`} role="status">
            <p className={`flex items-center gap-2 font-bold ${isCorrect ? 'text-mint-800' : 'text-red-800'}`}>
              {isCorrect ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
              {isCorrect ? 'Correct! Well done 🎉' : `Not quite. The answer is ${correctText}.`}
            </p>
            <button onClick={() => setShowSteps((v) => !v)} aria-expanded={showSteps} className="mt-3 flex items-center gap-2 text-sm font-semibold text-violet-700 underline-offset-4 hover:underline">
              <Lightbulb className="h-4 w-4" /> {showSteps ? 'Hide' : 'View'} step-by-step solution
            </button>
            {showSteps && (
              <ol className="mt-3 space-y-2">
                {question.steps.map((step, i) => (
                  <li key={step} className="flex gap-3 rounded-xl bg-white p-3 text-sm text-slate-800">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">{i + 1}</span>
                    <span className="font-mono">{step}</span>
                  </li>
                ))}
              </ol>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={checked ? next : check}
        disabled={!checked && !canCheck}
        className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-mint-500 to-mint-400 text-base font-bold text-white shadow-lg shadow-mint-300/50 transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {checked ? (index + 1 === questions.length ? 'See results' : 'Next question') : 'Check answer'} <ArrowRight className="h-5 w-5" />
      </button>
    </div>
  );
}
