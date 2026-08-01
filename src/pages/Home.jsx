import React, { useState, useEffect } from 'react';
import { prince } from '@/api/princeClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Play, ArrowRight, BookOpen, Award, Users, LogIn, UserPlus, CheckCircle, Star, Trophy, TrendingUp, GraduationCap } from 'lucide-react';
import VideoCard from '../components/videos/VideoCard';
import GradeCard from '../components/videos/GradeCard';
import { useAuth } from '@/lib/AuthContext';

const grades = ['Grade 10', 'Grade 11', 'Grade 12'];

// Dark MathMaster Theme - Exactly like the design
const DARK_BG = '#0B0B1F';
const DARK_CARD = '#1A1A3E';
const PURPLE_PRIMARY = '#8B5CF6';
const PURPLE_SECONDARY = '#A78BFA';
const CYAN_ACCENT = '#06B6D4';
const ORANGE_ACCENT = '#F97316';
const GREEN_ACCENT = '#10B981';
const PINK_ACCENT = '#EC4899';
const YELLOW_ACCENT = '#F59E0B';
const TEXT_WHITE = '#FFFFFF';
const TEXT_GRAY = '#9CA3AF';

const HEADING_FONT = "'Poppins', sans-serif";
const BODY_FONT = "'Inter', 'Poppins', sans-serif";

