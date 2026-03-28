import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const LEVELS    = ['Beginner', 'Intermediate', 'Advanced'];
const TIMEFRAMES = ['2 weeks', '1 month', '2 months', '3 months', '6 months'];
const RESOURCE_ICONS = { video:'🎬', docs:'📚', course:'🎓', article:'📄', book:'📖' };
const PHASE_COLORS = ['#6d28d9','#0891b2','#059669','#d97706','#dc2626'];

const POPULAR_GOALS = [
  'React', 'Node.js', 'Python', 'TypeScript', 'Docker',
  'GraphQL', 'AWS', 'Machine Learning', 'Rust', 'Go',
  'Kubernetes', 'Flutter', 'PostgreSQL', 'Redis', 'Next.js'
];

const PhaseCard = ({ phase, index, isExpanded, onToggle }) => {
  const color = PHASE_COLORS[index % PHASE_COLORS.length];
  return (
    <div style={{
      border: `1px solid ${isExpanded ? color+'60' : '#2a2a3d'}`,
      borderRadius: '12px', overflow: 'hidden',
      background: isExpanded ? `${color}08` : '#12121a',
      transition: 'all 0.2s'
    }}>
      <button onClick={onToggle} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
        padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer',
        textAlign: 'left'
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
          background: `${color}20`, border: `2px solid ${color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color, fontWeight: 800, fontSize: '0.9rem'
        }}>{phase.phase}</div>
        <div style={{ flex: 1 }}>
          <p style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.9rem' }}>{phase.title}</p>
          <p style={{ color: '#6b7280', fontSize: '0.75rem' }}>⏱ {phase.duration} · {phase.topics?.length} topics</p>
        </div>
        <span style={{ color: '#6b7280', fontSize: '1rem', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'none' }}>▾</span>
      </button>

      {isExpanded && (
        <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Topics */}
          <div>
            <p style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '8px' }}>TOPICS TO COVER</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {phase.topics?.map((t, i) => (
                <span key={i} style={{
                  padding: '4px 10px', borderRadius: '999px', fontSize: '0.78rem',
                  background: `${color}15`, color, border: `1px solid ${color}30`
                }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Resources */}
          {phase.resources?.length > 0 && (
            <div>
              <p style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '8px' }}>RESOURCES</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {phase.resources.map((r, i) => {
                  const url = r.url && r.url.startsWith('http')
                    ? r.url
                    : `https://www.google.com/search?q=${encodeURIComponent(r.title)}`;
                  return (
                    <a key={i} href={url} target="_blank" rel="noreferrer" style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '8px 12px', borderRadius: '8px',
                      background: '#1a1a26', border: '1px solid #2a2a3d',
                      textDecoration: 'none', transition: 'border-color 0.15s'
                    }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = color}
                      onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a3d'}>
                      <span style={{ fontSize: '1rem' }}>{RESOURCE_ICONS[r.type] || '🔗'}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ color: '#e2e8f0', fontSize: '0.82rem', display: 'block' }}>{r.title}</span>
                        <span style={{ color: '#4b5563', fontSize: '0.7rem' }}>{url.replace('https://','').slice(0,50)}</span>
                      </div>
                      <span style={{ color: '#6b7280', fontSize: '0.7rem', background: '#12121a', padding: '2px 6px', borderRadius: '4px', flexShrink: 0 }}>{r.type}</span>
                      <span style={{ color, fontSize: '0.8rem', flexShrink: 0 }}>↗</span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Project */}
          {phase.project && (
            <div style={{
              padding: '12px 14px', borderRadius: '8px',
              background: `${color}10`, border: `1px solid ${color}30`
            }}>
              <p style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '4px' }}>🛠 HANDS-ON PROJECT</p>
              <p style={{ color: '#e2e8f0', fontSize: '0.85rem' }}>{phase.project}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function LearningPath() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    goalSkill: '',
    currentSkills: user?.skillsOffered?.join(', ') || '',
    level: 'Beginner',
    timeframe: '1 month'
  });
  const [path, setPath]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [expanded, setExpanded] = useState({ 0: true });
  const [saved, setSaved]       = useState([]);

  const generate = async () => {
    if (!form.goalSkill.trim()) { setError('Please enter a skill to learn'); return; }
    setLoading(true); setError(''); setPath(null); setExpanded({ 0: true });
    try {
      const res = await api.post('/ai/learning-path', {
        goalSkill: form.goalSkill.trim(),
        currentSkills: form.currentSkills.split(',').map(s => s.trim()).filter(Boolean),
        level: form.level,
        timeframe: form.timeframe
      });
      setPath(res.data);
    } catch (err) {
      setError('Failed to generate path. Please try again.');
    } finally { setLoading(false); }
  };

  const savePath = () => {
    if (!path) return;
    const newSaved = [{ ...path, savedAt: new Date() }, ...saved.slice(0, 4)];
    setSaved(newSaved);
  };

  const togglePhase = (i) => setExpanded(prev => ({ ...prev, [i]: !prev[i] }));

  const exportPDF = () => {
    const printContent = `
      <html><head><title>${path.goal} Learning Path</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 32px; color: #1e293b; max-width: 800px; margin: 0 auto; }
        h1 { color: #5b21b6; font-size: 1.8rem; margin-bottom: 4px; }
        .badge { background: #ede9fe; color: #5b21b6; border-radius: 999px; padding: 2px 10px; font-size: 0.75rem; margin-right: 6px; }
        .summary { color: #475569; margin: 12px 0 24px; line-height: 1.6; }
        .phase { border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin-bottom: 14px; }
        .phase-title { color: #5b21b6; font-weight: bold; font-size: 1rem; margin-bottom: 8px; }
        .label { font-size: 0.75rem; font-weight: 600; color: #64748b; margin: 10px 0 4px; }
        ul { margin: 0; padding-left: 20px; color: #334155; }
        li { margin-bottom: 4px; font-size: 0.875rem; }
        .project { background: #f8f5ff; border-radius: 6px; padding: 8px 12px; color: #5b21b6; font-size: 0.875rem; margin-top: 8px; }
        .tip { background: #f0fdf4; border-radius: 8px; padding: 12px 16px; color: #166534; margin-top: 20px; font-size: 0.875rem; }
        .footer { margin-top: 32px; color: #94a3b8; font-size: 0.75rem; text-align: center; }
      </style></head><body>
      <h1>🗺️ ${path.goal} Roadmap</h1>
      <span class="badge">${path.level}</span><span class="badge">${path.timeframe}</span>
      <p class="summary">${path.summary}</p>
      ${path.phases?.map((p, i) => `
        <div class="phase">
          <div class="phase-title">Phase ${i+1}: ${p.title} · ${p.duration}</div>
          <div class="label">Topics</div>
          <ul>${p.topics?.map(t => `<li>${t}</li>`).join('')}</ul>
          <div class="label">Resources</div>
          <ul>${p.resources?.map(r => `<li><a href="${r.url}">${r.title}</a></li>`).join('')}</ul>
          <div class="project">🛠 Project: ${p.project}</div>
        </div>
      `).join('')}
      ${path.exchangeTip ? `<div class="tip">💡 ${path.exchangeTip}</div>` : ''}
      <div class="footer">Generated by SkillSwap · ${new Date().toLocaleDateString()}</div>
      </body></html>
    `;
    const w = window.open('', '_blank');
    w.document.write(printContent);
    w.document.close();
    w.print();
  };

  return (
    <div style={{ padding: '24px', maxWidth: '860px', margin: '0 auto' }}>
      <div className="slide-up mb-6">
        <h1 className="font-display text-3xl font-bold gradient-text mb-1">🧠 Learning Path</h1>
        <p style={{ color: '#94a3b8' }}>Get a personalized AI-generated roadmap for any skill</p>
      </div>

      {/* Input card */}
      <div className="glass p-5 mb-6 fade-in">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: '6px' }}>What do you want to learn? *</label>
            <input className="input" placeholder="e.g. React, Machine Learning, Docker..."
              value={form.goalSkill}
              onChange={e => setForm({ ...form, goalSkill: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && generate()}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '8px' }}>
              {POPULAR_GOALS.map(g => (
                <button key={g} onClick={() => setForm({ ...form, goalSkill: g })}
                  style={{
                    padding: '3px 9px', borderRadius: '999px', fontSize: '0.72rem',
                    background: form.goalSkill === g ? 'rgba(109,40,217,0.2)' : '#1a1a26',
                    color: form.goalSkill === g ? '#a78bfa' : '#6b7280',
                    border: `1px solid ${form.goalSkill === g ? 'rgba(109,40,217,0.4)' : '#2a2a3d'}`,
                    cursor: 'pointer', transition: 'all 0.15s'
                  }}>{g}</button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: '6px' }}>Your current skills <span style={{ color: '#4b5563' }}>(comma separated)</span></label>
            <input className="input" placeholder="e.g. JavaScript, HTML, CSS"
              value={form.currentSkills}
              onChange={e => setForm({ ...form, currentSkills: e.target.value })}
            />
          </div>

          <div>
            <label style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: '6px' }}>Experience Level</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {LEVELS.map(l => (
                <button key={l} onClick={() => setForm({ ...form, level: l })}
                  style={{
                    flex: 1, padding: '8px', borderRadius: '8px', border: 'none',
                    cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500,
                    background: form.level === l ? 'rgba(109,40,217,0.2)' : '#1a1a26',
                    color: form.level === l ? '#a78bfa' : '#6b7280',
                    outline: `1px solid ${form.level === l ? 'rgba(109,40,217,0.4)' : '#2a2a3d'}`,
                    transition: 'all 0.15s'
                  }}>{l}</button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: '6px' }}>Available Time</label>
            <select className="input" value={form.timeframe} onChange={e => setForm({ ...form, timeframe: e.target.value })}>
              {TIMEFRAMES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {error && <p style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '10px' }}>{error}</p>}

        <button className="btn-primary w-full" onClick={generate} disabled={loading}>
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"/>
              Generating your roadmap...
            </span>
          ) : '🧠 Generate Learning Path'}
        </button>
      </div>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ height: '64px', borderRadius: '12px', background: '#12121a', border: '1px solid #2a2a3d', animation: 'pulse 1.5s infinite' }}/>
          ))}
        </div>
      )}

      {path && !loading && (
        <div className="fade-in">
          <div style={{
            padding: '16px 20px', borderRadius: '12px', marginBottom: '20px',
            background: 'rgba(109,40,217,0.1)', border: '1px solid rgba(109,40,217,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <h2 className="font-display font-bold" style={{ color: '#e2e8f0', fontSize: '1.2rem' }}>{path.goal} Roadmap</h2>
                  <span style={{ background: 'rgba(109,40,217,0.2)', color: '#a78bfa', border: '1px solid rgba(109,40,217,0.3)', borderRadius: '999px', fontSize: '0.72rem', padding: '2px 8px' }}>{path.level}</span>
                  <span style={{ background: 'rgba(109,40,217,0.2)', color: '#a78bfa', border: '1px solid rgba(109,40,217,0.3)', borderRadius: '999px', fontSize: '0.72rem', padding: '2px 8px' }}>{path.timeframe}</span>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.5 }}>{path.summary}</p>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button onClick={savePath} className="btn-secondary text-sm py-1.5 px-4">💾 Save</button>
                <button onClick={exportPDF} className="btn-secondary text-sm py-1.5 px-4">📄 Export PDF</button>
                <button onClick={() => navigate('/app/exchanges')} className="btn-primary text-sm py-1.5 px-4">Find Partner ⇄</button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {path.phases?.map((phase, i) => (
              <PhaseCard key={i} phase={phase} index={i}
                isExpanded={!!expanded[i]}
                onToggle={() => togglePhase(i)}
              />
            ))}
          </div>

          {path.exchangeTip && (
            <div style={{ padding: '14px 16px', borderRadius: '10px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}>
              <p style={{ color: '#34d399', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>💡 SKILLSWAP TIP</p>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.5 }}>{path.exchangeTip}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}