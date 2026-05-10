import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Star, Trophy, Crown } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const LEVELS = [
  { name: 'Beginner',  min: 0,    max: 99,   color: 'text-slate-500', bg: 'bg-slate-100',   icon: Shield,  ring: 'from-slate-300 to-slate-400' },
  { name: 'Bronze',    min: 100,  max: 299,  color: 'text-amber-700', bg: 'bg-amber-100',   icon: Star,    ring: 'from-amber-400 to-orange-500' },
  { name: 'Silver',    min: 300,  max: 599,  color: 'text-slate-600', bg: 'bg-slate-200',   icon: Star,    ring: 'from-slate-400 to-slate-500' },
  { name: 'Gold',      min: 600,  max: 999,  color: 'text-yellow-600', bg: 'bg-yellow-100', icon: Trophy,  ring: 'from-yellow-400 to-amber-500' },
  { name: 'Platinum',  min: 1000, max: Infinity, color: 'text-violet-600', bg: 'bg-violet-100', icon: Crown, ring: 'from-violet-500 to-purple-600' },
];

export function getLevel(xp) {
  return LEVELS.findLast(l => xp >= l.min) || LEVELS[0];
}

export default function XPCard({ totalXP = 0, eventCount = 0 }) {
  const level = getLevel(totalXP);
  const nextLevel = LEVELS[LEVELS.indexOf(level) + 1];
  const pct = nextLevel
    ? Math.round(((totalXP - level.min) / (nextLevel.min - level.min)) * 100)
    : 100;

  const Icon = level.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
    >
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${level.ring} flex items-center justify-center flex-shrink-0 shadow-md`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <p className="font-bold text-slate-800 text-lg">{totalXP.toLocaleString()} XP</p>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${level.bg} ${level.color}`}>{level.name}</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-3 h-3 text-violet-400" />
            <p className="text-xs text-slate-500">{eventCount} actions completed</p>
          </div>
          <Progress value={pct} className="h-2" />
          <p className="text-xs text-slate-400 mt-1">
            {nextLevel ? `${nextLevel.min - totalXP} XP to ${nextLevel.name}` : '🏆 Max level reached!'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}