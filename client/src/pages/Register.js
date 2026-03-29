import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SKILL_SUGGESTIONS = ['React', 'Node.js', 'Python', 'TypeScript', 'Go', 'Rust', 'Docker', 'AWS', 'GraphQL', 'MongoDB', 'PostgreSQL', 'Machine Learning', 'DevOps', 'Vue.js', 'Flutter'];

export default function Register() {
  const [step, setStep]   = useState(1);
  const [form, setForm]   = useState({
    name: '', email: '', password: '', bio: '',
    skillsOffered: [], skillsWanted: [],
    availability: 'flexible', githubLink: '', linkedinLink: '', leetcodeLink: ''
  });
  const [skillInput, setSkillInput] = useState({ offered: '', wanted: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate     = useNavigate();

  const addSkill = (type) => {
    const val = skillInput[type].trim();
    if (!val) return;
    const field = type === 'offered' ? 'skillsOffered' : 'skillsWanted';
    if (!form[field].includes(val)) setForm({ ...form, [field]: [...form[field], val] });
    setSkillInput({ ...skillInput, [type]: '' });
  };

  const removeSkill = (type, skill) => {
    const field = type === 'offered' ? 'skillsOffered' : 'skillsWanted';
    setForm({ ...form, [field]: form[field].filter(s => s !== skill) });
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError(''); setLoading(true);
    try {
      await register(form);
      navigate('/app/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  const STEP_LABELS = ['Account', 'Skills', 'Links'];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0a0a0f', fontFamily: 'DM Sans, sans-serif' }}>
      <style>{`
        .reg-input {
          width: 100%; padding: 11px 14px; border-radius: 10px;
          background: #1a1a26 !important; border: 1px solid #2a2a3d;
          color: #e2e8f0 !important; font-size: 0.9rem; font-family: 'DM Sans', sans-serif;
          outline: none; transition: border-color 0.2s; box-sizing: border-box;
        }
        .reg-input:focus { border-color: #6d28d9; }
        .reg-input:-webkit-autofill,
        .reg-input:-webkit-autofill:hover,
        .reg-input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px #1a1a26 inset !important;
          -webkit-text-fill-color: #e2e8f0 !important;
        }
        @media (max-width: 768px) {
          .left-panel { display: none !important; }
          .right-panel { max-width: 100% !important; }
        }
      `}</style>

      {/* ── Left Panel ── */}
      <div className="left-panel" style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 48px', position: 'relative', overflow: 'hidden',
        borderRight: '1px solid #1a1a26'
      }}>
        <div style={{ position: 'absolute', top: '30%', left: '20%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(109,40,217,0.12) 0%, transparent 70%)', pointerEvents: 'none' }}/>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '60px' }}>
          <div style={{ width: 36, height: 36, borderRadius: '9px', background: 'linear-gradient(135deg,#6d28d9,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(109,40,217,0.4)' }}>
            <span style={{ color: 'white', fontWeight: 800, fontSize: '0.9rem' }}>S</span>
          </div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.2rem', background: 'linear-gradient(135deg,#a78bfa,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SkillSwap</span>
        </div>

        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '20px', color: '#e2e8f0' }}>
          Your skills are<br/>
          <span style={{ background: 'linear-gradient(135deg,#a78bfa,#6d28d9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>worth something.</span>
        </h1>
        <p style={{ color: '#4b5563', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '40px', maxWidth: '380px' }}>
          Join SkillSwap and start exchanging skills with real developers. No money needed — just knowledge.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '40px' }}>
          {[
            'Free forever — no subscriptions',
            'AI finds your best match automatically',
            'Start your first exchange in minutes',
          ].map(b => (
            <div key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <span style={{ color: '#6d28d9', fontSize: '1rem', marginTop: '1px', flexShrink: 0 }}>✓</span>
              <span style={{ color: '#6b7280', fontSize: '0.875rem', lineHeight: 1.5 }}>{b}</span>
            </div>
          ))}
        </div>

        <div style={{ padding: '14px 16px', borderRadius: '10px', background: 'rgba(109,40,217,0.08)', border: '1px solid rgba(109,40,217,0.2)', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.1rem' }}>⚡</span>
          <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>
            Joined by <span style={{ color: '#a78bfa', fontWeight: 600 }}>500+</span> developers already learning for free
          </span>
        </div>
      </div>

      {/* ── Right Panel (Form) ── */}
      <div className="right-panel" style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px', background: '#0d0d14', overflowY: 'auto' }}>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
          {STEP_LABELS.map((label, i) => {
            const s = i + 1;
            const isActive = s === step;
            const isDone = s < step;
            return (
              <React.Fragment key={s}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, background: isActive ? 'linear-gradient(135deg,#6d28d9,#8b5cf6)' : isDone ? '#6d28d9' : '#1a1a26', color: isActive || isDone ? 'white' : '#4b5563', border: isActive || isDone ? 'none' : '1px solid #2a2a3d' }}>
                    {isDone ? '✓' : s}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: isActive ? '#e2e8f0' : '#4b5563', fontWeight: isActive ? 600 : 400 }}>{label}</span>
                </div>
                {i < 2 && <div style={{ flex: 1, height: '1px', background: s < step ? '#6d28d9' : '#2a2a3d', maxWidth: '40px' }}/>}
              </React.Fragment>
            );
          })}
        </div>

        {error && (
          <div style={{ marginBottom: '16px', padding: '12px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)', fontSize: '0.83rem' }}>
            {error}
          </div>
        )}

        {/* ── Step 1 ── */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.2rem', color: '#e2e8f0', marginBottom: '4px' }}>Basic Info</h3>
            <div>
              <label style={{ display: 'block', color: '#6b7280', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '6px' }}>FULL NAME *</label>
              <input className="reg-input" placeholder="Jane Developer" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', color: '#6b7280', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '6px' }}>EMAIL *</label>
              <input className="reg-input" type="email" placeholder="jane@example.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', color: '#6b7280', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '6px' }}>PASSWORD *</label>
              <input className="reg-input" type="password" placeholder="Min 6 characters" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', color: '#6b7280', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '6px' }}>BIO <span style={{ color: '#3d3d52', fontWeight: 400 }}>(optional)</span></label>
              <textarea className="reg-input" rows={3} placeholder="Tell other developers about yourself..."
                value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}
                style={{ resize: 'vertical' }} />
            </div>
            <button onClick={() => form.name && form.email && form.password ? setStep(2) : setError('Please fill all required fields')}
              style={{ width: '100%', padding: '13px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#6d28d9,#8b5cf6)', color: 'white', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 0 20px rgba(109,40,217,0.3)', fontFamily: 'DM Sans, sans-serif', marginTop: '4px' }}>
              Continue →
            </button>
          </div>
        )}

        {/* ── Step 2 ── */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.2rem', color: '#e2e8f0', marginBottom: '4px' }}>Your Skills</h3>

            <div>
              <label style={{ display: 'block', color: '#6b7280', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '8px' }}>SKILLS YOU OFFER</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input className="reg-input" style={{ flex: 1 }} placeholder="e.g. React, Python..."
                  value={skillInput.offered} onChange={e => setSkillInput({ ...skillInput, offered: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill('offered'))} />
                <button onClick={() => addSkill('offered')} style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#6d28d9,#8b5cf6)', color: 'white', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.85rem' }}>Add</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                {form.skillsOffered.map(s => (
                  <span key={s} onClick={() => removeSkill('offered', s)} style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '0.75rem', background: 'rgba(109,40,217,0.15)', color: '#a78bfa', border: '1px solid rgba(109,40,217,0.3)', cursor: 'pointer' }}>{s} ×</span>
                ))}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {SKILL_SUGGESTIONS.filter(s => !form.skillsOffered.includes(s)).slice(0, 8).map(s => (
                  <button key={s} onClick={() => setForm({ ...form, skillsOffered: [...form.skillsOffered, s] })}
                    style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '0.72rem', background: '#1a1a26', color: '#4b5563', border: '1px solid #2a2a3d', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>+ {s}</button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: '#6b7280', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '8px' }}>SKILLS YOU WANT TO LEARN</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input className="reg-input" style={{ flex: 1 }} placeholder="e.g. Machine Learning, Go..."
                  value={skillInput.wanted} onChange={e => setSkillInput({ ...skillInput, wanted: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill('wanted'))} />
                <button onClick={() => addSkill('wanted')} style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#6d28d9,#8b5cf6)', color: 'white', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.85rem' }}>Add</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {form.skillsWanted.map(s => (
                  <span key={s} onClick={() => removeSkill('wanted', s)} style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '0.75rem', background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)', cursor: 'pointer' }}>{s} ×</span>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: '#6b7280', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '8px' }}>AVAILABILITY</label>
              <select className="reg-input" value={form.availability} onChange={e => setForm({ ...form, availability: e.target.value })}>
                {['full-time','part-time','weekends','evenings','flexible'].map(a => (
                  <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #2a2a3d', background: 'transparent', color: '#6b7280', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>← Back</button>
              <button onClick={() => setStep(3)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#6d28d9,#8b5cf6)', color: 'white', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 700 }}>Continue →</button>
            </div>
          </div>
        )}

        {/* ── Step 3 ── */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.2rem', color: '#e2e8f0', marginBottom: '4px' }}>Social Links</h3>
              <p style={{ color: '#4b5563', fontSize: '0.78rem' }}>Optional — helps others find and trust you</p>
            </div>
            <div>
              <label style={{ display: 'block', color: '#6b7280', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '6px' }}>GITHUB</label>
              <input className="reg-input" placeholder="https://github.com/username" value={form.githubLink}
                onChange={e => setForm({ ...form, githubLink: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', color: '#6b7280', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '6px' }}>LINKEDIN</label>
              <input className="reg-input" placeholder="https://linkedin.com/in/username" value={form.linkedinLink}
                onChange={e => setForm({ ...form, linkedinLink: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', color: '#6b7280', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '6px' }}>LEETCODE</label>
              <input className="reg-input" placeholder="https://leetcode.com/username" value={form.leetcodeLink}
                onChange={e => setForm({ ...form, leetcodeLink: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button onClick={() => setStep(2)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #2a2a3d', background: 'transparent', color: '#6b7280', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>← Back</button>
              <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, padding: '12px', borderRadius: '10px', border: 'none', background: loading ? '#3d3d52' : 'linear-gradient(135deg,#6d28d9,#8b5cf6)', color: 'white', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 700, boxShadow: loading ? 'none' : '0 0 20px rgba(109,40,217,0.3)' }}>
                {loading ? 'Creating...' : '🚀 Create Account'}
              </button>
            </div>
          </div>
        )}

        <p style={{ textAlign: 'center', fontSize: '0.82rem', color: '#4b5563', marginTop: '24px' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
        </p>
        <Link to="/" style={{ display: 'block', textAlign: 'center', marginTop: '12px', color: '#3d3d52', fontSize: '0.8rem', textDecoration: 'none' }}>
          ← Back to home
        </Link>
      </div>
    </div>
  );
}