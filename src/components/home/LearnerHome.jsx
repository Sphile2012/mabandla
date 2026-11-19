import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowRight, Bell, Calculator, Flame, LineChart, PenLine, Percent, Shapes, Sigma, Triangle, BarChart3 } from 'lucide-react';
import { prince } from '@/api/princeClient';
import { createPageUrl } from '@/utils';
import VideoCard from '@/components/videos/VideoCard';

const TOPICS = [
  { name: 'Algebra', icon: Calculator, tint: 'from-violet-100 to-violet-200 text-violet-800' },
  { name: 'Functions', icon: LineChart, tint: 'from-mint-100 to-mint-200 text-mint-800' },
  { name: 'Trigonometry', icon: Triangle, tint: 'from-mint-100 to-mint-200 text-mint-800' },
  { name: 'Calculus', icon: Sigma, tint: 'from-violet-100 to-violet-200 text-violet-800' },
  { name: 'Geometry', icon: Shapes, tint: 'from-violet-100 to-violet-200 text-violet-800' },
  { name: 'Statistics', icon: BarChart3, tint: 'from-mint-100 to-mint-200 text-mint-800' },
  { name: 'Probability', icon: Percent, tint: 'from-violet-100 to-violet-200 text-violet-800' },
];

function ProgressRing({ value }) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="relative h-20 w-20 shrink-0">
      <svg viewBox="0 0 72 72" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="36" cy="36" r={radius} fill="none" strokeWidth="8" className="stroke-white/70" />
        <circle
          cx="36" cy="36" r={radius} fill="none" strokeWidth="8" strokeLinecap="round"
          className="stroke-mint-500 transition-all duration-700"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - value / 100)}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-base font-extrabold text-mint-900">{value}%</span>
    </div>
  );
}

export default function LearnerHome({ user, videos, favoriteIds, onToggleFavorite }) {
  const { data: progress = [] } = useQuery({
    queryKey: ['video-progress', user.email],
    queryFn: () => prince.entities.VideoProgress.filter({ user_email: user.email }),
  });

  const completedIds = new Set(progress.filter((p) => p.completed).map((p) => p.video_id));
  const gradeVideos = user.grade ? videos.filter((v) => v.grade === user.grade) : videos;
  const total = gradeVideos.length;
  const completed = gradeVideos.filter((v) => completedIds.has(v.id)).length;
  const percent = total ? Math.round((completed / total) * 100) : 0;
  const firstName = (user.full_name || 'Learner').split(' ')[0];

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <header className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Hi, {firstName} 👋</h1>
          <p className="text-sm text-slate-500">Let’s keep learning!{user.grade ? ` · ${user.grade}` : ''}</p>
        </div>
        <Link to={createPageUrl('Messages')} aria-label="Messages and notifications" className="rounded-full bg-white p-3 text-violet-600 shadow-sm transition-all hover:scale-105">
          <Bell className="h-5 w-5" />
        </Link>
      </header>

      <div className="relative mb-6 h-32 overflow-hidden rounded-2xl shadow-sm sm:h-40">
        <img src="/front-cover.svg?v=20261119" alt="Prince Math Academy" className="h-full w-full bg-white object-contain" />
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-violet-900/45 via-transparent to-transparent p-4">
          <p className="text-sm font-semibold text-white drop-shadow">Practise a little every day 💜</p>
        </div>
      </div>

      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} aria-labelledby="progress-heading">
        <Link
          to={createPageUrl('StudentDashboard')}
          className="mb-6 flex items-center gap-4 rounded-2xl bg-gradient-to-r from-mint-100 to-mint-50 p-5 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md"
        >
          <ProgressRing value={percent} />
          <span className="flex-1">
            <span id="progress-heading" className="block text-sm font-semibold text-mint-900">Your progress</span>
            <span className="block text-sm text-mint-800">{completed} of {total} lessons completed</span>
          </span>
          <ArrowRight className="h-5 w-5 text-mint-700" />
        </Link>
      </motion.section>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <Link to={createPageUrl('Practice')} className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-violet-600 to-violet-500 p-4 text-white shadow-md transition-all hover:scale-105">
          <PenLine className="h-6 w-6" />
          <span className="text-sm font-bold">Practice questions</span>
        </Link>
        <Link to={createPageUrl('DailyChallenge')} className="flex items-center gap-3 rounded-2xl border border-violet-100 bg-white p-4 text-violet-800 shadow-sm transition-all hover:scale-105">
          <Flame className="h-6 w-6 text-mint-600" />
          <span className="text-sm font-bold">Daily challenge</span>
        </Link>
      </div>

      <section aria-labelledby="topics-heading" className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="topics-heading" className="text-lg font-bold text-slate-900">Choose a topic</h2>
          <Link to={createPageUrl('Categories')} className="text-sm font-semibold text-violet-600 hover:underline">View all</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {TOPICS.map((topic, i) => (
            <motion.div key={topic.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Link
                to={`${createPageUrl('Categories')}?topic=${encodeURIComponent(topic.name)}${user.grade ? `&grade=${encodeURIComponent(user.grade)}` : ''}`}
                className={`flex h-24 flex-col justify-between rounded-2xl bg-gradient-to-br p-4 shadow-sm transition-all hover:scale-105 hover:shadow-md ${topic.tint}`}
              >
                <topic.icon className="h-6 w-6" />
                <span className="text-sm font-bold">{topic.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {videos.length > 0 && (
        <section aria-labelledby="latest-heading">
          <h2 id="latest-heading" className="mb-3 text-lg font-bold text-slate-900">Latest lessons</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {videos.slice(0, 4).map((video) => (
              <VideoCard key={video.id} video={video} isFavorited={favoriteIds.includes(video.id)} onToggleFavorite={onToggleFavorite} showFavorite />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
