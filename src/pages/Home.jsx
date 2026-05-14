import React, { useState, useEffect } from 'react';
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
    <div className="min-h-screen" style={{ background: '#080d1a' }}>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden" style={{ minHeight: '92vh', display: 'flex', alignItems: 'center' }}>
        {/* Maths background image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1920&q=80"
            alt="Mathematics background"
            className="w-full h-full object-cover"
          />
          {/* Dark overlay so text is readable */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(8,5,30,0.92) 0%, rgba(15,10,46,0.88) 40%, rgba(10,22,40,0.90) 100%)' }} />
          {/* Extra violet tint */}
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse at 30% 50%,rgba(124,58,237,0.25) 0%,transparent 60%),radial-gradient(ellipse at 70% 30%,rgba(37,99,235,0.15) 0%,transparent 60%)' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8" style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#c4b5fd' }}>
              <Sparkles className="w-4 h-4" style={{ color: '#22d3ee' }} />
              Grade 10, 11 & 12 Mathematics
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight" style={{ fontFamily: "'Sora',sans-serif", letterSpacing: '-0.03em' }}>
              Master Mathematics
              <br />
              <span style={{ background: 'linear-gradient(135deg,#f59e0b,#ef4444,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                One Lesson at a Time
              </span>
            </h1>

            <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10" style={{ color: 'rgba(255,255,255,0.65)', lineHeight: '1.7' }}>
              Expertly crafted video lessons by{' '}
              <span style={{ color: '#22d3ee', fontWeight: '600' }}>Prince Mabandla</span>{' '}
              for Grade 10, 11 & 12 Mathematics. Learn at your own pace.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {user ? (
                <>
                  <Link to={createPageUrl('Categories')}>
                    <Button size="lg" className="px-8 h-12 text-base font-semibold rounded-2xl border-0" style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)', boxShadow: '0 8px 30px rgba(124,58,237,0.4)' }}>
                      <Play className="w-5 h-5 mr-2" fill="currentColor" />
                      Browse Lessons
                    </Button>
                  </Link>
                  <Link to={createPageUrl('Pricing')}>
                    <Button size="lg" variant="outline" className="px-8 h-12 text-base rounded-2xl" style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'white', background: 'rgba(255,255,255,0.05)' }}>
                      View Pricing <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to={createPageUrl('Register')}>
                    <Button size="lg" className="px-8 h-12 text-base font-semibold rounded-2xl border-0" style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)', boxShadow: '0 8px 30px rgba(124,58,237,0.4)' }}>
                      Start Free 3-Day Trial <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Button size="lg" onClick={() => prince.auth.redirectToLogin(window.location.href)} variant="outline" className="px-8 h-12 text-base rounded-2xl" style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'white', background: 'rgba(255,255,255,0.05)' }}>
                    Sign In
                  </Button>
                </>
              )}
            </div>

            <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
              <Link to={createPageUrl('DownloadApp')} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all" style={{ background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.3)', color: '#22d3ee' }}>
                <span>📱</span> Add to Home Screen
              </Link>
              <span className="inline-flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
                <span>🚀</span> Android App — Coming Soon
              </span>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="mt-16 grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {[
              { icon: BookOpen, label: 'Video Lessons', value: videos.length || '50+' },
              { icon: GraduationCap, label: 'Grades', value: 3 },
              { icon: Play, label: 'Hours of Content', value: '50+' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <stat.icon className="w-5 h-5 mx-auto mb-2" style={{ color: '#a78bfa' }} />
                <div className="text-2xl font-bold text-white" style={{ fontFamily: "'Sora',sans-serif" }}>{stat.value}</div>
                <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{stat.label}</div>
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
            <p className="mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Select your grade to browse Mathematics lessons</p>
          </div>
          <Link to={createPageUrl('Categories')} className="text-sm flex items-center gap-1 font-medium" style={{ color: '#a78bfa' }}>
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
              <p className="mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Recently uploaded video lessons</p>
            </div>
            <Link to={createPageUrl('Categories')} className="text-sm flex items-center gap-1 font-medium" style={{ color: '#a78bfa' }}>
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

      {/* ── CTA ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative overflow-hidden rounded-3xl p-8 md:p-12" style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.3),rgba(37,99,235,0.3))', border: '1px solid rgba(124,58,237,0.3)' }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl" style={{ background: 'rgba(124,58,237,0.2)' }} />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3" style={{ fontFamily: "'Sora',sans-serif" }}>
                Ready to Excel in Mathematics?
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.6)' }}>Join our learning community and get access to all video lessons.</p>
            </div>
            {user ? (
              <Link to={createPageUrl('Pricing')}>
                <Button size="lg" className="px-8 h-12 text-base font-semibold rounded-2xl border-0 whitespace-nowrap" style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)', boxShadow: '0 8px 30px rgba(124,58,237,0.4)' }}>
                  Subscribe Now <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            ) : (
              <Button size="lg" onClick={() => prince.auth.redirectToLogin(window.location.href)} className="px-8 h-12 text-base font-semibold rounded-2xl border-0 whitespace-nowrap" style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)', boxShadow: '0 8px 30px rgba(124,58,237,0.4)' }}>
                Register / Sign In <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
