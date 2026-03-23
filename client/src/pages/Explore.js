import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const POPULAR_SKILLS = ['React', 'Python', 'Node.js', 'UI/UX Design', 'Flutter', 'TypeScript', 'MongoDB', 'Machine Learning', 'Figma', 'DevOps'];

const ExchangeModal = ({ targetUser, onClose, onSend }) => {
  const { user } = useAuth();
  const [form, setForm] = useState({ skillOffered: '', skillWanted: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    try {
      await api.post('/exchanges', { receiverId: targetUser._id, ...form });
      onSend(); onClose();
    } catch (err) { alert(err.response?.data?.error || 'Failed to send request'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="glass p-6 w-full max-w-md fade-in">
        <h3 className="font-display font-semibold text-lg mb-4" style={{ color: '#e2e8f0' }}>Request Exchange with {targetUser.name}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-2" style={{ color: '#94a3b8' }}>Skill You Offer</label>
            <select className="input" value={form.skillOffered} onChange={e => setForm({ ...form, skillOffered: e.target.value })}>
              <option value="">Select your skill...</option>
              {user?.skillsOffered?.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-2" style={{ color: '#94a3b8' }}>Skill You Want</label>
            <select className="input" value={form.skillWanted} onChange={e => setForm({ ...form, skillWanted: e.target.value })}>
              <option value="">Select skill to learn...</option>
              {targetUser?.skillsOffered?.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-2" style={{ color: '#94a3b8' }}>Message (optional)</label>
            <textarea className="input" rows={3} placeholder="Introduce yourself..."
              value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
          </div>
          <div className="flex gap-3">
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

const UserCard = ({ user: u, onRequestExchange }) => {
  const initials = u.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const stars = '★'.repeat(Math.round(u.rating || 0)) + '☆'.repeat(5 - Math.round(u.rating || 0));
  return (
    <div className="glass p-5 flex flex-col gap-4 hover:border-violet-500/30 transition-all duration-300 fade-in">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            {u.avatar ? (
              <img src={u.avatar} alt={u.name} style={{ width:40, height:40, borderRadius:'50%', objectFit:'cover', border:'2px solid #2a2a3d' }} />
            ) : (
              <div className="avatar text-sm">{initials}</div>
            )}
            {u.isOnline && <div className="online-dot absolute bottom-0 right-0" style={{ width:'8px', height:'8px' }}></div>}
          </div>
          <div>
            <p className="font-semibold" style={{ color:'#e2e8f0' }}>{u.name}</p>
            <p className="text-xs" style={{ color:'#f59e0b' }}>{stars} <span style={{ color:'#6b7280' }}>({u.reviewCount || 0})</span></p>
          </div>
        </div>
        <span className="text-xs px-2 py-1 rounded" style={{ background:'#12121a', color:'#94a3b8', border:'1px solid #2a2a3d' }}>{u.availability}</span>
      </div>
      {u.bio && <p className="text-sm line-clamp-2" style={{ color:'#94a3b8' }}>{u.bio}</p>}
      <div>
        <p className="text-xs mb-2 font-medium" style={{ color:'#6b7280' }}>OFFERS</p>
        <div className="flex flex-wrap gap-1">
          {u.skillsOffered?.slice(0,4).map(s => <span key={s} className="skill-tag">{s}</span>)}
          {u.skillsOffered?.length > 4 && <span className="text-xs" style={{ color:'#6b7280' }}>+{u.skillsOffered.length - 4}</span>}
        </div>
      </div>
      <div>
        <p className="text-xs mb-2 font-medium" style={{ color:'#6b7280' }}>LEARNING</p>
        <div className="flex flex-wrap gap-1">
          {u.skillsWanted?.slice(0,4).map(s => <span key={s} className="skill-tag skill-tag-green">{s}</span>)}
        </div>
      </div>
      <div className="flex gap-2 mt-auto pt-2 border-t" style={{ borderColor:'#2a2a3d' }}>
        <Link to={`/profile/${u._id}`} className="btn-secondary text-sm py-1.5 text-center" style={{ flex:1 }}>Profile</Link>
        <Link to={`/messages/${u._id}`} className="btn-secondary text-sm py-1.5 text-center" style={{ flex:1 }}>💬 DM</Link>
        <button className="btn-primary text-sm py-1.5" style={{ flex:1 }} onClick={() => onRequestExchange(u)}>Exchange</button>
      </div>
    </div>
  );
};

export default function Explore() {
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [activeSkill, setActiveSkill] = useState('');
  const [availability, setAvailability] = useState('');
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [sortBy, setSortBy]         = useState('rating');
  const [selectedUser, setSelectedUser] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchUsers = useCallback(async (overrides = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const q      = overrides.search      ?? search;
      const skill  = overrides.activeSkill ?? activeSkill;
      const avail  = overrides.availability ?? availability;
      if (q)     params.append('search', q);
      if (skill) params.append('search', skill);
      if (avail) params.append('availability', avail);
      const res = await api.get(`/users?${params}`);
      let data = res.data;
      if (overrides.onlineOnly ?? onlineOnly) data = data.filter(u => u.isOnline);
      if (sortBy === 'rating')    data = [...data].sort((a,b) => (b.rating||0) - (a.rating||0));
      if (sortBy === 'exchanges') data = [...data].sort((a,b) => (b.reviewCount||0) - (a.reviewCount||0));
      if (sortBy === 'online')    data = [...data].sort((a,b) => (b.isOnline?1:0) - (a.isOnline?1:0));
      setUsers(data);
      setTotalCount(data.length);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search, activeSkill, availability, onlineOnly, sortBy]);

  useEffect(() => { fetchUsers(); }, []);

  const handleSkillChip = (skill) => {
    const next = activeSkill === skill ? '' : skill;
    setActiveSkill(next);
    fetchUsers({ activeSkill: next });
  };

  const handleSearch = (e) => { e.preventDefault(); fetchUsers(); };

  const clearFilters = () => {
    setSearch(''); setActiveSkill(''); setAvailability(''); setOnlineOnly(false); setSortBy('rating');
    fetchUsers({ search:'', activeSkill:'', availability:'', onlineOnly:false });
  };

  const hasFilters = search || activeSkill || availability || onlineOnly;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 slide-up">
        <h1 className="font-display text-3xl font-bold gradient-text mb-1">Explore Developers</h1>
        <p style={{ color:'#94a3b8' }}>Find people to exchange skills and collaborate with</p>
      </div>

      {/* ── Search bar ── */}
      <form onSubmit={handleSearch} className="glass p-4 mb-4 flex gap-3 flex-wrap items-center">
        <div style={{ position:'relative', flex:1, minWidth:'200px' }}>
          <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#6b7280', fontSize:'1rem' }}>🔍</span>
          <input className="input" style={{ paddingLeft:'36px' }} placeholder="Search by name or skill..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input" style={{ width:'auto' }} value={availability} onChange={e => { setAvailability(e.target.value); fetchUsers({ availability: e.target.value }); }}>
          <option value="">Any availability</option>
          {['full-time','part-time','weekends','evenings','flexible'].map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <select className="input" style={{ width:'auto' }} value={sortBy} onChange={e => { setSortBy(e.target.value); fetchUsers(); }}>
          <option value="rating">Sort: Top Rated</option>
          <option value="exchanges">Sort: Most Exchanges</option>
          <option value="online">Sort: Online First</option>
        </select>
        <label style={{ display:'flex', alignItems:'center', gap:'6px', color:'#94a3b8', fontSize:'0.85rem', cursor:'pointer', whiteSpace:'nowrap' }}>
          <input type="checkbox" checked={onlineOnly} onChange={e => { setOnlineOnly(e.target.checked); fetchUsers({ onlineOnly: e.target.checked }); }} />
          Online only
        </label>
        <button className="btn-primary" type="submit">Search</button>
        {hasFilters && (
          <button type="button" onClick={clearFilters} style={{ background:'none', border:'none', color:'#6b7280', cursor:'pointer', fontSize:'0.8rem' }}>✕ Clear</button>
        )}
      </form>

      {/* ── Skill chips ── */}
      <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'20px' }}>
        <span style={{ color:'#6b7280', fontSize:'0.78rem', alignSelf:'center' }}>Popular:</span>
        {POPULAR_SKILLS.map(skill => (
          <button key={skill} onClick={() => handleSkillChip(skill)}
            style={{
              padding:'4px 12px', borderRadius:'999px', fontSize:'0.78rem', cursor:'pointer', transition:'all 0.15s',
              background: activeSkill === skill ? 'linear-gradient(135deg,#6d28d9,#8b5cf6)' : '#1a1a26',
              border: `1px solid ${activeSkill === skill ? 'transparent' : '#2a2a3d'}`,
              color: activeSkill === skill ? 'white' : '#94a3b8',
              fontWeight: activeSkill === skill ? 600 : 400
            }}>
            {skill}
          </button>
        ))}
      </div>

      {/* ── Results header ── */}
      {!loading && (
        <div style={{ marginBottom:'16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <p style={{ color:'#6b7280', fontSize:'0.85rem' }}>
            {totalCount} developer{totalCount !== 1 ? 's' : ''} found
            {activeSkill && <span style={{ color:'#a78bfa' }}> · {activeSkill}</span>}
          </p>
        </div>
      )}

      {/* ── Results grid ── */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 glass">
          <p className="text-2xl mb-2">🔍</p>
          <p style={{ color:'#e2e8f0' }}>No developers found</p>
          <p className="text-sm mt-1 mb-4" style={{ color:'#6b7280' }}>Try different search terms or clear filters</p>
          <button onClick={clearFilters} className="btn-secondary text-sm">Clear Filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {users.map(u => <UserCard key={u._id} user={u} onRequestExchange={setSelectedUser} />)}
        </div>
      )}

      {selectedUser && <ExchangeModal targetUser={selectedUser} onClose={() => setSelectedUser(null)} onSend={fetchUsers} />}
    </div>
  );
}
