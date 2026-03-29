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
        /* FIX 6 — button micro interactions */
        .auth-btn { transition: all 0.2s; }
        .auth-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 0 36px rgba(109,40,217,0.55) !important;
        }
        .auth-btn:active:not(:disabled) {
          transform: translateY(0px) scale(0.98);
          box-shadow: 0 0 16px rgba(109,40,217,0.3) !important;
        }
        .forgot-link { color: #4b5563; font-size: 0.8rem; text-decoration: none; transition: color 0.15s; }
        .forgot-link:hover { color: #a78bfa; }
        .google-btn { transition: all 0.2s; }
        .google-btn:hover { background: #1e1e2e !important; border-color: #3d3d52 !important; transform: translateY(-1px); }
        @media (max-width: 768px) {
          .hide-on-mobile { display: none !important; }
          .show-on-mobile { display: block !important; }
        }
        @media (min-width: 769px) {
          .show-on-mobile { display: none !important; }
        }
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

          {/* FIX 3 — stronger benefits with checkmarks */}
          {[
            { icon: '✔', text: 'Learn from real developers, not pre-recorded videos' },
            { icon: '✔', text: 'Build real projects with actual collaborators' },
            { icon: '✔', text: 'Grow your network while growing your skills' },
            { icon: '🔒', text: 'Your data is secure. No spam. No hidden fees.' },
          ].map(item => (
            <div key={item.text} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
              <span style={{ fontSize: item.icon === '✔' ? '0.85rem' : '1rem', flexShrink: 0, color: item.icon === '✔' ? '#7c3aed' : '#6b7280', marginTop: item.icon === '✔' ? '3px' : '0', fontWeight: 700 }}>{item.icon}</span>
              <p style={{ color: item.icon === '✔' ? '#9ca3af' : '#4b5563', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>{item.text}</p>
            </div>
          ))}

          {/* FIX 4 — trust signal */}
          <div style={{ marginTop: '32px', padding: '12px 16px', borderRadius: '10px', background: 'rgba(109,40,217,0.06)', border: '1px solid rgba(109,40,217,0.12)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1rem' }}>⚡</span>
            <p style={{ color: '#6b7280', fontSize: '0.8rem', margin: 0 }}>
              Joined by <strong style={{ color: '#a78bfa' }}>500+</strong> developers already learning for free
            </p>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      {/* FIX 5 — narrower max-width on right panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', minHeight: '100vh' }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>

          {/* Mobile logo */}
          <div style={{ textAlign: 'center', marginBottom: '32px', display: 'none' }} className="show-on-mobile">
            <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'linear-gradient(135deg,#6d28d9,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 0 24px rgba(109,40,217,0.4)' }}>
              <span style={{ color: 'white', fontWeight: 800 }}>S</span>
            </div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.4rem', background: 'linear-gradient(135deg,#a78bfa,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SkillSwap</h1>
          </div>

          <div style={{ background: '#12121a', border: '1px solid #2a2a3d', borderRadius: '18px', padding: '36px 32px', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>

            {/* FIX 1 — emotional headline */}
            <h2 style={{ color: '#e2e8f0', fontWeight: 800, fontSize: '1.4rem', marginBottom: '4px', fontFamily: 'Syne, sans-serif' }}>
              Welcome back 👋
            </h2>
            <p style={{ color: '#4b5563', fontSize: '0.83rem', marginBottom: '28px' }}>
              Continue your learning journey
            </p>

            {error && (
              <div style={{ marginBottom: '18px', padding: '12px 14px', borderRadius: '9px', background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', fontSize: '0.84rem' }}>
                ⚠️ {error}
              </div>
            )}

            {/* FIX 8 — Google social login button */}
            <button type="button" className="google-btn" style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#16161f', border: '1px solid #2a2a3d', color: '#9ca3af', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ flex: 1, height: '1px', background: '#1e1e2e' }} />
              <span style={{ color: '#3d3d52', fontSize: '0.78rem' }}>or sign in with email</span>
              <div style={{ flex: 1, height: '1px', background: '#1e1e2e' }} />
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: '#6b7280', fontSize: '0.8rem', marginBottom: '7px', fontWeight: 600, letterSpacing: '0.03em' }}>EMAIL</label>
                <input className="auth-input" type="email" placeholder="you@example.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '7px' }}>
                  <label style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.03em' }}>PASSWORD</label>
                  {/* FIX 7 — forgot password */}
                  <a href="#" className="forgot-link">Forgot password?</a>
                </div>
                <input className="auth-input" type="password" placeholder="••••••••"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
              </div>

              {/* FIX 4 — trust signal under password */}
              <p style={{ color: '#3d3d52', fontSize: '0.75rem', marginBottom: '22px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span>🔒</span> Secure login · No spam · No hidden fees
              </p>

              {/* FIX 2 — better CTA text */}
              <button type="submit" disabled={loading} className="auth-btn" style={{
                width: '100%', padding: '14px', borderRadius: '10px', border: 'none',
                background: loading ? '#2a2a3d' : 'linear-gradient(135deg,#6d28d9,#8b5cf6)',
                color: loading ? '#6b7280' : 'white', fontWeight: 700, fontSize: '0.95rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 0 28px rgba(109,40,217,0.35)',
                fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.02em'
              }}>
                {loading ? 'Signing in...' : 'Continue Learning →'}
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: '0.84rem', color: '#4b5563', marginTop: '20px', marginBottom: 0 }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: 700 }}>Create one free</Link>
            </p>
          </div>

          <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.75rem', color: '#3d3d52' }}>
            <Link to="/" style={{ color: '#3d3d52', textDecoration: 'none' }}>← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}