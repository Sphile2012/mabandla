import React, { useState, useEffect } from 'react';
import { prince } from '@/api/princeClient';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Trophy, Flame, Star, BookOpen, Shield, Eye, Download, Share2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ParentPortal() {
  const [user, setUser] = useState(null);
  const [selectedChild, setSelectedChild] = useState(null);

  useEffect(() => {
    prince.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: children = [] } = useQuery({
    queryKey: ['children'],
    queryFn: () => prince.entities.User.list(),
    enabled: !!user,
  });

  const { data: xpEvents = [] } = useQuery({
    queryKey: ['xp-events', selectedChild?.email],
    queryFn: () => prince.entities.XPEvent.filter({ user_email: selectedChild?.email }),
    enabled: !!selectedChild?.email,
  });

  const { data: videoProgress = [] } = useQuery({
    queryKey: ['video-progress', selectedChild?.email],
    queryFn: () => prince.entities.VideoProgress.filter({ user_email: selectedChild?.email }),
    enabled: !!selectedChild?.email,
  });

  const { data: badges = [] } = useQuery({
    queryKey: ['user-badges', selectedChild?.email],
    queryFn: async () => {
      const allBadges = await prince.entities.Badge.list();
      const userBadges = await prince.entities.UserBadge.filter({ user_email: selectedChild?.email });
      return allBadges.filter(b => userBadges.some(ub => ub.badge_id === b.id));
    },
    enabled: !!selectedChild?.email,
  });

  const totalXP = xpEvents.reduce((sum, e) => sum + (e.xp_amount || 0), 0);
  const completedVideos = videoProgress.filter(vp => vp.completed).length;
  const level = Math.floor(totalXP / 100) + 1;
  const xpToNextLevel = (level * 100) - totalXP;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0f1e' }}>
        <div className="text-center">
          <Shield className="w-16 h-16 text-violet-400 mx-auto mb-4" />
          <p className="text-white">Please sign in to access the parent portal</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#0a0f1e' }}>
      {/* Header */}
      <div className="sticky top-16 z-20 border-b border-white/8" style={{ background: 'rgba(10,15,30,0.95)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "Playfair Display, Georgia, serif" }}>
            Parent Portal
          </h1>
          <p className="text-slate-400">Monitor your child's learning progress and achievements</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Child Selection */}
        <div className="mb-8">
          <label className="text-sm font-medium text-slate-400 mb-2 block">Select Child</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {children.filter(c => c.role === 'student').map((child) => (
              <button
                key={child.id}
                onClick={() => setSelectedChild(child)}
                className={`p-4 rounded-xl border transition-all ${
                  selectedChild?.id === child.id
                    ? 'border-violet-500 bg-violet-500/20'
                    : 'border-white/10 bg-white/5 hover:border-violet-500/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {child.full_name?.charAt(0).toUpperCase() || 'S'}
                  </div>
                  <div className="text-left">
                    <p className="text-white font-medium">{child.full_name || 'Student'}</p>
                    <p className="text-sm text-slate-400">{child.grade || 'Grade not set'}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {selectedChild && (
          <>
            {/* Overview Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
            >
              <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    Total XP
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-white">{totalXP}</p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
                    <Star className="w-4 h-4 text-violet-400" />
                    Level
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-white">{level}</p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-400" />
                    Current Streak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-white">{selectedChild.current_streak || 0} days</p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-cyan-400" />
                    Videos Completed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-white">{completedVideos}</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Level Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 rounded-2xl border border-white/10 p-6 mb-8"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Level Progress</h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Level {level}</span>
                <span className="text-sm text-violet-400">{xpToNextLevel} XP to next level</span>
              </div>
              <Progress value={(totalXP % 100)} className="h-3" />
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 rounded-2xl border border-white/10 p-6 mb-8"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              {xpEvents.length > 0 ? (
                <div className="space-y-3">
                  {xpEvents.slice(0, 5).map((event) => (
                    <div key={event.id} className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
                          <Trophy className="w-5 h-5 text-violet-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{event.event_type || 'Activity'}</p>
                          <p className="text-sm text-slate-400">
                            {new Date(event.created_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30">
                        +{event.xp_amount} XP
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-center py-8">No recent activity</p>
              )}
            </motion.div>

            {/* Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 rounded-2xl border border-white/10 p-6 mb-8"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Badges Earned</h3>
              {badges.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {badges.map((badge) => (
                    <div key={badge.id} className="bg-white/5 rounded-xl p-4 text-center">
                      <div className="text-3xl mb-2">🏅</div>
                      <p className="text-sm font-medium text-white">{badge.name}</p>
                      <p className="text-xs text-slate-400 mt-1">{badge.xp_reward} XP</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-center py-8">No badges earned yet</p>
              )}
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-4"
            >
              <Button variant="outline" className="border-white/20 text-white bg-white/5 hover:bg-white/10">
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
              <Button variant="outline" className="border-white/20 text-white bg-white/5 hover:bg-white/10">
                <Share2 className="w-4 h-4 mr-2" />
                Share Progress
              </Button>
              <Button variant="outline" className="border-white/20 text-white bg-white/5 hover:bg-white/10">
                <Eye className="w-4 h-4 mr-2" />
                View Detailed Activity
              </Button>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
