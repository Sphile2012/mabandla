import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowRight, BookOpen } from 'lucide-react';

const gradeConfig = {
  'Grade 10': {
    gradient: 'from-emerald-500 to-teal-500',
    glow: 'rgba(16,185,129,0.2)',
    border: 'rgba(16,185,129,0.25)',
    description: 'Foundation Mathematics — build strong basics',
    topics: ['Algebra', 'Functions', 'Geometry', 'Statistics', 'Trigonometry'],
  },
  'Grade 11': {
    gradient: 'from-blue-500 to-indigo-500',
    glow: 'rgba(59,130,246,0.2)',
    border: 'rgba(59,130,246,0.25)',
    description: 'Intermediate Mathematics — deepen your skills',
    topics: ['Functions', 'Trigonometry', 'Calculus', 'Probability', 'Analytical Geometry'],
  },
  'Grade 12': {
    gradient: 'from-violet-500 to-purple-600',
    glow: 'rgba(124,58,237,0.2)',
    border: 'rgba(124,58,237,0.25)',
    description: 'Matric Mathematics — prepare for exams',
    topics: ['Calculus', 'Statistics', 'Trigonometry', 'Algebra', 'Analytical Geometry'],
  },
};

export default function GradeCard({ grade, videoCount, index = 0 }) {
  const config = gradeConfig[grade] || {
    gradient: 'from-slate-500 to-slate-600',
    glow: 'rgba(100,116,139,0.2)',
    border: 'rgba(100,116,139,0.25)',
    description: 'Mathematics lessons',
    topics: [],
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ y: -4 }}
    >
      <Link to={createPageUrl('Categories') + `?grade=${encodeURIComponent(grade)}`}>
        <div
          className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${config.border}`,
            boxShadow: `0 0 0 0 ${config.glow}`,
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = `0 8px 32px ${config.glow}`}
          onMouseLeave={e => e.currentTarget.style.boxShadow = `0 0 0 0 ${config.glow}`}
        >
          {/* Background glow */}
          <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full bg-gradient-to-br ${config.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300 blur-2xl`} />

          {/* Icon */}
          <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${config.gradient} text-white mb-4 shadow-lg`}>
            <GraduationCap className="w-6 h-6" />
          </div>

          {/* Title */}
          <h3 className="font-bold text-xl text-white mb-1">{grade}</h3>
          <p className="text-sm text-slate-400 mb-4">{config.description}</p>

          {/* Topic pills */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {config.topics.slice(0, 3).map(topic => (
              <span key={topic} className="text-xs px-2 py-0.5 rounded-full bg-white/8 text-slate-400 border border-white/8">
                {topic}
              </span>
            ))}
            {config.topics.length > 3 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/8 text-slate-400 border border-white/8">
                +{config.topics.length - 3} more
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-sm text-slate-400">
              <BookOpen className="w-3.5 h-3.5" />
              {videoCount || 0} {videoCount === 1 ? 'lesson' : 'lessons'}
            </span>
            <span className={`flex items-center gap-1 text-sm font-semibold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent group-hover:gap-2 transition-all`}>
              Browse <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
