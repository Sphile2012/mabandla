import { useState, useEffect } from 'react';
import { prince } from '@/api/princeClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Play, ArrowRight, Sparkles, GraduationCap, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import VideoCard from '../components/videos/VideoCard';
import GradeCard from '@/components/videos/GradeCard';

const grades = ['Grade 10', 'Grade 11', 'Grade 12'];

// Gold & white colour constants
const GOLD = '#f5c842';
const GOLD_DARK = '#d4a017';
const GOLD_LIGHT = '#fde68a';

export default function Home() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    prince.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

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
        {/* Calculus / maths background */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1509228468518-180dd4864904?w=1920&q=80"
            alt="Calculus mathematics background"
            className="w-full h-full object-cover"
            loading="eager"
          />
          {/* Deep dark overlay with gold tint */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(135deg, rgba(15,12,7,0.93) 0%, rgba(26,21,8,0.90) 40%, rgba(15,12,7,0.93) 100%)'
          }} />
          {/* Gold glow accents */}
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(ellipse at 25% 50%, rgba(245,200,66,0.12) 0%, transparent 55%), radial-gradient(ellipse at 75% 30%, rgba(212,160,23,0.08) 0%, transparent 55%)'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-8" style={{
              background: 'rgba(245,200,66,0.12)',
              border: '1px solid rgba(245,200,66,0.35)',
              color: GOLD_LIGHT
            }}>
              <Sparkles className="w-4 h-4" style={{ color: GOLD }} />
              Grade 10, 11 &amp; 12 Mathematics
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight" style={{ fontFamily: "'Sora',sans-serif", letterSpacing: '-0.02em' }}>
              <span className="text-white">Master </span>
              <span style={{
                background: `linear-gradient(135deg, ${GOLD_LIGHT} 0%, ${GOLD} 50%, ${GOLD_DARK} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>Mathematics</span>
              <br />
              <span className="text-white text-4xl md:text-5xl font-bold">One Lesson at a Time</span>
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10" style={{ color: 'rgba(255,255,255,0.75)', lineHeight: '1.8' }}>
              Expertly crafted video lessons by{' '}
              <span style={{ color: GOLD, fontWeight: '700' }}>Prince Mabandla</span>{' '}
              for Grade 10, 11 &amp; 12 Mathematics. Learn at your own pace.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {user ? (
                <>
                  <Link to={createPageUrl('Categories')}>
                    <Button size="lg" className="px-8 h-12 text-base font-bold rounded-2xl border-0 text-black" style={{
                      background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`,
                      boxShadow: `0 8px 30px rgba(245,200,66,0.4)`
                    }}>
                      <Play className="w-5 h-5 mr-2" fill="currentColor" />
                      Browse Lessons
                    </Button>
                  </Link>
                  <Link to={createPageUrl('Pricing')}>
                    <Button size="lg" variant="outline" className="px-8 h-12 text-base rounded-2xl" style={{
                      borderColor: 'rgba(245,200,66,0.4)',
                      color: GOLD_LIGHT,
                      background: 'rgba(245,200,66,0.06)'
                    }}>
                      View Pricing <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to={createPageUrl('Register')}>
                    <Button size="lg" className="px-8 h-12 text-base font-bold rounded-2xl border-0 text-black" style={{
                      background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`,
                      boxShadow: `0 8px 30px rgba(245,200,66,0.4)`
                    }}>
                      Start Free 3-Day Trial <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Button size="lg" onClick={() => prince.auth.redirectToLogin(window.location.href)} variant="outline" className="px-8 h-12 text-base rounded-2xl" style={{
                    borderColor: 'rgba(245,200,66,0.4)',
                    color: GOLD_LIGHT,
                    background: 'rgba(245,200,66,0.06)'
                  }}>
                    Sign In
                  </Button>
                </>
              )}
            </div>

            {/* App link */}
            <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
              <Link to={createPageUrl('DownloadApp')} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105" style={{
                background: 'rgba(245,200,66,0.1)',
                border: `1px solid rgba(245,200,66,0.3)`,
                color: GOLD_LIGHT
              }}>
                <span>📱</span> Add to Home Screen
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {[
              { icon: BookOpen, label: 'Video Lessons', value: videos.length || '50+' },
              { icon: GraduationCap, label: 'Grades', value: 3 },
              { icon: Play, label: 'Hours of Content', value: '50+' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-4 rounded-2xl" style={{
                background: 'rgba(245,200,66,0.06)',
                border: '1px solid rgba(245,200,66,0.18)'
              }}>
                <stat.icon className="w-5 h-5 mx-auto mb-2" style={{ color: GOLD }} />
                <div className="text-2xl font-bold" style={{ color: GOLD_LIGHT, fontFamily: "'Sora',sans-serif" }}>{stat.value}</div>
                <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Grades Section ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Sora',sans-serif" }}>Choose Your Grade</h2>
            <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>Select your grade to browse Mathematics lessons</p>
          </div>
          <Link to={createPageUrl('Categories')} className="text-sm flex items-center gap-1 font-semibold transition-all hover:scale-105" style={{ color: GOLD }}>
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {grades.map((grade, index) => (
            <GradeCard key={grade} grade={grade} videoCount={gradeVideoCounts[grade]} index={index} />
          ))}
        </div>
      </section>

      {/* ── Featured Videos ── */}
      {featuredVideos.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Sora',sans-serif" }}>Latest Lessons</h2>
              <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>Recently uploaded video lessons</p>
            </div>
            <Link to={createPageUrl('Categories')} className="text-sm flex items-center gap-1 font-semibold transition-all hover:scale-105" style={{ color: GOLD }}>
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

      {/* ── CTA ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative overflow-hidden rounded-3xl p-8 md:p-12" style={{
          background: 'linear-gradient(135deg, rgba(245,200,66,0.12), rgba(212,160,23,0.08))',
          border: '1px solid rgba(245,200,66,0.25)'
        }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl" style={{ background: 'rgba(245,200,66,0.1)' }} />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3" style={{ fontFamily: "'Sora',sans-serif" }}>
                Ready to Excel in Mathematics?
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.6)' }}>Join our learning community and get access to all video lessons.</p>
            </div>
            {user ? (
              <Link to={createPageUrl('Pricing')}>
                <Button size="lg" className="px-8 h-12 text-base font-bold rounded-2xl border-0 text-black whitespace-nowrap" style={{
                  background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`,
                  boxShadow: `0 8px 30px rgba(245,200,66,0.35)`
                }}>
                  Subscribe Now <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            ) : (
              <Button size="lg" onClick={() => prince.auth.redirectToLogin(window.location.href)}
                className="px-8 h-12 text-base font-bold rounded-2xl border-0 text-black whitespace-nowrap" style={{
                  background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`,
                  boxShadow: `0 8px 30px rgba(245,200,66,0.35)`
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
