import React, { useState, useEffect } from 'react';
import { prince } from '@/api/princeClient';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import XPCard from '../components/dashboard/XPCard';
import KnowledgeGraph from '../components/dashboard/KnowledgeGraph';
import Leaderboard from '../components/dashboard/Leaderboard';
import { motion } from 'framer-motion';
import {
  BookOpen, Play, Clock, Star, TrendingUp, Award,
  CheckCircle, Lock, ChevronRight, GraduationCap, Calendar
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { createPageUrl } from '@/utils';

const TOPICS_ORDER = [
  'Algebra', 'Number Patterns', 'Functions', 'Finance',
  'Trigonometry', 'Analytical Geometry', 'Statistics',
  'Probability', 'Geometry', 'Calculus', 'Other'
];

export default function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    prince.auth.me().then(setUser).catch(() => setUser(null)).finally(() => setLoadingUser(false));
  }, []);

  const { data: videos = [] } = useQuery({
    queryKey: ['dashboard-videos', user?.grade],
    queryFn: () => prince.entities.Video.filter({ grade: user.grade }),
    enabled: !!user?.grade,
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['dashboard-favorites', user?.email],
    queryFn: () => prince.entities.Favorite.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const { data: xpEvents = [] } = useQuery({
    queryKey: ['xp-events'],
    queryFn: () => prince.entities.XPEvent.list('-created_date', 500),
    enabled: !!user?.email,
  });

  const myXP = xpEvents.filter(e => e.user_email === user?.email).reduce((s, e) => s + (e.xp_amount || 0), 0);
  const myEventCount = xpEvents.filter(e => e.user_email === user?.email).length;

  const favoriteIds = new Set(favorites.map(f => f.video_id));

  // Group videos by topic
  const byTopic = videos.reduce((acc, v) => {
    const topic = v.topic || 'Other';
    if (!acc[topic]) acc[topic] = [];
    acc[topic].push(v);
    return acc;
  }, {});

  const topics = TOPICS_ORDER.filter(t => byTopic[t]);

  // Stats
  const totalVideos = videos.length;
  const watchedCount = videos.filter(v => (v.views || 0) > 0).length;
  const favCount = favorites.length;
  const progressPct = totalVideos > 0 ? Math.round((watchedCount / totalVideos) * 100) : 0;

  // Recent / upcoming = last 5 videos sorted by created_date desc
  const recentVideos = [...videos].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 5);

  const isSubscribed = user?.subscription_status === 'active' || user?.trial_end_date
    ? new Date(user.trial_end_date) > new Date()
    : false;

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <GraduationCap className="w-16 h-16 text-violet-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Sign in to view your dashboard</h2>
          <button
            onClick={() => prince.auth.redirectToLogin(window.location.href)}
            className="mt-4 bg-violet-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-violet-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-600 to-purple-700 text-white px-4 py-10">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-violet-200 text-sm mb-1">Welcome back,</p>
            <h1 className="text-2xl md:text-3xl font-bold">{user.full_name || 'Student'} 👋</h1>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              {user.grade && <Badge className="bg-white/20 text-white border-0">{user.grade}</Badge>}
              {isSubscribed
                ? <Badge className="bg-green-400/30 text-white border-0"><CheckCircle className="w-3 h-3 mr-1" />Active Subscription</Badge>
                : <Badge className="bg-yellow-400/30 text-white border-0"><Lock className="w-3 h-3 mr-1" />No Active Plan</Badge>
              }
              {user.subscription_tier && <Badge className="bg-white/20 text-white border-0">{user.subscription_tier}</Badge>}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* XP Card */}
        <XPCard totalXP={myXP} eventCount={myEventCount} />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Lessons', value: totalVideos, icon: BookOpen, color: 'text-violet-600', bg: 'bg-violet-50' },
            { label: 'Topics Covered', value: topics.length, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Favourites', value: favCount, icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { label: 'Course Progress', value: `${progressPct}%`, icon: Award, color: 'text-green-600', bg: 'bg-green-50' },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
              <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Overall Progress */}
        {totalVideos > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-slate-800">{user.grade} — Overall Progress</h2>
              <span className="text-sm font-medium text-violet-600">{progressPct}%</span>
            </div>
            <Progress value={progressPct} className="h-3" />
            <p className="text-xs text-slate-500 mt-2">{watchedCount} of {totalVideos} lessons viewed</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Module Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">Math Modules</h2>
              <p className="text-xs text-slate-500 mt-0.5">Lessons by topic</p>
            </div>
            {topics.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                {user.grade ? 'No lessons available yet.' : 'Set your grade in your profile to see lessons.'}
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {topics.map((topic) => {
                  const topicVideos = byTopic[topic];
                  const accessible = topicVideos.filter(v =>
                    user.subscription_tier === 'Premium' || v.tier === 'Standard'
                  );
                  const pct = topicVideos.length > 0 ? Math.round((accessible.length / topicVideos.length) * 100) : 0;
                  return (
                    <Link key={topic} to={`${createPageUrl('Categories')}?topic=${encodeURIComponent(topic)}`}>
                      <div className="px-5 py-3.5 hover:bg-slate-50 transition-colors flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-medium text-slate-700">{topic}</span>
                            <span className="text-xs text-slate-400">{topicVideos.length} lessons</span>
                          </div>
                          <Progress value={pct} className="h-1.5" />
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent / Upcoming Lessons */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-800">Latest Lessons</h2>
                <p className="text-xs text-slate-500 mt-0.5">Most recently added</p>
              </div>
              <Link to={createPageUrl('Categories')} className="text-xs text-violet-600 hover:underline font-medium">View all</Link>
            </div>
            {recentVideos.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">No lessons yet.</div>
            ) : (
              <div className="divide-y divide-slate-50">
                {recentVideos.map((video) => {
                  const isFav = favoriteIds.has(video.id);
                  const locked = video.tier === 'Premium' && user.subscription_tier !== 'Premium' && !isSubscribed;
                  return (
                    <Link key={video.id} to={`${createPageUrl('VideoPlayer')}?id=${video.id}`}>
                      <div className="px-5 py-3.5 hover:bg-slate-50 transition-colors flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${locked ? 'bg-slate-100' : 'bg-violet-100'}`}>
                          {locked ? <Lock className="w-4 h-4 text-slate-400" /> : <Play className="w-4 h-4 text-violet-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{video.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {video.topic && <span className="text-xs text-slate-400">{video.topic}</span>}
                            {video.duration && <span className="flex items-center gap-0.5 text-xs text-slate-400"><Clock className="w-3 h-3" />{video.duration}</span>}
                            {isFav && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />}
                          </div>
                        </div>
                        <Badge variant={video.tier === 'Premium' ? 'default' : 'secondary'} className="text-xs flex-shrink-0">{video.tier}</Badge>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Knowledge Graph */}
        <KnowledgeGraph xpEvents={xpEvents} userEmail={user?.email} />

        {/* Leaderboard */}
        <Leaderboard allEvents={xpEvents} currentUserEmail={user?.email} />

        {/* No grade set prompt */}
        {!user.grade && (
          <div className="bg-violet-50 border border-violet-200 rounded-2xl p-6 text-center">
            <GraduationCap className="w-10 h-10 text-violet-400 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-800 mb-1">Set your grade to see your lessons</h3>
            <p className="text-sm text-slate-500 mb-4">Go to your profile and select your grade to personalise your dashboard.</p>
            <Link to={createPageUrl('Profile')}>
              <button className="bg-violet-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-violet-700">
                Update Profile
              </button>
            </Link>
          </div>
        )}

        {/* No subscription prompt */}
        {!isSubscribed && user.grade && (
          <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-6 text-white text-center">
            <Award className="w-10 h-10 mx-auto mb-3 opacity-80" />
            <h3 className="font-bold text-lg mb-1">Unlock All Lessons</h3>
            <p className="text-white/80 text-sm mb-4">Subscribe to access Premium content and all {user.grade} videos.</p>
            <Link to={createPageUrl('Pricing')}>
              <button className="bg-white text-violet-700 font-bold px-6 py-2.5 rounded-lg hover:bg-white/90">
                View Plans
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}