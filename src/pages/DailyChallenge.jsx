import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Check, CircleHelp, Flame, LoaderCircle, LockKeyhole, Sparkles } from 'lucide-react';
import { prince } from '@/api/princeClient';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const challengeQueryKey = ['daily-challenge'];

export default function DailyChallenge() {
  const [user, setUser] = useState(null);
  const [answer, setAnswer] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    prince.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: challengeQueryKey,
    queryFn: () => prince.functions.dailyChallenge(),
    retry: false,
    refetchOnWindowFocus: true,
  });

  const submitAnswer = useMutation({
    mutationFn: (submittedAnswer) => prince.functions.submitDailyChallengeAnswer(submittedAnswer),
    onSuccess: (result) => {
      if (result.correct) {
        queryClient.setQueryData(challengeQueryKey, (current) => ({
          ...current,
          submission: { is_correct: true, xp_earned: result.xp_earned },
        }));
      }
    },
  });

  const challenge = data?.challenge;
  const completed = Boolean(data?.submission?.is_correct);
  const submittedAnswer = answer.trim();

  return (
    <div className="mx-auto min-h-screen max-w-xl px-4 py-6 pb-24 sm:px-6 sm:py-10">
      <header className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-violet-600 to-violet-500 p-6 text-white shadow-xl shadow-violet-200/70 sm:p-8">
        <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/15 blur-2xl" />
        <div className="relative">
          <div className="mb-5 flex items-center justify-between">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-xs font-semibold">
              <Sparkles className="h-4 w-4" />
              A fresh question every day
            </span>
            <span className="rounded-full bg-white/20 p-2.5">
              <Flame className="h-5 w-5" />
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Daily maths challenge</h1>
          <p className="mt-2 max-w-sm text-sm leading-6 text-white/85">
            Solve today’s question, build your maths streak, and earn 20 XP.
          </p>
        </div>
      </header>

      {isLoading ? (
        <div className="flex min-h-56 items-center justify-center rounded-3xl         border border-violet-100 bg-white" role="status">
                  <LoaderCircle className="h-7 w-7 animate-spin text-violet-500" />
          <span className="sr-only">Loading today’s question</span>
        </div>
      ) : isError ? (
        <section className="rounded-3xl border border-rose-200 bg-white p-6 text-center">
          <CircleHelp className="mx-auto h-8 w-8 text-rose-500" />
          <h2 className="mt-3 text-lg font-bold text-rose-950">Could not load today’s challenge</h2>
          <p className="mt-2 text-sm text-slate-600">
            {error?.data?.message || error?.message || 'Check your connection and try again.'}
          </p>
          <Button type="button" onClick={() => refetch()} className="mt-5 bg-rose-600 text-white hover:bg-rose-700">
            Try again
          </Button>
        </section>
      ) : challenge ? (
        <section className="rounded-3xl border border-violet-100 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full bg-mint-100 px-3 py-1.5 text-xs font-semibold text-mint-800">
              {challenge.topic}
            </span>
            <span className="text-sm font-medium text-slate-500">
              {new Date(`${challenge.date}T12:00:00Z`).toLocaleDateString(undefined, {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                timeZone: 'UTC',
              })}
            </span>
          </div>

          <h2 className="mt-5 text-lg font-bold           text-violet-950">{challenge.title}</h2>
                    <p className="mt-3 rounded-2xl bg-violet-50 p-5 text-lg font-semibold leading-8 text-slate-800">
            {challenge.question}
          </p>

          {!user ? (
            <div className="mt-5 rounded-2xl             border border-violet-100 bg-white p-4">
              <p className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <LockKeyhole className="h-4 w-4 text-violet-600" />
                Sign in to submit your answer and save your XP.
              </p>
                          <Button asChild className="mt-4 w-full rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 text-white transition-all hover:scale-[1.02]">
                <Link to={createPageUrl('Login')}>Sign in to answer</Link>
              </Button>
            </div>
          ) : completed ? (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4" role="status">
              <p className="flex items-center gap-2 font-semibold text-emerald-800">
                <Check className="h-5 w-5" />
                Challenge complete · {data.submission.xp_earned} XP earned
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                You solved today’s question. Come back tomorrow for a new one!
              </p>
              {submitAnswer.data?.correct && (
                <p className="mt-3 border-t border-emerald-200 pt-3 text-sm leading-6 text-emerald-900">
                  {submitAnswer.data.explanation}
                </p>
              )}
            </div>
          ) : (
            <form
              className="mt-5"
              onSubmit={(event) => {
                event.preventDefault();
                if (submittedAnswer && !submitAnswer.isPending) submitAnswer.mutate(submittedAnswer);
              }}
            >
              <label htmlFor="daily-answer" className="mb-2 block text-sm font-semibold text-slate-700">
                Your answer
              </label>
              <div className="flex gap-2">
                <Input
                  id="daily-answer"
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="Type your answer"
                  aria-describedby="daily-answer-help"
                  disabled={submitAnswer.isPending}
                  className="h-12 rounded-xl border-violet-200 focus-visible:ring-violet-500"
                />
                <Button
                  type="submit"
                  disabled={!submittedAnswer || submitAnswer.isPending}
                  aria-label="Check answer"
                  className="h-12 shrink-0 rounded-xl bg-gradient-to-r from-mint-500 to-mint-400 px-4 text-white transition-all hover:scale-105"
                >
                  {submitAnswer.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                </Button>
              </div>
              <p id="daily-answer-help" className="mt-2 text-xs text-slate-500">
                You can try again if your first answer is not correct.
              </p>
              {submitAnswer.data && !submitAnswer.data.correct && (
                <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900" role="status">
                  {submitAnswer.data.message}
                </p>
              )}
              {submitAnswer.isError && (
                <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">
                  {submitAnswer.error?.data?.error || submitAnswer.error?.message || 'Your answer could not be submitted. Try again.'}
                </p>
              )}
              {submitAnswer.data?.correct && (
                <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900" role="status">
                  <p className="font-semibold">That’s correct! You earned {submitAnswer.data.xp_earned} XP.</p>
                  <p className="mt-2 leading-6">{submitAnswer.data.explanation}</p>
                </div>
              )}
            </form>
          )}
        </section>
      ) : null}

      <p className="mt-5 text-center text-xs leading-5 text-slate-500">
        Questions are generated from daily maths practice templates. Your answer is checked by the app.
      </p>
    </div>
  );
}
