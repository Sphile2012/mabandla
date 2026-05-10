import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { 
  Calculator, 
  TrendingUp, 
  BarChart3, 
  Shapes, 
  Triangle,
  LineChart 
} from 'lucide-react';

const categoryConfig = {
  Algebra: {
    icon: Calculator,
    gradient: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50',
    description: 'Equations & expressions'
  },
  Calculus: {
    icon: TrendingUp,
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50',
    description: 'Derivatives & integrals'
  },
  Statistics: {
    icon: BarChart3,
    gradient: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50',
    description: 'Data & probability'
  },
  Geometry: {
    icon: Shapes,
    gradient: 'from-orange-500 to-amber-500',
    bg: 'bg-orange-50',
    description: 'Shapes & proofs'
  },
  Trigonometry: {
    icon: Triangle,
    gradient: 'from-pink-500 to-rose-500',
    bg: 'bg-pink-50',
    description: 'Angles & identities'
  },
  Functions: {
    icon: LineChart,
    gradient: 'from-indigo-500 to-blue-500',
    bg: 'bg-indigo-50',
    description: 'Graphs & transformations'
  },
};

export default function CategoryCard({ category, videoCount, index = 0 }) {
  const config = categoryConfig[category] || {
    icon: Calculator,
    gradient: 'from-slate-400 to-slate-500',
    bg: 'bg-slate-50',
    description: 'Math lessons'
  };
  
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Link to={createPageUrl('Categories') + `?category=${category}`}>
        <div className={`group relative overflow-hidden rounded-2xl p-6 ${config.bg} border border-slate-100 hover:shadow-lg transition-all duration-300`}>
          <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${config.gradient} opacity-20 group-hover:opacity-30 transition-opacity`} />
          
          <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${config.gradient} text-white mb-4`}>
            <Icon className="w-6 h-6" />
          </div>
          
          <h3 className="font-semibold text-lg text-slate-800 mb-1">{category}</h3>
          <p className="text-sm text-slate-500 mb-3">{config.description}</p>
          
          <span className="text-xs font-medium text-slate-600 bg-white px-3 py-1 rounded-full">
            {videoCount} {videoCount === 1 ? 'lesson' : 'lessons'}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}