import React from 'react';
import { motion } from 'framer-motion';
import { Check, Crown, GraduationCap, Lock, Sparkles } from 'lucide-react';
import PayFastButton from '../components/pricing/PayFastButton';
import { useAuth } from '@/lib/AuthContext';
import { getPlanLabel } from '@/lib/access';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const GOLD = '#f5c842';
const GOLD_LIGHT = '#fde68a';
const GOLD_DARK = '#d97706';

const gradeColors = {
  'Grade 10': { label: 'emerald', hex: '#10b981' },
  'Grade 11': { label: 'blue', hex: '#3b82f6' },
  'Grade 12': { label: 'violet', hex: '#8b5cf6' },
};

const grades = ['Grade 10', 'Grade 11', 'Grade 12'];

const standardFeatures = [
  'All Standard lessons for your grade',
  'Comment & ask questions on videos',
  'Save your favourite lessons',
  'New lesson notifications',
  'Student dashboard & XP tracking',
];

const premiumFeatures = [
  'Everything in Standard',
  'All Premium lessons (advanced topics)',
  'Priority Q&A support',
  'Exam preparation videos',
  'Practice exercises & resources',
  'Certificate of completion',
];

export default function Pricing() {
  const { user } = useAuth();
  const planLabel = getPlanLabel(user);

  return (
    <div className="min-h-screen" style={{ background: '#0f0c07' }}>

      {/* Header */}
      <section className="relative overflow-hidden py-14 px-4 text-center">
        <div className="absolute inset-0"
          style={{ backgroundImage: 'radial-gradient(ellipse at 50% 0%,rgba(245,200,66,0.12) 0%,transparent 65%)' }} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-5 uppercase tracking-widest"
            style={{ background: 'rgba(245,200,66,0.1)', border: '1px solid rgba(245,200,66,0.3)', color: GOLD_LIGHT }}>
            <Sparkles className="w-3.5 h-3.5" style={{ color: GOLD }} />
            Affordable Maths Tuition
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4"
            style={{ fontFamily: "'Sora',sans-serif" }}>
            Simple,{' '}
            <span style={{ background: `linear-gradient(135deg,${GOLD_LIGHT},${GOLD})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Transparent
            </span>{' '}
            Pricing
          </h1>
          <p className="text-base md:text-lg" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Choose your grade and plan. Cancel anytime.
          </p>

          {/* Access explanation */}
          <div className="mt-6 inline-flex flex-col sm:flex-row items-center gap-4 px-6 py-3 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(245,200,66,0.15)' }}>
            <div className="flex items-center gap-2 text-sm">
              <Lock className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.4)' }} />
              <span style={{ color: 'rgba(255,255,255,0.6)' }}>
                <span className="font-semibold text-white">Standard R100</span> = Standard lessons only
              </span>
            </div>
            <div className="hidden sm:block w-px h-4" style={{ background: 'rgba(255,255,255,0.15)' }} />
            <div className="flex items-center gap-2 text-sm">
              <Crown className="w-4 h-4" style={{ color: GOLD }} />
              <span style={{ color: 'rgba(255,255,255,0.6)' }}>
                <span className="font-semibold" style={{ color: GOLD }}>Premium R150</span> = All lessons
              </span>
            </div>
          </div>

          {/* Current plan badge */}
          {user && planLabel && planLabel !== 'No Plan' && (
            <div className="mt-4">
              <span className="text-sm px-4 py-1.5 rounded-full font-semibold"
                style={{ background: 'rgba(34,197,94,0.15)', color: '#86efac', border: '1px solid rgba(34,197,94,0.3)' }}>
                ✓ Your current plan: {planLabel}
              </span>
            </div>
          )}
        </motion.div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {grades.map((grade, gi) => {
          const gc = gradeColors[grade];
          return (
            <motion.div key={grade}
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gi * 0.12 }}
              className="mb-14">

              {/* Grade header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                  style={{ background: `${gc.hex}22`, border: `1px solid ${gc.hex}44` }}>
                  <GraduationCap className="w-5 h-5" style={{ color: gc.hex }} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Sora',sans-serif" }}>{grade}</h2>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Mathematics by Prince Mabandla</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl">

                {/* Standard */}
                <div className="rounded-2xl p-6 relative"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(245,200,66,0.2)' }}>
                  <div className="mb-5">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full"
                      style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}>
                      Standard
                    </span>
                    <div className="mt-4 flex items-end gap-1">
                      <span className="text-4xl font-black text-white">R100</span>
                      <span className="mb-1 text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>/month</span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      Standard lessons only
                    </p>
                  </div>
                  <ul className="space-y-2.5 mb-6">
                    {standardFeatures.map(f => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: GOLD }} />
                        <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <PayFastButton grade={grade} tier="Standard" price="R100" highlighted={false} />
                </div>

                {/* Premium */}
                <div className="rounded-2xl p-6 relative"
                  style={{ background: `linear-gradient(135deg,${GOLD},${GOLD_DARK})` }}>
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="text-xs font-bold px-4 py-1 rounded-full text-black"
                      style={{ background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                      MOST POPULAR
                    </span>
                  </div>
                  <div className="mb-5">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-black/20 text-black">
                      Premium
                    </span>
                    <div className="mt-4 flex items-end gap-1">
                      <span className="text-4xl font-black text-black">R150</span>
                      <span className="mb-1 text-sm text-black/60">/month</span>
                    </div>
                    <p className="text-xs mt-1 text-black/60">
                      All lessons including Premium
                    </p>
                  </div>
                  <ul className="space-y-2.5 mb-6">
                    {premiumFeatures.map(f => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-black" />
                        <span className="text-sm text-black/80">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <PayFastButton grade={grade} tier="Premium" price="R150" highlighted={true} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </section>

      {/* Payment note */}
      <section className="max-w-3xl mx-auto px-4 pb-16 text-center">
        <div className="rounded-2xl p-6"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(245,200,66,0.15)' }}>
          <h3 className="font-semibold text-white mb-2">🏦 Pay with Your Bank</h3>
          <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Pay securely using online banking from any South African bank — FNB, Standard Bank, ABSA, Nedbank, Capitec & more.
          </p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Instant EFT, card payments, and mobile banking supported. Subscription activates immediately after payment.
          </p>
        </div>
      </section>
    </div>
  );
}
