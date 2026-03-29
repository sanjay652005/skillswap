import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

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
      const res = await api.post('/auth/login', form);
      login(res.data.token, res.data.user);
      navigate('/app/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#0a0a0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      overflowY: 'auto',
    }}>
      {/* bg orb left */}
      <div style={{
        position: 'fixed', top: '15%', left: '5%',
        width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(139,92,246,0.13) 0%, transparent 65%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      {/* bg orb right */}
      <div style={{
        position: 'fixed', bottom: '10%', right: '5%',
        width: 350, height: 350,
        background: 'radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 65%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      {/* Card — hard maxWidth so it never stretches */}
      <div style={{
        width: '420px',
        maxWidth: 'calc(100vw - 40px)',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 52, height: 52, borderRadius: 14,
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            marginBottom: 16,
          }}>
            <span style={{ fontSize: 22 }}>⇄</span>
          </div>
          <h1 style={{
            fontSize: 26, fontWeight: 700, color: '#fff',
            margin: '0 0 6px', letterSpacing: '-0.3px',
          }}>
            Welcome back
          </h1>
          <p style={{ color: '#888', fontSize: 14, margin: 0 }}>
            Sign in to SkillSwap
          </p>
        </div>

        {/* Form box */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 18,
          padding: '30px 26px',
        }}>
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 9, padding: '10px 13px',
              marginBottom: 18, color: '#f87171', fontSize: 13,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'block', color: '#888', fontSize: 12, marginBottom: 6, fontWeight: 500, letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                required
                style={{
                  display: 'block',
                  width: '100%',
                  boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 9,
                  padding: '10px 13px',
                  color: '#fff',
                  fontSize: 15,
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div style={{ marginBottom: 22 }}>
              <label style={{ display: 'block', color: '#888', fontSize: 12, marginBottom: 6, fontWeight: 500, letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
                style={{
                  display: 'block',
                  width: '100%',
                  boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 9,
                  padding: '10px 13px',
                  color: '#fff',
                  fontSize: 15,
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'block',
                width: '100%',
                padding: '12px',
                background: loading ? '#4c1d95' : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                border: 'none',
                borderRadius: 9,
                color: '#fff',
                fontSize: 15,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 18, marginBottom: 0, color: '#666', fontSize: 14 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#a78bfa', fontWeight: 500, textDecoration: 'none' }}>
              Create one
            </Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, marginBottom: 0 }}>
          <Link to="/" style={{ color: '#444', textDecoration: 'none' }}>← Back to home</Link>
        </p>
      </div>
    </div>
  );
}