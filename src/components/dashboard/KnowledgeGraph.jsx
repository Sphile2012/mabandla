import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Brain, CheckCircle, BookOpen, AlertCircle } from 'lucide-react';

const TOPICS = [
  'Algebra', 'Number Patterns', 'Functions', 'Finance',
  'Trigonometry', 'Analytical Geometry', 'Statistics',
  'Probability', 'Geometry', 'Calculus'
];

const MASTERY_LEVELS = [
  { key: 'mastered',  label: 'Mastered',        minXP: 90,  color: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-300', bg: 'bg-emerald-50',  icon: CheckCircle,  iconColor: 'text-emerald-500' },
  { key: 'learning',  label: 'In Progress',      minXP: 30,  color: 'bg-violet-500',  text: 'text-violet-700',  border: 'border-violet-300',  bg: 'bg-violet-50',   icon: BookOpen,     iconColor: 'text-violet-500' },
  { key: 'practice',  label: 'Needs Practice',   minXP: 1,   color: 'bg-amber-400',   text: 'text-amber-700',   border: 'border-amber-300',   bg: 'bg-amber-50',    icon: AlertCircle,  iconColor: 'text-amber-500' },
  { key: 'untouched', label: 'Not Started',       minXP: 0,   color: 'bg-slate-200',   text: 'text-slate-500',   border: 'border-slate-200',   bg: 'bg-slate-50',    icon: null,         iconColor: '' },
];

function getMastery(xp) {
  if (xp >= 90) return MASTERY_LEVELS[0];
  if (xp >= 30) return MASTERY_LEVELS[1];
  if (xp >= 1)  return MASTERY_LEVELS[2];
  return MASTERY_LEVELS[3];
}

export default function KnowledgeGraph({ xpEvents = [], userEmail }) {
  const topicXP = useMemo(() => {
    const map = {};
    TOPICS.forEach(t => { map[t] = 0; });

    xpEvents
      .filter(e => e.user_email === userEmail && e.action_type === 'quiz_score')
      .forEach(e => {
        const topic = e.reference_id; // expected to match topic name
        if (map[topic] !== undefined) map[topic] += e.xp_amount || 0;
      });

    return map;
  }, [xpEvents, userEmail]);

  const counts = useMemo(() => {
    const c = { mastered: 0, learning: 0, practice: 0, untouched: 0 };
    TOPICS.forEach(t => { c[getMastery(topicXP[t]).key]++; });
    return c;
  }, [topicXP]);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
          <Brain className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-800">Knowledge Graph</h2>
          <p className="text-xs text-slate-500">Topic mastery based on quiz performance</p>
        </div>
      </div>

      {/* Summary Pills */}
      <div className="flex flex-wrap gap-2 px-5 pt-4">
        {MASTERY_LEVELS.map(level => (
          <span key={level.key} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${level.bg} ${level.text} ${level.border}`}>
            <span className={`w-2 h-2 rounded-full ${level.color}`} />
            {counts[level.key]} {level.label}
          </span>
        ))}
      </div>

      {/* Topic Grid */}
      <div className="p-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {TOPICS.map((topic, i) => {
          const xp = topicXP[topic];
          const mastery = getMastery(xp);
          const pct = Math.min(100, Math.round((xp / 90) * 100));
          const Icon = mastery.icon;

          return (
            <motion.div
              key={topic}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className={`relative rounded-xl border-2 p-3 flex flex-col gap-2 ${mastery.border} ${mastery.bg}`}
            >
              {/* Mastery dot */}
              <div className="flex items-center justify-between">
                <span className={`w-2.5 h-2.5 rounded-full ${mastery.color}`} />
                {Icon && <Icon className={`w-3.5 h-3.5 ${mastery.iconColor}`} />}
              </div>

              <p className="text-xs font-semibold text-slate-700 leading-tight">{topic}</p>

              {/* XP bar */}
              <div className="w-full h-1.5 bg-white/70 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ delay: i * 0.04 + 0.3, duration: 0.6 }}
                  className={`h-full rounded-full ${mastery.color}`}
                />
              </div>

              <p className={`text-xs font-medium ${mastery.text}`}>{mastery.label}</p>
            </motion.div>
          );
        })}
      </div>

      <p className="px-5 pb-4 text-xs text-slate-400">
        * Mastery is calculated from quiz XP events. Complete quizzes to update your graph.
      </p>
    </div>
  );
}