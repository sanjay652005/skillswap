import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0a0a0f' }}>
      <div className="animated-bg" />
      <div className="w-full max-w-md fade-in">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #6d28d9, #8b5cf6)', boxShadow: '0 0 40px rgba(109,40,217,0.4)' }}>
            <span className="text-white font-bold text-xl">SE</span>
          </div>
          <h1 className="font-display text-3xl font-bold gradient-text">SkillSwap</h1>
          <p className="text-sm mt-2" style={{ color: '#6b7280' }}>Developer Collaboration Platform</p>
        </div>

        <div className="glass p-8">
          <h2 className="font-display text-xl font-semibold mb-6" style={{ color: '#e2e8f0' }}>Welcome back</h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-2" style={{ color: '#94a3b8' }}>Email</label>
              <input className="input" type="email" placeholder="you@example.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm mb-2" style={{ color: '#94a3b8' }}>Password</label>
              <input className="input" type="password" placeholder="••••••••" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button className="btn-primary w-full mt-2" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: '#6b7280' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#a78bfa' }} className="hover:underline">Create one</Link>
          </p>

          {/* Demo hint */}
          <div className="mt-4 p-3 rounded-lg text-xs" style={{ background: 'rgba(109,40,217,0.1)', border: '1px solid rgba(109,40,217,0.2)', color: '#a78bfa' }}>
            💡 <strong>Demo:</strong> Register a new account to get started immediately.
          </div>
        </div>
      </div>
    </div>
  );
}
