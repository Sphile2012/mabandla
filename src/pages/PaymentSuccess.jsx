import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { CheckCircle, Home, Loader2, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { prince } from '@/api/princeClient';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('checking');

  // The subscription is switched on by PayFast's server notification, so confirm it before celebrating.
  useEffect(() => {
    let cancelled = false;
    let tries = 0;
    const check = async () => {
      try {
        const me = await prince.auth.me();
        const end = me?.subscription_end_date ? new Date(me.subscription_end_date) : null;
        if (me?.subscription_active && end && end > new Date()) {
          if (!cancelled) setStatus('active');
          return;
        }
      } catch {
        if (!cancelled) setStatus('signin');
        return;
      }
      tries += 1;
      if (tries >= 10) {
        if (!cancelled) setStatus('pending');
        return;
      }
      setTimeout(check, 3000);
    };
    check();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (status !== 'active') return undefined;
    const animationEnd = Date.now() + 3000;

    const interval = setInterval(() => {
      if (animationEnd - Date.now() <= 0) {
        return clearInterval(interval);
      }

      import('canvas-confetti').then(({ default: confetti }) => {
        confetti({ particleCount: 2, angle: 60, spread: 55, origin: { x: 0 } });
        confetti({ particleCount: 2, angle: 120, spread: 55, origin: { x: 1 } });
      });
    }, 100);

    return () => clearInterval(interval);
  }, [status]);

  const copy = {
    checking: ['Confirming your payment…', 'This only takes a few seconds.'],
    active: ['Payment Successful! 🎉', 'Your subscription is active. You now have access to your grade’s lessons.'],
    pending: ['Payment received', 'PayFast is still confirming it. Your access switches on automatically within a few minutes — refresh the app shortly.'],
    signin: ['Please sign in', 'Sign in to see your subscription status.'],
  }[status];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-violet-50 to-mint-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="w-20 h-20 bg-mint-100 rounded-full flex items-center justify-center mx-auto mb-6">
          {status === 'checking'
            ? <Loader2 className="w-10 h-10 text-violet-600 animate-spin" />
            : <CheckCircle className="w-12 h-12 text-mint-600" />}
        </div>

        <h1 className="text-3xl font-bold text-violet-950 mb-3">{copy[0]}</h1>
        <p className="text-slate-600 mb-8">{copy[1]}</p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => navigate(createPageUrl(status === 'signin' ? 'Login' : 'Categories'))}
            className="bg-gradient-to-r from-violet-600 to-violet-500 text-white"
          >
            <Video className="w-4 h-4 mr-2" />
            {status === 'signin' ? 'Sign in' : 'Browse Lessons'}
          </Button>
          <Button
            onClick={() => navigate(createPageUrl('Home'))}
            variant="outline"
          >
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </div>
      </motion.div>
    </div>
  );
}