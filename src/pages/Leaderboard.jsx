import React, { useState, useEffect } from 'react';
import { prince } from '@/api/princeClient';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Trophy, Medal, Flame, Crown } from 'lucide-react';
import { getLeaderboard } from '@/lib/gamification';

export default function Leaderboard() {
  const [user, setUser] = useState(null);
  const [timeFilter, setTimeFilter] = useState('all'); // all, week, month

  useEffect(() => {
    prince.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ['leaderboard', timeFilter],
    queryFn: () => getLeaderboard(50),
  });

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-300" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return <span className="text-lg font-bold text-slate-400">#{rank}</span>;
  };

  const getRankStyle = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/30';
    if (rank === 2) return 'bg-gradient-to-r from-gray-400/20 to-slate-400/20 border-gray-400/30';
    if (rank === 3) return 'bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-amber-600/30';
    return 'bg-white/5 border-white/10';
  };

  const userRank = leaderboard.findIndex(u => u.email === user?.email) + 1;

  return (
    <div className="min-h-screen" style={{ background: '#080d1a' }}>
      {/* Header */}
      <div className="sticky top-16 z-20 border-b border-white/8" style={{ background: 'rgba(8,13,26,0.95)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Orbitron',sans-serif" }}>
                <Trophy className="w-8 h-8 inline mr-3 text-yellow-400" />
                Leaderboard
              </h1>
              <p className="text-slate-400">Top students ranked by XP</p>
            </div>
            <div className="flex gap-2">
              {['all', 'week', 'month'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    timeFilter === filter
                      ? 'bg-violet-600 text-white'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User's Rank Card */}
        {user && userRank > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 rounded-2xl border-2 border-violet-500/50"
            style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.2),rgba(37,99,235,0.2))' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-violet-600">
                  <span className="text-xl font-bold text-white">#{userRank}</span>
                </div>
                <div>
                  <p className="text-white font-semibold">Your Rank</p>
                  <p className="text-slate-300 text-sm">{user.name || user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-violet-300">{user.xp}</p>
                  <p className="text-xs text-slate-400">Total XP</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-cyan-300">{user.level}</p>
                  <p className="text-xs text-slate-400">Level</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-300">{user.streak}</p>
                  <p className="text-xs text-slate-400">Day Streak</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { rank: 2, data: leaderboard[1], height: 'h-32', color: 'from-gray-400/20 to-slate-400/20', borderColor: 'border-gray-400/30' },
              { rank: 1, data: leaderboard[0], height: 'h-40', color: 'from-yellow-500/20 to-amber-500/20', borderColor: 'border-yellow-500/30' },
              { rank: 3, data: leaderboard[2], height: 'h-24', color: 'from-amber-600/20 to-orange-600/20', borderColor: 'border-amber-600/30' },
            ].map(({ rank, data, height, color, borderColor }) => (
              <motion.div
                key={rank}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: rank * 0.1 }}
                className={`relative p-6 rounded-2xl border ${borderColor} flex flex-col items-center`}
                style={{ background: `linear-gradient(135deg,${color})` }}
              >
                <div className={`absolute -top-4 ${height === 'h-40' ? '-top-6' : ''}`}>
                  {getRankIcon(rank)}
                </div>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-3 text-white text-xl font-bold">
                  {data.name?.charAt(0) || data.email?.charAt(0)}
                </div>
                <p className="text-white font-semibold text-center mb-1">{data.name || data.email}</p>
                <p className="text-violet-300 text-sm mb-3">Level {data.level}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-yellow-400 font-bold">{data.xp} XP</span>
                  <span className="text-orange-400 flex items-center gap-1">
                    <Flame className="w-4 h-4" /> {data.streak}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Full Leaderboard */}
        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">All Rankings</h2>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-slate-400">Loading leaderboard...</div>
          ) : leaderboard.length === 0 ? (
            <div className="p-12 text-center text-slate-500">No rankings yet</div>
          ) : (
            <div className="divide-y divide-white/10">
              {leaderboard.map((student, index) => {
                const rank = index + 1;
                return (
                  <motion.div
                    key={student.email}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(index * 0.05, 1) }}
                    className={`flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors ${
                      student.email === user?.email ? 'bg-violet-500/10' : ''
                    }`}
                  >
                    <div className="w-10 h-10 flex items-center justify-center">
                      {getRankIcon(rank)}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {student.name?.charAt(0) || student.email?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{student.name || student.email}</p>
                      <p className="text-xs text-slate-400">Level {student.level}</p>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="text-yellow-400 font-bold">{student.xp}</p>
                        <p className="text-xs text-slate-500">XP</p>
                      </div>
                      <div className="text-center">
                        <p className="text-orange-400 font-bold flex items-center gap-1">
                          <Flame className="w-4 h-4" /> {student.streak}
                        </p>
                        <p className="text-xs text-slate-500">Streak</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
