import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { GraduationCap, Mail, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getApiBaseUrl, parseJsonBody } from '@/api/client';

const GOLD = '#f5c842';
const GOLD_LIGHT = '#fde68a';
const GOLD_DARK = '#d97706';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) { setError('Please enter a valid email address.'); return; }

    setLoading(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await parseJsonBody(res);
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setSuccess(true);
      toast.success('Reset code sent! Check your email.');
    } catch (err) {
      setError(err.message || 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(245,200,66,0.2)',
    color: '#fef9e7',
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
      style={{ background: '#0f0c07' }}>

      <div className="fixed inset-0 pointer-events-none">
        <img src="/math-bg.jpg" alt="" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0" style={{ background: 'rgba(15,12,7,0.85)' }} />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle,rgba(245,200,66,0.07) 0%,transparent 70%)', filter: 'blur(40px)' }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
        className="w-full max-w-md relative z-10">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to={createPageUrl('Home')}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: `linear-gradient(135deg,${GOLD_LIGHT},${GOLD})`, boxShadow: '0 8px 28px rgba(245,200,66,0.35)' }}>
              <GraduationCap className="w-8 h-8 text-black" />
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "'Sora',sans-serif" }}>Reset Password</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Enter your email to receive a 6-digit reset code</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6 md:p-8"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(245,200,66,0.15)', backdropFilter: 'blur(20px)' }}>

          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: 'rgba(255,255,255,0.3)' }} />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    autoComplete="email"
                    className="w-full h-12 rounded-xl text-sm outline-none transition-all placeholder:text-slate-600"
                    style={{ ...inputStyle, paddingLeft: '2.75rem', paddingRight: '1rem' }}
                    onFocus={(e) => (e.target.style.borderColor = 'rgba(245,200,66,0.6)')}
                    onBlur={(e) => (e.target.style.borderColor = 'rgba(245,200,66,0.2)')}
                  />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full h-12 rounded-xl font-bold text-black flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:pointer-events-none"
                style={{ background: `linear-gradient(135deg,${GOLD_LIGHT},${GOLD})`, boxShadow: '0 4px 20px rgba(245,200,66,0.4)' }}>
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Sending...</>
                ) : (
                  <>Send Reset Code <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-5">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                style={{ background: 'rgba(245,200,66,0.1)', border: '1px solid rgba(245,200,66,0.3)' }}>
                <CheckCircle className="w-8 h-8" style={{ color: GOLD }} />
              </div>
              <div>
                <p className="font-semibold text-white mb-1">Reset code sent!</p>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  We sent a 6-digit code to <span style={{ color: GOLD_LIGHT }}>{email}</span>
                </p>
                <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  Check your spam folder if you don't see it within a minute.
                </p>
              </div>
              <button
                onClick={() => navigate(createPageUrl('ResetPassword') + `?email=${encodeURIComponent(email.trim().toLowerCase())}`)}
                className="w-full h-12 rounded-xl font-bold text-black flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
                style={{ background: `linear-gradient(135deg,${GOLD_LIGHT},${GOLD})`, boxShadow: '0 4px 20px rgba(245,200,66,0.4)' }}>
                Enter Reset Code <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setSuccess(false); setError(''); }}
                className="text-sm transition-colors hover:opacity-80"
                style={{ color: 'rgba(255,255,255,0.45)' }}>
                Use a different email
              </button>
            </div>
          )}

          <div className="mt-6 pt-5" style={{ borderTop: '1px solid rgba(245,200,66,0.08)' }}>
            <Link to={createPageUrl('Login')}
              className="block w-full h-11 rounded-xl text-sm font-semibold text-center leading-[44px] transition-all hover:opacity-80"
              style={{ color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(245,200,66,0.12)', background: 'rgba(255,255,255,0.03)' }}>
              Back to Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
