import React from 'react';
import { motion } from 'framer-motion';
import { Check, Star, GraduationCap } from 'lucide-react';
import PayFastButton from '../components/pricing/PayFastButton';

const plans = [
  {
    grade: 'Grade 10',
    color: 'from-emerald-500 to-teal-500',
    border: 'border-emerald-200',
    bg: 'bg-emerald-50',
    badge: 'bg-emerald-100 text-emerald-700',
    tiers: [
      {
        name: 'Standard',
        price: 'R100',
        period: '/month',
        features: [
          'Access to all Standard Grade 10 lessons',
          'Comment & ask questions',
          'Save favourites',
          'New lesson notifications',
        ],
      },
      {
        name: 'Premium',
        price: 'R150',
        period: '/month',
        highlighted: true,
        features: [
          'Everything in Standard',
          'Access to all Premium Grade 10 lessons',
          'Priority Q&A support',
          'Downloadable resources',
          'Practice exercises',
        ],
      },
    ],
  },
  {
    grade: 'Grade 11',
    color: 'from-blue-500 to-indigo-500',
    border: 'border-blue-200',
    bg: 'bg-blue-50',
    badge: 'bg-blue-100 text-blue-700',
    tiers: [
      {
        name: 'Standard',
        price: 'R100',
        period: '/month',
        features: [
          'Access to all Standard Grade 11 lessons',
          'Comment & ask questions',
          'Save favourites',
          'New lesson notifications',
        ],
      },
      {
        name: 'Premium',
        price: 'R150',
        period: '/month',
        highlighted: true,
        features: [
          'Everything in Standard',
          'Access to all Premium Grade 11 lessons',
          'Priority Q&A support',
          'Downloadable resources',
          'Practice exercises',
        ],
      },
    ],
  },
  {
    grade: 'Grade 12',
    color: 'from-violet-500 to-purple-600',
    border: 'border-violet-200',
    bg: 'bg-violet-50',
    badge: 'bg-violet-100 text-violet-700',
    tiers: [
      {
        name: 'Standard',
        price: 'R100',
        period: '/month',
        features: [
          'Access to all Standard Grade 12 lessons',
          'Comment & ask questions',
          'Save favourites',
          'New lesson notifications',
        ],
      },
      {
        name: 'Premium',
        price: 'R150',
        period: '/month',
        highlighted: true,
        features: [
          'Everything in Standard',
          'Access to all Premium Grade 12 lessons',
          'Priority Q&A support',
          'Downloadable resources',
          'Practice exercises',
          'Exam preparation videos',
        ],
      },
    ],
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen" style={{ background: '#080d1a' }}>
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 py-12 md:py-20 px-4 text-center">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Star className="w-4 h-4" />
            Affordable Maths Tuition
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4 px-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-white/80 text-base md:text-lg px-4">
            Separate subscriptions for each grade — choose the plan that works for you.
          </p>
        </motion.div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        {plans.map((plan, pi) => (
          <motion.div
            key={plan.grade}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: pi * 0.15 }}
            className="mb-12 md:mb-16"
          >
            {/* Grade Header */}
            <div className="flex items-center gap-3 mb-6 md:mb-8">
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center flex-shrink-0`}>
                <GraduationCap className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-800">{plan.grade}</h2>
                <p className="text-slate-500 text-xs md:text-sm">Mathematics by Prince Mabandla</p>
              </div>
            </div>

            {/* Tier Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-3xl">
              {plan.tiers.map((tier, ti) => (
                <div
                  key={tier.name}
                  className={`relative rounded-xl md:rounded-2xl border-2 p-6 md:p-8 ${
                    tier.highlighted
                      ? `border-2 bg-gradient-to-br ${plan.color} text-white shadow-xl`
                      : `${plan.border} bg-white`
                  }`}
                >
                  {tier.highlighted && (
                    <div className="absolute -top-2.5 md:-top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-amber-400 text-amber-900 text-xs font-bold px-3 md:px-4 py-1 rounded-full whitespace-nowrap">
                        MOST POPULAR
                      </span>
                    </div>
                  )}

                  <div className="mb-4 md:mb-6">
                    <span className={`text-xs md:text-sm font-semibold px-2.5 md:px-3 py-1 rounded-full ${
                      tier.highlighted ? 'bg-white/20 text-white' : plan.badge
                    }`}>
                      {tier.name}
                    </span>
                    <div className="mt-3 md:mt-4 flex items-end gap-1">
                      <span className={`text-3xl md:text-4xl font-bold ${tier.highlighted ? 'text-white' : 'text-slate-800'}`}>
                        {tier.price}
                      </span>
                      <span className={`mb-1 text-sm md:text-base ${tier.highlighted ? 'text-white/70' : 'text-slate-500'}`}>
                        {tier.period}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${tier.highlighted ? 'text-white' : 'text-emerald-500'}`} />
                        <span className={`text-xs md:text-sm ${tier.highlighted ? 'text-white/90' : 'text-slate-600'}`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <PayFastButton
                    grade={plan.grade}
                    tier={tier.name}
                    price={tier.price}
                    highlighted={tier.highlighted}
                    color={plan.color}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </section>

      {/* Note */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 md:pb-16 text-center">
        <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 rounded-xl p-6">
          <h3 className="font-semibold text-slate-800 mb-2">🏦 Pay with Your Bank</h3>
          <p className="text-slate-600 text-sm mb-3">
            Pay securely using online banking from any South African bank (FNB, Standard Bank, ABSA, Nedbank, Capitec & more).
          </p>
          <p className="text-slate-500 text-xs">
            Instant EFT, card payments, and mobile banking supported. Your subscription activates immediately after payment.
          </p>
        </div>
      </section>
    </div>
  );
}