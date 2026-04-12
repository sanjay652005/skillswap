import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/app/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0a0a0f', fontFamily: 'DM Sans, sans-serif' }}>
      <style>{`
        .auth-input {
          width: 100%; padding: 11px 14px; border-radius: 10px;
          background: #1a1a26 !important; border: 1px solid #2a2a3d;
          color: #e2e8f0 !important; font-size: 0.9rem; font-family: 'DM Sans', sans-serif;
          outline: none; transition: border-color 0.2s; box-sizing: border-box;
        }
        .auth-input:focus { border-color: #6d28d9; }
        .auth-input:-webkit-autofill,
        .auth-input:-webkit-autofill:hover,
        .auth-input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px #1a1a26 inset !important;
          -webkit-text-fill-color: #e2e8f0 !important;
        }
      `}</style>

      {/* ── Left Panel ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 48px', position: 'relative', overflow: 'hidden',
        borderRight: '1px solid #1a1a26'
      }} className="hide-mobile">
        {/* Background glow */}
        <div style={{ position: 'absolute', top: '30%', left: '20%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(109,40,217,0.12) 0%, transparent 70%)', pointerEvents: 'none' }}/>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '60px' }}>
          <div style={{ width: 36, height: 36, borderRadius: '9px', background: 'linear-gradient(135deg,#6d28d9,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(109,40,217,0.4)' }}>
            <span style={{ color: 'white', fontWeight: 800, fontSize: '0.9rem' }}>S</span>
          </div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.2rem', background: 'linear-gradient(135deg,#a78bfa,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SkillSwap</span>
        </div>

        {/* Headline */}
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '20px', color: '#e2e8f0' }}>
          Learn without<br/>
          <span style={{ background: 'linear-gradient(135deg,#a78bfa,#6d28d9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>spending money.</span>
        </h1>
        <p style={{ color: '#4b5563', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '40px', maxWidth: '380px' }}>
          Exchange your skills with real developers. Teach what you know. Learn what you need.
        </p>

        {/* Benefits */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '40px' }}>
          {[
            'Learn from real developers, not pre-recorded videos',
            'Build real projects with actual collaborators',
            'Grow your network while growing your skills',
          ].map(b => (
            <div key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <span style={{ color: '#6d28d9', fontSize: '1rem', marginTop: '1px', flexShrink: 0 }}>✓</span>
              <span style={{ color: '#6b7280', fontSize: '0.875rem', lineHeight: 1.5 }}>{b}</span>
            </div>
          ))}
        </div>

        {/* Social proof */}
        <div style={{ padding: '14px 16px', borderRadius: '10px', background: 'rgba(109,40,217,0.08)', border: '1px solid rgba(109,40,217,0.2)', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.1rem' }}>⚡</span>
          <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>
            No subscriptions. No fees. <span style={{ color: '#a78bfa', fontWeight: 600 }}>100% free forever.</span>
          </span>
        </div>
      </div>

      {/* ── Right Panel (Form) ── */}
      <div style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 40px', background: '#0d0d14' }}>
        {/* Mobile logo */}
        <div style={{ display: 'none', textAlign: 'center', marginBottom: '28px' }} className="show-mobile">
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.3rem', background: 'linear-gradient(135deg,#a78bfa,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SkillSwap</span>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.6rem', color: '#e2e8f0', marginBottom: '6px' }}>Welcome back 👋</h2>
          <p style={{ color: '#4b5563', fontSize: '0.85rem' }}>Continue your learning journey</p>
        </div>

        {error && (
          <div style={{ marginBottom: '16px', padding: '12px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Google Sign In */}
          <button type="button" onClick={() => {
            const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
            window.location.href = `${API}/auth/google`;
          }} style={{
            width: '100%', padding: '12px', borderRadius: '10px',
            border: '1px solid #2a2a3d', background: '#1a1a26',
            color: '#e2e8f0', fontWeight: 600, fontSize: '0.9rem',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '10px', fontFamily: 'DM Sans, sans-serif',
            transition: 'border-color 0.2s'
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#6d28d9'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a3d'}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1, height: '1px', background: '#2a2a3d' }}/>
            <span style={{ color: '#4b5563', fontSize: '0.78rem' }}>or sign in with email</span>
            <div style={{ flex: 1, height: '1px', background: '#2a2a3d' }}/>
          </div>
          <div>
            <label style={{ display: 'block', color: '#6b7280', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '6px' }}>EMAIL</label>
            <input className="auth-input" type="email" placeholder="you@example.com"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ color: '#6b7280', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.08em' }}>PASSWORD</label>
            </div>
            <input className="auth-input" type="password" placeholder="••••••••"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '13px', borderRadius: '10px', border: 'none',
            background: loading ? '#3d3d52' : 'linear-gradient(135deg,#6d28d9,#8b5cf6)',
            color: 'white', fontWeight: 700, fontSize: '0.95rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 0 24px rgba(109,40,217,0.35)',
            fontFamily: 'DM Sans, sans-serif', marginTop: '4px'
          }}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#4b5563', marginTop: '20px' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: 600 }}>Create one free</Link>
        </p>

        <div style={{ marginTop: '16px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(109,40,217,0.08)', border: '1px solid rgba(109,40,217,0.18)', fontSize: '0.78rem', color: '#6b7280' }}>
          💡 <strong style={{ color: '#a78bfa' }}>Demo:</strong> Register a new account to get started immediately.
        </div>

        <Link to="/" style={{ display: 'block', textAlign: 'center', marginTop: '24px', color: '#3d3d52', fontSize: '0.8rem', textDecoration: 'none' }}>
          ← Back to home
        </Link>
      </div>
    </div>
  );
}