import React, { useState } from 'react';
import { prince } from '@/api/princeClient';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Building2, Shield, ChevronDown } from 'lucide-react';
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

const grades = ['Grade 10', 'Grade 11', 'Grade 12'];
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field) => (e) => setFormData(prev => ({ ...prev, [field]: e.target.value }));
  const setSelect = (field) => (value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.full_name || !formData.email || !formData.password || !formData.grade) {
      setError('Please fill in all required fields (name, email, password, grade).');
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
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      // Save token
      localStorage.setItem('access_token', data.token);

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
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10" style={{background:'linear-gradient(135deg,#0a0f2e 0%,#0f1a4e 50%,#1a0a3e 100%)'}}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Create Your Account</h1>
          <p className="text-slate-300 mt-1.5 text-sm md:text-base">
            Start your 3-day free trial � no credit card required
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl shadow-xl border border-white/10 p-6 md:p-8">
          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <Label htmlFor="full_name" className="text-sm font-medium text-slate-200">Full Name *</Label>
              <Input
                id="full_name"
                placeholder="e.g. Thabo Nkosi"
                value={formData.full_name}
                onChange={set('full_name')}
                className="mt-1.5"
                required
              />
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-slate-200">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={set('email')}
                className="mt-1.5"
                required
              />
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password" className="text-sm font-medium text-slate-200">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={set('password')}
                className="mt-1.5"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone" className="text-sm font-medium text-slate-200">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="e.g. 0812345678"
                value={formData.phone_number}
                onChange={set('phone_number')}
                className="mt-1.5"
              />
            </div>

            {/* Grade */}
            <div>
              <Label className="text-sm font-medium text-slate-200">Grade Level *</Label>
              <Select value={formData.grade} onValueChange={setSelect('grade')}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select your grade" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map(g => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Banking Details Toggle */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowBanking(v => !v)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors text-sm font-medium text-slate-700"
              >
                <span className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-violet-500" />
                  Banking Details <span className="text-slate-400 font-normal">(optional)</span>
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showBanking ? 'rotate-180' : ''}`} />
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
                      <p className="text-xs text-amber-200">Your banking details are securely stored and only used for refunds.</p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-slate-200">Bank Name</Label>
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
                        <Label className="text-sm font-medium text-slate-200">Account Holder Name</Label>
                        <Input
                          value={formData.account_holder}
                          onChange={set('account_holder')}
                          placeholder="Full name as per bank account"
                          className="mt-1.5"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-sm font-medium text-slate-200">Account Number</Label>
                          <Input
                            value={formData.account_number}
                            onChange={set('account_number')}
                            placeholder="Account number"
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-slate-200">Account Type</Label>
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
              className="w-full mt-2 h-11 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold rounded-xl disabled:opacity-50 disabled:pointer-events-none transition-all"
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
          <div className="mt-6 pt-5 border-t border-white/10">
            <p className="text-xs text-slate-400 text-center mb-3">What you get with your free trial:</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
              {['3 days full access', 'All grade lessons', 'Ask questions', 'No credit card'].map(b => (
                <div key={b} className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-violet-400 rounded-full flex-shrink-0" />
                  {b}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sign In Link */}
        <p className="text-center text-sm text-slate-400 mt-5">
          Already have an account?{' '}
          <Link to={createPageUrl('Login')} className="text-violet-400 hover:text-violet-300 font-semibold">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
