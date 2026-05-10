import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const grades = ['Grade 10', 'Grade 11', 'Grade 12'];
const benefits = ['3 days full access', 'All grade lessons', 'Ask questions', 'No credit card'];

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ full_name: '', email: '', password: '', phone_number: '', grade: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const set = (field) => (e) => {
    setFormData(p => ({ ...p, [field]: e.target.value }));
    if (error) setError('');
  };

  const handleStep1 = (e) => {
    e.preventDefault();
    setError('');
    if (!formData.full_name.trim()) return setError('Please enter your display name.');
    if (!formData.email.trim()) return setError('Please enter your email address.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return setError('Please enter a valid email address.');
    if (formData.password.length < 6) return setError('Password must be at least 6 characters.');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.grade) return setError('Please select your grade level.');
    setLoading(true);
    try {
      const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.full_name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
      });

      let data;
      try { data = await res.json(); } catch { data = {}; }

      if (!res.ok) {
        throw new Error(data.error || `Registration failed (${res.status})`);
      }

      localStorage.setItem('access_token', data.token);
      sessionStorage.setItem('pendingRegistration', JSON.stringify({
        phone_number: formData.phone_number,
        grade: formData.grade,
      }));

      toast.success('Account created! Setting up your profile...');
      navigate(createPageUrl('CompleteProfile'));
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Network error — please check your connection and try again.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
      // If email already exists, go back to step 1
      if (err.message?.toLowerCase().includes('email already exists')) {
        setStep(1);
      }
    } finally {
      setLoading(false);
    }
  };

  const inputBase = "w-full h-12 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none transition-all";
  const inputStyle = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' };
  const focusStyle = 'rgba(124,58,237,0.7)';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
      style={{ background: 'linear-gradient(135deg,#050818 0%,#0a0f2e 50%,#0d0520 100%)' }}>

      {/* Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle,rgba(124,58,237,0.15) 0%,transparent 70%)', filter: 'blur(40px)' }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
        className="w-full max-w-md relative z-10">

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)', boxShadow: '0 8px 32px rgba(124,58,237,0.45)' }}>
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Create Account</h1>
          <p className="text-slate-400 text-sm">Start your 3-day free trial — no credit card needed</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {[1, 2].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                style={step > s
                  ? { background: '#10b981', color: 'white' }
                  : step === s
                    ? { background: 'linear-gradient(135deg,#7c3aed,#2563eb)', color: 'white' }
                    : { background: 'rgba(255,255,255,0.08)', color: '#64748b' }}>
                {step > s ? <CheckCircle className="w-4 h-4" /> : s}
              </div>
              <span className={`text-xs font-medium ${step === s ? 'text-white' : 'text-slate-600'}`}>
                {s === 1 ? 'Account' : 'Profile'}
              </span>
              {i < 1 && (
                <div className="w-8 h-px mx-1 transition-all"
                  style={{ background: step > 1 ? '#10b981' : 'rgba(255,255,255,0.1)' }} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6 md:p-8 border border-white/10"
          style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)' }}>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                className="mb-5 overflow-hidden">
                <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Step 1 ── */}
          {step === 1 && (
            <motion.form key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              onSubmit={handleStep1} className="space-y-4">

              {/* Display name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Display Name <span className="text-violet-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input type="text" placeholder="e.g. Thabo Nkosi" value={formData.full_name}
                    onChange={set('full_name')} required autoFocus autoComplete="name"
                    className={inputBase} style={{ ...inputStyle, paddingLeft: '2.5rem', paddingRight: '1rem' }}
                    onFocus={e => (e.target.style.borderColor = focusStyle)}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} />
                </div>
                <p className="text-xs text-slate-600 mt-1">This is how other students will see you</p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Email Address <span className="text-violet-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input type="email" placeholder="you@example.com" value={formData.email}
                    onChange={set('email')} required autoComplete="email"
                    className={inputBase} style={{ ...inputStyle, paddingLeft: '2.5rem', paddingRight: '1rem' }}
                    onFocus={e => (e.target.style.borderColor = focusStyle)}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Password <span className="text-violet-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input type={showPass ? 'text' : 'password'} placeholder="Min. 6 characters"
                    value={formData.password} onChange={set('password')} required minLength={6} autoComplete="new-password"
                    className={inputBase} style={{ ...inputStyle, paddingLeft: '2.5rem', paddingRight: '2.75rem' }}
                    onFocus={e => (e.target.style.borderColor = focusStyle)}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formData.password.length > 0 && formData.password.length < 6 && (
                  <p className="text-xs text-amber-400 mt-1">Password needs {6 - formData.password.length} more character{6 - formData.password.length !== 1 ? 's' : ''}</p>
                )}
              </div>

              <button type="submit"
                className="w-full h-12 rounded-xl font-semibold text-white flex items-center justify-center gap-2 mt-2 transition-all hover:-translate-y-0.5 active:translate-y-0"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)', boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}>
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </motion.form>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <motion.form key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              onSubmit={handleSubmit} className="space-y-4">

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone Number <span className="text-slate-600 font-normal">(optional)</span></label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input type="tel" placeholder="e.g. 0812345678" value={formData.phone_number}
                    onChange={set('phone_number')} autoComplete="tel"
                    className={inputBase} style={{ ...inputStyle, paddingLeft: '2.5rem', paddingRight: '1rem' }}
                    onFocus={e => (e.target.style.borderColor = focusStyle)}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} />
                </div>
              </div>

              {/* Grade */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Grade Level <span className="text-violet-400">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {grades.map(g => (
                    <button key={g} type="button" onClick={() => { setFormData(p => ({ ...p, grade: g })); setError(''); }}
                      className="h-12 rounded-xl text-sm font-semibold transition-all"
                      style={formData.grade === g
                        ? { background: 'linear-gradient(135deg,#7c3aed,#2563eb)', color: 'white', border: '1px solid transparent', boxShadow: '0 4px 14px rgba(124,58,237,0.45)' }
                        : { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trial benefits */}
              <div className="rounded-xl p-4" style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
                <p className="text-xs font-semibold text-violet-300 mb-2.5">✨ Your free trial includes:</p>
                <div className="grid grid-cols-2 gap-2">
                  {benefits.map(b => (
                    <div key={b} className="flex items-center gap-1.5 text-xs text-slate-400">
                      <CheckCircle className="w-3 h-3 text-emerald-400 flex-shrink-0" />{b}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => { setStep(1); setError(''); }}
                  className="h-12 px-5 rounded-xl font-semibold text-slate-400 transition-all hover:text-white"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  Back
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 h-12 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:pointer-events-none"
                  style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)', boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}>
                  {loading
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</>
                    : <>Start Free Trial <ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
            </motion.form>
          )}

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-xs text-slate-600">already have an account?</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          <Link to={createPageUrl('Login')}
            className="block w-full h-12 rounded-xl text-sm font-semibold text-slate-300 text-center leading-[3rem] transition-all hover:text-white"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
            Sign In Instead
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