export default function Home() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: videos = [] } = useQuery({
    queryKey: ['videos'],
    queryFn: () => prince.entities.Video.list('-created_date', 50),
    retry: 1,
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
    <div className="min-h-screen" style={{ background: DARK_BG }}>

      {/* ── Hero Section - MathMaster Style ── */}
      <section className="relative overflow-hidden" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        
        {/* Compass and Sphere 3D Objects */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30">
          <div className="relative" style={{ width: '400px', height: '400px' }}>
            {/* Compass visual representation */}
            <svg viewBox="0 0 200 200" className="absolute" style={{ width: '100%', height: '100%' }}>
              <defs>
                <linearGradient id="compassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: PURPLE_PRIMARY, stopOpacity: 0.8 }} />
                  <stop offset="100%" style={{ stopColor: CYAN_ACCENT, stopOpacity: 0.8 }} />
                </linearGradient>
              </defs>
              {/* Compass legs */}
              <line x1="100" y1="60" x2="80" y2="160" stroke="url(#compassGrad)" strokeWidth="6" strokeLinecap="round"/>
              <line x1="100" y1="60" x2="120" y2="160" stroke="url(#compassGrad)" strokeWidth="6" strokeLinecap="round"/>
              <circle cx="100" cy="60" r="8" fill={PURPLE_PRIMARY}/>
              {/* Sphere */}
              <circle cx="80" cy="140" r="25" fill={PURPLE_PRIMARY} opacity="0.6"/>
              <circle cx="80" cy="140" r="20" fill={PURPLE_SECONDARY} opacity="0.4"/>
            </svg>
          </div>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>

            {/* π Logo */}
            <div className="mb-8 flex justify-center">
              <div className="w-24 h-24 rounded-3xl flex items-center justify-center" style={{
                background: `linear-gradient(135deg, ${PURPLE_PRIMARY}, ${PURPLE_SECONDARY})`,
                boxShadow: `0 20px 60px ${PURPLE_PRIMARY}60`
              }}>
                <span style={{ fontSize: '3.5rem', fontWeight: 'bold', color: TEXT_WHITE }}>π</span>
              </div>
            </div>

            {/* MathMaster Title */}
            <h1 style={{
              fontFamily: HEADING_FONT,
              fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
              fontWeight: 800,
              color: TEXT_WHITE,
              marginBottom: '1rem',
              letterSpacing: '-0.02em'
            }}>
              Math<span style={{ color: PURPLE_PRIMARY }}>Master</span>
            </h1>

            {/* Tagline */}
            <p style={{
              fontFamily: BODY_FONT,
              fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
              color: TEXT_GRAY,
              marginBottom: '0.5rem',
              letterSpacing: '0.05em'
            }}>
              Learn. Practice. Master.
            </p>

            {/* Teacher Credit */}
            <p style={{
              fontFamily: BODY_FONT,
              fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
              color: PURPLE_SECONDARY,
              marginBottom: '3rem',
              letterSpacing: '0.02em',
              fontWeight: 600
            }}>
              with Prince Mabandla
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              {user ? (
                <Link to={createPageUrl('Categories')}>
                  <button className="px-10 py-4 rounded-2xl font-bold text-white transition-all hover:scale-105" style={{
                    background: `linear-gradient(135deg, ${PURPLE_PRIMARY}, ${CYAN_ACCENT})`,
                    boxShadow: `0 10px 40px ${PURPLE_PRIMARY}60`,
                    fontFamily: BODY_FONT,
                    fontSize: '1.1rem'
                  }}>
                    Get Started
                  </button>
                </Link>
              ) : (
                <>
                  <Link to={createPageUrl('Register')}>
                    <button className="px-10 py-4 rounded-2xl font-bold text-white transition-all hover:scale-105" style={{
                      background: `linear-gradient(135deg, ${PURPLE_PRIMARY}, ${CYAN_ACCENT})`,
                      boxShadow: `0 10px 40px ${PURPLE_PRIMARY}60`,
                      fontFamily: BODY_FONT,
                      fontSize: '1.1rem'
                    }}>
                      Get Started
                    </button>
                  </Link>
                  <Link to={createPageUrl('Login')}>
                    <button className="px-10 py-4 rounded-2xl font-semibold transition-all hover:scale-105" style={{
                      color: TEXT_WHITE,
                      border: `2px solid ${PURPLE_PRIMARY}`,
                      background: 'transparent',
                      fontFamily: BODY_FONT,
                      fontSize: '1.1rem'
                    }}>
                      Log In
                    </button>
                  </Link>
                </>
              )}
            </div>

            {/* User Greeting (if logged in) */}
            {user && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mb-8">
                <p style={{ fontSize: '1.5rem', color: TEXT_WHITE, fontFamily: BODY_FONT }}>
                  Hello, {user.user_metadata?.full_name || user.email?.split('@')[0]} 👋
                </p>
                <p style={{ fontSize: '0.95rem', color: TEXT_GRAY, marginTop: '0.5rem' }}>
                  Ready to grow your mathematical skills?
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── Topics Grid - MathMaster Style ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h2 style={{ fontFamily: HEADING_FONT, fontWeight: 700, fontSize: '1.8rem', color: TEXT_WHITE, marginBottom: '0.5rem' }}>
              Topics
            </h2>
            <Link to={createPageUrl('Categories')} style={{ color: CYAN_ACCENT, fontSize: '0.95rem', fontWeight: 600 }}>
              View All
            </Link>
          </div>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
          {[
            { name: 'Algebra', icon: '🔢', color: PURPLE_PRIMARY, lessons: '12 Lessons' },
            { name: 'Geometry', icon: '📐', color: CYAN_ACCENT, lessons: '8 Lessons' },
            { name: 'Calculus', icon: '📊', color: ORANGE_ACCENT, lessons: '15 Lessons' },
            { name: 'Statistics', icon: '📈', color: GREEN_ACCENT, lessons: '10 Lessons' },
            { name: 'Trigonometry', icon: '📉', color: YELLOW_ACCENT, lessons: '9 Lessons' },
            { name: 'Practice', icon: '✏️', color: PINK_ACCENT, lessons: '100+ Qs' },
          ].map((topic, i) => (
            <Link key={i} to={createPageUrl('Categories')}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-3xl transition-all hover:scale-105 cursor-pointer"
                style={{
                  background: DARK_CARD,
                  border: `1px solid ${topic.color}40`
                }}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">{topic.icon}</div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: TEXT_WHITE, marginBottom: '0.25rem' }}>{topic.name}</h3>
                  <p style={{ fontSize: '0.75rem', color: TEXT_GRAY }}>{topic.lessons}</p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Continue Learning Section ── */}
      {user && featuredVideos.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 style={{ fontFamily: HEADING_FONT, fontWeight: 700, fontSize: '1.5rem', color: TEXT_WHITE, marginBottom: '1rem' }}>
            Continue Learning
          </h2>
          <div className="p-6 rounded-3xl" style={{ background: `linear-gradient(135deg, ${PURPLE_PRIMARY}40, ${CYAN_ACCENT}40)`, border: `1px solid ${PURPLE_PRIMARY}60` }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: TEXT_WHITE }}>Algebra Basics</h3>
                <p style={{ fontSize: '0.9rem', color: TEXT_GRAY }}>50% Completed</p>
              </div>
              <div style={{ fontSize: '2rem' }}>📐</div>
            </div>
            <div className="w-full h-2 rounded-full" style={{ background: '#1A1A3E' }}>
              <div className="h-full rounded-full" style={{ width: '50%', background: `linear-gradient(90deg, ${PURPLE_PRIMARY}, ${CYAN_ACCENT})` }} />
            </div>
          </div>
        </section>
      )}

      {/* ── Choose Your Grade ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 style={{ fontFamily: HEADING_FONT, fontWeight: 700, fontSize: '1.8rem', color: TEXT_WHITE, marginBottom: '1rem' }}>
          Choose Your Grade
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {grades.map((grade, index) => (
            <GradeCard key={grade} grade={grade} videoCount={gradeVideoCounts[grade]} index={index} />
          ))}
        </div>
      </section>

      {/* ── Latest Lessons ── */}
      {featuredVideos.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 style={{ fontFamily: HEADING_FONT, fontWeight: 700, fontSize: '1.8rem', color: TEXT_WHITE }}>
              Latest Lessons
            </h2>
            <Link to={createPageUrl('Categories')} style={{ color: CYAN_ACCENT, fontSize: '0.95rem', fontWeight: 600 }}>
              See All
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* ── Why MathMaster? (Trust Section) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 style={{ fontFamily: HEADING_FONT, fontWeight: 700, fontSize: '2rem', color: TEXT_WHITE, marginBottom: '1rem', textAlign: 'center' }}>
          Why MathMaster?
        </h2>
        <p style={{ color: TEXT_GRAY, textAlign: 'center', maxWidth: '600px', margin: '0 auto 3rem', fontSize: '1.1rem' }}>
          Join thousands of students mastering mathematics with our expert-led platform
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { icon: '📚', title: 'Structured', subtitle: 'Organized courses', color: PURPLE_PRIMARY },
            { icon: '✅', title: 'Verified', subtitle: 'Expert teachers', color: GREEN_ACCENT },
            { icon: '📊', title: 'Track Progress', subtitle: 'Real-time stats', color: CYAN_ACCENT },
            { icon: '🏆', title: 'Achievements', subtitle: 'Earn badges', color: ORANGE_ACCENT },
            { icon: '⏰', title: 'Smart Reminders', subtitle: 'Stay on track', color: YELLOW_ACCENT },
            { icon: '🌙', title: 'Dark Mode', subtitle: 'Eye-friendly', color: PURPLE_SECONDARY },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="p-6 rounded-3xl text-center"
              style={{ background: DARK_CARD, border: `1px solid ${feature.color}40` }}
            >
              <div className="text-3xl mb-2">{feature.icon}</div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: TEXT_WHITE, marginBottom: '0.25rem' }}>{feature.title}</h3>
              <p style={{ fontSize: '0.75rem', color: TEXT_GRAY }}>{feature.subtitle}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA Section ── */}
      {!user && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="p-12 rounded-3xl text-center" style={{
            background: `linear-gradient(135deg, ${PURPLE_PRIMARY}30, ${CYAN_ACCENT}30)`,
            border: `2px solid ${PURPLE_PRIMARY}60`,
            backdropFilter: 'blur(10px)'
          }}>
            <h2 style={{ fontFamily: HEADING_FONT, fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', color: TEXT_WHITE, marginBottom: '1rem' }}>
              Ready to Master Mathematics?
            </h2>
            <p style={{ color: TEXT_GRAY, fontSize: '1.1rem', marginBottom: '2rem' }}>
              Start your free 3-day trial today
            </p>
            <Link to={createPageUrl('Register')}>
              <button className="px-12 py-4 rounded-2xl font-bold text-white transition-all hover:scale-105" style={{
                background: `linear-gradient(135deg, ${PURPLE_PRIMARY}, ${CYAN_ACCENT})`,
                boxShadow: `0 10px 40px ${PURPLE_PRIMARY}60`,
                fontFamily: BODY_FONT,
                fontSize: '1.1rem'
              }}>
                Get Started Free
              </button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
