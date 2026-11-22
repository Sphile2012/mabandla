import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import { prince } from '@/api/princeClient';
import { createPageUrl } from '@/utils';

const SEEN_KEY = 'prince-splash-seen';
const symbols = [
  { text: '√x', className: 'left-6 top-24', delay: 0 },
  { text: 'π', className: 'right-8 top-40', delay: 0.6 },
  { text: 'f(x)', className: 'left-10 bottom-72', delay: 1.1 },
  { text: '∫', className: 'right-10 bottom-80', delay: 0.3 },
  { text: 'x²', className: 'right-24 top-20', delay: 0.9 },
];

function alreadySeen() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

export default function SplashScreen() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(() => !alreadySeen() && window.location.pathname === '/');
  const [signedIn, setSignedIn] = useState(false);

  const dismiss = (destination) => {
    try {
      sessionStorage.setItem(SEEN_KEY, '1');
    } catch {
      // Storage can be unavailable in private mode; the splash simply shows again.
    }
    setVisible(false);
    if (destination) navigate(createPageUrl(destination));
  };

  useEffect(() => {
    if (!visible) return undefined;
    let cancelled = false;
    let timer;
    prince.auth.me()
      .then(() => {
        if (cancelled) return;
        setSignedIn(true);
        timer = setTimeout(() => dismiss(), 1800);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Welcome to Prince Math Academy"
          className="fixed inset-0 z-[100] overflow-hidden bg-white text-[#0b2456]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.4 }}
        >
          <div className="pointer-events-none absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-[#dbe6f8]/70 blur-3xl" />
          <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-[#fff0c8]/70 blur-3xl" />

          {symbols.map((s) => (
            <motion.span
              key={s.text}
              aria-hidden="true"
              className={`absolute select-none font-mono text-2xl font-bold text-[#16377a]/20 ${s.className}`}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: s.delay, ease: 'easeInOut' }}
            >
              {s.text}
            </motion.span>
          ))}

          <div className="relative mx-auto flex h-full max-w-md flex-col items-center px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-10 text-center sm:pt-14">
            <motion.div
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <BrandLogo className="mb-5 h-28 sm:h-36 w-auto max-w-[90vw] drop-shadow-[0_18px_28px_rgba(11,36,86,0.14)]" />
              <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-[#0b2456] sm:text-4xl">
                Mathematics made clear.
              </h1>
              <p className="mt-3 text-lg font-semibold text-[#9b6b00]">Learn · Practise · Improve</p>
              <p className="mt-3 max-w-xs text-sm leading-6 text-slate-600">
                Grade 10–12 maths tutoring with clear video lessons, practice questions and past papers.
              </p>
            </motion.div>

            <motion.div
              className="mt-auto w-full space-y-3"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {signedIn ? (
                <p className="text-center text-sm text-[#16377a]" role="status">Welcome back! Loading your dashboard…</p>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => dismiss('Register')}
                    className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#16377a] text-base font-bold text-white shadow-[0_8px_20px_rgba(22,55,122,0.2)] transition-all hover:-translate-y-0.5 hover:bg-[#0b2456] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d99b12]"
                  >
                    Get Started <ArrowRight className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => dismiss('Login')}
                    className="h-12 w-full rounded-xl border border-[#16377a]/20 bg-white text-base font-semibold text-[#16377a] transition-all hover:border-[#d99b12] hover:bg-[#fffaf0]"
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => dismiss()}
                    className="mx-auto block text-xs text-[#16377a] underline decoration-[#d99b12] underline-offset-4 hover:text-[#9b6b00]"
                  >
                    Continue as guest
                  </button>
                </>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
