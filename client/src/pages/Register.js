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

  const inp = {
    display: 'block', width: '100%', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 9, padding: '10px 13px',
    color: '#fff', fontSize: 15, outline: 'none',
    fontFamily: 'inherit', marginBottom: 14,
  };

  const lbl = {
    display: 'block', color: '#777', fontSize: 11,
    marginBottom: 6, fontWeight: 600,
    letterSpacing: '0.5px', textTransform: 'uppercase',
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#0a0a0f',
      zIndex: 9999,
      display: 'table',
      width: '100%',
      height: '100%',
    }}>
      {/* bg orbs */}
      <div style={{ position: 'fixed', top: '10%', right: '8%', width: 380, height: 380, background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '15%', left: '5%', width: 280, height: 280, background: 'radial-gradient(circle, rgba(99,102,241,0.09) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{
        display: 'table-cell',
        verticalAlign: 'middle',
        textAlign: 'center',
        padding: '20px',
      }}>
        <div style={{
          display: 'inline-block',
          width: '460px',
          maxWidth: '100%',
          textAlign: 'left',
          position: 'relative',
          zIndex: 1,
        }}>

          {/* Logo + title */}
          <div style={{ textAlign: 'center', marginBottom: 22 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 48, height: 48, borderRadius: 13,
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              marginBottom: 12,
            }}>
              <span style={{ fontSize: 20 }}>⇄</span>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: '0 0 5px', letterSpacing: '-0.3px' }}>
              Join SkillSwap
            </h1>
            <p style={{ color: '#888', fontSize: 13, margin: 0 }}>Learn any skill without paying money</p>
          </div>

          {/* Step indicators */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginBottom: 20 }}>
            {STEPS.map((s, i) => (
              <React.Fragment key={s}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: i < step ? '#7c3aed' : i === step ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.07)',
                    border: i === step ? '1.5px solid #7c3aed' : '1.5px solid transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, color: '#fff', fontWeight: 600,
                  }}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span style={{ fontSize: 12, color: i === step ? '#a78bfa' : '#555', fontWeight: i === step ? 500 : 400 }}>
                    {s}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ width: 22, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Form card */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 18,
            padding: '26px 26px',
          }}>
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 9, padding: '10px 13px', marginBottom: 16,
                color: '#f87171', fontSize: 13,
              }}>{error}</div>
            )}

            {/* Step 0 */}
            {step === 0 && (
              <>
                <label style={lbl}>Full Name</label>
                <input style={inp} value={form.name} onChange={e => update('name', e.target.value)} placeholder="Sanjay Kumar" />
                <label style={lbl}>Email</label>
                <input style={inp} type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@example.com" />
                <label style={lbl}>Password</label>
                <input style={{ ...inp, marginBottom: 0 }} type="password" value={form.password} onChange={e => update('password', e.target.value)} placeholder="Min. 6 characters" />
              </>
            )}

            {/* Step 1 */}
            {step === 1 && (
              <>
                <label style={lbl}>Bio</label>
                <textarea style={{ ...inp, resize: 'vertical', minHeight: 72 }} value={form.bio} onChange={e => update('bio', e.target.value)} placeholder="Tell others about yourself..." />
                <label style={lbl}>Availability</label>
                <select style={{ ...inp, cursor: 'pointer' }} value={form.availability} onChange={e => update('availability', e.target.value)}>
                  <option value="weekdays">Weekdays</option>
                  <option value="weekends">Weekends</option>
                  <option value="evenings">Evenings</option>
                  <option value="flexible">Flexible</option>
                </select>
                <label style={lbl}>GitHub (optional)</label>
                <input style={inp} value={form.githubLink} onChange={e => update('githubLink', e.target.value)} placeholder="https://github.com/username" />
                <label style={lbl}>LinkedIn (optional)</label>
                <input style={{ ...inp, marginBottom: 0 }} value={form.linkedinLink} onChange={e => update('linkedinLink', e.target.value)} placeholder="https://linkedin.com/in/username" />
              </>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <>
                <label style={lbl}>Skills I Can Teach</label>
                <input style={inp} value={form.skillsOffered} onChange={e => update('skillsOffered', e.target.value)} placeholder="React, Node.js, Python (comma separated)" />
                <label style={lbl}>Skills I Want to Learn</label>
                <input style={{ ...inp, marginBottom: 6 }} value={form.skillsWanted} onChange={e => update('skillsWanted', e.target.value)} placeholder="UI/UX, Machine Learning, Docker" />
                <p style={{ color: '#555', fontSize: 12, margin: 0 }}>Separate multiple skills with commas</p>
              </>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              {step > 0 && (
                <button onClick={() => setStep(s => s - 1)} style={{
                  flex: 1, padding: '11px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 9, color: '#aaa', fontSize: 14,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  Back
                </button>
              )}
              {step < 2 ? (
                <button onClick={() => setStep(s => s + 1)} style={{
                  flex: 1, padding: '11px',
                  background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                  border: 'none', borderRadius: 9,
                  color: '#fff', fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  Continue →
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={loading} style={{
                  flex: 1, padding: '11px',
                  background: loading ? '#4c1d95' : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                  border: 'none', borderRadius: 9,
                  color: '#fff', fontSize: 14, fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                }}>
                  {loading ? 'Creating account...' : 'Start Learning Free →'}
                </button>
              )}
            </div>
          </div>

          <p style={{ textAlign: 'center', marginTop: 16, color: '#666', fontSize: 14, marginBottom: 0 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#a78bfa', fontWeight: 500, textDecoration: 'none' }}>Sign in</Link>
          </p>
          <p style={{ textAlign: 'center', marginTop: 8, fontSize: 13, marginBottom: 0 }}>
            <Link to="/" style={{ color: '#444', textDecoration: 'none' }}>← Back to home</Link>
          </p>

        </div>
      </div>
    </div>
  );
}