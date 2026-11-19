import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Shield, ChevronDown, Eye, EyeOff } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { setToken } from '@/api/client';

const banks = ['FNB', 'Standard Bank', 'ABSA', 'Nedbank', 'Capitec', 'African Bank', 'Discovery Bank', 'TymeBank', 'Investec'];

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone_number: '',
    grade: '',
    bank_name: '',
    account_holder: '',
    account_number: '',
    account_type: '',
  });
  const [showBanking, setShowBanking] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field) => (e) => setFormData(prev => ({ ...prev, [field]: e.target.value }));
  const setSelect = (field) => (value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.full_name || !formData.password) {
      setError('Please fill in your name and password.');
      return;
    }
    if (formData.password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.full_name,
          email: formData.email || null,
          password: formData.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      // Save token using the centralized function
      setToken(data.token);

      // Save extra profile data to complete after login
      sessionStorage.setItem('pendingRegistration', JSON.stringify({
        phone_number: formData.phone_number,
        grade: formData.grade,
        bank_name: formData.bank_name,
        account_holder: formData.account_holder,
        account_number: formData.account_number,
        account_type: formData.account_type,
      }));

      toast.success('Account created! Setting up your profile...');
      navigate(createPageUrl('CompleteProfile'));
    } catch (err) {
      console.error('Registration error:', err);
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Unable to connect to server. If running locally, start the backend with "npm run dev:all". If using the deployed version, please wait for the deployment to complete.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#f7f9fc] px-4 py-10">
      <div aria-hidden="true" className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-[#dbe6f8]/70 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 -right-32 h-[28rem] w-[28rem] rounded-full bg-[#fff0c8]/70 blur-3xl" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <BrandLogo className="mx-auto mb-4 h-16 w-16" />
          <h1 className="text-2xl font-extrabold text-[#0b2456] md:text-3xl">Create your account</h1>
          <p className="mt-1.5 text-sm text-slate-600 md:text-base">
            Start your 3-day free trial — no credit card required
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(11,36,86,0.12)] md:p-8">
          {error && (
            <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <Label htmlFor="full_name" className="text-sm font-semibold text-slate-700">Full name *</Label>
              <Input
                id="full_name"
                placeholder="e.g. Thabo Nkosi"
                value={formData.full_name}
                onChange={set('full_name')}
                className="mt-1.5 border-slate-300 bg-slate-50 hover:border-[#b8c5d8] hover:bg-white focus-visible:border-[#d99b12] focus-visible:ring-[#d99b12]/25"
                required
              />
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={set('email')}
                className="mt-1.5 border-slate-300 bg-slate-50 hover:border-[#b8c5d8] hover:bg-white focus-visible:border-[#d99b12] focus-visible:ring-[#d99b12]/25"
                required
              />
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password" className="text-sm font-semibold text-slate-700">Password *</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={set('password')}
                  className="border-slate-300 bg-slate-50 pr-12 hover:border-[#b8c5d8] hover:bg-white focus-visible:border-[#d99b12] focus-visible:ring-[#d99b12]/25"
                  minLength={8}
                  maxLength={128}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-[#16377a] transition hover:text-[#9b6b00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#d99b12]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  {showPassword
                    ? <EyeOff className="h-4 w-4" aria-hidden="true" />
                    : <Eye className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirm_password" className="text-sm font-semibold text-slate-700">Confirm password *</Label>
              <div className="relative mt-1.5">
                <Input
                  id="confirm_password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="border-slate-300 bg-slate-50 pr-12 hover:border-[#b8c5d8] hover:bg-white focus-visible:border-[#d99b12] focus-visible:ring-[#d99b12]/25"
                  minLength={8}
                  maxLength={128}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((visible) => !visible)}
                  className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-[#16377a] transition hover:text-[#9b6b00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#d99b12]"
                  aria-label={showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'}
                  aria-pressed={showConfirmPassword}
                >
                  {showConfirmPassword
                    ? <EyeOff className="h-4 w-4" aria-hidden="true" />
                    : <Eye className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone" className="text-sm font-semibold text-slate-700">Phone number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="e.g. 0812345678"
                value={formData.phone_number}
                onChange={set('phone_number')}
                className="mt-1.5 border-slate-300 bg-slate-50 hover:border-[#b8c5d8] hover:bg-white focus-visible:border-[#d99b12] focus-visible:ring-[#d99b12]/25"
              />
            </div>

            {/* Banking Details Toggle */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowBanking(v => !v)}
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-[#16377a] transition-colors hover:border-[#d8bd76] hover:bg-[#fffaf0]"
              >
                <span className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#d99b12]" />
                  Banking Details <span className="text-slate-400 font-normal">(optional)</span>
                </span>
                <ChevronDown className={`w-4 h-4 text-[#16377a] transition-transform ${showBanking ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showBanking && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3 space-y-3">
                      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                        <Shield className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-amber-900">Your banking details are securely stored and only used for refunds.</p>
                      </div>

                      <div>
                        <Label className="text-sm font-semibold text-slate-700">Bank name</Label>
                        <Select value={formData.bank_name} onValueChange={setSelect('bank_name')}>
                          <SelectTrigger className="mt-1.5">
                            <SelectValue placeholder="Select your bank" />
                          </SelectTrigger>
                          <SelectContent>
                            {banks.map(b => (
                              <SelectItem key={b} value={b}>{b}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm font-semibold text-slate-700">Account holder name</Label>
                        <Input
                          value={formData.account_holder}
                          onChange={set('account_holder')}
                          placeholder="Full name as per bank account"
                          className="mt-1.5 border-slate-300 bg-slate-50 hover:border-[#b8c5d8] hover:bg-white focus-visible:border-[#d99b12] focus-visible:ring-[#d99b12]/25"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-sm font-semibold text-slate-700">Account number</Label>
                          <Input
                            value={formData.account_number}
                            onChange={set('account_number')}
                            placeholder="Account number"
                            className="mt-1.5 border-slate-300 bg-slate-50 hover:border-[#b8c5d8] hover:bg-white focus-visible:border-[#d99b12] focus-visible:ring-[#d99b12]/25"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-slate-700">Account type</Label>
                          <Select value={formData.account_type} onValueChange={setSelect('account_type')}>
                            <SelectTrigger className="mt-1.5">
                              <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Cheque">Cheque</SelectItem>
                              <SelectItem value="Savings">Savings</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 h-12 w-full rounded-xl bg-[#16377a] font-bold text-white shadow-[0_8px_20px_rgba(22,55,122,0.2)] transition-all hover:-translate-y-0.5 hover:bg-[#0b2456] disabled:pointer-events-none disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : 'Create Account'}
            </button>

          </form>

          {/* Benefits */}
          <div className="mt-6 border-t border-slate-100 pt-5">
            <p className="mb-3 text-center text-xs font-semibold text-slate-500">What you get with your free trial:</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
              {['3 days full access', 'All grade lessons', 'Ask questions', 'No credit card'].map(b => (
                <div key={b} className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#d99b12]" />
                  {b}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sign In Link */}
        <p className="mt-5 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to={createPageUrl('Login')} className="font-bold text-[#16377a] underline decoration-[#d99b12] underline-offset-4 hover:text-[#9b6b00]">
            Sign In
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
