import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { setToken } from '@/api/client';

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field) => (e) => {
    setFormData((p) => ({ ...p, [field]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!formData.email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!formData.password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Signup failed (${res.status})`);
      }

      // Store the token so the user is automatically logged in
      if (data.token) {
        setToken(data.token);
      }

      toast.success('Account created successfully!');
      navigate(createPageUrl('Home'), { replace: true });
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Network error — please check your connection and try again.');
      } else {
        setError(err.message || 'Signup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
      style={{ background: 'linear-gradient(135deg,#050818 0%,#0a0f2e 50%,#0d0520 100%)' }}>
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Create an Account</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={set('name')}
          className="w-full mb-4 p-2 border rounded"
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={set('email')}
          className="w-full mb-4 p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={set('password')}
          className="w-full mb-4 p-2 border rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
}