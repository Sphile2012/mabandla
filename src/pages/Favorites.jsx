import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Clock, Eye, Heart, Play } from 'lucide-react';
import { prince } from '@/api/princeClient';
import { createPageUrl } from '@/utils';
import { getLessonLoadErrorMessage } from '@/lib/lessonErrors';

export default function Favorites() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    let active = true;

    prince.auth.me()
      .then((currentUser) => {
        if (active) setUser(currentUser);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setAuthLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const {
    data: favorites = [],
    isPending: favoritesPending,
    isError: favoritesFailed,
    refetch: refetchFavorites,
  } = useQuery({
    queryKey: ['favorites', user?.email],
    queryFn: () => prince.entities.Favorite.filter({ user_email: user.email }),
    enabled: Boolean(user?.email),
  });

  const {
    data: allVideos = [],
    isPending: videosPending,
    isError: videosFailed,
    error: videosError,
    refetch: refetchVideos,
  } = useQuery({
    queryKey: ['videos'],
    queryFn: () => prince.entities.Video.list('-created_date', 100),
    enabled: Boolean(user?.email),
  });

  const favoriteVideoIds = new Set(favorites.map((favorite) => favorite.video_id));
  const favoriteVideos = allVideos.filter((video) => favoriteVideoIds.has(video.id));

  const removeFavoriteMutation = useMutation({
    mutationFn: async (videoId) => {
      const favorite = favorites.find((item) => item.video_id === videoId);
      if (!favorite) throw new Error('This lesson is no longer in your favorites.');
      return prince.entities.Favorite.delete(favorite.id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites', user?.email] }),
  });

  const isLoading = authLoading || favoritesPending || videosPending;
  const retryLoading = async () => {
    await Promise.all([refetchFavorites(), refetchVideos()]);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f5f4ff] px-4 py-12">
        <div className="mx-auto max-w-6xl animate-pulse space-y-6">
          <div className="h-10 w-56 rounded-full bg-[#e7e4f7]" />
          <div className="h-64 rounded-[2rem] bg-white" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f4ff] px-4 py-12 text-slate-800">
        <div className="absolute -left-12 top-16 h-56 w-56 rounded-full bg-[#d9d4ff]/70 blur-3xl" />
        <div className="absolute -right-10 bottom-10 h-64 w-64 rounded-full bg-[#e7e2ff]/80 blur-3xl" />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full max-w-md rounded-[2rem] border border-white bg-white p-8 text-center text-slate-800 shadow-[0_20px_60px_rgba(80,65,150,0.12)]"
        >
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#efedff]">
            <Heart className="h-7 w-7 text-[#6546e8]" />
          </div>
          <h1 className="text-2xl font-bold">Your saved lessons</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Sign in to keep your favorite lessons together and return to them anytime.
          </p>
          <button
            type="button"
            onClick={() => prince.auth.redirectToLogin(window.location.href)}
            className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#5b38e8] px-6 text-sm font-semibold text-white shadow-lg shadow-[#5b38e8]/20 transition hover:bg-[#4c2ed0] focus:outline-none focus:ring-2 focus:ring-[#5b38e8] focus:ring-offset-2"
          >
            Sign in <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f4ff] text-slate-800">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-20 top-28 h-72 w-72 rounded-full bg-[#e8e4ff]/70 blur-3xl" />
        <div className="absolute -right-24 top-16 h-80 w-80 rounded-full bg-white/80 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[#e6e2ff]/60 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <header className="mx-auto mb-6 flex w-full max-w-4xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#5b38e8] shadow-lg shadow-[#5b38e8]/20">
              <Heart className="h-6 w-6 text-white" fill="currentColor" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#7969bd]">Your personal library</p>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">My Favorites</h1>
            </div>
          </div>
          <div className="rounded-xl border border-[#e5e1fb] bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm">
            {favoriteVideos.length} {favoriteVideos.length === 1 ? 'lesson' : 'lessons'}
          </div>
        </header>

        <section className="relative mx-auto max-w-4xl rounded-[1.5rem] border border-[#e9e6f7] bg-white p-4 text-slate-800 shadow-[0_16px_50px_rgba(70,58,125,0.08)] sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#efedf7] pb-4">
            <div>
              <h2 className="text-lg font-bold">Saved lessons</h2>
              <p className="mt-0.5 text-sm text-slate-500">Pick up where your curiosity left off.</p>
            </div>
            <Link
              to={createPageUrl('Categories')}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#5b38e8] px-4 text-sm font-semibold text-white shadow-sm shadow-[#5b38e8]/20 transition hover:bg-[#4c2ed0] focus:outline-none focus:ring-2 focus:ring-[#5b38e8] focus:ring-offset-2"
            >
              Browse <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((item) => (
                <div key={item} className="flex animate-pulse gap-3 rounded-2xl border border-[#eceaf5] bg-white p-3">
                  <div className="aspect-video w-32 shrink-0 rounded-xl bg-[#e9e6f8] sm:w-40" />
                  <div className="flex flex-1 flex-col justify-center gap-2">
                    <div className="h-3 w-20 rounded bg-[#e9e6f8]" />
                    <div className="h-5 w-3/4 rounded bg-[#e9e6f8]" />
                    <div className="h-3 w-1/2 rounded bg-[#e9e6f8]" />
                  </div>
                </div>
              ))}
            </div>
          ) : favoritesFailed || videosFailed ? (
            <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-5 py-6 text-center">
              <p className="font-semibold text-red-800">
                {videosFailed
                  ? getLessonLoadErrorMessage(videosError)
                  : 'Your saved lessons could not be loaded. Check your connection and try again.'}
              </p>
              <button
                type="button"
                onClick={retryLoading}
                className="mt-3 rounded-xl bg-[#5b38e8] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#4c2ed0] focus:outline-none focus:ring-2 focus:ring-[#5b38e8] focus:ring-offset-2"
              >
                Try again
              </button>
            </div>
          ) : favoriteVideos.length > 0 ? (
            <div className="space-y-3">
              {favoriteVideos.map((video, index) => (
                <motion.article
                  key={video.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.05, 0.3) }}
                  className="group flex min-w-0 gap-3 rounded-2xl border border-[#eceaf5] bg-white p-2.5 shadow-[0_4px_16px_rgba(70,58,125,0.04)] transition duration-200 hover:border-[#d9d2fa] hover:shadow-[0_8px_24px_rgba(70,58,125,0.1)] sm:gap-4 sm:p-3"
                >
                  <div className="relative aspect-video w-[38%] max-w-48 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#dcd7ff] via-[#f2efff] to-[#c9c1ff] sm:w-40">
                    <Link
                      to={`${createPageUrl('VideoPlayer')}?id=${video.id}`}
                      aria-label={`Play ${video.title}`}
                      className="absolute inset-0"
                    >
                      {video.thumbnail_url ? (
                        <img
                          src={video.thumbnail_url}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full flex-col justify-between bg-gradient-to-br from-[#dcd7ff] via-[#f2efff] to-[#c9c1ff] p-3 text-[#33286c]">
                          <BookOpen className="h-5 w-5 text-[#6546e8] sm:h-6 sm:w-6" />
                          <span className="line-clamp-2 text-xs font-bold sm:text-sm">{video.topic || video.grade || 'Math lesson'}</span>
                        </div>
                      )}
                      <span className="absolute inset-0 flex items-center justify-center bg-slate-900/0 transition group-hover:bg-slate-900/20">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#5b38e8] opacity-0 shadow-lg transition group-hover:opacity-100">
                          <Play className="ml-0.5 h-4 w-4" fill="currentColor" />
                        </span>
                      </span>
                    </Link>
                    <span className="absolute bottom-1.5 right-1.5 rounded-md bg-slate-900/75 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur sm:bottom-2 sm:right-2 sm:px-2 sm:text-xs">
                      {video.duration || '--'}
                    </span>
                    <button
                      type="button"
                      aria-label={`Remove ${video.title} from favorites`}
                      disabled={removeFavoriteMutation.isPending}
                      onClick={() => removeFavoriteMutation.mutate(video.id)}
                      className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-white/95 text-[#5b38e8] shadow-sm transition hover:bg-white hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-[#5b38e8] disabled:cursor-wait disabled:opacity-60 sm:right-2 sm:top-2 sm:h-8 sm:w-8"
                    >
                      <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="currentColor" />
                    </button>
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col justify-center py-1 pr-1">
                    <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                      {video.grade && (
                        <span className="rounded-md bg-[#efedff] px-2 py-0.5 text-[10px] font-semibold text-[#5b38e8] sm:text-xs">
                          {video.grade}
                        </span>
                      )}
                      {video.topic && (
                        <span className="max-w-28 truncate rounded-md bg-[#f3f2f8] px-2 py-0.5 text-[10px] font-medium text-slate-600 sm:max-w-48 sm:text-xs">
                          {video.topic}
                        </span>
                      )}
                    </div>
                    <Link to={`${createPageUrl('VideoPlayer')}?id=${video.id}`} className="focus:outline-none">
                      <h3 className="line-clamp-2 text-sm font-bold leading-snug text-slate-800 transition group-hover:text-[#5b38e8] sm:text-base">
                        {video.title}
                      </h3>
                    </Link>
                    <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-500 sm:gap-4 sm:text-xs">
                      <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{video.views || 0}</span>
                      <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{video.duration || '--'}</span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-[#eceaf5] bg-[#fcfbff] px-5 py-14 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#efedff]">
                <Heart className="h-7 w-7 text-[#6546e8]" />
              </div>
              <h3 className="mt-5 text-lg font-bold">No favorites yet</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Browse the lesson library and tap the heart on a lesson to save it here.
              </p>
              <Link
                to={createPageUrl('Categories')}
                className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#5b38e8] px-5 text-sm font-semibold text-white shadow-lg shadow-[#5b38e8]/20 transition hover:bg-[#4c2ed0] focus:outline-none focus:ring-2 focus:ring-[#5b38e8] focus:ring-offset-2"
              >
                Browse lessons <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          {removeFavoriteMutation.isError && (
            <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
              Could not remove this favorite: {removeFavoriteMutation.error.message}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
