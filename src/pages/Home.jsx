import React, { useState, useEffect } from 'react';
import { prince } from '@/api/princeClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Play, ArrowRight, Sparkles, GraduationCap, BookOpen, Award, Users, LogIn, UserPlus, CheckCircle, Star, Trophy, TrendingUp } from 'lucide-react';
import VideoCard from '../components/videos/VideoCard';
import GradeCard from '../components/videos/GradeCard';
import { useAuth } from '@/lib/AuthContext';

const grades = ['Grade 10', 'Grade 11', 'Grade 12'];
// Dark Mathematics Theme
const DARK_BG = '#0A0E27';
const DARK_SURFACE = '#141B3D';
const DARK_CARD = '#1A2245';
const ACCENT_PRIMARY = '#00D9FF';
const ACCENT_SECONDARY = '#7B2FFF';
const ACCENT_GOLD = '#FFB800';
const TEXT_PRIMARY = '#FFFFFF';
const TEXT_SECONDARY = '#B8C5D6';
const TEXT_MUTED = '#6B7B94';

const HEADING_FONT = "'Playfair Display', Georgia, 'Times New Roman', serif";
const BODY_FONT = "'Poppins', 'Sora', sans-serif";

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

      {/* ── Hero ── */}
      <section className="relative overflow-hidden" style={{ minHeight: '92vh', display: 'flex', alignItems: 'center' }}>
        {/* DNA/Math Background Image */}
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: 'url(/math-bg.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
        {/* Dark overlay for text readability */}
        <div 
          className="absolute inset-0" 
          style={{
            background: `linear-gradient(135deg, ${DARK_BG}F5 0%, ${DARK_SURFACE}F0 50%, ${DARK_BG}F5 100%)`,
          }}
        />
        
        {/* Mathematical Grid Pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `
            linear-gradient(${ACCENT_PRIMARY}40 1px, transparent 1px),
            linear-gradient(90deg, ${ACCENT_PRIMARY}40 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }} />
        
        {/* Animated math formulas overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-8 left-8" style={{ color: ACCENT_PRIMARY, fontFamily: 'serif', fontSize: '1.5rem', animation: 'float 6s ease-in-out infinite' }}>
            <div>a² + b² = c²</div>
          </div>
          
          <div className="absolute top-16 right-16 flex gap-8" style={{ color: ACCENT_SECONDARY, fontSize: '2.5rem', animation: 'float 5s ease-in-out infinite' }}>
            <span>π</span>
            <span>√x</span>
            <span>Σ</span>
          </div>

          <div className="absolute bottom-16 left-8" style={{ color: ACCENT_PRIMARY, fontFamily: 'serif', fontSize: '1.2rem', animation: 'float 7s ease-in-out infinite' }}>
            <div>ax² + bx + c = 0</div>
          </div>

          <div className="absolute bottom-8 right-12" style={{ color: ACCENT_GOLD, fontFamily: 'serif', fontSize: '1rem', animation: 'float 8s ease-in-out infinite' }}>
            <div>A = πr²</div>
            <div className="mt-2">V = 4/3 πr³</div>
          </div>

          <div className="absolute left-16 top-1/2" style={{ color: ACCENT_SECONDARY, fontSize: '4rem', transform: 'translateY(-50%)', animation: 'float 9s ease-in-out infinite' }}>
            ∞
          </div>
        </div>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
        `}</style>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center">

            {/* Dots decoration */}
            <div className="flex justify-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full" style={{ background: ACCENT_PRIMARY, boxShadow: `0 0 10px ${ACCENT_PRIMARY}` }} />
              <div className="w-2 h-2 rounded-full" style={{ background: ACCENT_SECONDARY, boxShadow: `0 0 10px ${ACCENT_SECONDARY}` }} />
              <div className="w-2 h-2 rounded-full" style={{ background: ACCENT_GOLD, boxShadow: `0 0 10px ${ACCENT_GOLD}` }} />
            </div>

            {/* Main Headline - MATHEMATICS */}
            <h1 style={{
              fontFamily: "'Impact', 'Arial Black', sans-serif",
              fontWeight: 900,
              fontSize: 'clamp(3rem, 10vw, 7rem)',
              lineHeight: 1,
              marginBottom: '1rem',
              letterSpacing: '0.02em',
              background: `linear-gradient(135deg, ${ACCENT_PRIMARY}, ${ACCENT_SECONDARY})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textTransform: 'uppercase',
              textShadow: '0 4px 20px rgba(0,217,255,0.3)'
            }}>
              MATHEMATICS
            </h1>

            {/* Blue diamond separator */}
            <div className="flex items-center justify-center gap-8 mb-4">
              <div style={{ height: '2px', width: '120px', background: `linear-gradient(90deg, transparent, ${ACCENT_PRIMARY}, transparent)` }} />
              <div style={{
                width: '12px',
                height: '12px',
                background: ACCENT_PRIMARY,
                transform: 'rotate(45deg)',
                boxShadow: `0 0 20px ${ACCENT_PRIMARY}`
              }} />
              <div style={{ height: '2px', width: '120px', background: `linear-gradient(90deg, transparent, ${ACCENT_PRIMARY}, transparent)` }} />
            </div>

            {/* Tagline - THINK SOLVE ACHIEVE */}
            <div className="inline-block px-8 py-2.5 mb-6" style={{
              background: `linear-gradient(135deg, ${ACCENT_SECONDARY}20, ${ACCENT_PRIMARY}20)`,
              border: `2px solid ${ACCENT_PRIMARY}80`,
              borderRadius: '50px',
              fontFamily: BODY_FONT,
              fontWeight: 600,
              fontSize: '0.95rem',
              color: TEXT_PRIMARY,
              letterSpacing: '0.15em',
              boxShadow: `0 0 30px ${ACCENT_PRIMARY}40`
            }}>
              THINK • SOLVE • ACHIEVE
            </div>

            {/* Quote */}
            <p style={{
              fontFamily: 'Georgia, serif',
              fontStyle: 'italic',
              fontSize: '1.1rem',
              color: TEXT_SECONDARY,
              maxWidth: '600px',
              margin: '0 auto 2rem',
              lineHeight: 1.6,
            }}>
              "Mathematics is the language of patterns and possibilities."
            </p>

            {/* Blue dot separator */}
            <div className="flex justify-center mb-6">
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: ACCENT_PRIMARY, boxShadow: `0 0 20px ${ACCENT_PRIMARY}` }} />
            </div>

            {/* User Info Form */}
            <div className="max-w-xl mx-auto mb-8 p-6 rounded-2xl" style={{
              border: `2px solid ${ACCENT_PRIMARY}40`,
              background: `${DARK_CARD}E6`,
              backdropFilter: 'blur(10px)',
              boxShadow: `0 8px 32px ${ACCENT_PRIMARY}20`
            }}>
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3" style={{ borderBottom: `1px solid ${ACCENT_PRIMARY}20` }}>
                  <div style={{ color: ACCENT_PRIMARY }}>
                    <Users className="w-5 h-5" />
                  </div>
                  <input type="text" placeholder="NAME :" readOnly className="flex-1 bg-transparent outline-none" style={{ fontFamily: BODY_FONT, fontSize: '0.95rem', fontWeight: 500, color: TEXT_SECONDARY }} />
                </div>
                <div className="flex items-center gap-3 pb-3" style={{ borderBottom: `1px solid ${ACCENT_PRIMARY}20` }}>
                  <div style={{ color: ACCENT_SECONDARY }}>
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <input type="text" placeholder="GRADE :" readOnly className="flex-1 bg-transparent outline-none" style={{ fontFamily: BODY_FONT, fontSize: '0.95rem', fontWeight: 500, color: TEXT_SECONDARY }} />
                </div>
                <div className="flex items-center gap-3 pb-3" style={{ borderBottom: `1px solid ${ACCENT_PRIMARY}20` }}>
                  <div style={{ color: ACCENT_GOLD }}>
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <input type="text" placeholder="SCHOOL :" readOnly className="flex-1 bg-transparent outline-none" style={{ fontFamily: BODY_FONT, fontSize: '0.95rem', fontWeight: 500, color: TEXT_SECONDARY }} />
                </div>
                <div className="flex items-center gap-3 pb-3">
                  <div style={{ color: ACCENT_PRIMARY }}>
                    <Award className="w-5 h-5" />
                  </div>
                  <input type="text" placeholder="ACADEMIC YEAR :" readOnly className="flex-1 bg-transparent outline-none" style={{ fontFamily: BODY_FONT, fontSize: '0.95rem', fontWeight: 500, color: TEXT_SECONDARY }} />
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {user ? (
                <>
                  <Link to={createPageUrl('Categories')}>
                    <button className="flex items-center gap-2 px-8 rounded-xl font-bold transition-all hover:-translate-y-1"
                      style={{ background: `linear-gradient(135deg, ${ACCENT_PRIMARY}, ${ACCENT_SECONDARY})`, color: DARK_BG, boxShadow: `0 8px 24px ${ACCENT_PRIMARY}60`, fontFamily: BODY_FONT, height: '52px', paddingLeft: '2rem', paddingRight: '2rem', fontSize: '1rem' }}>
                      <Play className="w-5 h-5" fill="currentColor" />
                      Browse Lessons
                    </button>
                  </Link>
                  <Link to={createPageUrl('Pricing')}>
                    <button className="flex items-center gap-2 px-8 rounded-xl font-semibold transition-all hover:-translate-y-1"
                      style={{ color: TEXT_PRIMARY, border: `2px solid ${ACCENT_PRIMARY}`, background: `${DARK_CARD}80`, fontFamily: BODY_FONT, height: '52px', paddingLeft: '2rem', paddingRight: '2rem', fontSize: '1rem', backdropFilter: 'blur(10px)' }}>
                      View Pricing <ArrowRight className="w-5 h-5" />
                    </button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to={createPageUrl('Register')}>
                    <button className="flex items-center gap-2 rounded-xl font-bold transition-all hover:-translate-y-1"
                      style={{ background: `linear-gradient(135deg, ${ACCENT_PRIMARY}, ${ACCENT_SECONDARY})`, color: DARK_BG, boxShadow: `0 8px 24px ${ACCENT_PRIMARY}60`, fontFamily: BODY_FONT, height: '52px', paddingLeft: '2rem', paddingRight: '2rem', fontSize: '1rem' }}>
                      <UserPlus className="w-5 h-5" />
                      Start Free 3-Day Trial
                    </button>
                  </Link>
                  <Link to={createPageUrl('Login')}>
                    <button className="flex items-center gap-2 rounded-xl font-semibold transition-all hover:-translate-y-1"
                      style={{ color: TEXT_PRIMARY, border: `2px solid ${ACCENT_PRIMARY}`, background: `${DARK_CARD}80`, fontFamily: BODY_FONT, height: '52px', paddingLeft: '2rem', paddingRight: '2rem', fontSize: '1rem', backdropFilter: 'blur(10px)' }}>
                      <LogIn className="w-5 h-5" />
                      Sign In
                    </button>
                  </Link>
                </>
              )}
            </div>

            {/* Download app link */}
            <div className="mt-8">
              <Link to={createPageUrl('DownloadApp')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:scale-105"
                style={{ background: `${ACCENT_PRIMARY}15`, border: `1px solid ${ACCENT_PRIMARY}40`, color: ACCENT_PRIMARY, fontFamily: BODY_FONT, backdropFilter: 'blur(10px)' }}>
                📱 Add to Home Screen — Free
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {[
              { icon: BookOpen, label: 'Video Lessons', value: videos.length || '50+', color: ACCENT_PRIMARY },
              { icon: GraduationCap, label: 'Grades', value: 3, color: ACCENT_SECONDARY },
              { icon: Users, label: 'Students', value: '500+', color: ACCENT_GOLD },
              { icon: Award, label: 'Badges', value: '20+', color: ACCENT_PRIMARY },
            ].map((stat, i) => (
              <div key={i} className="text-center p-4 rounded-2xl"
                style={{ background: `${DARK_CARD}B3`, border: `2px solid ${stat.color}30`, boxShadow: `0 4px 20px ${stat.color}20`, backdropFilter: 'blur(10px)' }}>
                <stat.icon className="w-5 h-5 mx-auto mb-2" style={{ color: stat.color }} />
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: TEXT_PRIMARY, fontFamily: HEADING_FONT }}>{stat.value}</div>
                <div style={{ fontSize: '0.7rem', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: BODY_FONT }}>{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Why Trust Prince Mabandla Academy ── */}
      <section className="relative py-20" style={{ background: `linear-gradient(180deg, ${DARK_BG} 0%, ${DARK_SURFACE} 100%)` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 style={{ fontFamily: HEADING_FONT, fontWeight: 800, color: TEXT_PRIMARY, fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '1rem' }}>
              Why Trust Prince Mabandla Academy?
            </h2>
            <p style={{ fontFamily: BODY_FONT, fontSize: '1.1rem', color: TEXT_SECONDARY, maxWidth: '700px', margin: '0 auto' }}>
              Join hundreds of students who have transformed their mathematics journey with expert guidance and proven results
            </p>
          </motion.div>

          {/* Trust Points Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: Star,
                title: 'Expert Mathematics Teacher',
                description: 'Prince Mabandla brings years of teaching experience, specializing in Grade 10-12 Mathematics with a proven track record of student success.',
                color: ACCENT_GOLD
              },
              {
                icon: Trophy,
                title: 'Proven Results',
                description: 'Our students consistently achieve excellence in their exams, with many improving their marks by 20-40% within months of joining.',
                color: '#66BB6A'
              },
              {
                icon: CheckCircle,
                title: 'Comprehensive Curriculum',
                description: 'Every lesson is carefully structured to align with the South African CAPS curriculum, ensuring complete exam preparation.',
                color: ACCENT_PRIMARY
              },
              {
                icon: Users,
                title: 'Growing Community',
                description: 'Join over 500+ students who trust our platform for their mathematics education and support each other\'s learning journey.',
                color: ACCENT_SECONDARY
              },
              {
                icon: TrendingUp,
                title: 'Continuous Improvement',
                description: 'Regular content updates, new lessons added weekly, and continuous refinement based on student feedback and curriculum changes.',
                color: '#26C6DA'
              },
              {
                icon: Award,
                title: 'Quality Assurance',
                description: 'Every video undergoes rigorous quality checks. Clear explanations, step-by-step solutions, and professional production standards.',
                color: '#FF7043'
              },
            ].map((point, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl transition-all duration-300 hover:-translate-y-2"
                style={{
                  background: `${DARK_CARD}B3`,
                  border: `2px solid ${point.color}30`,
                  boxShadow: `0 4px 20px ${point.color}20`,
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl flex-shrink-0" style={{ background: `${point.color}20`, border: `2px solid ${point.color}40`, boxShadow: `0 0 20px ${point.color}30` }}>
                    <point.icon className="w-6 h-6" style={{ color: point.color }} />
                  </div>
                  <div>
                    <h3 style={{ fontFamily: BODY_FONT, fontWeight: 700, fontSize: '1.1rem', color: TEXT_PRIMARY, marginBottom: '0.5rem' }}>
                      {point.title}
                    </h3>
                    <p style={{ fontFamily: BODY_FONT, fontSize: '0.95rem', color: TEXT_SECONDARY, lineHeight: 1.6 }}>
                      {point.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Testimonial Highlight */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto p-8 rounded-2xl text-center"
            style={{
              background: `linear-gradient(135deg, ${ACCENT_SECONDARY}30, ${ACCENT_PRIMARY}30)`,
              border: `2px solid ${ACCENT_PRIMARY}40`,
              boxShadow: `0 12px 40px ${ACCENT_PRIMARY}30`,
              backdropFilter: 'blur(10px)'
            }}
          >
            <div className="mb-4">
              <Star className="w-8 h-8 inline-block" style={{ color: ACCENT_GOLD, filter: `drop-shadow(0 0 10px ${ACCENT_GOLD})` }} />
              <Star className="w-8 h-8 inline-block mx-1" style={{ color: ACCENT_GOLD, filter: `drop-shadow(0 0 10px ${ACCENT_GOLD})` }} />
              <Star className="w-8 h-8 inline-block" style={{ color: ACCENT_GOLD, filter: `drop-shadow(0 0 10px ${ACCENT_GOLD})` }} />
              <Star className="w-8 h-8 inline-block mx-1" style={{ color: ACCENT_GOLD, filter: `drop-shadow(0 0 10px ${ACCENT_GOLD})` }} />
              <Star className="w-8 h-8 inline-block" style={{ color: ACCENT_GOLD, filter: `drop-shadow(0 0 10px ${ACCENT_GOLD})` }} />
            </div>
            <p style={{
              fontFamily: 'Georgia, serif',
              fontStyle: 'italic',
              fontSize: '1.25rem',
              color: TEXT_PRIMARY,
              marginBottom: '1rem',
              lineHeight: 1.7
            }}>
              "Prince Mabandla's teaching method is exceptional. His clear explanations and patient approach helped me improve from 45% to 78% in just 3 months!"
            </p>
            <div style={{
              fontFamily: BODY_FONT,
              fontWeight: 600,
              color: TEXT_SECONDARY,
              fontSize: '1rem'
            }}>
              — Thabo M., Grade 12 Student
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Choose Your Grade ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 style={{ fontFamily: HEADING_FONT, fontWeight: 800, color: TEXT_PRIMARY, fontSize: '2rem', marginBottom: '0.25rem' }}>
              Choose Your Grade
            </h2>
            <p style={{ color: TEXT_SECONDARY, fontFamily: BODY_FONT, fontSize: '0.95rem' }}>Select your grade to browse lessons</p>
          </div>
          <Link to={createPageUrl('Categories')}
            className="flex items-center gap-1 text-sm font-semibold transition-all hover:opacity-80"
            style={{ color: ACCENT_PRIMARY, fontFamily: BODY_FONT }}>
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
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
            <div>
              <h2 style={{ fontFamily: HEADING_FONT, fontWeight: 800, color: TEXT_PRIMARY, fontSize: '2rem', marginBottom: '0.25rem' }}>
                Latest Lessons
              </h2>
              <p style={{ color: TEXT_SECONDARY, fontFamily: BODY_FONT, fontSize: '0.95rem' }}>Recently uploaded video lessons</p>
            </div>
            <Link to={createPageUrl('Categories')}
              className="flex items-center gap-1 text-sm font-semibold transition-all hover:opacity-80"
              style={{ color: ACCENT_PRIMARY, fontFamily: BODY_FONT }}>
              See all <ArrowRight className="w-4 h-4" />
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

      {/* ── CTA Banner ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative overflow-hidden rounded-3xl p-8 md:p-12"
          style={{ 
            background: `linear-gradient(135deg, ${ACCENT_SECONDARY}40, ${ACCENT_PRIMARY}40)`,
            border: `2px solid ${ACCENT_PRIMARY}40`,
            boxShadow: `0 12px 40px ${ACCENT_PRIMARY}30`,
            backdropFilter: 'blur(10px)'
          }}>
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl" style={{ background: `${ACCENT_PRIMARY}20` }} />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl" style={{ background: `${ACCENT_SECONDARY}20` }} />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 style={{ fontFamily: HEADING_FONT, fontWeight: 800, fontStyle: 'italic', fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', color: TEXT_PRIMARY, marginBottom: '0.75rem' }}>
                Ready to Excel in Mathematics?
              </h3>
              <p style={{ color: TEXT_SECONDARY, fontFamily: BODY_FONT }}>
                Join our learning community. Standard plan from <span style={{ fontWeight: 700, color: ACCENT_GOLD }}>R100/month</span>.
              </p>
            </div>
            {user ? (
              <Link to={createPageUrl('Pricing')}>
                <button className="flex items-center gap-2 rounded-xl font-bold whitespace-nowrap transition-all hover:-translate-y-1"
                  style={{ background: `linear-gradient(135deg, ${ACCENT_PRIMARY}, ${ACCENT_SECONDARY})`, color: DARK_BG, boxShadow: `0 8px 24px ${ACCENT_PRIMARY}40`, fontFamily: BODY_FONT, height: '52px', paddingLeft: '2rem', paddingRight: '2rem', fontSize: '1rem' }}>
                  Subscribe Now <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to={createPageUrl('Register')}>
                  <button className="flex items-center gap-2 rounded-xl font-bold whitespace-nowrap transition-all hover:-translate-y-1"
                    style={{ background: `linear-gradient(135deg, ${ACCENT_PRIMARY}, ${ACCENT_SECONDARY})`, color: DARK_BG, boxShadow: `0 8px 24px ${ACCENT_PRIMARY}40`, fontFamily: BODY_FONT, height: '52px', paddingLeft: '2rem', paddingRight: '2rem', fontSize: '1rem' }}>
                    <UserPlus className="w-5 h-5" /> Register Free
                  </button>
                </Link>
                <Link to={createPageUrl('Login')}>
                  <button className="flex items-center gap-2 rounded-xl font-semibold whitespace-nowrap transition-all hover:-translate-y-1"
                    style={{ color: TEXT_PRIMARY, border: `2px solid ${ACCENT_PRIMARY}`, background: `${DARK_CARD}80`, fontFamily: BODY_FONT, height: '52px', paddingLeft: '2rem', paddingRight: '2rem', fontSize: '1rem' }}>
                    <LogIn className="w-5 h-5" /> Sign In
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
