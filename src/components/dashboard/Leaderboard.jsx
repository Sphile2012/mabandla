import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Crown, Medal } from 'lucide-react';
import { getLevel } from './XPCard';

const RANK_STYLES = [
  { bg: 'bg-yellow-50 border-yellow-200', badge: 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white', icon: Crown },
  { bg: 'bg-slate-50 border-slate-200',  badge: 'bg-gradient-to-br from-slate-400 to-slate-500 text-white',  icon: Medal },
  { bg: 'bg-orange-50 border-orange-200', badge: 'bg-gradient-to-br from-orange-400 to-amber-600 text-white', icon: Medal },
];

function aggregateXP(events) {
  const map = {};
  events.forEach(e => {
    if (!map[e.user_email]) map[e.user_email] = { user_email: e.user_email, user_name: e.user_name, xp: 0 };
    map[e.user_email].xp += e.xp_amount || 0;
  });
  return Object.values(map).sort((a, b) => b.xp - a.xp);
}

export default function Leaderboard({ allEvents = [], currentUserEmail }) {
  const ranked = useMemo(() => aggregateXP(allEvents).slice(0, 10), [allEvents]);

  if (ranked.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center">
        <Trophy className="w-10 h-10 text-slate-200 mx-auto mb-3" />
        <p className="text-sm text-slate-400">Be the first on the leaderboard — watch a lesson to earn XP!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-amber-500" />
        <h3 className="font-semibold text-slate-800">XP Leaderboard</h3>
      </div>
      <div className="divide-y divide-slate-50">
        {ranked.map((entry, i) => {
          const isMe = entry.user_email === currentUserEmail;
          const style = RANK_STYLES[i] || { bg: isMe ? 'bg-violet-50 border-violet-100' : 'bg-white border-transparent', badge: 'bg-slate-100 text-slate-600', icon: null };
          const RankIcon = style.icon;
          const level = getLevel(entry.xp);

          return (
            <motion.div
              key={entry.user_email}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`flex items-center gap-3 px-5 py-3 ${isMe ? 'bg-violet-50' : ''}`}
            >
              {/* Rank badge */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm ${style.badge}`}>
                {RankIcon ? <RankIcon className="w-4 h-4" /> : `#${i + 1}`}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isMe ? 'text-violet-700' : 'text-slate-700'}`}>
                  {entry.user_name || entry.user_email.split('@')[0]}
                  {isMe && <span className="ml-1.5 text-xs text-violet-400">(you)</span>}
                </p>
                <p className="text-xs text-slate-400">{level.name}</p>
              </div>

              {/* XP */}
              <div className="text-right flex-shrink-0">
                <p className={`text-sm font-bold ${isMe ? 'text-violet-600' : 'text-slate-600'}`}>{entry.xp.toLocaleString()}</p>
                <p className="text-xs text-slate-400">XP</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}