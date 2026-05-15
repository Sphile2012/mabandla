import React, { useState, useEffect } from 'react';
import { prince } from '@/api/princeClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Heart, ArrowRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import VideoCard from '../components/videos/VideoCard';

export default function Favorites() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    prince.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: favorites = [], isLoading: favoritesLoading } = useQuery({
    queryKey: ['favorites', user?.email],
    queryFn: () => prince.entities.Favorite.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const { data: allVideos = [], isLoading: videosLoading } = useQuery({
    queryKey: ['videos'],
    queryFn: () => prince.entities.Video.list('-created_date', 100),
  });

  const favoriteVideoIds = favorites.map(f => f.video_id);
  const favoriteVideos = allVideos.filter(v => favoriteVideoIds.includes(v.id));

  const toggleFavoriteMutation = useMutation({
    mutationFn: async (videoId) => {
      const existing = favorites.find(f => f.video_id === videoId);
      if (existing) {
        await prince.entities.Favorite.delete(existing.id);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });

  const isLoading = favoritesLoading || videosLoading;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{background:'#080d1a'}}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-rose-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Sign in to view favorites</h2>
          <p className="text-slate-500 mb-6">
            Save your favorite lessons and access them anytime.
          </p>
          <Button 
            onClick={() => prince.auth.redirectToLogin(window.location.href)}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
          >
            Sign In
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{background:'#080d1a'}}>
      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center">
              <Heart className="w-7 h-7 text-white" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">My Favorites</h1>
              <p className="text-slate-500">
                {favoriteVideos.length} saved {favoriteVideos.length === 1 ? 'lesson' : 'lessons'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-100">
                <Skeleton className="aspect-video w-full" />
                <div className="p-4">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-5 w-full mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : favoriteVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoriteVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                isFavorited={true}
                onToggleFavorite={(id) => toggleFavoriteMutation.mutate(id)}
                showFavorite={true}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-slate-300" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-3">No favorites yet</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-6">
              Start exploring lessons and save your favorites for quick access later.
            </p>
            <Link to={createPageUrl('Categories')}>
              <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
                Browse Lessons
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}