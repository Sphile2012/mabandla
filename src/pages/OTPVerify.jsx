import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowLeft, RefreshCw, CheckCircle } from 'lucide-react';
import { getApiBaseUrl, getToken } from '@/api/client';

export default function OTPVerify() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  // Get email from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get('email') || '';

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setTimeout(() => setResendTimer(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendTimer]);

  // Auto-send OTP on mount if we have a token (just registered)
  useEffect(() => {
    const token = getToken();
    if (token) {
      sendOtp(token);
    }
  }, []);

  async function sendOtp(token) {
    try {
      await fetch(`${getApiBaseUrl()}/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch {
      // Silently fail — OTP may have been sent already
    }
  }

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    pasted.split('').forEach((char, i) => { newOtp[i] = char; });
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = getToken();
      const res = await fetch(`${getApiBaseUrl()}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ otp: code }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid code');

      setVerified(true);
      setTimeout(() => navigate(createPageUrl('CompleteProfile')), 1500);
    } catch (err) {
      setError(err.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    try {
      const token = getToken();
      await sendOtp(token);
      setResendTimer(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch {
      setError('Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  if (verified) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#080d1a' }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-9 h-9 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Email Verified!</h2>
          <p className="text-slate-400 text-sm mt-1">Setting up your profile...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
      style={{ background: 'linear-gradient(135deg,#050818 0%,#0a0f2e 50%,#0d0520 100%)' }}>

      {/* Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle,rgba(124,58,237,0.15) 0%,transparent 70%)', filter: 'blur(40px)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)', boxShadow: '0 8px 32px rgba(124,58,237,0.45)' }}>
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Verify Your Email</h1>
          <p className="text-slate-400 mt-1.5 text-sm">
            We sent a 6-digit code to
          </p>
          {email && (
            <p className="text-violet-400 font-semibold text-sm mt-0.5 break-all">{email}</p>
          )}
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6 md:p-8 border border-white/10"
          style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)' }}>

          {error && (
            <div className="mb-5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleVerify}>
            {/* OTP Inputs */}
            <div className="flex justify-center gap-2 md:gap-3 mb-6" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`w-11 h-14 md:w-13 md:h-16 text-center text-xl md:text-2xl font-bold rounded-xl border-2 transition-all outline-none text-white ${
                    digit
                      ? 'border-violet-500 bg-violet-500/10'
                      : 'border-white/15 bg-white/5 focus:border-violet-500'
                  }`}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || otp.join('').length < 6}
              className="w-full h-11 font-semibold text-white rounded-xl disabled:opacity-50 disabled:pointer-events-none transition-all hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)', boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </span>
              ) : (
                'Verify Code'
              )}
            </button>
          </form>

          {/* Resend */}
          <div className="mt-5 text-center">
            {resendTimer > 0 ? (
              <p className="text-sm text-slate-500">
                Resend code in <span className="font-semibold text-violet-400">{resendTimer}s</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                className="flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300 font-semibold mx-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                {resending ? 'Sending...' : 'Resend Code'}
              </button>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-white/8 text-center">
            <p className="text-xs text-slate-500">
              Check your spam folder if you don't see the email within a minute.
            </p>
          </div>
        </div>

        {/* Skip link — allow skipping email verification */}
        <div className="text-center mt-5 space-y-2">
          <button
            onClick={() => navigate(createPageUrl('CompleteProfile'))}
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            Skip for now →
          </button>
          <div>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go back
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
