import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getApiBaseUrl, parseJsonBody } from '@/api/client';

export default function ChangePassword() {
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

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const data = await parseJsonBody(res);

      if (!res.ok) {
        throw new Error(data.error || `Request failed (${res.status})`);
      }

      setEmail(normalizedEmail);
      setSuccess(true);
      toast.success('If an account exists, a reset code has been emailed.');
    } catch (err) {
      console.error('Password reset request error:', err);
      if (err.name === 'TypeError') {
        setError('Network error — please check your connection and try again.');
      } else if (err.message?.includes('fetch')) {
        setError('Unable to connect to server. Please try again later.');
      } else {
        setError(err.message || 'Failed to send reset code. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "h-12 w-full rounded-xl border border-white/10 bg-white/[0.06] pl-10 pr-4 text-sm text-white placeholder:text-slate-500 outline-none transition-all hover:border-white/20 focus:border-violet-500";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 bg-[linear-gradient(135deg,#050818 0%,#0a0f2e 50%,#0d0520 100%)]">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.15) 0%,transparent 70%)] blur-[40px]" />
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
        className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-[linear-gradient(135deg,#7c3aed,#2563eb)] shadow-[0_8px_32px_rgba(124,58,237,0.45)]">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Change Password</h1>
          <p className="text-slate-400 text-sm">Enter your email to receive a 6-digit reset code</p>
        </div>

        <div className="rounded-2xl p-6 md:p-8 border border-white/10 bg-[rgba(255,255,255,0.04)] backdrop-blur-[20px]">
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
                    <div className="font-medium">Check your email</div>
                    <div className="text-xs mt-1 opacity-90">If an account exists, a 6-digit reset code has been sent.</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full h-12 rounded-xl font-semibold text-white flex items-center justify-center gap-2 mt-2 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:pointer-events-none bg-[linear-gradient(135deg,#7c3aed,#2563eb)] shadow-[0_4px_20px_rgba(124,58,237,0.4)]">
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
                If an account exists for <span className="font-medium text-white">{email}</span>, a 6-digit reset code has been emailed.
              </p>
              <button
                onClick={() => navigate(`${createPageUrl('ResetPassword')}?email=${encodeURIComponent(email)}`, { state: { email } })}
                className="w-full h-12 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0 bg-[linear-gradient(135deg,#7c3aed,#2563eb)] shadow-[0_4px_20px_rgba(124,58,237,0.4)]">
                Enter Reset Code <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setSuccess(false); setError(''); }}
                className="w-full h-12 rounded-xl border border-white/10 bg-[rgba(255,255,255,0.04)] text-center font-semibold text-slate-300 transition-all hover:border-white/20 hover:text-white"
              >
                Use a different email
              </button>
            </div>
          )}

          <div className="mt-5 text-center">
            <Link to={createPageUrl('Profile')} className="text-sm text-slate-400 hover:text-white transition-colors">
              Back to Profile
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
