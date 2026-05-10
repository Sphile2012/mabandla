import React, { useState, useEffect } from 'react';
import { prince } from '@/api/princeClient';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { GraduationCap, CheckCircle, ArrowRight, Sparkles, Building2, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const grades = ['Grade 10', 'Grade 11', 'Grade 12'];
const banks = ['FNB', 'Standard Bank', 'ABSA', 'Nedbank', 'Capitec', 'African Bank', 'Discovery Bank', 'TymeBank', 'Investec'];

export default function CompleteProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ phone_number: '', grade: '', bank_name: '', account_holder: '', account_number: '', account_type: '' });
  const navigate = useNavigate();

  useEffect(() => {
    prince.auth.me().then(u => {
      setUser(u);
      const now = new Date();
      const hasActiveTrial = u?.trial_end_date && new Date(u.trial_end_date) > now;
      const hasActiveSub = u?.subscription_active && u?.subscription_end_date && new Date(u.subscription_end_date) > now;
      if (hasActiveTrial || hasActiveSub) { navigate(createPageUrl('Home')); return; }
      const pending = sessionStorage.getItem('pendingRegistration');
      if (pending) {
        try {
          const d = JSON.parse(pending);
          setFormData(prev => ({ ...prev, phone_number: d.phone_number || '', grade: d.grade || '', bank_name: d.bank_name || '', account_holder: d.account_holder || '', account_number: d.account_number || '', account_type: d.account_type || '' }));
          sessionStorage.removeItem('pendingRegistration');
        } catch { /* ignore */ }
      }
    }).catch(() => navigate(createPageUrl('Login')));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.grade) { toast.error('Please select your grade'); return; }
    setLoading(true);
    try {
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 3);
      await prince.auth.updateMe({
        phone_number: formData.phone_number,
        grade: formData.grade,
        subscription_tier: 'Trial',
        trial_end_date: trialEndDate.toISOString(),
        ...(formData.bank_name && { bank_name: formData.bank_name }),
        ...(formData.account_holder && { account_holder: formData.account_holder }),
        ...(formData.account_number && { account_number: formData.account_number }),
        ...(formData.account_type && { account_type: formData.account_type }),
      });
      toast.success('🎉 Welcome! Your 3-day free trial has started!');
      navigate(createPageUrl('Home'));
    } catch (err) {
      toast.error('Failed to set up trial: ' + err.message);
      setLoading(false);
    }
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#080d1a' }}>
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: '#080d1a' }}>
      {/* Hero */}
      <div className="relative overflow-hidden py-14 px-4 text-center" style={{ background: 'linear-gradient(135deg,#0f0a2e,#1a0a3e,#0a1628)' }}>
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse at 50% 0%,rgba(124,58,237,0.3) 0%,transparent 70%)' }} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-5 uppercase tracking-widest" style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)', color: '#a78bfa' }}>
            <Sparkles className="w-3.5 h-3.5" /> Start Your Free Trial
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3" style={{ fontFamily: "'Sora',sans-serif" }}>
            Welcome, {user.full_name}! 👋
          </h1>
          <p className="text-slate-300">Get <span className="text-amber-300 font-semibold">3 days free access</span> to all Grade 10–12 Mathematics lessons</p>
        </motion.div>
      </div>

      {/* Form */}
      <div className="max-w-xl mx-auto px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl p-6 md:p-8 border border-white/10" style={{ background: 'rgba(255,255,255,0.04)' }}>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email (readonly) */}
            <div>
              <Label className="text-slate-300">Email Address</Label>
              <Input value={user.email} disabled className="mt-1.5 opacity-60" />
            </div>

            {/* Phone */}
            <div>
              <Label className="text-slate-300">Phone Number</Label>
              <Input
                type="tel"
                value={formData.phone_number}
                onChange={e => setFormData(p => ({ ...p, phone_number: e.target.value }))}
                placeholder="e.g. 0812345678"
                className="mt-1.5"
              />
            </div>

            {/* Grade */}
            <div>
              <Label className="text-slate-300">Grade Level *</Label>
              <Select value={formData.grade} onValueChange={v => setFormData(p => ({ ...p, grade: v }))}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select your grade" /></SelectTrigger>
                <SelectContent>{grades.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            {/* Banking (optional) */}
            <div className="rounded-xl p-4 border border-white/8" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-semibold text-white">Banking Details <span className="text-slate-500 font-normal">(optional)</span></span>
              </div>
              <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5 mb-3">
                <Shield className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-300">Securely stored — only used for refunds. You can add this later in Profile.</p>
              </div>
              <div className="space-y-3">
                <Select value={formData.bank_name} onValueChange={v => setFormData(p => ({ ...p, bank_name: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select bank" /></SelectTrigger>
                  <SelectContent>{banks.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                </Select>
                <Input value={formData.account_holder} onChange={e => setFormData(p => ({ ...p, account_holder: e.target.value }))} placeholder="Account holder name" />
                <div className="grid grid-cols-2 gap-3">
                  <Input value={formData.account_number} onChange={e => setFormData(p => ({ ...p, account_number: e.target.value }))} placeholder="Account number" />
                  <Select value={formData.account_type} onValueChange={v => setFormData(p => ({ ...p, account_type: v }))}>
                    <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cheque">Cheque</SelectItem>
                      <SelectItem value="Savings">Savings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Trial benefits */}
            <div className="rounded-xl p-4 border border-violet-500/20" style={{ background: 'rgba(124,58,237,0.08)' }}>
              <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-violet-400" /> Your 3-Day Free Trial Includes:
              </h3>
              <ul className="space-y-1.5">
                {['Full access to all Standard lessons', 'Comment & ask questions on videos', 'Save your favourite lessons', 'No credit card required'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none transition-all hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)', boxShadow: '0 8px 24px rgba(124,58,237,0.4)' }}
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Setting up trial...</>
              ) : (
                <>Start My Free Trial <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
