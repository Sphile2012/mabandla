import React, { useState, useEffect } from 'react';
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

  const urlParams = new URLSearchParams(window.location.search);
  const returnUrl = urlParams.get('return_url') || createPageUrl('Home');

  // If already logged in, redirect away
  useEffect(() => {
    const token = getToken();
    if (token) {
      prince.auth.me()
        .then(() => navigate(returnUrl, { replace: true }))
        .catch(() => { /* token invalid, stay on login */ });
    }
  }, []);

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
              <input
                id="password"
                type="password"
                placeholder="Your password"
                value={formData.password}
                onChange={set('password')}
                className="w-full h-12 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none transition-all mt-1.5 px-4"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(124,58,237,0.7)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                required
              />
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
