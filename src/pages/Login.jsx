import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { setToken, getToken } from '@/api/client';
import { prince } from '@/api/princeClient';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const urlParams = new URLSearchParams(window.location.search);
  const returnUrl = urlParams.get('return_url') || createPageUrl('Home');

  useEffect(() => {
    let isMounted = true;
    const token = getToken();
    if (token) {
      prince.auth.me()
        .then(() => { if (isMounted) { setIsCheckingAuth(false); navigate(returnUrl, { replace: true }); } })
        .catch(() => { if (isMounted) { setToken(null); setIsCheckingAuth(false); } });
    } else {
      if (isMounted) setIsCheckingAuth(false);
    }
    return () => { isMounted = false; };
  }, [navigate, returnUrl]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f0c07' }}>
        <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#f5c842', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  const set = (field) => (e) => setFormData(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.email) { setError('Please enter your email address.'); return; }
    if (!formData.password) { setError('Please enter your password.'); return; }
    setLoading(true);
    try {
      const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email.trim().toLowerCase(), password: formData.password }),
      });

      let data = {};
      try { data = await res.json(); } catch { /* non-JSON response */ }

      if (!res.ok) {
        if (res.status === 401) throw new Error('Incorrect email or password. Please try again.');
        if (res.status === 404) throw new Error('Account not found. Please check your email or register.');
        if (res.status === 500) throw new Error('Server error. Please try again in a moment.');
        throw new Error(data.error || data.message || `Login failed (${res.status})`);
      }

      setToken(data.token);
      toast.success('Welcome back!');
      if (!data.user?.grade) {
        navigate(createPageUrl('CompleteProfile'), { replace: true });
      } else {
        navigate(returnUrl, { replace: true });
      }
    } catch (err) {
      if (err.name === 'TypeError' || err.message?.includes('fetch') || err.message?.includes('Failed to fetch')) {
        setError('Cannot reach the server. Please check your internet connection and try again.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{ background: '#0f0c07' }}>

      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1920&q=80"
          alt="Mathematics background"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,rgba(15,12,7,0.95) 0%,rgba(26,21,8,0.92) 50%,rgba(15,12,7,0.95) 100%)' }} />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse at 30% 50%,rgba(245,200,66,0.08) 0%,transparent 60%)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to={createPageUrl('Home')}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg,#f5c842,#d97706)', boxShadow: '0 8px 32px rgba(245,200,66,0.35)' }}>
              <GraduationCap className="w-8 h-8 text-black" />
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "'Sora',sans-serif" }}>Welcome Back</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Sign in to continue learning</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6 md:p-8"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(245,200,66,0.15)', backdropFilter: 'blur(20px)' }}>

          {error && (
            <div className="mb-5 rounded-xl px-4 py-3 text-sm"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
              {error}
              {error.includes('not found') && (
                <div className="mt-2">
                  <Link to={createPageUrl('Register')}
                    className="font-semibold underline"
                    style={{ color: '#f5c842' }}>
                    Create an account →
                  </Link>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={set('email')}
                required
                autoFocus
                autoComplete="email"
                className="w-full h-12 rounded-xl text-sm outline-none transition-all px-4 placeholder:text-slate-600"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(245,200,66,0.6)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(245,200,66,0.2)')}
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>Password</label>
                <Link to={createPageUrl('ForgotPassword')}
                  className="text-sm font-medium transition-colors hover:opacity-80"
                  style={{ color: '#f5c842' }}>
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Your password"
                  value={formData.password}
                  onChange={set('password')}
                  required
                  autoComplete="current-password"
                  className="w-full h-12 rounded-xl text-sm outline-none transition-all px-4 pr-12 placeholder:text-slate-600"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = 'rgba(245,200,66,0.6)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(245,200,66,0.2)')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 h-12 rounded-xl font-bold text-black flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:pointer-events-none"
              style={{ background: 'linear-gradient(135deg,#fde68a,#f5c842)', boxShadow: '0 4px 20px rgba(245,200,66,0.4)' }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Signing in...
                </>
              ) : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-5" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Don't have an account?{' '}
          <Link to={createPageUrl('Register')}
            className="font-semibold transition-colors hover:opacity-80"
            style={{ color: '#f5c842' }}>
            Create one free
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
