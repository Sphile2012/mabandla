import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { GraduationCap, Lock, Eye, EyeOff, RefreshCw, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getApiBaseUrl, parseJsonBody } from '@/api/client';

const GOLD = '#f5c842';
const GOLD_LIGHT = '#fde68a';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [step, setStep] = useState(1); // 1 = OTP entry, 2 = new password
  const [done, setDone] = useState(false);
  const inputRefs = useRef([]);

  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get('email') || '';

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
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

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { setError('Please enter the full 6-digit code.'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await parseJsonBody(res);
      if (!res.ok) throw new Error(data.error || 'Invalid code');
      toast.success('Code verified!');
      setStep(2);
    } catch (err) {
      setError(err.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otp.join(''), new_password: newPassword }),
      });
      const data = await parseJsonBody(res);
      if (!res.ok) throw new Error(data.error || 'Password reset failed');
      setDone(true);
      toast.success('Password reset successfully!');
      setTimeout(() => navigate(createPageUrl('Login')), 2000);
    } catch (err) {
      setError(err.message || 'Password reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    try {
      await fetch(`${getApiBaseUrl()}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setOtp(['', '', '', '', '', '']);
      setError('');
      toast.success('New code sent! Check your email.');
      inputRefs.current[0]?.focus();
    } catch {
      toast.error('Failed to resend. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(245,200,66,0.2)',
    color: '#fef9e7',
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0f0c07' }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(245,200,66,0.1)', border: '1px solid rgba(245,200,66,0.3)' }}>
            <CheckCircle className="w-8 h-8" style={{ color: GOLD }} />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">Password Reset!</h2>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Redirecting you to sign in...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
      style={{ background: '#0f0c07' }}>

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle,rgba(245,200,66,0.07) 0%,transparent 70%)', filter: 'blur(40px)' }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: `linear-gradient(135deg,${GOLD_LIGHT},${GOLD})`, boxShadow: '0 8px 28px rgba(245,200,66,0.35)' }}>
            <GraduationCap className="w-7 h-7 text-black" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Sora',sans-serif" }}>
            {step === 1 ? 'Enter Reset Code' : 'Create New Password'}
          </h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {step === 1
              ? <>Code sent to <span style={{ color: GOLD_LIGHT }}>{email || 'your email'}</span></>
              : 'Choose a strong new password'}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6 md:p-8"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(245,200,66,0.15)', backdropFilter: 'blur(20px)' }}>

          {error && (
            <div className="mb-5 rounded-xl px-4 py-3 text-sm"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleVerifyOtp}>
              {/* OTP inputs */}
              <div className="flex justify-center gap-2 md:gap-3 mb-6" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-11 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all text-white"
                    style={{
                      background: digit ? 'rgba(245,200,66,0.1)' : 'rgba(255,255,255,0.05)',
                      borderColor: digit ? 'rgba(245,200,66,0.6)' : 'rgba(245,200,66,0.2)',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = 'rgba(245,200,66,0.8)')}
                    onBlur={(e) => (e.target.style.borderColor = digit ? 'rgba(245,200,66,0.6)' : 'rgba(245,200,66,0.2)')}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || otp.join('').length < 6}
                className="w-full h-12 rounded-xl font-bold text-black flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none"
                style={{ background: `linear-gradient(135deg,${GOLD_LIGHT},${GOLD})`, boxShadow: '0 4px 20px rgba(245,200,66,0.4)' }}>
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Verifying...</>
                ) : 'Verify Code'}
              </button>

              {/* Resend */}
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-80"
                  style={{ color: 'rgba(255,255,255,0.45)' }}>
                  <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                  {resending ? 'Sending...' : 'Resend code'}
                </button>
              </div>

              <p className="text-xs text-center mt-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Check your spam folder if you don't see the email.
              </p>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: 'rgba(255,255,255,0.3)' }} />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    autoFocus
                    className="w-full h-12 rounded-xl text-sm outline-none transition-all placeholder:text-slate-600"
                    style={{ ...inputStyle, paddingLeft: '2.75rem', paddingRight: '3rem' }}
                    onFocus={(e) => (e.target.style.borderColor = 'rgba(245,200,66,0.6)')}
                    onBlur={(e) => (e.target.style.borderColor = 'rgba(245,200,66,0.2)')}
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: 'rgba(255,255,255,0.3)' }} />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full h-12 rounded-xl text-sm outline-none transition-all placeholder:text-slate-600"
                    style={{ ...inputStyle, paddingLeft: '2.75rem' }}
                    onFocus={(e) => (e.target.style.borderColor = 'rgba(245,200,66,0.6)')}
                    onBlur={(e) => (e.target.style.borderColor = 'rgba(245,200,66,0.2)')}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl font-bold text-black flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:pointer-events-none"
                style={{ background: `linear-gradient(135deg,${GOLD_LIGHT},${GOLD})`, boxShadow: '0 4px 20px rgba(245,200,66,0.4)' }}>
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Resetting...</>
                ) : (
                  <><Lock className="w-4 h-4" /> Reset Password</>
                )}
              </button>
            </form>
          )}
        </div>

        <div className="text-center mt-5">
          <button onClick={() => navigate(createPageUrl('Login'))}
            className="text-sm transition-colors hover:opacity-80"
            style={{ color: 'rgba(255,255,255,0.4)' }}>
            Back to Sign In
          </button>
        </div>
      </motion.div>
    </div>
  );
}
