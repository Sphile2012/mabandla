import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Building2, Shield, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { setToken } from '@/api/client';

const grades = ['Grade 10', 'Grade 11', 'Grade 12'];
const banks = ['FNB', 'Standard Bank', 'ABSA', 'Nedbank', 'Capitec', 'African Bank', 'Discovery Bank', 'TymeBank', 'Investec'];

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '', email: '', password: '', phone_number: '',
    grade: '', bank_name: '', account_holder: '', account_number: '', account_type: '',
  });
  const [showBanking, setShowBanking] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field) => (e) => setFormData(prev => ({ ...prev, [field]: e.target.value }));
  const setSelect = (field) => (value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.full_name || !formData.email || !formData.password) {
      setError('Please fill in your name, email and password.');
      return;
    }
    if (!formData.grade) {
      setError('Please select your grade level.');
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

      setToken(data.token);
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
      if (err.name === 'TypeError') {
        setError('Unable to connect. Please check your connection and try again.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(245,200,66,0.2)',
    color: '#fef9e7',
    width: '100%',
    height: '48px',
    borderRadius: '12px',
    padding: '0 16px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{ background: '#0f0c07' }}>

      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle,rgba(245,200,66,0.07) 0%,transparent 70%)', filter: 'blur(40px)' }} />
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
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg,#f5c842,#d97706)', boxShadow: '0 8px 28px rgba(245,200,66,0.35)' }}>
              <GraduationCap className="w-7 h-7 text-black" />
            </div>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: "'Sora',sans-serif" }}>
            Create Your Account
          </h1>
          <p className="mt-1.5 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Start your 3-day free trial — no credit card required
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Full Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Thabo Nkosi"
                value={formData.full_name}
                onChange={set('full_name')}
                required
                autoFocus
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(245,200,66,0.6)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(245,200,66,0.2)')}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Email Address *
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={set('email')}
                required
                autoComplete="email"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(245,200,66,0.6)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(245,200,66,0.2)')}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password (min 6 chars)"
                  value={formData.password}
                  onChange={set('password')}
                  required
                  minLength={6}
                  style={{ ...inputStyle, paddingRight: '48px' }}
                  onFocus={(e) => (e.target.style.borderColor = 'rgba(245,200,66,0.6)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(245,200,66,0.2)')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="e.g. 0812345678"
                value={formData.phone_number}
                onChange={set('phone_number')}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(245,200,66,0.6)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(245,200,66,0.2)')}
              />
            </div>

            {/* Grade */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Grade Level *
              </label>
              <Select value={formData.grade} onValueChange={setSelect('grade')}>
                <SelectTrigger className="mt-0 h-12 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(245,200,66,0.2)', color: '#fef9e7' }}>
                  <SelectValue placeholder="Select your grade" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Banking Details Toggle */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowBanking(v => !v)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors text-sm font-medium"
                style={{ background: 'rgba(245,200,66,0.06)', border: '1px solid rgba(245,200,66,0.15)', color: 'rgba(255,255,255,0.7)' }}
              >
                <span className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" style={{ color: '#f5c842' }} />
                  Banking Details <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}>(optional)</span>
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showBanking ? 'rotate-180' : ''}`}
                  style={{ color: 'rgba(255,255,255,0.4)' }} />
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
                      <div className="flex items-start gap-2 rounded-xl p-3"
                        style={{ background: 'rgba(245,200,66,0.08)', border: '1px solid rgba(245,200,66,0.2)' }}>
                        <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#f5c842' }} />
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
                          Securely stored and only used for refunds. Never shared with third parties.
                        </p>
                      </div>

                      <Select value={formData.bank_name} onValueChange={setSelect('bank_name')}>
                        <SelectTrigger className="h-12 rounded-xl"
                          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(245,200,66,0.2)', color: '#fef9e7' }}>
                          <SelectValue placeholder="Select your bank" />
                        </SelectTrigger>
                        <SelectContent>
                          {banks.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                        </SelectContent>
                      </Select>

                      <input
                        type="text"
                        placeholder="Account holder name"
                        value={formData.account_holder}
                        onChange={set('account_holder')}
                        style={inputStyle}
                        onFocus={(e) => (e.target.style.borderColor = 'rgba(245,200,66,0.6)')}
                        onBlur={(e) => (e.target.style.borderColor = 'rgba(245,200,66,0.2)')}
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Account number"
                          value={formData.account_number}
                          onChange={set('account_number')}
                          style={inputStyle}
                          onFocus={(e) => (e.target.style.borderColor = 'rgba(245,200,66,0.6)')}
                          onBlur={(e) => (e.target.style.borderColor = 'rgba(245,200,66,0.2)')}
                        />
                        <Select value={formData.account_type} onValueChange={setSelect('account_type')}>
                          <SelectTrigger className="h-12 rounded-xl"
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(245,200,66,0.2)', color: '#fef9e7' }}>
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Cheque">Cheque</SelectItem>
                            <SelectItem value="Savings">Savings</SelectItem>
                          </SelectContent>
                        </Select>
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
              className="w-full mt-2 h-12 rounded-xl font-bold text-black flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:pointer-events-none"
              style={{ background: 'linear-gradient(135deg,#fde68a,#f5c842)', boxShadow: '0 4px 20px rgba(245,200,66,0.4)' }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Creating account...
                </>
              ) : 'Create Account'}
            </button>
          </form>

          {/* Benefits */}
          <div className="mt-6 pt-5" style={{ borderTop: '1px solid rgba(245,200,66,0.1)' }}>
            <p className="text-xs text-center mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
              What you get with your free trial:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {['3 days full access', 'All grade lessons', 'Ask questions', 'No credit card'].map(b => (
                <div key={b} className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#f5c842' }} />
                  {b}
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-sm mt-5" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Already have an account?{' '}
          <Link to={createPageUrl('Login')}
            className="font-semibold transition-colors hover:opacity-80"
            style={{ color: '#f5c842' }}>
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
