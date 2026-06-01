import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getApiBaseUrl, getToken } from '@/api/client';

export default function ChangePassword() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const set = (field) => (e) => setFormData(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.current_password) {
      setError('Please enter your current password.');
      return;
    }
    if (!formData.new_password) {
      setError('Please enter a new password.');
      return;
    }
    if (formData.new_password.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (formData.new_password !== formData.confirm_password) {
      setError('New passwords do not match.');
      return;
    }
    if (formData.current_password === formData.new_password) {
      setError('New password must be different from your current password.');
      return;
    }

    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        navigate(createPageUrl('Login'));
        return;
      }

      const res = await fetch(`${getApiBaseUrl()}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: formData.current_password,
          new_password: formData.new_password,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password.');

      setSuccess(true);
      toast.success('Password changed successfully!');
      setTimeout(() => navigate(createPageUrl('Profile')), 2000);
    } catch (err) {
      setError(err.message || 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputBase = "w-full h-12 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none transition-all px-4";
  const inputStyle = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
      style={{ background: 'linear-gradient(135deg,#050818 0%,#0a0f2e 50%,#0d0520 100%)' }}>

      {/* Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle,rgba(124,58,237,0.15) 0%,transparent 70%)', filter: 'blur(40px)' }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
        className="w-full max-w-md relative z-10">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)', boxShadow: '0 8px 32px rgba(124,58,237,0.45)' }}>
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Change Password</h1>
          <p className="text-slate-400 text-sm">Enter your current password and choose a new one</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6 md:p-8 border border-white/10"
          style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)' }}>

          {success ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Password Changed!</h3>
              <p className="text-slate-400 text-sm">Redirecting you to your profile...</p>
            </motion.div>
          ) : (
            <>
              {error && (
                <div className="mb-5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      placeholder="Your current password"
                      value={formData.current_password}
                      onChange={set('current_password')}
                      required
                      autoFocus
                      className={`${inputBase} pr-11`}
                      style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = 'rgba(124,58,237,0.7)')}
                      onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                    />
                    <button type="button" onClick={() => setShowCurrent(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">New Password</label>
                  <div className="relative">
                    <input
                      type={showNew ? 'text' : 'password'}
                      placeholder="At least 6 characters"
                      value={formData.new_password}
                      onChange={set('new_password')}
                      required
                      minLength={6}
                      className={`${inputBase} pr-11`}
                      style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = 'rgba(124,58,237,0.7)')}
                      onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                    />
                    <button type="button" onClick={() => setShowNew(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm New Password</label>
                  <input
                    type={showNew ? 'text' : 'password'}
                    placeholder="Repeat new password"
                    value={formData.confirm_password}
                    onChange={set('confirm_password')}
                    required
                    minLength={6}
                    className={inputBase}
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = 'rgba(124,58,237,0.7)')}
                    onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                  />
                </div>

                <button type="submit" disabled={loading}
                  className="w-full h-12 rounded-xl font-semibold text-white flex items-center justify-center gap-2 mt-2 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:pointer-events-none"
                  style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)', boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}>
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Changing...</>
                  ) : (
                    <><Lock className="w-4 h-4" /> Change Password</>
                  )}
                </button>
              </form>

              <div className="mt-4 pt-4 border-t border-white/8 text-center">
                <p className="text-xs text-slate-500">
                  Forgot your current password?{' '}
                  <button
                    type="button"
                    onClick={() => navigate(createPageUrl('ForgotPassword'))}
                    className="text-violet-400 hover:text-violet-300 font-medium"
                  >
                    Reset it here
                  </button>
                </p>
              </div>
            </>
          )}
        </div>

        {/* Back */}
        <div className="text-center mt-5">
          <button
            onClick={() => navigate(createPageUrl('Profile'))}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Profile
          </button>
        </div>
      </motion.div>
    </div>
  );
}
