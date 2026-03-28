import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SKILL_SUGGESTIONS = ['React', 'Node.js', 'Python', 'TypeScript', 'Go', 'Rust', 'Docker', 'AWS', 'GraphQL', 'MongoDB', 'PostgreSQL', 'Machine Learning', 'DevOps', 'Vue.js', 'Flutter'];

export default function Register() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', email: '', password: '', bio: '',
    skillsOffered: [], skillsWanted: [],
    availability: 'flexible', githubLink: '', linkedinLink: '', leetcodeLink: ''
  });
  const [skillInput, setSkillInput] = useState({ offered: '', wanted: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

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
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/app/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0a0a0f' }}>
      <div className="animated-bg" />
      <div className="w-full max-w-lg fade-in">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
            style={{ background: 'linear-gradient(135deg, #6d28d9, #8b5cf6)', boxShadow: '0 0 30px rgba(109,40,217,0.4)' }}>
            <span className="text-white font-bold">SE</span>
          </div>
          <h1 className="font-display text-2xl font-bold gradient-text">Join SkillSwap</h1>
        </div>

        <div className="glass p-8">
          {/* Step indicator */}
          <div className="flex gap-2 mb-8">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex-1 h-1 rounded-full transition-all duration-300"
                style={{ background: s <= step ? 'linear-gradient(90deg, #6d28d9, #8b5cf6)' : '#2a2a3d' }} />
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-lg mb-4" style={{ color: '#e2e8f0' }}>Basic Info</h3>
              <div>
                <label className="block text-sm mb-2" style={{ color: '#94a3b8' }}>Full Name *</label>
                <input className="input" placeholder="Jane Developer" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: '#94a3b8' }}>Email *</label>
                <input className="input" type="email" placeholder="jane@example.com" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: '#94a3b8' }}>Password *</label>
                <input className="input" type="password" placeholder="Min 6 characters" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: '#94a3b8' }}>Bio</label>
                <textarea className="input" rows={3} placeholder="Tell other developers about yourself..." value={form.bio}
                  onChange={e => setForm({ ...form, bio: e.target.value })} style={{ resize: 'vertical' }} />
              </div>
              <button className="btn-primary w-full" onClick={() => form.name && form.email && form.password ? setStep(2) : null}>
                Continue →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h3 className="font-display font-semibold text-lg" style={{ color: '#e2e8f0' }}>Your Skills</h3>

              {/* Skills Offered */}
              <div>
                <label className="block text-sm mb-2" style={{ color: '#94a3b8' }}>Skills You Offer</label>
                <div className="flex gap-2 mb-2">
                  <input className="input flex-1" placeholder="e.g. React, Python..." value={skillInput.offered}
                    onChange={e => setSkillInput({ ...skillInput, offered: e.target.value })}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill('offered'))} />
                  <button className="btn-primary px-4" onClick={() => addSkill('offered')}>Add</button>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.skillsOffered.map(s => (
                    <span key={s} className="skill-tag cursor-pointer" onClick={() => removeSkill('offered', s)}>
                      {s} ×
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  {SKILL_SUGGESTIONS.filter(s => !form.skillsOffered.includes(s)).slice(0, 8).map(s => (
                    <button key={s} onClick={() => setForm({ ...form, skillsOffered: [...form.skillsOffered, s] })}
                      className="text-xs px-2 py-1 rounded" style={{ background: '#1a1a26', color: '#6b7280', border: '1px solid #2a2a3d' }}>
                      + {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skills Wanted */}
              <div>
                <label className="block text-sm mb-2" style={{ color: '#94a3b8' }}>Skills You Want to Learn</label>
                <div className="flex gap-2 mb-2">
                  <input className="input flex-1" placeholder="e.g. Machine Learning, Go..." value={skillInput.wanted}
                    onChange={e => setSkillInput({ ...skillInput, wanted: e.target.value })}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill('wanted'))} />
                  <button className="btn-primary px-4" onClick={() => addSkill('wanted')}>Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.skillsWanted.map(s => (
                    <span key={s} className="skill-tag-green skill-tag cursor-pointer" onClick={() => removeSkill('wanted', s)}>
                      {s} ×
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#94a3b8' }}>Availability</label>
                <select className="input" value={form.availability} onChange={e => setForm({ ...form, availability: e.target.value })}>
                  {['full-time', 'part-time', 'weekends', 'evenings', 'flexible'].map(a => (
                    <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button className="btn-secondary flex-1" onClick={() => setStep(1)}>← Back</button>
                <button className="btn-primary flex-1" onClick={() => setStep(3)}>Continue →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-lg" style={{ color: '#e2e8f0' }}>Social Links <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>(optional)</span></h3>
              <div>
                <label className="block text-sm mb-2" style={{ color: '#94a3b8' }}>GitHub</label>
                <input className="input" placeholder="https://github.com/username" value={form.githubLink}
                  onChange={e => setForm({ ...form, githubLink: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: '#94a3b8' }}>LinkedIn</label>
                <input className="input" placeholder="https://linkedin.com/in/username" value={form.linkedinLink}
                  onChange={e => setForm({ ...form, linkedinLink: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: '#94a3b8' }}>LeetCode</label>
                <input className="input" placeholder="https://leetcode.com/username" value={form.leetcodeLink}
                  onChange={e => setForm({ ...form, leetcodeLink: e.target.value })} />
              </div>
              <div className="flex gap-3 mt-2">
                <button className="btn-secondary flex-1" onClick={() => setStep(2)}>← Back</button>
                <button className="btn-primary flex-1" onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Creating...' : '🚀 Create Account'}
                </button>
              </div>
            </div>
          )}

          <p className="text-center text-sm mt-6" style={{ color: '#6b7280' }}>
            Already have an account? <Link to="/login" style={{ color: '#a78bfa' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}