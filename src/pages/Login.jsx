import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { setToken, getToken } from '@/api/client';
import { prince } from '@/api/princeClient';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const urlParams = new URLSearchParams(window.location.search);
  const returnUrl = urlParams.get('return_url') || createPageUrl('Home');

  // Check if already logged in, redirect away or allow login
  useEffect(() => {
    let isMounted = true;
    const token = getToken();
    if (token) {
      prince.auth.me()
        .then(() => {
          if (isMounted) {
            setIsCheckingAuth(false);
            navigate(returnUrl, { replace: true });
          }
        })
        .catch(() => {
          // Token invalid, clear it and allow login
          if (isMounted) {
            setToken(null);
            setIsCheckingAuth(false);
          }
        });
    } else {
      if (isMounted) setIsCheckingAuth(false);
    }
    return () => { isMounted = false; };
  }, [navigate, returnUrl]);

  // Show loading state while checking auth status
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#080d1a' }}>
        <div className="w-10 h-10 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const set = (field) => (e) => setFormData(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.email && !formData.username) {
      setError('Please enter your email or username.');
      return;
    }
    if (!formData.password) {
      setError('Please enter your password.');
      return;
    }
    setLoading(true);
    try {
      const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email || null,
          username: formData.username || null,
          password: formData.password
        }),
      });

      if (!res.ok) {
        const contentType = res.headers.get('content-type');
        let errorMessage = 'Login failed';

        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          errorMessage = data.error || data.message || errorMessage;
        } else {
          errorMessage = `Server error (${res.status})`;
        }

        if (res.status === 404) {
          errorMessage = 'API endpoint not found. Please ensure the backend server is running.';
        } else if (res.status === 401) {
          errorMessage = 'Invalid email or password. Please check your credentials.';
        } else if (res.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }

        throw new Error(errorMessage);
      }

      const data = await res.json();
      setToken(data.token);
      toast.success('Welcome back!');

      // If user hasn't set grade yet, send to CompleteProfile
      if (!data.user?.grade) {
        navigate(createPageUrl('CompleteProfile'), { replace: true });
      } else {
        navigate(returnUrl, { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Unable to connect to server. If running locally, start the backend with "npm run dev:all". If using the deployed version, please wait for the deployment to complete.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Temporary bypass for development/testing
  const handleBypassLogin = () => {
    const fakeToken = 'dev-bypass-token-' + Date.now();
    const fakeUser = {
      id: 'dev-user-' + Date.now(),
      email: 'dev@example.com',
      full_name: 'Development User',
      role: 'student',
      grade: 'Grade 10',
      phone_number: '+27812345678',
      subscription_tier: 'Premium',
      subscription_active: true,
      subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      trial_end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      created_date: new Date().toISOString()
    };

    // Store token and user data
    setToken(fakeToken);
    localStorage.setItem('user', JSON.stringify(fakeUser));

    toast.success('Development bypass login successful');
    navigate(returnUrl, { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden" style={{ background: '#080d1a' }}>
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1920&q=80"
          alt="Mathematics background"
          className="w-full h-full object-cover"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(8,5,30,0.92) 0%, rgba(15,10,46,0.88) 40%, rgba(10,22,40,0.90) 100%)' }} />
        {/* Violet tint */}
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse at 30% 50%,rgba(124,58,237,0.25) 0%,transparent 60%),radial-gradient(ellipse at 70% 30%,rgba(37,99,235,0.15) 0%,transparent 60%)' }} />
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
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)', boxShadow: '0 8px 32px rgba(124,58,237,0.45)' }}>
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-1">Welcome Back</h1>
          <p className="text-slate-400 text-sm">Sign in to continue learning</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6 md:p-8 border border-white/10" style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)' }}>
          {error && (
            <div className="mb-5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email or Username</label>
              <input
                id="email"
                type="text"
                placeholder="you@example.com or your username"
                value={formData.email || formData.username}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    email: value.includes('@') ? value : '',
                    username: value.includes('@') ? '' : value
                  }));
                }}
                className="w-full h-12 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none transition-all mt-1.5 px-4"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(124,58,237,0.7)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                required
                autoFocus
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-sm font-medium text-slate-300">Password</label>
                <Link to={createPageUrl('ForgotPassword')} className="text-sm text-violet-400 hover:text-violet-300 font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Your password"
                  value={formData.password}
                  onChange={set('password')}
                  className="w-full h-12 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none transition-all mt-1.5 px-4 pr-12"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                  onFocus={(e) => e.target.style.borderColor = 'rgba(124,58,237,0.7)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /><line x1="2" x2="22" y1="12" y2="12" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><path d="M12 9a3 3 0 0 0-3 3" /><path d="M12 15a3 3 0 0 0 3-3" /></svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 h-12 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:pointer-events-none"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)', boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : 'Sign In'}
            </button>

            {/* Temporary bypass button for development */}
            <button
              type="button"
              onClick={handleBypassLogin}
              className="w-full mt-3 h-10 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 transition-all border border-slate-600 hover:border-slate-400"
            >
              Bypass Login (Development)
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-400 mt-5">
          Don't have an account?{' '}
          <Link to={createPageUrl('Register')} className="text-violet-400 hover:text-violet-300 font-semibold">
            Create one free
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
