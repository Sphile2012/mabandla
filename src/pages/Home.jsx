import React from 'react';
import { prince } from '@/api/princeClient'; // still needed for entities via useQuery
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Play, ArrowRight, Sparkles, GraduationCap, BookOpen, Award, Users, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import VideoCard from '../components/videos/VideoCard';
import GradeCard from '../components/videos/GradeCard';
import { useAuth } from '@/lib/AuthContext';

const grades = ['Grade 10', 'Grade 11', 'Grade 12'];
const GOLD = '#f5c842';
const GOLD_LIGHT = '#fde68a';
const GOLD_DARK = '#d97706';

export default function Home() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: videos = [] } = useQuery({
    queryKey: ['videos'],
    queryFn: () => prince.entities.Video.list('-created_date', 50),
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites', user?.email],
    queryFn: () => prince.entities.Favorite.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const favoriteVideoIds = favorites.map(f => f.video_id);

  const toggleFavoriteMutation = useMutation({
    mutationFn: async (videoId) => {
      const existing = favorites.find(f => f.video_id === videoId);
      if (existing) {
        await prince.entities.Favorite.delete(existing.id);
      } else {
        await prince.entities.Favorite.create({ video_id: videoId, user_email: user.email });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });

  const featuredVideos = videos.slice(0, 4);
  const gradeVideoCounts = grades.reduce((acc, g) => {
    acc[g] = videos.filter(v => v.grade === g).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen" style={{ background: '#0f0c07' }}>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden" style={{ minHeight: '92vh', display: 'flex', alignItems: 'center' }}>
        {/* Background photo — mathematics spirals & equations */}
        <div className="absolute inset-0">
          <img
            src="/math-bg.jpg"
            alt="Mathematics background"
            className="w-full h-full object-cover"
            loading="eager"
          />
          {/* Dark overlay — lighter so photo is visible */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,rgba(15,12,7,0.82) 0%,rgba(26,21,8,0.75) 50%,rgba(15,12,7,0.82) 100%)' }} />
          {/* Gold glow */}
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse at 25% 50%,rgba(245,200,66,0.12) 0%,transparent 55%),radial-gradient(ellipse at 75% 30%,rgba(212,160,23,0.08) 0%,transparent 55%)' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-8"
              style={{ background: 'rgba(245,200,66,0.1)', border: '1px solid rgba(245,200,66,0.3)', color: GOLD_LIGHT }}>
              <Sparkles className="w-4 h-4" style={{ color: GOLD }} />
              Grade 10, 11 &amp; 12 Mathematics
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight text-white"
              style={{ fontFamily: "'Sora',sans-serif", letterSpacing: '-0.02em' }}>
              Master{' '}
              <span style={{ background: `linear-gradient(135deg,${GOLD_LIGHT},${GOLD},${GOLD_DARK})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Mathematics
              </span>
              <br />
              <span className="text-white text-3xl sm:text-4xl md:text-5xl font-bold">One Lesson at a Time</span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-10 px-4" style={{ color: 'rgba(255,255,255,0.7)', lineHeight: '1.8' }}>
              Expertly crafted video lessons by{' '}
              <span style={{ color: GOLD, fontWeight: '700' }}>Prince Mabandla</span>{' '}
              for Grade 10, 11 &amp; 12 Mathematics. Learn at your own pace.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {user ? (
                <>
                  <Link to={createPageUrl('Categories')}>
                    <button className="px-8 h-12 rounded-2xl font-bold text-black text-base flex items-center gap-2 transition-all hover:-translate-y-0.5"
                      style={{ background: `linear-gradient(135deg,${GOLD_LIGHT},${GOLD})`, boxShadow: `0 8px 28px rgba(245,200,66,0.45)` }}>
                      <Play className="w-5 h-5" fill="currentColor" />
                      Browse Lessons
                    </button>
                  </Link>
                  <Link to={createPageUrl('Pricing')}>
                    <button className="px-8 h-12 rounded-2xl font-semibold text-base flex items-center gap-2 transition-all hover:-translate-y-0.5"
                      style={{ color: GOLD_LIGHT, border: `1px solid rgba(245,200,66,0.35)`, background: 'rgba(245,200,66,0.06)' }}>
                      View Pricing <ArrowRight className="w-5 h-5" />
                    </button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to={createPageUrl('Register')}>
                    <button className="px-8 h-12 rounded-2xl font-bold text-black text-base flex items-center gap-2 transition-all hover:-translate-y-0.5"
                      style={{ background: `linear-gradient(135deg,${GOLD_LIGHT},${GOLD})`, boxShadow: `0 8px 28px rgba(245,200,66,0.45)` }}>
                      <UserPlus className="w-5 h-5" />
                      Start Free 3-Day Trial
                    </button>
                  </Link>
                  <Link to={createPageUrl('Login')}>
                    <button className="px-8 h-12 rounded-2xl font-semibold text-base flex items-center gap-2 transition-all hover:-translate-y-0.5"
                      style={{ color: GOLD_LIGHT, border: `1px solid rgba(245,200,66,0.35)`, background: 'rgba(245,200,66,0.06)' }}>
                      <LogIn className="w-5 h-5" />
                      Sign In
                    </button>
                  </Link>
                </>
              )}
            </div>

            {/* App link */}
            <div className="mt-8">
              <Link to={createPageUrl('DownloadApp')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105"
                style={{ background: 'rgba(245,200,66,0.08)', border: '1px solid rgba(245,200,66,0.2)', color: GOLD_LIGHT }}>
                📱 Add to Home Screen
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-2xl mx-auto px-4">
            {[
              { icon: BookOpen, label: 'Video Lessons', value: videos.length || '50+' },
              { icon: GraduationCap, label: 'Grades', value: 3 },
              { icon: Users, label: 'Students', value: '500+' },
              { icon: Award, label: 'Badges', value: '20+' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-3 sm:p-4 rounded-2xl"
                style={{ background: 'rgba(245,200,66,0.06)', border: '1px solid rgba(245,200,66,0.15)' }}>
                <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-2" style={{ color: GOLD }} />
                <div className="text-xl sm:text-2xl font-bold text-white" style={{ fontFamily: "'Sora',sans-serif" }}>{stat.value}</div>
                <div className="text-[10px] sm:text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Grades Section ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white" style={{ fontFamily: "'Sora',sans-serif" }}>Choose Your Grade</h2>
            <p className="mt-1 text-xs sm:text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Select your grade to browse Mathematics lessons</p>
          </div>
          <Link to={createPageUrl('Categories')}
            className="text-xs sm:text-sm flex items-center gap-1 font-semibold transition-all hover:opacity-80"
            style={{ color: GOLD }}>
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {grades.map((grade, index) => (
            <GradeCard key={grade} grade={grade} videoCount={gradeVideoCounts[grade]} index={index} />
          ))}
        </div>
      </section>

      {/* ── Featured Videos ── */}
      {featuredVideos.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white" style={{ fontFamily: "'Sora',sans-serif" }}>Latest Lessons</h2>
              <p className="mt-1 text-xs sm:text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Recently uploaded video lessons</p>
            </div>
            <Link to={createPageUrl('Categories')}
              className="text-xs sm:text-sm flex items-center gap-1 font-semibold transition-all hover:opacity-80"
              style={{ color: GOLD }}>
              See all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                isFavorited={favoriteVideoIds.includes(video.id)}
                onToggleFavorite={(id) => user && toggleFavoriteMutation.mutate(id)}
                showFavorite={!!user}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── CTA Banner ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12"
          style={{ background: 'linear-gradient(135deg,rgba(245,200,66,0.1),rgba(212,160,23,0.07))', border: '1px solid rgba(245,200,66,0.2)' }}>
          <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 rounded-full blur-3xl" style={{ background: 'rgba(245,200,66,0.08)' }} />
          <div className="relative flex flex-col items-center text-center md:items-start md:text-left md:flex-row md:justify-between gap-6 sm:gap-8">
            <div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3" style={{
                fontFamily: "'Sora',sans-serif' }}>
                Ready to Excel in Mathematics?
              </h3>
            <p className="text-sm sm:text-base" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Join our learning community and get access to all video lessons.
            </p>
          </div>
          {user ? (
            <Link to={createPageUrl('Pricing')} className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-6 sm:px-8 h-11 sm:h-12 rounded-2xl font-bold text-black text-sm sm:text-base flex items-center justify-center gap-2 whitespace-nowrap transition-all hover:-translate-y-0.5"
                style={{ background: `linear-gradient(135deg,${GOLD_LIGHT},${GOLD})`, boxShadow: '0 8px 28px rgba(245,200,66,0.4)' }}>
                Subscribe Now <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </Link>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link to={createPageUrl('Register')} className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-6 sm:px-8 h-11 sm:h-12 rounded-2xl font-bold text-black text-sm sm:text-base flex items-center justify-center gap-2 whitespace-nowrap transition-all hover:-translate-y-0.5"
                  style={{ background: `linear-gradient(135deg,${GOLD_LIGHT},${GOLD})`, boxShadow: '0 8px 28px rgba(245,200,66,0.4)' }}>
                  <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" /> Register Free
                </button>
              </Link>
              <Link to={createPageUrl('Login')} className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-6 sm:px-8 h-11 sm:h-12 rounded-2xl font-semibold text-sm sm:text-base flex items-center justify-center gap-2 whitespace-nowrap transition-all hover:-translate-y-0.5"
                  style={{ color: GOLD_LIGHT, border: '1px solid rgba(245,200,66,0.3)', background: 'rgba(245,200,66,0.06)' }}>
                  <LogIn className="w-4 h-4 sm:w-5 sm:h-5" /> Sign In
                </button>
              </Link>
            </div>
          )}
        </div>
    </div>
      </section >
    </div >
  );
}
