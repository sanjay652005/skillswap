import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import TrustScore from '../components/TrustScore';

const StarRating = ({ rating, onRate, readonly = false }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map(n => (
      <span key={n} className={`star ${n <= rating ? 'star-filled' : 'star-empty'}`}
        onClick={() => !readonly && onRate && onRate(n)}>★</span>
    ))}
  </div>
);

const timeAgo = (date) => {
  if (!date) return 'Never';
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff/86400)}d ago`;
  return new Date(date).toLocaleDateString();
};

const COMPLIMENT_ICONS = {
  'great_teacher': '🎓', 'patient': '🧘', 'knowledgeable': '📚',
  'helpful': '🤝', 'communicative': '💬', 'creative': '🎨',
  'reliable': '⭐', 'inspiring': '✨'
};

export default function Profile() {
  const { id } = useParams();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile]       = useState(null);
  const [reviews, setReviews]       = useState([]);
  const [compliments, setCompliments] = useState([]);
  const [exchanges, setExchanges]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [editing, setEditing]       = useState(false);
  const [form, setForm]             = useState({});
  const [skillInput, setSkillInput] = useState({ offered: '', wanted: '' });
  const [reviewForm, setReviewForm] = useState({ rating: 0, feedback: '', skillReviewed: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [saving, setSaving]         = useState(false);

  const isOwnProfile = !id || id === user?._id;
  const profileId    = id || user?._id;

  useEffect(() => {
    Promise.all([
      api.get(isOwnProfile ? '/auth/me' : `/users/${profileId}`),
      api.get(`/reviews/user/${profileId}`),
      api.get('/exchanges'),
    ]).then(([profileRes, reviewsRes, exRes]) => {
      setProfile(profileRes.data);
      setForm(profileRes.data);
      setReviews(reviewsRes.data);
      // filter compliments from reviews
      setCompliments(reviewsRes.data.filter(r => r.complimentTags?.length > 0));
      // count exchanges for this profile user
      setExchanges(exRes.data.filter(e =>
        (e.sender?._id === profileId || e.receiver?._id === profileId) && e.status === 'completed'
      ));
    }).finally(() => setLoading(false));
  }, [id]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await api.put('/users/profile', form);
      setProfile(res.data); updateUser(res.data); setEditing(false);
    } catch (err) { alert(err.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const addSkill = (type) => {
    const val = skillInput[type].trim();
    if (!val) return;
    const field = type === 'offered' ? 'skillsOffered' : 'skillsWanted';
    if (!form[field]?.includes(val)) setForm({ ...form, [field]: [...(form[field] || []), val] });
    setSkillInput({ ...skillInput, [type]: '' });
  };

  const removeSkill = (type, skill) => {
    const field = type === 'offered' ? 'skillsOffered' : 'skillsWanted';
    setForm({ ...form, [field]: form[field].filter(s => s !== skill) });
  };

  const submitReview = async () => {
    try {
      const res = await api.post('/reviews', {
        revieweeId: profile._id,
        referenceId: profile._id,
        referenceType: 'exchange',
        ...reviewForm
      });
      setReviews(prev => [res.data, ...prev]);
      setShowReviewForm(false);
      setReviewForm({ rating: 0, feedback: '', skillReviewed: '' });
    } catch (err) { alert(err.response?.data?.error || 'Failed'); }
  };

  const BASE_URL = process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL.replace('/api', '')
    : 'http://localhost:5000';

  const uploadAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const res = await api.post('/upload/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfile(prev => ({ ...prev, avatar: res.data.avatar }));
    } catch (err) { alert('Upload failed'); }
  };

  const initials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || 'U';

  // Tally compliment tags across all reviews
  const complimentCounts = reviews.reduce((acc, r) => {
    r.complimentTags?.forEach(tag => { acc[tag] = (acc[tag] || 0) + 1; });
    return acc;
  }, {});
  const topCompliments = Object.entries(complimentCounts).sort((a,b) => b[1]-a[1]);

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!profile) return <div className="p-8"><p style={{ color: '#ef4444' }}>Profile not found</p></div>;

  const memberSince = new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const completedExchanges = exchanges.length;
  const avgRating = profile.rating ? profile.rating.toFixed(1) : '—';

  return (
    <div className="p-8 max-w-4xl mx-auto">

      {/* ── Profile Header ── */}
      <div className="glass p-6 mb-6 slide-up">
        <div className="flex items-start gap-6 flex-wrap">
          <div className="relative">
            {profile.avatar ? (
              <img src={`${BASE_URL}${profile.avatar}`} alt={profile.name}
                style={{ width:80, height:80, borderRadius:'50%', objectFit:'cover', border:'2px solid #2a2a3d' }} />
            ) : (
              <div className="avatar" style={{ width:'80px', height:'80px', fontSize:'1.5rem' }}>{initials(profile.name)}</div>
            )}
            {profile.isOnline && <div className="online-dot absolute bottom-1 right-1" style={{ width:'14px', height:'14px', border:'2px solid #12121a' }}/>}
            {isOwnProfile && (
              <label style={{ position:'absolute', bottom:0, right:0, background:'#6d28d9', borderRadius:'50%', width:24, height:24, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', border:'2px solid #12121a' }}
                title="Change photo">
                <span style={{ fontSize:'0.65rem', color:'white' }}>📷</span>
                <input type="file" accept="image/*" onChange={uploadAvatar} style={{ display:'none' }} />
              </label>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="font-display text-2xl font-bold" style={{ color: '#e2e8f0' }}>{profile.name}</h1>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <div className="flex gap-0.5">
                    {'★'.repeat(Math.round(profile.rating||0)).split('').map((s,i) => <span key={i} style={{ color:'#f59e0b', fontSize:'0.9rem' }}>{s}</span>)}
                    {'☆'.repeat(5-Math.round(profile.rating||0)).split('').map((s,i) => <span key={i} style={{ color:'#2a2a3d', fontSize:'0.9rem' }}>{s}</span>)}
                  </div>
                  <span className="text-sm" style={{ color:'#6b7280' }}>({profile.reviewCount||0} reviews)</span>
                  <span className="text-xs px-2 py-0.5 rounded" style={{ background:'#1a1a26', color:'#94a3b8', border:'1px solid #2a2a3d' }}>{profile.availability}</span>
                </div>
                {profile.bio && <p className="mt-2 text-sm" style={{ color:'#94a3b8' }}>{profile.bio}</p>}
                {/* Member since + last active */}
                <div className="flex gap-4 mt-2 flex-wrap">
                  <span style={{ color:'#4b5563', fontSize:'0.75rem' }}>📅 Member since {memberSince}</span>
                  <span style={{ color: profile.isOnline ? '#10b981' : '#4b5563', fontSize:'0.75rem' }}>
                    {profile.isOnline ? '🟢 Online now' : `🕐 Active ${timeAgo(profile.lastSeen)}`}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {isOwnProfile ? (
                  <button className="btn-secondary text-sm" onClick={() => setEditing(!editing)}>
                    {editing ? 'Cancel' : 'Edit Profile'}
                  </button>
                ) : (
                  <>
                    <button className="btn-secondary text-sm" onClick={() => navigate(`/messages/${profile._id}`)}>
                      💬 Message
                    </button>
                    <button className="btn-secondary text-sm" onClick={() => setShowReviewForm(!showReviewForm)}>
                      Leave Review
                    </button>
                  </>
                )}
              </div>
            </div>
            {/* Social links */}
            <div className="flex gap-3 mt-3 text-sm flex-wrap">
              {profile.githubLink   && <a href={profile.githubLink}   target="_blank" rel="noreferrer" style={{ color:'#a78bfa' }}>🔗 GitHub</a>}
              {profile.linkedinLink && <a href={profile.linkedinLink} target="_blank" rel="noreferrer" style={{ color:'#a78bfa' }}>🔗 LinkedIn</a>}
              {profile.leetcodeLink && <a href={profile.leetcodeLink} target="_blank" rel="noreferrer" style={{ color:'#a78bfa' }}>🔗 LeetCode</a>}
            </div>
            {/* Trust Score */}
            <div style={{ marginTop: '14px' }}>
              <TrustScore userId={profile._id} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'24px' }}>
        {[
          { icon:'⇄', label:'Exchanges',   value: completedExchanges, color:'#6d28d9' },
          { icon:'⭐', label:'Avg Rating',  value: avgRating,          color:'#f59e0b' },
          { icon:'📝', label:'Reviews',     value: profile.reviewCount||0, color:'#0891b2' },
          { icon:'🎖', label:'Compliments', value: topCompliments.length,  color:'#10b981' },
        ].map(s => (
          <div key={s.label} className="glass p-4 text-center fade-in">
            <p style={{ fontSize:'1.4rem', marginBottom:'4px' }}>{s.icon}</p>
            <p style={{ color:s.color, fontWeight:700, fontSize:'1.3rem' }}>{s.value}</p>
            <p style={{ color:'#6b7280', fontSize:'0.72rem' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Edit Form ── */}
      {editing && (
        <div className="glass p-6 mb-6 fade-in">
          <h3 className="font-display font-semibold mb-4" style={{ color:'#e2e8f0' }}>Edit Profile</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1" style={{ color:'#94a3b8' }}>Name</label>
                <input className="input" value={form.name||''} onChange={e => setForm({...form, name:e.target.value})} />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color:'#94a3b8' }}>Availability</label>
                <select className="input" value={form.availability||'flexible'} onChange={e => setForm({...form, availability:e.target.value})}>
                  {['full-time','part-time','weekends','evenings','flexible'].map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color:'#94a3b8' }}>Bio</label>
              <textarea className="input" rows={3} value={form.bio||''} onChange={e => setForm({...form, bio:e.target.value})} />
            </div>
            <div>
              <label className="block text-sm mb-2" style={{ color:'#94a3b8' }}>Skills You Offer</label>
              <div className="flex gap-2 mb-2">
                <input className="input flex-1" placeholder="Add skill..." value={skillInput.offered}
                  onChange={e => setSkillInput({...skillInput, offered:e.target.value})}
                  onKeyDown={e => e.key==='Enter' && (e.preventDefault(), addSkill('offered'))} />
                <button className="btn-primary px-4" onClick={() => addSkill('offered')}>+</button>
              </div>
              <div className="flex flex-wrap gap-1">
                {form.skillsOffered?.map(s => <span key={s} className="skill-tag cursor-pointer" onClick={() => removeSkill('offered',s)}>{s} ×</span>)}
              </div>
            </div>
            <div>
              <label className="block text-sm mb-2" style={{ color:'#94a3b8' }}>Skills You Want</label>
              <div className="flex gap-2 mb-2">
                <input className="input flex-1" placeholder="Add skill..." value={skillInput.wanted}
                  onChange={e => setSkillInput({...skillInput, wanted:e.target.value})}
                  onKeyDown={e => e.key==='Enter' && (e.preventDefault(), addSkill('wanted'))} />
                <button className="btn-primary px-4" onClick={() => addSkill('wanted')}>+</button>
              </div>
              <div className="flex flex-wrap gap-1">
                {form.skillsWanted?.map(s => <span key={s} className="skill-tag skill-tag-green cursor-pointer" onClick={() => removeSkill('wanted',s)}>{s} ×</span>)}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm mb-1" style={{ color:'#94a3b8' }}>GitHub URL</label>
                <input className="input" value={form.githubLink||''} onChange={e => setForm({...form, githubLink:e.target.value})} />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color:'#94a3b8' }}>LinkedIn URL</label>
                <input className="input" value={form.linkedinLink||''} onChange={e => setForm({...form, linkedinLink:e.target.value})} />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color:'#94a3b8' }}>LeetCode URL</label>
                <input className="input" value={form.leetcodeLink||''} onChange={e => setForm({...form, leetcodeLink:e.target.value})} />
              </div>
            </div>
            <button className="btn-primary" onClick={saveProfile} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </div>
      )}

      {/* ── Skills ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="glass p-5">
          <h3 className="font-display font-semibold mb-3" style={{ color:'#e2e8f0' }}>Skills Offered</h3>
          <div className="flex flex-wrap gap-2">
            {profile.skillsOffered?.length ? profile.skillsOffered.map(s => <span key={s} className="skill-tag">{s}</span>)
              : <p className="text-sm" style={{ color:'#6b7280' }}>No skills listed</p>}
          </div>
        </div>
        <div className="glass p-5">
          <h3 className="font-display font-semibold mb-3" style={{ color:'#e2e8f0' }}>Skills Wanted</h3>
          <div className="flex flex-wrap gap-2">
            {profile.skillsWanted?.length ? profile.skillsWanted.map(s => <span key={s} className="skill-tag skill-tag-green">{s}</span>)
              : <p className="text-sm" style={{ color:'#6b7280' }}>No skills listed</p>}
          </div>
        </div>
      </div>

      {/* ── Compliments ── */}
      {topCompliments.length > 0 && (
        <div className="glass p-5 mb-6 fade-in">
          <h3 className="font-display font-semibold mb-3" style={{ color:'#e2e8f0' }}>🎖 Compliments</h3>
          <div className="flex flex-wrap gap-2">
            {topCompliments.map(([tag, count]) => (
              <div key={tag} style={{
                display:'flex', alignItems:'center', gap:'6px', padding:'6px 12px',
                borderRadius:'999px', background:'rgba(109,40,217,0.1)', border:'1px solid rgba(109,40,217,0.25)'
              }}>
                <span>{COMPLIMENT_ICONS[tag] || '⭐'}</span>
                <span style={{ color:'#a78bfa', fontSize:'0.82rem', textTransform:'capitalize' }}>{tag.replace('_',' ')}</span>
                <span style={{ color:'#6d28d9', fontWeight:700, fontSize:'0.78rem', background:'rgba(109,40,217,0.2)', borderRadius:'999px', padding:'1px 6px' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Review form ── */}
      {showReviewForm && !isOwnProfile && (
        <div className="glass p-6 mb-6 fade-in">
          <h3 className="font-display font-semibold mb-4" style={{ color:'#e2e8f0' }}>Leave a Review</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2" style={{ color:'#94a3b8' }}>Rating</label>
              <StarRating rating={reviewForm.rating} onRate={r => setReviewForm({...reviewForm, rating:r})} />
            </div>
            <div>
              <label className="block text-sm mb-2" style={{ color:'#94a3b8' }}>Skill Reviewed</label>
              <input className="input" placeholder="Which skill did they help with?" value={reviewForm.skillReviewed}
                onChange={e => setReviewForm({...reviewForm, skillReviewed:e.target.value})} />
            </div>
            <div>
              <label className="block text-sm mb-2" style={{ color:'#94a3b8' }}>Feedback</label>
              <textarea className="input" rows={4} placeholder="Share your experience..." value={reviewForm.feedback}
                onChange={e => setReviewForm({...reviewForm, feedback:e.target.value})} />
            </div>
            <div className="flex gap-3">
              <button className="btn-secondary" onClick={() => setShowReviewForm(false)}>Cancel</button>
              <button className="btn-primary" onClick={submitReview} disabled={!reviewForm.rating||!reviewForm.feedback}>Submit Review</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reviews ── */}
      <div className="glass p-6">
        <h3 className="font-display font-semibold mb-4" style={{ color:'#e2e8f0' }}>Reviews ({reviews.length})</h3>
        {reviews.length === 0 ? (
          <p className="text-sm" style={{ color:'#6b7280' }}>No reviews yet</p>
        ) : (
          <div className="space-y-4">
            {reviews.map(r => (
              <div key={r._id} className="p-4 rounded-lg fade-in" style={{ background:'#12121a', border:'1px solid #2a2a3d' }}>
                <div className="flex items-start gap-3">
                  <div className="avatar" style={{ width:'32px', height:'32px', fontSize:'0.7rem' }}>{initials(r.reviewer?.name)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm" style={{ color:'#e2e8f0' }}>{r.reviewer?.name}</p>
                      <div className="flex gap-0.5">
                        {'★'.repeat(r.rating).split('').map((s,i) => <span key={i} style={{ color:'#f59e0b', fontSize:'0.8rem' }}>{s}</span>)}
                        {'☆'.repeat(5-r.rating).split('').map((s,i) => <span key={i} style={{ color:'#2a2a3d', fontSize:'0.8rem' }}>{s}</span>)}
                      </div>
                      {r.skillReviewed && <span className="skill-tag" style={{ fontSize:'0.7rem', padding:'1px 6px' }}>{r.skillReviewed}</span>}
                    </div>
                    {r.complimentTags?.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {r.complimentTags.map(tag => (
                          <span key={tag} style={{ fontSize:'0.7rem', color:'#a78bfa', background:'rgba(109,40,217,0.1)', padding:'1px 6px', borderRadius:'999px' }}>
                            {COMPLIMENT_ICONS[tag]} {tag.replace('_',' ')}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-sm mt-2" style={{ color:'#94a3b8' }}>{r.feedback}</p>
                    <p className="text-xs mt-2" style={{ color:'#4b5563' }}>{timeAgo(r.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
