import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const CONFIDENCE_LABELS = { 1: 'Just Started', 2: 'Getting There', 3: 'Comfortable', 4: 'Confident', 5: 'Expert' };
const CONFIDENCE_COLORS = { 1: '#ef4444', 2: '#f97316', 3: '#eab308', 4: '#22c55e', 5: '#6d28d9' };

// ── Single Exchange Progress Panel ───────────────────────────
function ProgressPanel({ entry, onUpdate }) {
  const [progress, setProgress]   = useState(entry);
  const [goalInput, setGoalInput] = useState('');
  const [msInput, setMsInput]     = useState({ title: '', description: '', dueDate: '' });
  const [showMsForm, setShowMsForm] = useState(false);
  const [notes, setNotes]         = useState(entry.notes || '');
  const [hours, setHours]         = useState(entry.hoursSpent || 0);
  const [confidence, setConfidence] = useState(entry.confidence || null);
  const [saving, setSaving]       = useState(false);
  const [tab, setTab]             = useState('goals');

  const exId = progress.exchange?._id || progress.exchange;
  const partner = progress.exchange?.sender?.name && progress.exchange?.receiver?.name
    ? [progress.exchange.sender, progress.exchange.receiver].find(u => u._id !== entry.user)
    : null;

  const pct = () => {
    const total = (progress.goals?.length || 0) + (progress.milestones?.length || 0);
    if (!total) return 0;
    const done = (progress.goals?.filter(g => g.completed).length || 0) +
                 (progress.milestones?.filter(m => m.completed).length || 0);
    return Math.round((done / total) * 100);
  };

  const addGoal = async () => {
    if (!goalInput.trim()) return;
    const res = await api.post(`/progress/${exId}/goals`, { text: goalInput });
    setProgress(res.data); setGoalInput('');
  };

  const toggleGoal = async (goalId) => {
    const res = await api.put(`/progress/${exId}/goals/${goalId}/toggle`);
    setProgress(res.data);
  };

  const deleteGoal = async (goalId) => {
    const res = await api.delete(`/progress/${exId}/goals/${goalId}`);
    setProgress(res.data);
  };

  const addMilestone = async () => {
    if (!msInput.title.trim()) return;
    const res = await api.post(`/progress/${exId}/milestones`, msInput);
    setProgress(res.data); setMsInput({ title: '', description: '', dueDate: '' }); setShowMsForm(false);
  };

  const toggleMilestone = async (msId) => {
    const res = await api.put(`/progress/${exId}/milestones/${msId}/toggle`);
    setProgress(res.data);
  };

  const deleteMilestone = async (msId) => {
    const res = await api.delete(`/progress/${exId}/milestones/${msId}`);
    setProgress(res.data);
  };

  const saveNotes = async () => {
    setSaving(true);
    try {
      const res = await api.put(`/progress/${exId}`, { notes, hoursSpent: hours, confidence });
      setProgress(res.data);
    } finally { setSaving(false); }
  };

  const percent = pct();

  return (
    <div className="glass mb-4 overflow-hidden fade-in">
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #2a2a3d', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(109,40,217,0.2)', border: '1px solid rgba(109,40,217,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>📚</div>
        <div style={{ flex: 1 }}>
          <p style={{ color: '#e2e8f0', fontWeight: 600 }}>{progress.skillTracked}</p>
          <p style={{ color: '#6b7280', fontSize: '0.78rem' }}>
            {progress.exchange?.sender?.name && progress.exchange?.receiver?.name
              ? `with ${progress.exchange.sender.name} & ${progress.exchange.receiver.name}`
              : 'Exchange partner'}
          </p>
        </div>
        {/* Progress ring */}
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{ position: 'relative', width: 52, height: 52 }}>
            <svg width="52" height="52" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="26" cy="26" r="22" fill="none" stroke="#2a2a3d" strokeWidth="4"/>
              <circle cx="26" cy="26" r="22" fill="none" stroke="#6d28d9" strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 22}`}
                strokeDashoffset={`${2 * Math.PI * 22 * (1 - percent / 100)}`}
                strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s' }}/>
            </svg>
            <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa', fontWeight: 700, fontSize: '0.75rem' }}>{percent}%</span>
          </div>
        </div>
        {/* Hours */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '1rem' }}>{hours}h</p>
          <p style={{ color: '#6b7280', fontSize: '0.72rem' }}>hours</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #2a2a3d' }}>
        {['goals', 'milestones', 'notes'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '0.82rem', fontWeight: 500, textTransform: 'capitalize',
              color: tab === t ? '#a78bfa' : '#6b7280',
              borderBottom: `2px solid ${tab === t ? '#6d28d9' : 'transparent'}`,
              transition: 'all 0.15s'
            }}>{t} {t === 'goals' && progress.goals?.length ? `(${progress.goals.filter(g=>g.completed).length}/${progress.goals.length})` : t === 'milestones' && progress.milestones?.length ? `(${progress.milestones.filter(m=>m.completed).length}/${progress.milestones.length})` : ''}
          </button>
        ))}
      </div>

      <div style={{ padding: '16px 20px' }}>
        {/* ── Goals tab ── */}
        {tab === 'goals' && (
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input className="input" style={{ flex: 1, fontSize: '0.85rem', padding: '8px 12px' }}
                placeholder="Add a learning goal..."
                value={goalInput} onChange={e => setGoalInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addGoal()} />
              <button className="btn-primary" style={{ padding: '8px 14px', fontSize: '0.82rem' }} onClick={addGoal}>Add</button>
            </div>
            {progress.goals?.length === 0 && (
              <p style={{ color: '#4b5563', fontSize: '0.85rem', textAlign: 'center', padding: '12px 0' }}>No goals yet — add your first learning goal</p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {progress.goals?.map(g => (
                <div key={g._id} style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px',
                  borderRadius: '8px', background: g.completed ? 'rgba(16,185,129,0.05)' : '#1a1a26',
                  border: `1px solid ${g.completed ? 'rgba(16,185,129,0.2)' : '#2a2a3d'}`
                }}>
                  <button onClick={() => toggleGoal(g._id)} style={{
                    width: 20, height: 20, borderRadius: '50%', border: `2px solid ${g.completed ? '#10b981' : '#4b5563'}`,
                    background: g.completed ? '#10b981' : 'transparent', cursor: 'pointer', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.65rem'
                  }}>{g.completed ? '✓' : ''}</button>
                  <span style={{ flex: 1, color: g.completed ? '#6b7280' : '#e2e8f0', fontSize: '0.85rem', textDecoration: g.completed ? 'line-through' : 'none' }}>{g.text}</span>
                  <button onClick={() => deleteGoal(g._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563', fontSize: '0.85rem', padding: '2px 4px' }}>✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Milestones tab ── */}
        {tab === 'milestones' && (
          <div>
            <button onClick={() => setShowMsForm(!showMsForm)} className="btn-secondary" style={{ fontSize: '0.82rem', padding: '7px 14px', marginBottom: '12px' }}>
              {showMsForm ? '✕ Cancel' : '+ Add Milestone'}
            </button>
            {showMsForm && (
              <div style={{ padding: '12px', borderRadius: '10px', background: '#1a1a26', border: '1px solid #2a2a3d', marginBottom: '12px' }}>
                <input className="input" style={{ marginBottom: '8px', fontSize: '0.85rem', padding: '8px 12px' }}
                  placeholder="Milestone title *" value={msInput.title} onChange={e => setMsInput({ ...msInput, title: e.target.value })} />
                <input className="input" style={{ marginBottom: '8px', fontSize: '0.85rem', padding: '8px 12px' }}
                  placeholder="Description (optional)" value={msInput.description} onChange={e => setMsInput({ ...msInput, description: e.target.value })} />
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input type="date" className="input" style={{ flex: 1, fontSize: '0.85rem', padding: '8px 12px' }}
                    value={msInput.dueDate} onChange={e => setMsInput({ ...msInput, dueDate: e.target.value })} />
                  <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.82rem' }} onClick={addMilestone}>Save</button>
                </div>
              </div>
            )}
            {progress.milestones?.length === 0 && (
              <p style={{ color: '#4b5563', fontSize: '0.85rem', textAlign: 'center', padding: '12px 0' }}>No milestones yet</p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {progress.milestones?.map(m => (
                <div key={m._id} style={{
                  padding: '10px 14px', borderRadius: '10px',
                  background: m.completed ? 'rgba(16,185,129,0.05)' : '#1a1a26',
                  border: `1px solid ${m.completed ? 'rgba(16,185,129,0.2)' : '#2a2a3d'}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <button onClick={() => toggleMilestone(m._id)} style={{
                      width: 22, height: 22, borderRadius: '6px', border: `2px solid ${m.completed ? '#10b981' : '#4b5563'}`,
                      background: m.completed ? '#10b981' : 'transparent', cursor: 'pointer', flexShrink: 0, marginTop: 2,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem'
                    }}>{m.completed ? '✓' : ''}</button>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: m.completed ? '#6b7280' : '#e2e8f0', fontWeight: 500, fontSize: '0.88rem', textDecoration: m.completed ? 'line-through' : 'none' }}>{m.title}</p>
                      {m.description && <p style={{ color: '#6b7280', fontSize: '0.78rem', marginTop: '2px' }}>{m.description}</p>}
                      {m.dueDate && <p style={{ color: new Date(m.dueDate) < new Date() && !m.completed ? '#f87171' : '#6b7280', fontSize: '0.72rem', marginTop: '4px' }}>
                        📅 Due {new Date(m.dueDate).toLocaleDateString()}
                      </p>}
                    </div>
                    <button onClick={() => deleteMilestone(m._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563', fontSize: '0.85rem' }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Notes tab ── */}
        {tab === 'notes' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Hours */}
            <div>
              <label style={{ color: '#94a3b8', fontSize: '0.78rem', display: 'block', marginBottom: '6px' }}>⏱ Hours Spent</label>
              <input type="number" min="0" className="input" style={{ width: '100px', fontSize: '0.85rem', padding: '8px 12px' }}
                value={hours} onChange={e => setHours(Number(e.target.value))} />
            </div>
            {/* Confidence */}
            <div>
              <label style={{ color: '#94a3b8', fontSize: '0.78rem', display: 'block', marginBottom: '6px' }}>🎯 Confidence Level</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setConfidence(n)} style={{
                    padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.78rem',
                    background: confidence === n ? `${CONFIDENCE_COLORS[n]}20` : '#1a1a26',
                    color: confidence === n ? CONFIDENCE_COLORS[n] : '#6b7280',
                    outline: `1px solid ${confidence === n ? CONFIDENCE_COLORS[n]+'40' : '#2a2a3d'}`,
                    transition: 'all 0.15s'
                  }}>{n} {confidence === n ? `— ${CONFIDENCE_LABELS[n]}` : ''}</button>
                ))}
              </div>
            </div>
            {/* Notes */}
            <div>
              <label style={{ color: '#94a3b8', fontSize: '0.78rem', display: 'block', marginBottom: '6px' }}>📝 Learning Notes</label>
              <textarea className="input" rows={5} placeholder="What have you learned? Any blockers? Key takeaways..."
                value={notes} onChange={e => setNotes(e.target.value)}
                style={{ resize: 'vertical', fontSize: '0.85rem', lineHeight: 1.6 }} />
            </div>
            <button className="btn-primary" style={{ alignSelf: 'flex-start', padding: '8px 20px', fontSize: '0.85rem' }}
              onClick={saveNotes} disabled={saving}>
              {saving ? 'Saving...' : '💾 Save'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function ProgressTracker() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/progress/my').then(res => setEntries(res.data)).finally(() => setLoading(false));
  }, []);

  const totalGoals      = entries.reduce((s, e) => s + (e.goals?.length || 0), 0);
  const completedGoals  = entries.reduce((s, e) => s + (e.goals?.filter(g => g.completed).length || 0), 0);
  const totalHours      = entries.reduce((s, e) => s + (e.hoursSpent || 0), 0);
  const totalMilestones = entries.reduce((s, e) => s + (e.milestones?.length || 0), 0);
  const doneMilestones  = entries.reduce((s, e) => s + (e.milestones?.filter(m => m.completed).length || 0), 0);

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div className="slide-up mb-6">
        <h1 className="font-display text-3xl font-bold gradient-text mb-1">📊 Progress Tracker</h1>
        <p style={{ color: '#94a3b8' }}>Track your learning goals and milestones across all exchanges</p>
      </div>

      {/* Stats row */}
      {entries.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Active Exchanges', value: entries.length, icon: '⇄', color: '#6d28d9' },
            { label: 'Goals Done', value: `${completedGoals}/${totalGoals}`, icon: '✅', color: '#10b981' },
            { label: 'Milestones', value: `${doneMilestones}/${totalMilestones}`, icon: '🏁', color: '#0891b2' },
            { label: 'Hours Logged', value: `${totalHours}h`, icon: '⏱', color: '#f59e0b' },
          ].map(s => (
            <div key={s.label} className="glass p-4 text-center fade-in">
              <p style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{s.icon}</p>
              <p style={{ color: s.color, fontWeight: 700, fontSize: '1.3rem' }}>{s.value}</p>
              <p style={{ color: '#6b7280', fontSize: '0.72rem' }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1,2].map(i => <div key={i} style={{ height: '120px', borderRadius: '12px', background: '#12121a', border: '1px solid #2a2a3d', animation: 'pulse 1.5s infinite' }}/>)}
        </div>
      )}

      {/* Empty state */}
      {!loading && entries.length === 0 && (
        <div className="glass p-10 text-center fade-in">
          <p style={{ fontSize: '3rem', marginBottom: '12px' }}>📊</p>
          <h3 className="font-display font-semibold text-lg mb-2" style={{ color: '#e2e8f0' }}>No progress tracked yet</h3>
          <p style={{ color: '#6b7280', marginBottom: '20px', fontSize: '0.9rem' }}>Accept an exchange request to start tracking your learning progress</p>
          <button className="btn-primary" onClick={() => navigate('/app/exchanges')}>Go to Exchanges →</button>
        </div>
      )}

      {/* Progress panels */}
      {!loading && entries.map(entry => (
        <ProgressPanel key={entry._id} entry={entry} onUpdate={updated => setEntries(prev => prev.map(e => e._id === updated._id ? updated : e))} />
      ))}
    </div>
  );
}