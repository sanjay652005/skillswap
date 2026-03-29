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
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0a0a0f', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        .auth-input {
          width: 100%; padding: 13px 16px; border-radius: 10px;
          background: #1a1a26; border: 1px solid #2a2a3d;
          color: #e2e8f0; font-size: 0.92rem; font-family: 'DM Sans', sans-serif;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box; appearance: none;
        }
        .auth-input:focus { border-color: #6d28d9; box-shadow: 0 0 0 3px rgba(109,40,217,0.15); }
        .auth-input::placeholder { color: #3d3d52; }
        .auth-input:-webkit-autofill,
        .auth-input:-webkit-autofill:hover,
        .auth-input:-webkit-autofill:focus,
        .auth-input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px #1a1a26 inset !important;
          -webkit-text-fill-color: #e2e8f0 !important;
          caret-color: #e2e8f0 !important;
          border-color: #2a2a3d !important;
          transition: background-color 9999s ease-in-out 0s;
        }
        .auth-btn { transition: all 0.2s; }
        .auth-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 0 32px rgba(109,40,217,0.5) !important; }
      `}</style>

      {/* Left panel — branding (desktop only) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 48px', background: 'linear-gradient(135deg, #0d0d16, #12121a)', borderRight: '1px solid #1e1e2e', position: 'relative', overflow: 'hidden' }}
        className="hide-on-mobile">
        {/* Glow */}
        <div style={{ position: 'absolute', top: '30%', left: '30%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(109,40,217,0.12) 0%, transparent 65%)', pointerEvents: 'none' }}/>

        <div style={{ position: 'relative', maxWidth: '360px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '48px' }}>
            <div style={{ width: 36, height: 36, borderRadius: '9px', background: 'linear-gradient(135deg,#6d28d9,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(109,40,217,0.4)' }}>
              <span style={{ color: 'white', fontWeight: 800, fontSize: '0.9rem' }}>S</span>
            </div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.2rem', background: 'linear-gradient(135deg,#a78bfa,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SkillSwap</span>
          </div>

          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '2rem', fontWeight: 800, color: '#e2e8f0', lineHeight: 1.2, marginBottom: '16px' }}>
            Learn without<br/>spending money.
          </h2>
          <p style={{ color: '#4b5563', lineHeight: 1.8, fontSize: '0.92rem', marginBottom: '36px' }}>
            Exchange your skills with real developers. Teach what you know. Learn what you need.
          </p>

          {[
            { icon: '🎯', text: 'AI matches you with the right partner' },
            { icon: '💬', text: 'Real-time workspace with AI tools' },
            { icon: '🏆', text: 'Build your reputation as you grow' },
          ].map(item => (
            <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{item.icon}</span>
              <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', minHeight: '100vh' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>

          {/* Mobile logo */}
          <div style={{ textAlign: 'center', marginBottom: '32px', display: 'none' }} className="show-on-mobile">
            <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'linear-gradient(135deg,#6d28d9,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 0 24px rgba(109,40,217,0.4)' }}>
              <span style={{ color: 'white', fontWeight: 800 }}>S</span>
            </div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.4rem', background: 'linear-gradient(135deg,#a78bfa,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SkillSwap</h1>
          </div>

          <div style={{ background: '#12121a', border: '1px solid #2a2a3d', borderRadius: '18px', padding: '36px 32px', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
            <h2 style={{ color: '#e2e8f0', fontWeight: 800, fontSize: '1.4rem', marginBottom: '6px', fontFamily: 'Syne, sans-serif' }}>Welcome back</h2>
            <p style={{ color: '#4b5563', fontSize: '0.83rem', marginBottom: '28px' }}>Sign in to your SkillSwap account</p>

            {error && (
              <div style={{ marginBottom: '18px', padding: '12px 14px', borderRadius: '9px', background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', fontSize: '0.84rem' }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: '#6b7280', fontSize: '0.8rem', marginBottom: '7px', fontWeight: 600, letterSpacing: '0.03em' }}>EMAIL</label>
                <input className="auth-input" type="email" placeholder="you@example.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div style={{ marginBottom: '26px' }}>
                <label style={{ display: 'block', color: '#6b7280', fontSize: '0.8rem', marginBottom: '7px', fontWeight: 600, letterSpacing: '0.03em' }}>PASSWORD</label>
                <input className="auth-input" type="password" placeholder="••••••••"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
              </div>
              <button type="submit" disabled={loading} className="auth-btn" style={{
                width: '100%', padding: '14px', borderRadius: '10px', border: 'none',
                background: loading ? '#2a2a3d' : 'linear-gradient(135deg,#6d28d9,#8b5cf6)',
                color: loading ? '#6b7280' : 'white', fontWeight: 700, fontSize: '0.95rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 0 28px rgba(109,40,217,0.35)',
                fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.02em'
              }}>
                {loading ? 'Signing in...' : 'Sign In →'}
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: '0.84rem', color: '#4b5563', marginTop: '20px' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: 700 }}>Create one free</Link>
            </p>
          </div>

          <div style={{ marginTop: '16px', padding: '12px 16px', borderRadius: '10px', background: 'rgba(109,40,217,0.06)', border: '1px solid rgba(109,40,217,0.15)', fontSize: '0.78rem', color: '#6b7280', textAlign: 'center' }}>
            💡 <strong style={{ color: '#a78bfa' }}>New here?</strong> Register a free account — no credit card needed.
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hide-on-mobile { display: none !important; }
          .show-on-mobile { display: block !important; }
        }
        @media (min-width: 769px) {
          .show-on-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
}