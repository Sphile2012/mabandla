import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Play, Clock, Eye, Heart, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const gradeColors = {
  'Grade 10': 'from-emerald-500 to-teal-500',
  'Grade 11': 'from-blue-500 to-indigo-500',
  'Grade 12': 'from-violet-500 to-purple-600',
};

export default function VideoCard({ video, isFavorited, onToggleFavorite, showFavorite = true, listMode = false }) {
  const color = gradeColors[video.grade] || 'from-slate-500 to-slate-600';

  if (listMode) {
    return (
      <div className="group flex items-center gap-4 p-3 rounded-2xl border border-white/8 bg-white/4 hover:bg-white/7 hover:border-violet-500/30 transition-all duration-200">
        <Link to={createPageUrl('VideoPlayer') + `?id=${video.id}`} className="flex-shrink-0">
          <div className="relative w-28 h-16 rounded-xl overflow-hidden">
            {video.thumbnail_url ? (
              <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${color} flex items-center justify-center`}>
                <Play className="w-5 h-5 text-white/80" />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                <Play className="w-3 h-3 text-slate-800 ml-0.5" fill="currentColor" />
              </div>
            </div>
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full text-white bg-gradient-to-r ${color}`}>{video.grade}</span>
            {video.tier === 'Premium' && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">Premium</span>}
            {video.topic && <span className="text-xs px-2 py-0.5 rounded-full bg-white/8 text-slate-400">{video.topic}</span>}
          </div>
          <Link to={createPageUrl('VideoPlayer') + `?id=${video.id}`}>
            <h3 className="font-semibold text-white text-sm line-clamp-1 hover:text-violet-300 transition-colors">{video.title}</h3>
          </Link>
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{video.views || 0}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{video.duration || '--'}</span>
          </div>
        </div>
        {showFavorite && (
          <button onClick={() => onToggleFavorite?.(video.id)} className="p-2 rounded-xl hover:bg-white/8 transition-colors flex-shrink-0">
            <Heart className={cn('w-4 h-4 transition-colors', isFavorited ? 'fill-rose-500 text-rose-500' : 'text-slate-500 hover:text-rose-400')} />
          </button>
        )}
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="group relative rounded-2xl overflow-hidden border border-white/8 bg-white/4 hover:bg-white/6 hover:border-violet-500/30 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300"
    >
      {/* Thumbnail */}
      <Link to={createPageUrl('VideoPlayer') + `?id=${video.id}`}>
        <div className="relative aspect-video overflow-hidden">
          {video.thumbnail_url ? (
            <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${color} flex items-center justify-center`}>
              <Play className="w-10 h-10 text-white/60" />
            </div>
          )}
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-lg">
              <Play className="w-5 h-5 text-slate-800 ml-0.5" fill="currentColor" />
            </div>
          </div>
          {/* Duration badge */}
          <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs font-medium px-2 py-0.5 rounded-md">
            {video.duration || '--'}
          </div>
          {/* Premium lock */}
          {video.tier === 'Premium' && (
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-amber-500/90 backdrop-blur-sm text-white text-xs font-bold px-2 py-0.5 rounded-full">
              <Lock className="w-2.5 h-2.5" /> Premium
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full text-white bg-gradient-to-r ${color}`}>{video.grade}</span>
              {video.topic && <span className="text-xs px-2 py-0.5 rounded-full bg-white/8 text-slate-400">{video.topic}</span>}
            </div>
            <Link to={createPageUrl('VideoPlayer') + `?id=${video.id}`}>
              <h3 className="font-semibold text-white text-sm line-clamp-2 hover:text-violet-300 transition-colors leading-snug">
                {video.title}
              </h3>
            </Link>
          </div>
          {showFavorite && (
            <button
              onClick={(e) => { e.preventDefault(); onToggleFavorite?.(video.id); }}
              className="p-1.5 rounded-lg hover:bg-white/8 transition-colors flex-shrink-0 mt-0.5"
            >
              <Heart className={cn('w-4 h-4 transition-colors', isFavorited ? 'fill-rose-500 text-rose-500' : 'text-slate-500 hover:text-rose-400')} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{video.views || 0}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{video.duration || '--'}</span>
        </div>
      </div>
    </motion.div>
  );
}
