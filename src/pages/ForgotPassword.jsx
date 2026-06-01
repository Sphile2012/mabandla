import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Mail, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getApiBaseUrl, parseJsonBody } from '@/api/client';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await parseJsonBody(res);

      if (!res.ok) {
        throw new Error(data.error || `Request failed (${res.status})`);
      }

      setSuccess(true);
      toast.success('Password reset code sent to your email!');
    } catch (err) {
      console.error('Forgot password error:', err);
      if (err.name === 'TypeError') {
        setError('Network error — please check your connection and try again.');
      } else if (err.message?.includes('fetch')) {
        setError('Unable to connect to server. Please ensure the backend is running on port 3001.');
      } else {
        setError(err.message || 'Failed to send reset code. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full h-12 rounded-xl text-sm text-slate-900 placeholder:text-slate-500 outline-none transition-all";
  const inputStyle = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' };
  const focusBorder = 'rgba(124,58,237,0.7)';

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
        <div className="text-center mb-8">
          <Link to={createPageUrl('Home')}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)', boxShadow: '0 8px 32px rgba(124,58,237,0.45)' }}>
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-1">Reset Password</h1>
          <p className="text-slate-400 text-sm">Enter your email to receive a reset code</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6 md:p-8 border border-white/10"
          style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)' }}>

          {/* Error/Success Messages */}
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

          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                className="mb-5 overflow-hidden">
                <div className="flex items-start gap-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl px-4 py-3 text-sm">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Reset code sent!</div>
                    <div className="text-xs mt-1 opacity-90">Check your email for the 6-digit code</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    autoComplete="email"
                    className={inputClass}
                    style={{ ...inputStyle, paddingLeft: '2.5rem', paddingRight: '1rem' }}
                    onFocus={(e) => (e.target.style.borderColor = focusBorder)}
                    onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                  />
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="w-full h-12 rounded-xl font-semibold text-white flex items-center justify-center gap-2 mt-2 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:pointer-events-none"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)', boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}>
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                ) : (
                  <>Send Reset Code <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-slate-300 text-sm">
                We've sent a 6-digit reset code to your email address.
              </p>
              <button
                onClick={() => navigate(createPageUrl('ResetPassword') + `?email=${encodeURIComponent(email.trim().toLowerCase())}`)}
                className="w-full h-12 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)', boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}>
                Enter Reset Code <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-xs text-slate-600">remember password?</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          <Link to={createPageUrl('Login')}
            className="block w-full h-12 rounded-xl text-sm font-semibold text-slate-300 text-center leading-[3rem] transition-all hover:text-white hover:border-white/20"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
            Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
