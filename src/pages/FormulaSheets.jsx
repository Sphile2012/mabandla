import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Download, Lightbulb, Search, Sparkles, Target } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FORMULAS, TOPIC_INTROS } from '@/lib/formulaData';

const DOWNLOADS_PER_DAY = 3;
const DOWNLOAD_KEY = 'prince-formula-downloads';

function downloadsToday() {
  const today = new Date().toDateString();
  try {
    const saved = JSON.parse(localStorage.getItem(DOWNLOAD_KEY) || '{}');
    return saved.day === today ? saved.count : 0;
  } catch {
    return 0;
  }
}

export default function FormulaSheets() {
  const [grade, setGrade] = useState('Grade 10');
  const [topic, setTopic] = useState('All');
  const [query, setQuery] = useState('');

  const topics = Object.keys(FORMULAS[grade] || {});

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return Object.entries(FORMULAS[grade] || {})
      .filter(([name]) => topic === 'All' || name === topic)
      .map(([name, items]) => [
        name,
        items.filter((f) => !q || [f.name, f.formula, f.simple, f.when].some((t) => t.toLowerCase().includes(q))),
      ])
      .filter(([, items]) => items.length > 0);
  }, [grade, topic, query]);

  const downloadSheet = () => {
    const used = downloadsToday();
    if (used >= DOWNLOADS_PER_DAY) {
      toast.error(`Download limit reached (${DOWNLOADS_PER_DAY} per day). You can still read everything on this page.`);
      return;
    }
    const text = Object.entries(FORMULAS[grade])
      .map(([name, items]) => [
        `${name.toUpperCase()}\n${TOPIC_INTROS[name] || ''}\n`,
        ...items.map((f) => `• ${f.name}\n  Formula: ${f.formula}\n  In simple terms: ${f.simple}\n  Use it when: ${f.when}\n  Example: ${f.example}\n`),
      ].join('\n'))
      .join('\n\n');
    const url = URL.createObjectURL(new Blob([`${grade} Formula Sheet - Prince Math Academy\n\n${text}`], { type: 'text/plain' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${grade.replace(' ', '-')}-Formula-Sheet.txt`;
    a.click();
    URL.revokeObjectURL(url);
    localStorage.setItem(DOWNLOAD_KEY, JSON.stringify({ day: new Date().toDateString(), count: used + 1 }));
    toast.success(`Downloaded. ${DOWNLOADS_PER_DAY - used - 1} downloads left today.`);
  };

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-r from-violet-600 to-violet-500 text-white">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="flex items-center gap-3 text-3xl font-bold text-white">
                <BookOpen className="h-8 w-8" /> Formula Sheets
              </h1>
              <p className="mt-2 max-w-xl text-violet-100">
                Every formula explained in plain language, with when to use it and a worked example.
              </p>
            </div>
            <Button onClick={downloadSheet} className="gap-2 rounded-xl bg-white text-violet-700 transition-all hover:scale-105 hover:bg-violet-50">
              <Download className="h-4 w-4" /> Download {grade}
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Grade">
          {Object.keys(FORMULAS).map((g) => (
            <button
              key={g}
              role="tab"
              aria-selected={grade === g}
              onClick={() => { setGrade(g); setTopic('All'); }}
              className={`whitespace-nowrap rounded-2xl px-5 py-2.5 text-sm font-semibold transition-all ${grade === g ? 'bg-violet-600 text-white shadow-sm' : 'bg-white text-violet-700 shadow-sm hover:scale-105'}`}
            >
              {g}
            </button>
          ))}
        </div>

        <div className="mb-4 flex gap-2 overflow-x-auto pb-1" aria-label="Topic">
          {['All', ...topics].map((t) => (
            <button
              key={t}
              onClick={() => setTopic(t)}
              aria-pressed={topic === t}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-all ${topic === t ? 'bg-mint-500 text-white' : 'bg-mint-100 text-mint-800 hover:bg-mint-200'}`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-violet-400" aria-hidden="true" />
          <Input
            aria-label="Search formulas"
            placeholder="Search a formula or a word like “area”…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-12 rounded-2xl border-violet-100 bg-white pl-12 text-slate-800 shadow-sm"
          />
        </div>

        <div className="mb-8 flex items-start gap-3 rounded-2xl border border-mint-200 bg-mint-50 p-4 text-sm text-mint-900">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <p>
            <strong>How to read this page:</strong> the big line is the formula. “In simple terms” says what it means in everyday words,
            “Use it when” tells you which questions it helps with, and the example shows the numbers going in.
          </p>
        </div>

        {visible.length === 0 && (
          <p className="rounded-2xl bg-white p-8 text-center text-slate-500 shadow-sm">No formulas match “{query}”. Try a simpler word.</p>
        )}

        {visible.map(([name, items]) => (
          <section key={name} className="mb-10">
            <h2 className="text-xl font-bold text-violet-900">{name}</h2>
            {TOPIC_INTROS[name] && <p className="mb-4 mt-1 text-slate-600">{TOPIC_INTROS[name]}</p>}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {items.map((f, i) => (
                <motion.article
                  key={f.name}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.3) }}
                  className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm transition-all hover:shadow-md"
                >
                  <h3 className="font-semibold text-slate-900">{f.name}</h3>
                  <p className="my-3 rounded-xl bg-gradient-to-r from-violet-50 to-mint-50 px-4 py-3 font-mono text-base font-semibold text-violet-800">
                    {f.formula}
                  </p>
                  <p className="flex gap-2 text-sm text-slate-700">
                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
                    <span><strong>In simple terms:</strong> {f.simple}</span>
                  </p>
                  <p className="mt-2 flex gap-2 text-sm text-slate-700">
                    <Target className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" aria-hidden="true" />
                    <span><strong>Use it when:</strong> {f.when}</span>
                  </p>
                  <p className="mt-3 rounded-xl bg-mint-50 px-3 py-2 text-sm text-mint-900">
                    <strong>Example:</strong> {f.example}
                  </p>
                </motion.article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
