import React, { useState, useEffect } from 'react';
import { prince } from '@/api/princeClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  Play, 
  Heart, 
  Share2, 
  ArrowLeft, 
  Clock, 
  Eye, 
  Calendar,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import CommentSection from '../components/comments/CommentSection';
import VideoCard from '../components/videos/VideoCard';

export default function VideoPlayer() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();
  
  const urlParams = new URLSearchParams(window.location.search);
  const videoId = urlParams.get('id');

  useEffect(() => {
    prince.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: video, isLoading: videoLoading } = useQuery({
    queryKey: ['video', videoId],
    queryFn: async () => {
      const videos = await prince.entities.Video.filter({ id: videoId });
      return videos[0];
    },
    enabled: !!videoId,
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', videoId],
    queryFn: () => prince.entities.Comment.filter({ video_id: videoId }, '-created_date'),
    enabled: !!videoId,
  });

  const { data: relatedVideos = [] } = useQuery({
    queryKey: ['relatedVideos', video?.topic, video?.grade],
    queryFn: () => prince.entities.Video.filter({ topic: video?.topic, grade: video?.grade }, '-created_date', 5),
    enabled: !!video?.topic,
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites', user?.email],
    queryFn: () => prince.entities.Favorite.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const favoriteVideoIds = favorites.map(f => f.video_id);
  const isFavorited = favoriteVideoIds.includes(videoId);

  // Check if user has active access to watch this video
  const hasAccess = () => {
    if (!user || !video) return false;
    if (user.role === 'admin') return true;
    
    const now = new Date();

    // Check active trial
    if (user.trial_end_date && new Date(user.trial_end_date) > now) return true;
    
    // Check active paid subscription (check end_date too if available)
    if (user.subscription_active && user.subscription_tier && user.subscription_tier !== 'Trial') {
      const notExpired = !user.subscription_end_date || new Date(user.subscription_end_date) > now;
      if (notExpired) {
        if (user.subscription_tier === 'Premium') return true;
        if (user.subscription_tier === 'Standard' && (video.tier === 'Standard' || !video.tier)) return true;
      }
    }
    
    return false;
  };

  const canWatch = hasAccess();

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      const existing = favorites.find(f => f.video_id === videoId);
      if (existing) {
        await prince.entities.Favorite.delete(existing.id);
      } else {
        await prince.entities.Favorite.create({ video_id: videoId, user_email: user.email });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
    },
  });

  // Track view + award XP
  useEffect(() => {
    if (!video?.id || !user) return;
    prince.functions.invoke('trackVideoView', { video_id: video.id })
      .catch(err => console.error('Failed to track view:', err));

    // Award XP for watching — deduplicate by checking existing events
    prince.entities.XPEvent.filter({ user_email: user.email, reference_id: video.id, action_type: 'video_watch' })
      .then(existing => {
        if (existing.length === 0) {
          prince.entities.XPEvent.create({
            user_email: user.email,
            user_name: user.full_name || user.email.split('@')[0],
            xp_amount: video.tier === 'Premium' ? 30 : 20,
            action_type: 'video_watch',
            reference_id: video.id,
          }).catch(() => {});
        }
      }).catch(() => {});
  }, [video?.id, user]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: video?.title, url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    }
  };

  const categoryColors = {
    Algebra: 'from-violet-500 to-purple-600',
    Calculus: 'from-blue-500 to-cyan-500',
    Statistics: 'from-emerald-500 to-teal-500',
    Geometry: 'from-orange-500 to-amber-500',
    Trigonometry: 'from-pink-500 to-rose-500',
    Functions: 'from-indigo-500 to-blue-500',
  };

  if (videoLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="w-full aspect-video rounded-2xl mb-6" />
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Video not found</h2>
          <Link to={createPageUrl('Categories')}>
            <Button>Browse Videos</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link to={createPageUrl('Home')} className="hover:text-violet-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link to={createPageUrl('Categories')} className="hover:text-violet-600 transition-colors">
            Categories
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link 
            to={createPageUrl('Categories') + `?grade=${video.grade}`}
            className="hover:text-violet-600 transition-colors"
          >
            {video.grade}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-700 truncate max-w-[200px]">{video.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black"
            >
              {canWatch && video.video_url ? (
                /* Actual video player for subscribed/trial users */
                <video
                  className="w-full h-full"
                  controls
                  controlsList="nodownload"
                  onContextMenu={(e) => e.preventDefault()}
                  poster={video.thumbnail_url || undefined}
                  playsInline
                >
                  <source src={video.video_url} />
                  Your browser does not support HTML5 video.
                </video>
              ) : canWatch && !video.video_url ? (
                /* Has access but no video uploaded yet */
                <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${categoryColors[video.topic] || 'from-violet-600 to-purple-700'}`}>
                  <Play className="w-16 h-16 text-white/60 mb-4" />
                  <p className="text-white/80 text-lg font-medium">Video coming soon</p>
                </div>
              ) : (
                /* Locked — no access */
                <>
                  {video.thumbnail_url ? (
                    <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${categoryColors[video.topic] || 'from-violet-600 to-purple-700'}`} />
                  )}
                  <div className="absolute inset-0 bg-black/65 flex flex-col items-center justify-center text-center px-6">
                    {!user ? (
                      <>
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-5">
                          <Play className="w-10 h-10 text-white ml-1" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Sign In to Watch</h3>
                        <p className="text-white/70 mb-6 max-w-md">Create a free account or sign in to access lessons.</p>
                        <Button
                          size="lg"
                          onClick={() => prince.auth.redirectToLogin(window.location.href)}
                          className="bg-white text-violet-700 hover:bg-white/90 font-semibold px-8"
                        >
                          Sign In / Register
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-5">
                          <Play className="w-10 h-10 text-white ml-1" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Subscribe to Watch</h3>
                        <p className="text-white/70 mb-2 max-w-md">
                          This is a <span className="font-semibold text-amber-300">{video.tier || 'Standard'}</span> lesson for <span className="font-semibold text-amber-300">{video.grade}</span>.
                        </p>
                        <p className="text-white/60 text-sm mb-6">Subscribe to get full access to all lessons.</p>
                        <Link to={createPageUrl('Pricing')}>
                          <Button size="lg" className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold px-8">
                            View Pricing & Subscribe
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </>
              )}
            </motion.div>

            {/* Video Info */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <Badge className={`bg-gradient-to-r ${categoryColors[video.topic] || 'from-slate-400 to-slate-500'} text-white border-0 mb-3`}>
                    {video.topic || video.grade}
                  </Badge>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3">
                    {video.title}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4" />
                      {video.views || 0} views
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {video.duration || '10:00'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(video.created_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {user && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => toggleFavoriteMutation.mutate()}
                      disabled={toggleFavoriteMutation.isPending}
                      className="h-10 w-10"
                    >
                      <Heart className={`w-5 h-5 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleShare}
                    className="h-10 w-10"
                  >
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {video.description && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <h3 className="font-semibold text-slate-800 mb-2">About this lesson</h3>
                  <p className="text-slate-600 leading-relaxed">{video.description}</p>
                </div>
              )}
            </div>

            {/* Comments Section */}
            <CommentSection videoId={videoId} comments={comments} user={user} />
          </div>

          {/* Sidebar - Related Videos */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <h3 className="font-semibold text-slate-800 mb-4">More {video.topic || video.grade} Lessons</h3>
              <div className="space-y-4">
                {relatedVideos
                  .filter(v => v.id !== videoId)
                  .slice(0, 3)
                  .map((relatedVideo) => (
                    <VideoCard
                      key={relatedVideo.id}
                      video={relatedVideo}
                      isFavorited={favoriteVideoIds.includes(relatedVideo.id)}
                      onToggleFavorite={(id) => user && toggleFavoriteMutation.mutate(id)}
                      showFavorite={false}
                    />
                  ))}
              </div>
              
              <Link 
                to={createPageUrl('Categories') + `?grade=${video.grade}`}
                className="block mt-4"
              >
                <Button variant="outline" className="w-full">
                  View All {video.grade} Videos
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}