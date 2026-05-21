import React, { useState, useEffect } from 'react';
import { prince } from '@/api/princeClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Play, ArrowRight, Sparkles, GraduationCap, BookOpen, Award, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import VideoCard from '../components/videos/VideoCard';
import GradeCard from '../components/videos/GradeCard';

const grades = ['Grade 10', 'Grade 11', 'Grade 12'];

export default function Home() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    prince.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: videos = [], isLoading } = useQuery({
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
    <div className="min-h-screen" style={{ background: '#0a0f1e' }}>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden" style={{ minHeight: '95vh', display: 'flex', alignItems: 'center' }}>
        {/* Premium mathematics background */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1509228468518-180dd4864904?w=1920&q=80"
            alt="Mathematics background"
            className="w-full h-full object-cover"
          />
          {/* Sophisticated dark overlay */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(10,15,30,0.95) 0%, rgba(15,23,42,0.92) 35%, rgba(20,30,50,0.90) 65%, rgba(10,15,30,0.95) 100%)' }} />
          {/* Premium violet and blue gradient accents */}
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(ellipse at 20% 40%,rgba(139,92,246,0.15) 0%,transparent 50%),radial-gradient(ellipse at 80% 20%,rgba(59,130,246,0.12) 0%,transparent 50%),radial-gradient(ellipse at 50% 80%,rgba(99,102,241,0.1) 0%,transparent 50%)',
            backgroundSize: '100% 100%'
          }} />
          {/* Subtle geometric pattern overlay */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'linear-gradient(rgba(139,92,246,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center">
            {/* Premium badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium mb-10" style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(59,130,246,0.25))',
              border: '1px solid rgba(139,92,246,0.4)',
              color: '#c4b5fd',
              fontFamily: 'Poppins, sans-serif',
              boxShadow: '0 0 30px rgba(139,92,246,0.3), inset 0 0 20px rgba(139,92,246,0.1)'
            }}>
              <Sparkles className="w-4 h-4" style={{ color: '#22d3ee', filter: 'drop-shadow(0 0 12px rgba(34,211,238,0.9))' }} />
              Grade 10, 11 & 12 Mathematics
            </div>

            {/* Premium headline */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight" style={{
              fontFamily: "Orbitron, sans-serif",
              letterSpacing: '-0.02em',
              textShadow: '0 0 50px rgba(139,92,246,0.4), 0 0 100px rgba(139,92,246,0.2)'
            }}>
              Master Mathematics
              <br />
              <span style={{
                background: 'linear-gradient(135deg, #f59e0b, #ef4444, #ec4899, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 30px rgba(245,158,11,0.6))',
                fontFamily: "Orbitron, sans-serif"
              }}>
                With Confidence
              </span>
            </h1>

            {/* Premium description */}
            <p className="text-lg md:text-xl max-w-3xl mx-auto mb-12 leading-relaxed" style={{
              color: 'rgba(255,255,255,0.85)',
              fontFamily: 'Poppins, sans-serif',
              textShadow: '0 2px 8px rgba(0,0,0,0.4)'
            }}>
              Expertly crafted video lessons by{' '}
              <span style={{
                color: '#22d3ee',
                fontWeight: '600',
                filter: 'drop-shadow(0 0 15px rgba(34,211,238,0.8))',
                fontFamily: "Orbitron, sans-serif"
              }}>Prince Mabandla</span>{' '}
              for Grade 10, 11 & 12 Mathematics. Transform your understanding with our innovative approach.
            </p>

            {/* Premium CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              {user ? (
                <>
                  <Link to={createPageUrl('Categories')}>
                    <Button size="lg" className="px-10 h-14 text-base font-semibold rounded-2xl border-0 transition-all hover:scale-105" style={{
                      background: 'linear-gradient(135deg, #8b5cf6, #6366f1, #3b82f6)',
                      boxShadow: '0 10px 40px rgba(139,92,246,0.5), 0 0 30px rgba(139,92,246,0.3), inset 0 0 20px rgba(255,255,255,0.1)',
                      fontFamily: 'Poppins, sans-serif'
                    }}>
                      <Play className="w-5 h-5 mr-2" fill="currentColor" />
                      Browse Lessons
                    </Button>
                  </Link>
                  <Link to={createPageUrl('Pricing')}>
                    <Button size="lg" variant="outline" className="px-10 h-14 text-base rounded-2xl transition-all hover:scale-105" style={{
                      borderColor: 'rgba(139,92,246,0.4)',
                      color: 'white',
                      background: 'rgba(139,92,246,0.1)',
                      fontFamily: 'Poppins, sans-serif',
                      boxShadow: '0 0 25px rgba(139,92,246,0.2)'
                    }}>
                      View Pricing <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to={createPageUrl('Register')}>
                    <Button size="lg" className="px-10 h-14 text-base font-semibold rounded-2xl border-0 transition-all hover:scale-105" style={{
                      background: 'linear-gradient(135deg, #8b5cf6, #6366f1, #3b82f6)',
                      boxShadow: '0 10px 40px rgba(139,92,246,0.5), 0 0 30px rgba(139,92,246,0.3), inset 0 0 20px rgba(255,255,255,0.1)',
                      fontFamily: 'Poppins, sans-serif'
                    }}>
                      Start Free 3-Day Trial <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Button size="lg" onClick={() => prince.auth.redirectToLogin(window.location.href)} variant="outline" className="px-10 h-14 text-base rounded-2xl transition-all hover:scale-105" style={{
                    borderColor: 'rgba(139,92,246,0.4)',
                    color: 'white',
                    background: 'rgba(139,92,246,0.1)',
                    fontFamily: 'Poppins, sans-serif',
                    boxShadow: '0 0 25px rgba(139,92,246,0.2)'
                  }}>
                    Sign In
                  </Button>
                </>
              )}
            </div>

            {/* Premium app download link */}
            <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
              <Link to={createPageUrl('DownloadApp')} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm transition-all hover:scale-105" style={{
                background: 'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(59,130,246,0.2))',
                border: '1px solid rgba(34,211,238,0.4)',
                color: '#22d3ee',
                fontFamily: 'Poppins, sans-serif',
                boxShadow: '0 0 25px rgba(34,211,238,0.4), inset 0 0 15px rgba(34,211,238,0.1)'
              }}>
                <span>📱</span> Add to Home Screen
              </Link>
            </div>
          </motion.div>

          {/* Premium stats */}
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-5 max-w-4xl mx-auto">
            {[
              { icon: BookOpen, label: 'Video Lessons', value: videos.length || '50+' },
              { icon: GraduationCap, label: 'Grades', value: 3 },
              { icon: Users, label: 'Students', value: '500+' },
              { icon: Award, label: 'Badges', value: '20+' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-5 rounded-2xl transition-all hover:scale-105" style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(59,130,246,0.1))',
                border: '1px solid rgba(139,92,246,0.2)',
                boxShadow: '0 0 30px rgba(139,92,246,0.3), inset 0 0 20px rgba(139,92,246,0.05)'
              }}>
                <stat.icon className="w-6 h-6 mx-auto mb-2" style={{
                  color: '#a78bfa',
                  filter: 'drop-shadow(0 0 12px rgba(167,139,250,0.8))'
                }} />
                <div className="text-3xl font-bold text-white" style={{
                  fontFamily: "Orbitron, sans-serif",
                  textShadow: '0 0 20px rgba(255,255,255,0.4)'
                }}>{stat.value}</div>
                <div className="text-xs mt-1" style={{
                  color: 'rgba(255,255,255,0.5)',
                  fontFamily: 'Poppins, sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Grades Section ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2" style={{
              fontFamily: "Orbitron, sans-serif",
              textShadow: '0 0 30px rgba(139,92,246,0.4)'
            }}>Choose Your Grade</h2>
            <p style={{
              color: 'rgba(255,255,255,0.5)',
              fontFamily: "Poppins, sans-serif",
              fontSize: '1.1rem'
            }}>Select your grade to browse Mathematics lessons</p>
          </div>
          <Link to={createPageUrl('Categories')} className="text-sm flex items-center gap-1 font-medium transition-all hover:scale-105" style={{
            color: '#a78bfa',
            fontFamily: "Poppins, sans-serif",
            filter: 'drop-shadow(0 0 12px rgba(167,139,250,0.6))'
          }}>
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {grades.map((grade, index) => (
            <GradeCard key={grade} grade={grade} videoCount={gradeVideoCounts[grade]} index={index} />
          ))}
        </div>
      </section>

      {/* ── Featured Videos ── */}
      {featuredVideos.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2" style={{
                fontFamily: "Orbitron, sans-serif",
                textShadow: '0 0 30px rgba(139,92,246,0.4)'
              }}>Latest Lessons</h2>
              <p style={{
                color: 'rgba(255,255,255,0.5)',
                fontFamily: "Poppins, sans-serif",
                fontSize: '1.1rem'
              }}>Recently uploaded video lessons</p>
            </div>
            <Link to={createPageUrl('Categories')} className="text-sm flex items-center gap-1 font-medium transition-all hover:scale-105" style={{
              color: '#a78bfa',
              fontFamily: "Poppins, sans-serif",
              filter: 'drop-shadow(0 0 12px rgba(167,139,250,0.6))'
            }}>
              See all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredVideos.map((video) => (
              <VideoCard key={video.id} video={video} isFavorited={favoriteVideoIds.includes(video.id)} onToggleFavorite={(id) => user && toggleFavoriteMutation.mutate(id)} showFavorite={!!user} />
            ))}
          </div>
        </section>
      )}

      {/* ── Premium CTA ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="relative overflow-hidden rounded-3xl p-10 md:p-16" style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(59,130,246,0.25), rgba(99,102,241,0.25))',
          border: '1px solid rgba(139,92,246,0.3)',
          boxShadow: '0 0 60px rgba(139,92,246,0.3), inset 0 0 60px rgba(139,92,246,0.1)'
        }}>
          {/* Premium glow effects */}
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl" style={{ background: 'rgba(139,92,246,0.3)' }} />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl" style={{ background: 'rgba(59,130,246,0.25)' }} />

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex-1">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{
                fontFamily: "Orbitron, sans-serif",
                textShadow: '0 0 30px rgba(255,255,255,0.3)'
              }}>
                Ready to Excel in Mathematics?
              </h3>
              <p style={{
                color: 'rgba(255,255,255,0.7)',
                fontFamily: "Poppins, sans-serif",
                fontSize: '1.1rem',
                lineHeight: '1.7'
              }}>
                Join our learning community and get access to all video lessons. Track your progress with our gamification system and compete on the leaderboard.
              </p>
            </div>
            {user ? (
              <Link to={createPageUrl('Pricing')}>
                <Button size="lg" className="px-10 h-14 text-base font-semibold rounded-2xl border-0 whitespace-nowrap" style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #6366f1, #3b82f6)',
                  boxShadow: '0 10px 40px rgba(139,92,246,0.5), 0 0 30px rgba(139,92,246,0.3), inset 0 0 20px rgba(255,255,255,0.1)',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  Subscribe Now <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            ) : (
              <Button size="lg" onClick={() => prince.auth.redirectToLogin(window.location.href)} className="px-10 h-14 text-base font-semibold rounded-2xl border-0 whitespace-nowrap" style={{
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1, #3b82f6)',
                boxShadow: '0 10px 40px rgba(139,92,246,0.5), 0 0 30px rgba(139,92,246,0.3), inset 0 0 20px rgba(255,255,255,0.1)',
                fontFamily: 'Poppins, sans-serif'
              }}>
                Register / Sign In <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
