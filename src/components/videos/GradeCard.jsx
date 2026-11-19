import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowRight, BookOpen } from 'lucide-react';

const gradeConfig = {
  'Grade 10': {
    gradient: 'from-violet-400 to-violet-600',
    border: 'border-violet-100',
    hoverShadow: 'hover:shadow-[0_8px_32px_rgba(116,64,234,0.16)]',
  },
  'Grade 11': {
    gradient: 'from-violet-500 to-mint-500',
    border: 'border-violet-100',
    hoverShadow: 'hover:shadow-[0_8px_32px_rgba(116,64,234,0.16)]',
  },
  'Grade 12': {
    gradient: 'from-violet-600 to-violet-800',
    border: 'border-violet-100',
    hoverShadow: 'hover:shadow-[0_8px_32px_rgba(116,64,234,0.16)]',
  },
};

export default function GradeCard({ grade, videoCount, index = 0 }) {
  const config = gradeConfig[grade] || {
    gradient: 'from-violet-400 to-violet-600',
    border: 'border-violet-100',
    hoverShadow: 'hover:shadow-[0_8px_32px_rgba(116,64,234,0.16)]',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ y: -4 }}
    >
      <Link to={createPageUrl('Categories') + `?grade=${encodeURIComponent(grade)}`}>
        <div className={`group relative overflow-hidden rounded-2xl border bg-white p-6 shadow-sm transition-all duration-300 ${config.border} ${config.hoverShadow}`}>
          {/* Background glow */}
          <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full bg-gradient-to-br ${config.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300 blur-2xl`} />

          {/* Icon */}
          <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${config.gradient} text-white mb-4 shadow-lg`}>
            <GraduationCap className="w-6 h-6" />
          </div>

          {/* Title */}
          <h3 className="font-bold text-xl text-violet-950 mb-1">{grade}</h3>

          {/* Footer */}
          <div className="flex items-center justify-between">
            {videoCount !== undefined && (
              <span className="flex items-center gap-1.5 text-sm text-slate-500">
                <BookOpen className="w-3.5 h-3.5" />
                {videoCount} {videoCount === 1 ? 'lesson' : 'lessons'}
              </span>
            )}
            <span className={`flex items-center gap-1 text-sm font-semibold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent group-hover:gap-2 transition-all`}>
              Browse <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
