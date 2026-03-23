import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const ScoreRing = ({ score, color }) => {
  const r = 28, circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const scoreColor = score >= 80 ? '#f59e0b' : score >= 60 ? '#34d399' : score >= 40 ? '#60a5fa' : '#a78bfa';
  return (
    <svg width="72" height="72" style={{ flexShrink: 0 }}>
      <circle cx="36" cy="36" r={r} fill="none" stroke="#2a2a3d" strokeWidth="5"/>
      <circle cx="36" cy="36" r={r} fill="none" stroke={scoreColor} strokeWidth="5"
        strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 36 36)" style={{ transition: 'stroke-dasharray 0.8s ease' }}/>
      <text x="36" y="40" textAnchor="middle" fill={scoreColor} fontSize="13" fontWeight="800">{score}%</text>
    </svg>
  );
};

const MatchCard = ({ match, onRequestExchange }) => {
  const { user: u, matchScore, reasons, iCanLearn, theyCanLearn } = match;
  const initials = u.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || 'U';
  const scoreColor = matchScore >= 80 ? '#f59e0b' : matchScore >= 60 ? '#34d399' : matchScore >= 40 ? '#60a5fa' : '#a78bfa';
  const label = matchScore >= 80 ? 'Perfect Match' : matchScore >= 60 ? 'Great Match' : matchScore >= 40 ? 'Good Match' : 'Potential Match';

  return (
    <div className="glass fade-in" style={{
      padding: '20px', borderRadius: '14px',
      border: `1px solid ${scoreColor}30`,
      background: `linear-gradient(135deg, #12121a, ${scoreColor}08)`,
      transition: 'all 0.2s'
    }}>
      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
        {/* Score ring */}
        <ScoreRing score={matchScore} />

        {/* User info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {u.avatar
                ? <img src={u.avatar} alt={u.name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}/>
                : <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.7rem' }}>{initials}</div>
              }
              <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.95rem' }}>{u.name}</span>
            </div>
            <span style={{
              padding: '2px 8px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600,
              background: `${scoreColor}20`, color: scoreColor, border: `1px solid ${scoreColor}40`
            }}>{label}</span>
            {u.isOnline && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', display: 'inline-block' }}/>}
          </div>

          {/* Reasons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '10px' }}>
            {reasons.slice(0,3).map((r, i) => (
              <span key={i} style={{ color: '#94a3b8', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ color: scoreColor }}>✓</span> {r}
              </span>
            ))}
          </div>

          {/* Skill exchange preview */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {iCanLearn.slice(0,3).map(s => (
              <span key={s} style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '0.72rem', background: 'rgba(109,40,217,0.15)', color: '#a78bfa', border: '1px solid rgba(109,40,217,0.3)' }}>
                📚 {s}
              </span>
            ))}
            {theyCanLearn.slice(0,3).map(s => (
              <span key={s} style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '0.72rem', background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}>
                🎓 {s}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link to={`/profile/${u._id}`} className="btn-secondary text-sm py-1.5 px-3">View Profile</Link>
            <Link to={`/messages/${u._id}`} className="btn-secondary text-sm py-1.5 px-3">💬 Message</Link>
            <button className="btn-primary text-sm py-1.5 px-3" onClick={() => onRequestExchange(u)}>⇄ Exchange</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ExchangeModal = ({ targetUser, onClose, onSend }) => {
  const { user } = useAuth();
  const [form, setForm] = useState({ skillOffered: '', skillWanted: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    try {
      await api.post('/exchanges', { receiverId: targetUser._id, ...form });
      onSend(); onClose();
    } catch (err) { alert(err.response?.data?.error || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
      <div className="glass p-6 w-full fade-in" style={{ maxWidth: '420px' }}>
        <h3 style={{ color: '#e2e8f0', fontWeight: 700, marginBottom: '16px' }}>Exchange with {targetUser.name}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: '5px' }}>Skill You Offer</label>
            <select className="input" value={form.skillOffered} onChange={e => setForm({ ...form, skillOffered: e.target.value })}>
              <option value="">Select...</option>
              {user?.skillsOffered?.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: '5px' }}>Skill You Want</label>
            <select className="input" value={form.skillWanted} onChange={e => setForm({ ...form, skillWanted: e.target.value })}>
              <option value="">Select...</option>
              {targetUser?.skillsOffered?.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: '5px' }}>Message (optional)</label>
            <textarea className="input" rows={3} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Introduce yourself..."/>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
            <button className="btn-primary flex-1" onClick={handleSend} disabled={loading || !form.skillOffered || !form.skillWanted}>
              {loading ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AIMatches() {
  const { user } = useAuth();
  const [matches, setMatches]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => { fetchMatches(); }, []);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const res = await api.get('/matching/matches');
      setMatches(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const hasSkills = user?.skillsOffered?.length > 0 || user?.skillsWanted?.length > 0;

  return (
    <div style={{ padding: '24px', maxWidth: '860px', margin: '0 auto' }}>
      {/* Header */}
      <div className="slide-up" style={{ marginBottom: '24px' }}>
        <h1 className="font-display font-bold gradient-text" style={{ fontSize: '1.9rem', marginBottom: '4px' }}>🧠 AI Match Engine</h1>
        <p style={{ color: '#94a3b8' }}>Ranked by skill compatibility, availability, rating and activity</p>
      </div>

      {/* No skills warning */}
      {!hasSkills && (
        <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)', marginBottom: '20px' }}>
          <p style={{ color: '#fbbf24', fontWeight: 600, marginBottom: '4px' }}>⚠️ Add skills to get better matches</p>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Go to your profile and add skills you offer and want to learn for accurate matching.</p>
          <Link to="/profile" className="btn-primary text-sm" style={{ display: 'inline-block', marginTop: '10px', padding: '6px 16px' }}>Update Profile →</Link>
        </div>
      )}

      {/* Score legend */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {[['Perfect Match', '#f59e0b', '80+'], ['Great Match', '#34d399', '60+'], ['Good Match', '#60a5fa', '40+'], ['Potential', '#a78bfa', '<40']].map(([label, color, range]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }}/>
            <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>{label} ({range}%)</span>
          </div>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ height: '140px', borderRadius: '14px', background: '#12121a', border: '1px solid #2a2a3d', animation: 'pulse 1.5s infinite' }}/>
          ))}
        </div>
      ) : matches.length === 0 ? (
        <div className="glass" style={{ padding: '48px', textAlign: 'center' }}>
          <p style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔍</p>
          <p style={{ color: '#e2e8f0', fontWeight: 600, marginBottom: '6px' }}>No matches found yet</p>
          <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '16px' }}>Add more skills to your profile or invite friends to SkillSwap</p>
          <Link to="/profile" className="btn-primary text-sm" style={{ padding: '8px 20px' }}>Update Skills →</Link>
        </div>
      ) : (
        <>
          <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '16px' }}>
            Found <span style={{ color: '#a78bfa', fontWeight: 600 }}>{matches.length} matches</span> ranked by compatibility
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {matches.map((m, i) => (
              <MatchCard key={m.user._id} match={m} onRequestExchange={setSelected} />
            ))}
          </div>
        </>
      )}

      {selected && <ExchangeModal targetUser={selected} onClose={() => setSelected(null)} onSend={fetchMatches} />}
    </div>
  );
}
