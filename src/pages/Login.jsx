import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
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

  const requestedReturnUrl = new URLSearchParams(window.location.search).get('return_url');
  const isSafeReturnUrl = requestedReturnUrl?.startsWith('/')
    && !requestedReturnUrl.startsWith('//')
    && !requestedReturnUrl.includes('\\');
  const returnUrl = isSafeReturnUrl ? requestedReturnUrl : createPageUrl('Home');

  useEffect(() => {
    let isMounted = true;
    const token = getToken();

    if (!token) {
      setIsCheckingAuth(false);
      return () => { isMounted = false; };
    }

    prince.auth.me()
      .then(() => {
        if (isMounted) navigate(returnUrl, { replace: true });
      })
      .catch((authError) => {
        if (!isMounted) return;

        if (authError.status === 401) {
          setToken(null);
        } else {
          console.error('Unable to verify login session:', authError);
          setError('Unable to verify your session. Please try signing in again.');
        }
      })
      .finally(() => {
        if (isMounted) setIsCheckingAuth(false);
      });

    return () => { isMounted = false; };
  }, [navigate, returnUrl]);

  const set = (field) => (e) => setFormData((previous) => ({ ...previous, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email && !formData.username) {
      setError('Please enter your email address.');
      return;
    }
    if (!formData.password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const baseUrl = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email || null,
          username: formData.username || null,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        let errorMessage = `Server error (${response.status})`;
        const contentType = response.headers.get('content-type');

        if (contentType?.includes('application/json')) {
          const responseData = await response.json();
          errorMessage = responseData.error || responseData.message || errorMessage;
        }

        if (response.status === 404) {
          errorMessage = 'API endpoint not found. Please ensure the backend server is running.';
        } else if (response.status === 401) {
          errorMessage = 'Invalid email or password. Please check your credentials.';
        } else if (response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (!data.token) {
        throw new Error('The server response did not include a login token. Please try again.');
      }

      setToken(data.token);
      toast.success('Welcome back!');

      if (!data.user?.grade) {
        navigate(createPageUrl('CompleteProfile'), { replace: true });
      } else {
        navigate(returnUrl, { replace: true });
      }
    } catch (loginError) {
      console.error('Login error:', loginError);
      if (loginError instanceof TypeError && loginError.message.includes('fetch')) {
        setError('Unable to connect to server. If running locally, start the backend with "npm run dev:all". If using the deployed version, please wait for the deployment to complete.');
      } else {
        setError(loginError.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffaff]" aria-label="Checking login status">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-100 border-t-violet-600" />
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fffaff] px-4 py-6 text-slate-800 sm:px-6 sm:py-10">
      <div className="pointer-events-none absolute -left-40 -top-48 h-[32rem] w-[32rem] rounded-full bg-violet-200/40 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-48 -right-40 h-[32rem] w-[32rem] rounded-full bg-pink-200/40 blur-[120px]" />

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative grid w-full max-w-md overflow-hidden rounded-[2rem] border border-violet-100/80 bg-white shadow-[0_28px_90px_-40px_rgba(109,40,217,0.3)]"
      >
        <section className="flex items-center justify-center p-7 sm:p-10 lg:p-12">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <BrandLogo className="mb-5 h-16 w-16" />
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">Welcome back</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#35294b]">Sign in to continue</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Your next study session is just a moment away.</p>
            </div>

            {error && (
              <div role="alert" aria-live="polite" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="loginId" className="mb-2 block text-sm font-semibold text-slate-700">Email address</label>
                <input
                  id="loginId"
                  name="username"
                  type="text"
                  autoComplete="username"
                  placeholder="you@example.com"
                  value={formData.email || formData.username}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData((previous) => ({
                      ...previous,
                      email: value.includes('@') ? value : '',
                      username: value.includes('@') ? '' : value,
                    }));
                  }}
                  className="h-12 w-full rounded-xl border border-violet-100 bg-[#fbfaff] px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-violet-200 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
                  required
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-700">Password</label>
                  <Link to={createPageUrl('ForgotPassword')} className="text-sm font-semibold text-violet-600 transition hover:text-violet-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={set('password')}
                    className="h-12 w-full rounded-xl border border-violet-100 bg-[#fbfaff] px-4 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-violet-200 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-slate-400 transition hover:text-violet-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-500"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                  >
                    {showPassword
                      ? <EyeOff className="h-5 w-5" aria-hidden="true" />
                      : <Eye className="h-5 w-5" aria-hidden="true" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-4 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-500/25 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-200 disabled:pointer-events-none disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Signing in...
                  </>
                ) : 'Sign in'}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500">
              Don&apos;t have an account?{' '}
              <Link to={createPageUrl('Register')} className="font-bold text-violet-600 transition hover:text-violet-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500">
                Create one free
              </Link>
            </p>
          </div>
        </section>
      </motion.section>
    </main>
  );
}
