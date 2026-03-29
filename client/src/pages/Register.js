import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const STEPS = ['Account', 'Profile', 'Skills'];

export default function Register() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    bio: '', availability: 'weekends',
    skillsOffered: '', skillsWanted: '',
    githubLink: '', linkedinLink: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const update = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        skillsOffered: form.skillsOffered.split(',').map(s => s.trim()).filter(Boolean),
        skillsWanted: form.skillsWanted.split(',').map(s => s.trim()).filter(Boolean),
      };
      const res = await api.post('/auth/register', payload);
      login(res.data.token, res.data.user);
      navigate('/app/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10, padding: '11px 14px',
    color: '#ffffff', fontSize: 15,
    outline: 'none', marginBottom: 16,
    transition: 'border-color 0.2s',
  };

  const labelStyle = {
    display: 'block', color: '#a0a0b0',
    fontSize: 13, marginBottom: 6, fontWeight: 500,
  };

  const textareaStyle = {
    ...inputStyle,
    resize: 'vertical', minHeight: 80,
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
    }}>
      {/* Background orbs */}
      <div style={{
        position: 'fixed', top: '15%', right: '10%',
        width: 350, height: 350,
        background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 48, height: 48, borderRadius: 13,
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            marginBottom: 14,
          }}>
            <span style={{ fontSize: 22 }}>⇄</span>
          </div>
          <h1 style={{
            fontSize: 26, fontWeight: 700, color: '#ffffff',
            margin: '0 0 5px', fontFamily: 'Syne, sans-serif',
          }}>Join SkillSwap</h1>
          <p style={{ color: '#a0a0b0', fontSize: 14, margin: 0 }}>
            Learn any skill without paying money
          </p>
        </div>

        {/* Step indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                opacity: i <= step ? 1 : 0.4,
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: i < step ? '#7c3aed' : i === step ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.1)',
                  border: i === step ? '2px solid #7c3aed' : '2px solid transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, color: '#fff', fontWeight: 600,
                }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 13, color: i === step ? '#a78bfa' : '#666' }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ width: 24, height: 1, background: 'rgba(255,255,255,0.1)' }} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          padding: '28px 28px',
          backdropFilter: 'blur(10px)',
        }}>
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 10, padding: '11px 14px', marginBottom: 18,
              color: '#f87171', fontSize: 14,
            }}>
              {error}
            </div>
          )}

          {/* Step 0 — Account */}
          {step === 0 && (
            <div>
              <label style={labelStyle}>Full Name</label>
              <input style={inputStyle} value={form.name} onChange={e => update('name', e.target.value)}
                placeholder="Sanjay Kumar"
                onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />

              <label style={labelStyle}>Email</label>
              <input style={inputStyle} type="email" value={form.email} onChange={e => update('email', e.target.value)}
                placeholder="you@example.com"
                onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />

              <label style={labelStyle}>Password</label>
              <input style={{ ...inputStyle, marginBottom: 0 }} type="password" value={form.password} onChange={e => update('password', e.target.value)}
                placeholder="Min. 6 characters"
                onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
            </div>
          )}

          {/* Step 1 — Profile */}
          {step === 1 && (
            <div>
              <label style={labelStyle}>Bio</label>
              <textarea style={textareaStyle} value={form.bio} onChange={e => update('bio', e.target.value)}
                placeholder="Tell others about yourself..."
                onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />

              <label style={labelStyle}>Availability</label>
              <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.availability}
                onChange={e => update('availability', e.target.value)}>
                <option value="weekdays">Weekdays</option>
                <option value="weekends">Weekends</option>
                <option value="evenings">Evenings</option>
                <option value="flexible">Flexible</option>
              </select>

              <label style={labelStyle}>GitHub (optional)</label>
              <input style={inputStyle} value={form.githubLink} onChange={e => update('githubLink', e.target.value)}
                placeholder="https://github.com/username"
                onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />

              <label style={{ ...labelStyle, marginBottom: 6 }}>LinkedIn (optional)</label>
              <input style={{ ...inputStyle, marginBottom: 0 }} value={form.linkedinLink} onChange={e => update('linkedinLink', e.target.value)}
                placeholder="https://linkedin.com/in/username"
                onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
            </div>
          )}

          {/* Step 2 — Skills */}
          {step === 2 && (
            <div>
              <label style={labelStyle}>Skills I Can Teach</label>
              <input style={inputStyle} value={form.skillsOffered} onChange={e => update('skillsOffered', e.target.value)}
                placeholder="React, Node.js, Python (comma separated)"
                onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />

              <label style={labelStyle}>Skills I Want to Learn</label>
              <input style={{ ...inputStyle, marginBottom: 0 }} value={form.skillsWanted} onChange={e => update('skillsWanted', e.target.value)}
                placeholder="UI/UX, Machine Learning, Docker"
                onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />

              <p style={{ color: '#666', fontSize: 13, marginTop: 12 }}>
                Separate multiple skills with commas
              </p>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} style={{
                flex: 1, padding: '11px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 10, color: '#a0a0b0',
                fontSize: 15, cursor: 'pointer',
              }}>
                Back
              </button>
            )}
            {step < 2 ? (
              <button onClick={() => setStep(s => s + 1)} style={{
                flex: 1, padding: '11px',
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                border: 'none', borderRadius: 10,
                color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer',
              }}>
                Continue →
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} style={{
                flex: 1, padding: '11px',
                background: loading ? 'rgba(139,92,246,0.5)' : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                border: 'none', borderRadius: 10,
                color: '#fff', fontSize: 15, fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}>
                {loading ? 'Creating account...' : 'Start Learning Free'}
              </button>
            )}
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 18, color: '#555', fontSize: 14 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#a78bfa', fontWeight: 500, textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>

        <p style={{ textAlign: 'center', marginTop: 10, fontSize: 13 }}>
          <Link to="/" style={{ color: '#555', textDecoration: 'none' }}>← Back to home</Link>
        </p>
      </div>
    </div>
  );
}