import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { GraduationCap, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { getApiBaseUrl, parseJsonBody } from '@/api/client';

export default function ResetPassword() {
    const navigate = useNavigate();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [step, setStep] = useState(1); // 1 = OTP, 2 = New Password

    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email') || '';

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        setError('');

        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length < 6) {
            setError('Please enter the full 6-digit code.');
            return;
        }

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

        if (!newPassword) {
            setError('Please enter your new password.');
            return;
        }
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${getApiBaseUrl()}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    otp: otp.join(''),
                    new_password: newPassword,
                }),
            });
            const data = await parseJsonBody(res);
            if (!res.ok) throw new Error(data.error || 'Password reset failed');

            toast.success('Password reset successfully!');
            setTimeout(() => navigate(createPageUrl('Login')), 1500);
        } catch (err) {
            setError(err.message || 'Password reset failed. Please try again.');
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
                    <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <GraduationCap className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                        {step === 1 ? 'Verify Code' : 'New Password'}
                    </h1>
                    <p className="text-slate-500 mt-1.5 text-sm">
                        {step === 1 ? 'Enter the 6-digit code sent to your email' : 'Create a new secure password'}
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 md:p-8">
                    {error && (
                        <div className="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                            {error}
                        </div>
                    )}

                    {step === 1 ? (
                        <form onSubmit={handleVerifyOtp}>
                            <div className="flex justify-center gap-2 mb-6">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        id={`otp-${index}`}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                        className="w-11 h-14 text-center text-xl font-bold rounded-xl border-2 border-slate-200 bg-white text-slate-900 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all"
                                    />
                                ))}
                            </div>

                            <button
                                type="submit"
                                disabled={loading || otp.join('').length < 6}
                                className="w-full h-11 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold rounded-xl disabled:opacity-50 disabled:pointer-events-none transition-all"
                            >
                                {loading ? 'Verifying...' : 'Verify Code'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                    <input
                                        type={showPass ? 'text' : 'password'}
                                        placeholder="Enter new password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full h-12 rounded-xl border border-slate-300 bg-white px-3.5 py-2 pl-10 pr-10 text-sm text-slate-900 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all"
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass((v) => !v)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                                    >
                                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                    <input
                                        type={showPass ? 'text' : 'password'}
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full h-12 rounded-xl border border-slate-300 bg-white px-3.5 py-2 pl-10 text-sm text-slate-900 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-11 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold rounded-xl disabled:opacity-50 disabled:pointer-events-none transition-all"
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    )}
                </div>

                <div className="text-center mt-5">
                    <button
                        onClick={() => navigate(createPageUrl('Login'))}
                        className="text-sm text-slate-500 hover:text-slate-700"
                    >
                        Back to Login
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
