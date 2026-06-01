import React from 'react';
import { prince } from '@/api/princeClient';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, Play, Clock, Star, TrendingUp, Award,
  Lock, ChevronRight, GraduationCap, Crown, CheckCircle, LogIn
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';
import { hasActiveAccess, canWatchVideo, getPlanLabel } from '@/lib/access';

const GOLD = '#f5c842';
const GOLD_LIGHT = '#fde68a';
const GOLD_DARK = '#d97706';

const TOPICS_ORDER = [
  'Algebra','Number Patterns','Functions','Finance',
  'Trigonometry','Analytical Geometry','Statistics',
  'Probability','Geometry','Calculus','Other'
];

const cardStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(245,200,66,0.12)',
};

export default function StudentDashboard() {
  const { user, isLoadingAuth } = useAuth();

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
    queryKey: ['xp-events', user?.email],
    queryFn: () => prince.entities.XPEvent.filter({ user_email: user.email }, '-created_date', 500),
    enabled: !!user?.email,
  });

  const isSubscribed = hasActiveAccess(user);
  const planLabel = getPlanLabel(user);
  const favoriteIds = new Set(favorites.map(f => f.video_id));
  const myXP = xpEvents.reduce((s, e) => s + (e.xp_amount || 0), 0);

  const byTopic = videos.reduce((acc, v) => {
    const t = v.topic || 'Other';
    if (!acc[t]) acc[t] = [];
    acc[t].push(v);
    return acc;
  }, {});
  const topics = TOPICS_ORDER.filter(t => byTopic[t]);

  const totalVideos = videos.length;
  const favCount = favorites.length;
  const recentVideos = [...videos]
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 6);

  // Loading
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f0c07' }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: GOLD, borderTopColor: 'transparent' }} />
      </div>
    );
  }

  // Not signed in
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0f0c07' }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: `linear-gradient(135deg,${GOLD_LIGHT},${GOLD})` }}>
            <GraduationCap className="w-8 h-8 text-black" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Sora',sans-serif" }}>
            Sign in to view your dashboard
          </h2>
          <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Track your progress, XP, and lessons
          </p>
          <Link to={createPageUrl('Login')}>
            <button className="px-6 h-11 rounded-xl font-bold text-black flex items-center gap-2 mx-auto"
              style={{ background: `linear-gradient(135deg,${GOLD_LIGHT},${GOLD})`, boxShadow: '0 4px 16px rgba(245,200,66,0.4)' }}>
              <LogIn className="w-4 h-4" /> Sign In
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16" style={{ background: '#0f0c07' }}>

      {/* Header */}
      <div className="relative overflow-hidden py-10 px-4"
        style={{ background: 'linear-gradient(135deg,rgba(245,200,66,0.12) 0%,rgba(15,12,7,0) 60%)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.45)' }}>Welcome back,</p>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-3"
              style={{ fontFamily: "'Sora',sans-serif" }}>
              {user.full_name || 'Student'} 👋
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              {user.grade && (
                <span className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ background: 'rgba(245,200,66,0.15)', color: GOLD_LIGHT, border: '1px solid rgba(245,200,66,0.3)' }}>
                  {user.grade}
                </span>
              )}
              <span className="text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1"
                style={{
                  background: isSubscribed ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                  color: isSubscribed ? '#86efac' : '#fca5a5',
                  border: `1px solid ${isSubscribed ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                }}>
                {isSubscribed ? <CheckCircle className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                {planLabel}
              </span>
              {planLabel === 'Premium' && (
                <span className="text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1"
                  style={{ background: 'rgba(245,200,66,0.15)', color: GOLD, border: '1px solid rgba(245,200,66,0.3)' }}>
                  <Crown className="w-3 h-3" /> Premium
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Lessons', value: totalVideos, icon: BookOpen },
            { label: 'Favourites', value: favCount, icon: Star },
            { label: 'XP Earned', value: myXP, icon: TrendingUp },
            { label: 'My Plan', value: planLabel, icon: Award },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="rounded-2xl p-4" style={cardStyle}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                style={{ background: 'rgba(245,200,66,0.1)' }}>
                <stat.icon className="w-5 h-5" style={{ color: GOLD }} />
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* No grade prompt */}
        {!user.grade && (
          <div className="rounded-2xl p-6 text-center" style={cardStyle}>
            <GraduationCap className="w-10 h-10 mx-auto mb-3" style={{ color: GOLD }} />
            <h3 className="font-semibold text-white mb-1">Set your grade to see your lessons</h3>
            <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Go to your profile and select your grade.
            </p>
            <Link to={createPageUrl('Profile')}>
              <button className="px-5 py-2 rounded-xl font-bold text-black text-sm"
                style={{ background: `linear-gradient(135deg,${GOLD_LIGHT},${GOLD})` }}>
                Update Profile
              </button>
            </Link>
          </div>
        )}

        {/* Latest Lessons */}
        {recentVideos.length > 0 && (
          <div className="rounded-2xl overflow-hidden" style={cardStyle}>
            <div className="px-5 py-4 flex items-center justify-between"
              style={{ borderBottom: '1px solid rgba(245,200,66,0.1)' }}>
              <div>
                <h2 className="font-semibold text-white" style={{ fontFamily: "'Sora',sans-serif" }}>
                  Latest Lessons
                </h2>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Most recently added for {user.grade}
                </p>
              </div>
              <Link to={createPageUrl('Categories')}
                className="text-xs font-semibold transition-colors hover:opacity-80"
                style={{ color: GOLD }}>
                View all
              </Link>
            </div>
            <div>
              {recentVideos.map((video) => {
                const locked = !canWatchVideo(user, video);
                const isFav = favoriteIds.has(video.id);
                return (
                  <Link key={video.id} to={`${createPageUrl('VideoPlayer')}?id=${video.id}`}>
                    <div className="px-5 py-3.5 flex items-center gap-3 transition-all hover:bg-white/5"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: locked ? 'rgba(255,255,255,0.05)' : 'rgba(245,200,66,0.1)' }}>
                        {locked
                          ? <Lock className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
                          : <Play className="w-4 h-4" style={{ color: GOLD }} />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{video.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {video.topic && (
                            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{video.topic}</span>
                          )}
                          {video.duration && (
                            <span className="flex items-center gap-0.5 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                              <Clock className="w-3 h-3" />{video.duration}
                            </span>
                          )}
                          {isFav && <Star className="w-3 h-3 fill-current" style={{ color: GOLD }} />}
                        </div>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{
                          background: video.tier === 'Premium' ? 'rgba(245,200,66,0.15)' : 'rgba(255,255,255,0.08)',
                          color: video.tier === 'Premium' ? GOLD : 'rgba(255,255,255,0.5)',
                          border: video.tier === 'Premium' ? '1px solid rgba(245,200,66,0.3)' : '1px solid rgba(255,255,255,0.1)',
                        }}>
                        {video.tier === 'Premium' ? '👑 Premium' : 'Standard'}
                      </span>
                      <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Math Modules */}
        {topics.length > 0 && (
          <div className="rounded-2xl overflow-hidden" style={cardStyle}>
            <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(245,200,66,0.1)' }}>
              <h2 className="font-semibold text-white" style={{ fontFamily: "'Sora',sans-serif" }}>
                Math Modules
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Lessons by topic</p>
            </div>
            <div>
              {topics.map((topic) => {
                const topicVideos = byTopic[topic];
                const accessible = topicVideos.filter(v => canWatchVideo(user, v)).length;
                const pct = topicVideos.length > 0 ? Math.round((accessible / topicVideos.length) * 100) : 0;
                return (
                  <Link key={topic} to={`${createPageUrl('Categories')}?topic=${encodeURIComponent(topic)}`}>
                    <div className="px-5 py-3.5 flex items-center gap-3 transition-all hover:bg-white/5"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-medium text-white">{topic}</span>
                          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                            {accessible}/{topicVideos.length} accessible
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                          <div className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, background: `linear-gradient(90deg,${GOLD_DARK},${GOLD})` }} />
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Subscription upsell */}
        {!isSubscribed && user.grade && (
          <div className="rounded-2xl p-6 text-center relative overflow-hidden"
            style={{ background: `linear-gradient(135deg,rgba(245,200,66,0.15),rgba(212,160,23,0.08))`, border: '1px solid rgba(245,200,66,0.25)' }}>
            <Crown className="w-10 h-10 mx-auto mb-3" style={{ color: GOLD }} />
            <h3 className="font-bold text-lg text-white mb-1">Unlock All Lessons</h3>
            <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Standard plan from <span style={{ color: GOLD }}>R100/month</span> — access all Standard lessons.
            </p>
            <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Premium plan <span style={{ color: GOLD }}>R150/month</span> — access everything including Premium lessons.
            </p>
            <Link to={createPageUrl('Pricing')}>
              <button className="px-8 h-11 rounded-xl font-bold text-black"
                style={{ background: `linear-gradient(135deg,${GOLD_LIGHT},${GOLD})`, boxShadow: '0 4px 16px rgba(245,200,66,0.4)' }}>
                View Plans
              </button>
            </Link>
          </div>
        )}

        {/* Standard upsell to Premium */}
        {isSubscribed && planLabel === 'Standard' && (
          <div className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: 'rgba(245,200,66,0.06)', border: '1px solid rgba(245,200,66,0.2)' }}>
            <Crown className="w-8 h-8 flex-shrink-0" style={{ color: GOLD }} />
            <div className="flex-1">
              <p className="font-semibold text-white text-sm">Upgrade to Premium</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Unlock Premium lessons for R150/month
              </p>
            </div>
            <Link to={createPageUrl('Pricing')}>
              <button className="px-4 h-9 rounded-xl font-bold text-black text-sm flex-shrink-0"
                style={{ background: `linear-gradient(135deg,${GOLD_LIGHT},${GOLD})` }}>
                Upgrade
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
