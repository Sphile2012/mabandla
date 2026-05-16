import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      setToken(data.token);
      toast.success('Welcome back!');

      // If user hasn't set grade yet, send to CompleteProfile
      if (!data.user?.grade) {
        navigate(createPageUrl('CompleteProfile'), { replace: true });
      } else {
        navigate(returnUrl, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex flex-col items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to={createPageUrl('Home')}>
            <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Welcome Back</h1>
          <p className="text-slate-500 mt-1.5 text-sm">Sign in to continue learning</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 md:p-8">
          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium">Email or Username</Label>
              <Input
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
                className="mt-1.5"
                required
                autoFocus
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Link to={createPageUrl('ForgotPassword')} className="text-sm text-violet-600 hover:text-violet-700 font-medium">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Your password"
                value={formData.password}
                onChange={set('password')}
                className="mt-1.5"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 h-11 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold rounded-xl disabled:opacity-50 disabled:pointer-events-none transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-5">
          Don't have an account?{' '}
          <Link to={createPageUrl('Register')} className="text-violet-600 hover:text-violet-700 font-semibold">
            Create one free
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
