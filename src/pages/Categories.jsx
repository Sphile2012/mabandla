import React, { useState, useEffect } from 'react';
import { prince } from '@/api/princeClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Grid, List, X, SlidersHorizontal, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import VideoCard from '../components/videos/VideoCard';
import GradeCard from '@/components/videos/GradeCard';

const grades = ['Grade 10', 'Grade 11', 'Grade 12'];
const topics = ['Algebra', 'Functions', 'Geometry', 'Statistics', 'Trigonometry', 'Calculus', 'Number Patterns', 'Finance', 'Probability', 'Analytical Geometry'];
const tiers = ['Standard', 'Premium'];

export default function Categories() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedTier, setSelectedTier] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const queryClient = useQueryClient();

  useEffect(() => {
    prince.auth.me().then(setUser).catch(() => setUser(null));
    const urlParams = new URLSearchParams(window.location.search);
    const gradeParam = urlParams.get('grade');
    const topicParam = urlParams.get('topic');
    if (gradeParam && grades.includes(gradeParam)) setSelectedGrade(gradeParam);
    if (topicParam) setSelectedTopic(decodeURIComponent(topicParam));
  }, []);

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['videos'],
    queryFn: () => prince.entities.Video.list('-created_date', 200),
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
      if (existing) await prince.entities.Favorite.delete(existing.id);
      else await prince.entities.Favorite.create({ video_id: videoId, user_email: user.email });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });

  const filteredVideos = videos.filter(video => {
    const matchesSearch = !searchQuery ||
      video.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.topic?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = !selectedGrade || video.grade === selectedGrade;
    const matchesTopic = !selectedTopic || video.topic === selectedTopic;
    const matchesTier = !selectedTier || video.tier === selectedTier;
    return matchesSearch && matchesGrade && matchesTopic && matchesTier;
  });

  const gradeVideoCounts = grades.reduce((acc, g) => {
    acc[g] = videos.filter(v => v.grade === g).length;
    return acc;
  }, {});

  // Get topics that actually have videos for selected grade
  const availableTopics = selectedGrade
    ? [...new Set(videos.filter(v => v.grade === selectedGrade).map(v => v.topic).filter(Boolean))]
    : topics;

  const clearAll = () => { setSelectedGrade(null); setSelectedTopic(null); setSelectedTier(null); setSearchQuery(''); };
  const hasFilters = selectedGrade || selectedTopic || selectedTier || searchQuery;

  return (
    <div className="min-h-screen" style={{ background: '#080d1a' }}>
      {/* Header */}
      <div className="sticky top-16 z-20 border-b border-white/8" style={{ background: 'rgba(8,13,26,0.95)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Search + view toggle */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="Search lessons, topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:border-violet-500/60"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-1 p-1 rounded-lg border border-white/10 bg-white/5">
              <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                <Grid className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Grade filters */}
          <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
            <button onClick={clearAll} className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${!hasFilters ? 'bg-violet-600 text-white' : 'bg-white/8 text-slate-400 hover:bg-white/12 hover:text-white border border-white/10'}`}>
              All
            </button>
            {grades.map(grade => (
              <button key={grade} onClick={() => { setSelectedGrade(selectedGrade === grade ? null : grade); setSelectedTopic(null); }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${selectedGrade === grade ? 'bg-violet-600 text-white' : 'bg-white/8 text-slate-400 hover:bg-white/12 hover:text-white border border-white/10'}`}>
                {grade} <span className="opacity-60 ml-1">({gradeVideoCounts[grade]})</span>
              </button>
            ))}
            <div className="w-px h-4 bg-white/10 mx-1" />
            {tiers.map(tier => (
              <button key={tier} onClick={() => setSelectedTier(selectedTier === tier ? null : tier)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${selectedTier === tier ? 'bg-amber-500 text-white' : 'bg-white/8 text-slate-400 hover:bg-white/12 hover:text-white border border-white/10'}`}>
                {tier}
              </button>
            ))}
          </div>

          {/* Topic filters */}
          {(selectedGrade || searchQuery) && availableTopics.length > 0 && (
            <div className="flex items-center gap-2 mt-2 overflow-x-auto pb-1 scrollbar-hide">
              <span className="text-xs text-slate-500 whitespace-nowrap">Topic:</span>
              {availableTopics.map(topic => (
                <button key={topic} onClick={() => setSelectedTopic(selectedTopic === topic ? null : topic)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${selectedTopic === topic ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-white/5 text-slate-400 hover:text-white border border-white/8'}`}>
                  {topic}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Grade cards when no filter */}
        {!selectedGrade && !searchQuery && !selectedTier && (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-white mb-6">Browse by Grade</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {grades.map((grade, index) => (
                <GradeCard key={grade} grade={grade} videoCount={gradeVideoCounts[grade]} index={index} />
              ))}
            </div>
          </div>
        )}

        {/* Active filter chips */}
        {hasFilters && (
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <span className="text-xs text-slate-500">Showing:</span>
            {selectedGrade && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30">{selectedGrade} <button onClick={() => { setSelectedGrade(null); setSelectedTopic(null); }}><X className="w-3 h-3" /></button></span>}
            {selectedTopic && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">{selectedTopic} <button onClick={() => setSelectedTopic(null)}><X className="w-3 h-3" /></button></span>}
            {selectedTier && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30">{selectedTier} <button onClick={() => setSelectedTier(null)}><X className="w-3 h-3" /></button></span>}
            {searchQuery && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-white/10 text-slate-300 border border-white/15">"{searchQuery}" <button onClick={() => setSearchQuery('')}><X className="w-3 h-3" /></button></span>}
            <button onClick={clearAll} className="text-xs text-slate-500 hover:text-white underline">Clear all</button>
          </div>
        )}

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">
            {selectedGrade ? `${selectedGrade}${selectedTopic ? ` · ${selectedTopic}` : ''}` : searchQuery ? `Results for "${searchQuery}"` : 'All Lessons'}
          </h2>
          <span className="text-sm text-slate-500">{filteredVideos.length} {filteredVideos.length === 1 ? 'lesson' : 'lessons'}</span>
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-white/8 bg-white/4">
                <div className="aspect-video skeleton" />
                <div className="p-4 space-y-2">
                  <div className="skeleton h-3 w-20 rounded" />
                  <div className="skeleton h-4 w-full rounded" />
                  <div className="skeleton h-3 w-28 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredVideos.length > 0 ? (
          <div className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 max-w-3xl'}`}>
            {filteredVideos.map((video, i) => (
              <motion.div key={video.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.4) }}>
                <VideoCard
                  video={video}
                  isFavorited={favoriteVideoIds.includes(video.id)}
                  onToggleFavorite={(id) => user && toggleFavoriteMutation.mutate(id)}
                  showFavorite={!!user}
                  listMode={viewMode === 'list'}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No lessons found</h3>
            <p className="text-slate-500 text-sm mb-4">
              {searchQuery ? `No results for "${searchQuery}".` : 'No lessons match your filters.'}
            </p>
            <button onClick={clearAll} className="text-violet-400 hover:text-violet-300 text-sm underline">Clear filters</button>
          </div>
        )}
      </div>
    </div>
  );
}
