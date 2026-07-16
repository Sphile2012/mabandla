import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowRight, BookOpen } from 'lucide-react';

const gradeConfig = {
  'Grade 10': {
    gradient: 'from-cyan-400 to-blue-500',
    color: '#00D9FF',
    glow: 'rgba(0,217,255,0.3)',
    border: 'rgba(0,217,255,0.4)',
    bgColor: '#1A2245',
    description: 'Foundation Mathematics — build strong basics',
    topics: ['Algebra', 'Functions', 'Geometry', 'Statistics', 'Trigonometry'],
  },
  'Grade 11': {
    gradient: 'from-purple-400 to-purple-600',
    color: '#7B2FFF',
    glow: 'rgba(123,47,255,0.3)',
    border: 'rgba(123,47,255,0.4)',
    bgColor: '#1A2245',
    description: 'Intermediate Mathematics — deepen your skills',
    topics: ['Functions', 'Trigonometry', 'Calculus', 'Probability', 'Analytical Geometry'],
  },
  'Grade 12': {
    gradient: 'from-amber-400 to-orange-500',
    color: '#FFB800',
    glow: 'rgba(255,184,0,0.3)',
    border: 'rgba(255,184,0,0.4)',
    bgColor: '#1A2245',
    description: 'Matric Mathematics — prepare for exams',
    topics: ['Calculus', 'Statistics', 'Trigonometry', 'Algebra', 'Analytical Geometry'],
  },
};

export default function GradeCard({ grade, videoCount, index = 0 }) {
  const config = gradeConfig[grade] || {
    gradient: 'from-blue-400 to-blue-600',
    color: '#00D9FF',
    glow: 'rgba(0,217,255,0.3)',
    border: 'rgba(0,217,255,0.4)',
    bgColor: '#1A2245',
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
            background: '#141B3DB3',
            border: `2px solid ${config.border}`,
            boxShadow: `0 4px 20px ${config.glow}`,
            backdropFilter: 'blur(10px)'
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = `0 8px 32px ${config.glow}`}
          onMouseLeave={e => e.currentTarget.style.boxShadow = `0 4px 20px ${config.glow}`}
        >
          {/* Background glow */}
          <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full bg-gradient-to-br ${config.gradient} opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-2xl`} />

          {/* Icon */}
          <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${config.gradient} text-white mb-4 shadow-lg`} style={{ boxShadow: `0 0 20px ${config.color}50` }}>
            <GraduationCap className="w-6 h-6" />
          </div>

          {/* Title */}
          <h3 className="font-bold text-xl mb-1" style={{ color: '#FFFFFF' }}>{grade}</h3>
          <p className="text-sm mb-4" style={{ color: '#B8C5D6' }}>{config.description}</p>

          {/* Topic pills */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {config.topics.slice(0, 3).map(topic => (
              <span key={topic} className="text-xs px-2 py-0.5 rounded-full border" style={{
                background: `${config.color}15`,
                color: config.color,
                borderColor: `${config.color}40`
              }}>
                {topic}
              </span>
            ))}
            {config.topics.length > 3 && (
              <span className="text-xs px-2 py-0.5 rounded-full border" style={{
                background: `${config.color}15`,
                color: config.color,
                borderColor: `${config.color}40`
              }}>
                +{config.topics.length - 3} more
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-sm" style={{ color: '#B8C5D6' }}>
              <BookOpen className="w-3.5 h-3.5" />
              {videoCount || 0} {videoCount === 1 ? 'lesson' : 'lessons'}
            </span>
            <span className={`flex items-center gap-1 text-sm font-semibold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent group-hover:gap-2 transition-all`}>
              Browse <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" style={{ color: config.color }} />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
