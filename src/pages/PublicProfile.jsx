import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Flame, Award, Star, Lock, Calendar, GraduationCap, Shield, TrendingUp } from 'lucide-react';
import { prince } from '@/api/princeClient';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getUserBadges } from '@/lib/gamification';

const BADGE_ICONS = {
  'First Steps': '🎯',
  'Quick Learner': '⚡',
  'Week Warrior': '🔥',
  'Month Master': '👑',
  'Topic Explorer': '🗺️',
  'Video Master': '📺',
  'Streak Champion': '🏆',
  'XP Hunter': '💎',
};

export default function PublicProfile() {
  const { email } = useParams();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    prince.auth.me().then(user => {
      setCurrentUser(user);
      setIsOwnProfile(user?.email === decodeURIComponent(email));
    }).catch(() => setCurrentUser(null));
  }, [email]);

  const { data: profileUser, isLoading } = useQuery({
    queryKey: ['user-profile', email],
    queryFn: async () => {
      const users = await prince.entities.User.list();
      return users.find(u => u.email === decodeURIComponent(email));
    },
    enabled: !!email,
  });

  const { data: badges = [] } = useQuery({
    queryKey: ['user-badges', email],
    queryFn: () => getUserBadges(decodeURIComponent(email)),
    enabled: !!email,
  });

  const { data: xpEvents = [] } = useQuery({
    queryKey: ['xp-events', email],
    queryFn: () => prince.entities.XPEvent.filter({ user_email: decodeURIComponent(email) }),
    enabled: !!email,
  });

  const { data: videoProgress = [] } = useQuery({
    queryKey: ['video-progress', email],
    queryFn: () => prince.entities.VideoProgress.filter({ user_email: decodeURIComponent(email) }),
    enabled: !!email,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#080d1a' }}>
        <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#080d1a' }}>
        <div className="text-center">
          <Shield className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">Profile not found</p>
        </div>
      </div>
    );
  }

  const totalXP = xpEvents.reduce((sum, e) => sum + (e.xp_amount || 0), 0);
  const completedVideos = videoProgress.filter(vp => vp.completed).length;
  const level = Math.floor(totalXP / 100) + 1;
  const xpToNextLevel = (level * 100) - totalXP;

  return (
    <div className="min-h-screen" style={{ background: '#080d1a' }}>
      {/* Header */}
      <div className="sticky top-16 z-20 border-b border-white/8" style={{ background: 'rgba(8,13,26,0.95)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Orbitron',sans-serif" }}>
            Public Profile
          </h1>
          <p className="text-slate-400">View student achievements and progress</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 rounded-2xl border border-white/10 p-8 mb-6"
        >
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white">
              {profileUser.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-white">{profileUser.full_name || 'Student'}</h2>
                {profileUser.role === 'admin' && (
                  <Badge className="bg-violet-600">Admin</Badge>
                )}
              </div>
              <p className="text-slate-400 mb-4">{profileUser.grade || 'Grade not set'}</p>
              
              {/* Gamification Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                  <p className="text-xl font-bold text-white">{totalXP}</p>
                  <p className="text-xs text-slate-400">Total XP</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <Star className="w-5 h-5 text-violet-400 mx-auto mb-1" />
                  <p className="text-xl font-bold text-white">Level {level}</p>
                  <p className="text-xs text-slate-400">Level</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                  <p className="text-xl font-bold text-white">{profileUser.current_streak || 0}</p>
                  <p className="text-xs text-slate-400">Day Streak</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-1" />
                  <p className="text-xl font-bold text-white">{profileUser.longest_streak || 0}</p>
                  <p className="text-xs text-slate-400">Best Streak</p>
                </div>
              </div>
            </div>
          </div>

          {/* Level Progress */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Level {level} Progress</span>
              <span className="text-sm text-violet-400">{xpToNextLevel} XP to next level</span>
            </div>
            <Progress value={(totalXP % 100)} className="h-3" />
          </div>
        </motion.div>

        {/* Learning Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 rounded-2xl border border-white/10 p-6 mb-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-violet-400" />
            Learning Progress
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-3xl font-bold text-white mb-1">{completedVideos}</p>
              <p className="text-sm text-slate-400">Videos Completed</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-3xl font-bold text-white mb-1">{xpEvents.length}</p>
              <p className="text-sm text-slate-400">XP Events</p>
            </div>
          </div>
        </motion.div>

        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 rounded-2xl border border-white/10 p-6 mb-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-violet-400" />
            Badges Earned
          </h3>
          {badges.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {badges.map((badge, index) => (
                <div
                  key={index}
                  className="bg-white/5 rounded-xl p-4 text-center hover:bg-white/8 transition-colors"
                  title={badge.description}
                >
                  <div className="text-3xl mb-2">{BADGE_ICONS[badge.name] || '🏅'}</div>
                  <p className="text-sm font-medium text-white">{badge.name}</p>
                  <p className="text-xs text-slate-400 mt-1">{badge.xp_reward} XP</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No badges earned yet</p>
            </div>
          )}
        </motion.div>

        {/* Account Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 rounded-2xl border border-white/10 p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-violet-400" />
            Account Information
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-white/10">
              <span className="text-slate-400">Member Since</span>
              <span className="text-white">
                {profileUser.created_date ? new Date(profileUser.created_date).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/10">
              <span className="text-slate-400">Subscription</span>
              <span className="text-white">{profileUser.subscription_tier || 'Free'}</span>
            </div>
            {profileUser.trial_end_date && (
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-400">Trial Ends</span>
                <span className="text-white">
                  {new Date(profileUser.trial_end_date).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Privacy Notice */}
        <div className="mt-6 text-center text-sm text-slate-500">
          <Lock className="w-4 h-4 inline mr-1" />
          Sensitive information is hidden from public view
        </div>
      </div>
    </div>
  );
}
