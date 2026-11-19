import { Link } from 'react-router-dom';
import { BookOpen, Download, Heart, MessageCircleQuestion, Search, UserRound } from 'lucide-react';
import { createPageUrl } from '@/utils';

const steps = [
  {
    title: 'Find a lesson',
    description: 'Open Lessons from the bottom navigation or menu. Search by title, then filter by grade, topic, or access tier.',
    icon: Search,
    link: 'Categories',
    linkText: 'Browse lessons',
  },
  {
    title: 'Ask the AI study assistant',
    description: 'Sign in, open Ask, and type a maths question. Ask for a worked example or for one step to be explained more simply.',
    icon: MessageCircleQuestion,
    link: 'AIChat',
    linkText: 'Ask a question',
  },
  {
    title: 'Save lessons and manage your account',
    description: 'Sign in to save favourite lessons. Open your account menu to view your profile, favourites, and available learning features.',
    icon: Heart,
    link: 'Profile',
    linkText: 'View profile',
  },
  {
    title: 'Install the app on your phone',
    description: 'Open Install App for device-specific instructions. Android browsers may offer Install app or Add to Home screen; on iPhone, use Safari’s Share menu.',
    icon: Download,
    link: 'DownloadApp',
    linkText: 'Install app',
  },
];

export default function UserGuide() {
  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 py-8 pb-24 sm:px-6 sm:py-12">
      <header className="mb-8">
        <div className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-violet-300">
          <BookOpen className="h-4 w-4" />
          Getting started
        </div>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">User guide</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400 sm:text-base">
          A quick guide to studying with Prince Math Academy on your phone.
        </p>
      </header>

      <div className="space-y-3">
        {steps.map(({ title, description, icon: Icon, link, linkText }, index) => (
          <section key={title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-violet-300">Step {index + 1}</p>
                <h2 className="mt-1 text-lg font-semibold text-white">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
                <Link to={createPageUrl(link)} className="mt-3 inline-flex min-h-10 items-center text-sm font-semibold text-violet-300 hover:text-violet-200">
                  {linkText} <span aria-hidden="true" className="ml-1">→</span>
                </Link>
              </div>
            </div>
          </section>
        ))}
      </div>

      <section className="mt-6 rounded-2xl border border-amber-300/15 bg-amber-300/5 p-5">
        <h2 className="flex items-center gap-2 font-semibold text-amber-100">
          <UserRound className="h-4 w-4" />
          Using the AI assistant
        </h2>
        <p className="mt-2 text-sm leading-6 text-amber-100/70">
          The assistant works through the questions you send; it does not see your private account or lesson records. AI explanations can be incorrect, so compare important answers with your teacher or course materials. If the assistant is not configured or available, the app will tell you instead of inventing an answer.
        </p>
      </section>

      <p className="mt-6 text-center text-sm text-slate-500">
        Need more help? <Link to={createPageUrl('Feedback')} className="font-medium text-violet-300 hover:text-violet-200">Send feedback</Link>.
      </p>
    </div>
  );
}
