import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const timeAgo = (date) => {
  if (!date) return '';
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
};

const initials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || 'U';

const useIsMobile = () => {
  const [mob, setMob] = useState(window.innerWidth < 768);
  useEffect(() => {
    const h = () => setMob(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return mob;
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const isMobile  = useIsMobile();

  const [data, setData] = useState({
    exchanges: [], projects: [], suggestions: [],
    onlineUsers: [], notifications: [], conversations: [], progress: []
  });
  const [aiSuggestions, setAiSuggestions] = useState('');
  const [loading, setLoading] = useState(true);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    Promise.all([
      api.get('/exchanges'),
      api.get('/projects?filter=my'),
      api.get('/users/suggestions'),
      api.get('/notifications'),
      api.get('/messages/conversations'),
      api.get('/progress/my'),
      api.get('/ai/suggestions'),
    ]).then(([exch, proj, sugg, notifs, convos, prog, ai]) => {
      const arr = d => Array.isArray(d) ? d : [];
      setData({
        exchanges:     arr(exch.data),
        projects:      arr(proj.data).slice(0, 6),
        suggestions:   arr(sugg.data).slice(0, 6),
        onlineUsers:   [],
        notifications: arr(notifs.data).slice(0, 5),
        conversations: arr(convos.data).slice(0, 4),
        progress:      arr(prog.data),
      });
      setAiSuggestions(ai.data.suggestions);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const { exchanges, projects, suggestions, onlineUsers, conversations, progress } = data;

  const pendingIn   = exchanges.filter(e => e.receiver?._id === user?._id && e.status === 'pending');
  const activeEx    = exchanges.filter(e => e.status === 'accepted');
  const completedEx = exchanges.filter(e => e.status === 'completed');
  const unreadMsgs  = conversations.reduce((s, c) => s + (c.unread || 0), 0);

  const totalGoals = progress.reduce((s,p) => s + (p.goals?.length||0), 0);
  const doneGoals  = progress.reduce((s,p) => s + (p.goals?.filter(g=>g.completed).length||0), 0);
  const progressPct = totalGoals ? Math.round((doneGoals/totalGoals)*100) : 0;

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#0a0a0f' }}>
      <div style={{ textAlign:'center' }}>
        <div className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" style={{ margin:'0 auto 12px' }}/>
        <p style={{ color:'#a78bfa' }}>Loading...</p>
      </div>
    </div>
  );

  const pad = isMobile ? '16px' : '24px';

  return (
    <div style={{ padding: pad, maxWidth:'1100px', margin:'0 auto', width:'100%', boxSizing:'border-box', overflowX:'hidden' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom:'16px' }}>
        <h1 className="font-display font-bold" style={{ fontSize: isMobile ? '1.4rem' : '1.9rem', color:'#e2e8f0', marginBottom:'4px' }}>
          {greeting()}, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p style={{ color:'#6b7280', fontSize:'0.85rem' }}>Here's what's happening in your network</p>
      </div>

      {/* ── Alert banners ── */}
      {(pendingIn.length > 0 || unreadMsgs > 0) && (
        <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'16px' }}>
          {pendingIn.length > 0 && (
            <button onClick={() => navigate('/app/exchanges')}
              style={{ display:'flex', alignItems:'center', gap:'10px', padding:'12px 16px', borderRadius:'12px', background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.25)', cursor:'pointer', textAlign:'left', width:'100%' }}>
              <span style={{ fontSize:'1.2rem' }}>⚡</span>
              <span style={{ color:'#fbbf24', fontSize:'0.85rem', fontWeight:600 }}>
                {pendingIn.length} pending exchange request{pendingIn.length>1?'s':''}
              </span>
              <span style={{ marginLeft:'auto', color:'#f59e0b', fontSize:'0.8rem' }}>Review →</span>
            </button>
          )}
          {unreadMsgs > 0 && (
            <button onClick={() => navigate('/app/messages')}
              style={{ display:'flex', alignItems:'center', gap:'10px', padding:'12px 16px', borderRadius:'12px', background:'rgba(109,40,217,0.1)', border:'1px solid rgba(109,40,217,0.25)', cursor:'pointer', textAlign:'left', width:'100%' }}>
              <span style={{ fontSize:'1.2rem' }}>💬</span>
              <span style={{ color:'#a78bfa', fontSize:'0.85rem', fontWeight:600 }}>
                {unreadMsgs} unread message{unreadMsgs>1?'s':''}
              </span>
              <span style={{ marginLeft:'auto', color:'#8b5cf6', fontSize:'0.8rem' }}>Open →</span>
            </button>
          )}
        </div>
      )}

      {/* ── Stats 2x2 on mobile, 4-col on desktop ── */}
      <div style={{
        display:'grid',
        gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)',
        gap:'10px', marginBottom:'20px'
      }}>
        {[
          { label:'Active Exchanges', value: activeEx.length,    color:'#a78bfa', icon:'⇄',  to:'/exchanges' },
          { label:'Completed',        value: completedEx.length, color:'#10b981', icon:'✅', to:'/exchanges' },
          { label:'Goal Progress',    value: `${progressPct}%`,  color:'#f59e0b', icon:'📊', to:'/progress'  },
          { label:'Skills Offered',   value: user?.skillsOffered?.length||0, color:'#f472b6', icon:'🎯', to:'/profile' },
        ].map(s => (
          <button key={s.label} onClick={() => navigate(s.to)}
            style={{ background:'rgba(255,255,255,0.03)', border:'1px solid #2a2a3d', borderRadius:'12px', padding:'14px 12px', textAlign:'center', cursor:'pointer', transition:'border-color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor='rgba(109,40,217,0.4)'}
            onMouseLeave={e => e.currentTarget.style.borderColor='#2a2a3d'}>
            <p style={{ fontSize:'1.3rem', marginBottom:'4px' }}>{s.icon}</p>
            <p style={{ color:s.color, fontWeight:700, fontSize:'1.3rem', lineHeight:1 }}>{s.value}</p>
            <p style={{ color:'#6b7280', fontSize:'0.7rem', marginTop:'4px' }}>{s.label}</p>
          </button>
        ))}
      </div>

      {/* ── Main content: single col mobile, 3-col desktop ── */}
      <div style={{
        display:'grid',
        gridTemplateColumns: '1fr',
        gap:'16px'
      }}>

        {/* ── Active Exchanges ── */}
        <div className="glass p-5" style={{ alignSelf:'start' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
            <h2 className="font-display font-semibold" style={{ color:'#e2e8f0', fontSize:'0.95rem' }}>⇄ Active Exchanges</h2>
            <Link to="/exchanges" style={{ color:'#a78bfa', fontSize:'0.8rem' }}>See all →</Link>
          </div>
          {activeEx.length === 0 ? (
            <div style={{ textAlign:'center', padding:'20px 0' }}>
              <p style={{ color:'#6b7280', fontSize:'0.85rem', marginBottom:'12px' }}>No active exchanges yet</p>
              <Link to="/explore" className="btn-primary" style={{ fontSize:'0.82rem', padding:'8px 18px' }}>Find Partners</Link>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {activeEx.slice(0,3).map(e => {
                const partner = e.receiver?._id === user?._id ? e.sender : e.receiver;
                const wsId    = e.workspace?._id || e.workspace;
                const prog    = progress.find(p => (p.exchange?._id||p.exchange) === e._id);
                const pct     = prog ? (() => {
                  const total = (prog.goals?.length||0) + (prog.milestones?.length||0);
                  if (!total) return 0;
                  const done = (prog.goals?.filter(g=>g.completed).length||0) + (prog.milestones?.filter(m=>m.completed).length||0);
                  return Math.round(done/total*100);
                })() : null;
                return (
                  <div key={e._id} style={{ padding:'12px', borderRadius:'10px', background:'#1a1a26', border:'1px solid #2a2a3d', display:'flex', alignItems:'center', gap:'10px' }}>
                    <div className="avatar" style={{ width:34, height:34, fontSize:'0.72rem', flexShrink:0 }}>{initials(partner?.name)}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ color:'#e2e8f0', fontWeight:600, fontSize:'0.85rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{partner?.name}</p>
                      <p style={{ color:'#6b7280', fontSize:'0.75rem' }}>
                        <span style={{ color:'#a78bfa' }}>{e.skillOffered}</span> ⇄ <span style={{ color:'#34d399' }}>{e.skillWanted}</span>
                      </p>
                      {pct !== null && (
                        <div style={{ marginTop:'5px', display:'flex', alignItems:'center', gap:'6px' }}>
                          <div style={{ flex:1, height:3, background:'#2a2a3d', borderRadius:'999px', overflow:'hidden' }}>
                            <div style={{ width:`${pct}%`, height:'100%', background:'linear-gradient(90deg,#6d28d9,#8b5cf6)', borderRadius:'999px' }}/>
                          </div>
                          <span style={{ color:'#6b7280', fontSize:'0.68rem', flexShrink:0 }}>{pct}%</span>
                        </div>
                      )}
                    </div>
                    {wsId && (
                      <Link to={`/app/exchanges/workspace/${wsId}`}
                        style={{ background:'rgba(109,40,217,0.15)', border:'1px solid rgba(109,40,217,0.3)', borderRadius:'8px', padding:'5px 10px', color:'#a78bfa', fontSize:'0.75rem', textDecoration:'none', flexShrink:0, whiteSpace:'nowrap' }}>
                        Open →
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Recent Messages ── */}
        <div className="glass p-5" style={{ alignSelf:'start' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
            <h2 className="font-display font-semibold" style={{ color:'#e2e8f0', fontSize:'0.95rem' }}>💬 Recent Messages</h2>
            <Link to="/messages" style={{ color:'#a78bfa', fontSize:'0.8rem' }}>See all →</Link>
          </div>
          {conversations.length === 0 ? (
            <p style={{ color:'#6b7280', fontSize:'0.85rem' }}>No messages yet</p>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
              {conversations.map(c => (
                <button key={c.partner?._id} onClick={() => navigate(`/app/messages/${c.partner?._id}`)}
                  style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', borderRadius:'10px', background:'#1a1a26', border:`1px solid ${c.unread?'rgba(109,40,217,0.3)':'#2a2a3d'}`, cursor:'pointer', textAlign:'left', width:'100%' }}>
                  <div style={{ position:'relative', flexShrink:0 }}>
                    <div className="avatar" style={{ width:32, height:32, fontSize:'0.68rem' }}>{initials(c.partner?.name)}</div>
                    {c.partner?.isOnline && <div className="online-dot" style={{ position:'absolute', bottom:0, right:0, width:8, height:8 }}/>}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ color:'#e2e8f0', fontWeight:c.unread?600:400, fontSize:'0.85rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.partner?.name}</p>
                    <p style={{ color:'#6b7280', fontSize:'0.75rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.lastMessage?.content || 'No messages'}</p>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'3px', flexShrink:0 }}>
                    <span style={{ color:'#4b5563', fontSize:'0.68rem' }}>{timeAgo(c.lastMessage?.createdAt)}</span>
                    {c.unread > 0 && <span style={{ background:'#6d28d9', color:'white', borderRadius:'999px', fontSize:'0.65rem', padding:'1px 6px', fontWeight:700 }}>{c.unread}</span>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Ongoing Projects ── */}
        <div className="glass p-5" style={{ alignSelf:'start' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
            <h2 className="font-display font-semibold" style={{ color:'#e2e8f0', fontSize:'0.95rem' }}>◈ My Ongoing Projects</h2>
            <Link to="/projects" style={{ color:'#a78bfa', fontSize:'0.8rem' }}>See all →</Link>
          </div>
          {projects.filter(p => p.status === 'in-progress' || p.status === 'open').length === 0 ? (
            <div style={{ textAlign:'center', padding:'16px 0' }}>
              <p style={{ color:'#6b7280', fontSize:'0.85rem', marginBottom:'12px' }}>No ongoing projects yet</p>
              <Link to="/projects" className="btn-primary" style={{ fontSize:'0.82rem', padding:'8px 18px' }}>Browse Projects</Link>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)', gap:'10px' }}>
              {projects.filter(p => p.status === 'in-progress' || p.status === 'open').map(p => {
                const wsId = p.workspace?._id || p.workspace;
                const isOwner = p.owner?._id === user?._id || p.owner === user?._id;
                const memberCount = p.collaborators?.length || 0;
                return (
                  <div key={p._id} style={{ padding:'14px', borderRadius:'10px', background:'#1a1a26', border:'1px solid #2a2a3d', display:'flex', flexDirection:'column', gap:'8px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'8px' }}>
                      <p style={{ color:'#e2e8f0', fontWeight:600, fontSize:'0.875rem', flex:1 }}>{p.title}</p>
                      <span style={{
                        fontSize:'0.68rem', padding:'2px 8px', borderRadius:'999px', flexShrink:0,
                        background: p.status==='in-progress' ? 'rgba(16,185,129,0.15)' : 'rgba(109,40,217,0.15)',
                        color: p.status==='in-progress' ? '#10b981' : '#a78bfa',
                        border: `1px solid ${p.status==='in-progress' ? 'rgba(16,185,129,0.3)' : 'rgba(109,40,217,0.3)'}`
                      }}>{p.status}</span>
                    </div>
                    <div style={{ display:'flex', gap:'4px', flexWrap:'wrap' }}>
                      {p.techStack?.slice(0,3).map(s => <span key={s} className="skill-tag" style={{ fontSize:'0.68rem', padding:'1px 6px' }}>{s}</span>)}
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'4px' }}>
                      <span style={{ color:'#6b7280', fontSize:'0.75rem' }}>👥 {memberCount} member{memberCount!==1?'s':''}{isOwner?' · owner':''}</span>
                      {wsId ? (
                        <Link to={`/app/projects/workspace/${wsId}`}
                          style={{ background:'rgba(109,40,217,0.15)', border:'1px solid rgba(109,40,217,0.3)', borderRadius:'8px', padding:'4px 10px', color:'#a78bfa', fontSize:'0.75rem', textDecoration:'none' }}>
                          Open →
                        </Link>
                      ) : (
                        <Link to="/projects" style={{ color:'#6b7280', fontSize:'0.75rem' }}>View →</Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── RIGHT SIDEBAR: stacks below on mobile ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>

          {/* Quick Actions */}
          <div className="glass p-5">
            <h2 className="font-display font-semibold mb-3" style={{ color:'#e2e8f0', fontSize:'0.95rem' }}>⚡ Quick Actions</h2>
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(3,1fr)', gap:'8px', width:'100%' }}>
              {[
                { to:'/explore',       icon:'🔍', label:'Find Partners',    color:'#6d28d9' },
                { to:'/ai-matches',    icon:'🧠', label:'AI Matches',        color:'#f59e0b' },
                { to:'/projects',      icon:'◈',  label:'Browse Projects',  color:'#10b981' },
                { to:'/learning-path', icon:'📚', label:'Learning Path',    color:'#0891b2' },
                { to:'/ai',            icon:'✦',  label:'AI Assistant',     color:'#6366f1' },
                { to:'/profile',       icon:'◉',  label:'Edit Profile',     color:'#f472b6' },
              ].map(a => (
                <Link key={a.to} to={a.to} style={{
                  display:'flex', alignItems:'center', gap:'8px', padding:'10px 12px',
                  borderRadius:'10px', textDecoration:'none', color:'#e2e8f0',
                  background:'rgba(255,255,255,0.03)', border:'1px solid #2a2a3d',
                  fontSize:'0.82rem', fontWeight:500, transition:'all 0.15s'
                }}
                  onMouseEnter={e => { e.currentTarget.style.background=`rgba(${a.color==='#6d28d9'?'109,40,217':a.color==='#10b981'?'16,185,129':a.color==='#0891b2'?'8,145,178':a.color==='#f59e0b'?'245,158,11':a.color==='#6366f1'?'99,102,241':'244,114,182'},0.12)`; e.currentTarget.style.borderColor=a.color+'55'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor='#2a2a3d'; }}>
                  <span style={{ fontSize:'1rem' }}>{a.icon}</span>
                  {a.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Suggested Matches */}
          <div className="glass p-5">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
              <h2 className="font-display font-semibold" style={{ color:'#e2e8f0', fontSize:'0.95rem' }}>🎯 Suggested</h2>
              <Link to="/explore" style={{ color:'#a78bfa', fontSize:'0.78rem' }}>All →</Link>
            </div>
            {suggestions.length === 0 ? (
              <div style={{ textAlign:'center' }}>
                <p style={{ color:'#6b7280', fontSize:'0.82rem', marginBottom:'6px' }}>Add skills to see matches</p>
                <Link to="/profile" style={{ color:'#a78bfa', fontSize:'0.78rem' }}>Edit Profile →</Link>
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)', gap:'8px' }}>
                {suggestions.slice(0, isMobile ? 3 : 6).map((u,i) => (
                  <div key={u._id} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'8px 10px', borderRadius:'8px', background:'#1a1a26', border:'1px solid #2a2a3d' }}>
                    <div style={{ position:'relative', flexShrink:0 }}>
                      <div className="avatar" style={{ width:30, height:30, fontSize:'0.65rem' }}>{initials(u.name)}</div>
                      {u.isOnline && <div className="online-dot" style={{ position:'absolute', bottom:0, right:0, width:7, height:7 }}/>}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ color:'#e2e8f0', fontSize:'0.82rem', fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.name}</p>
                      <div style={{ display:'flex', gap:'3px', flexWrap:'wrap' }}>
                        {u.skillsOffered?.slice(0,2).map(s => <span key={s} className="skill-tag" style={{ fontSize:'0.65rem', padding:'1px 5px' }}>{s}</span>)}
                      </div>
                    </div>
                    <Link to={`/app/profile/${u._id}`} style={{ color:'#a78bfa', fontSize:'0.72rem', textDecoration:'none', flexShrink:0 }}>View →</Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Suggestions */}
          {aiSuggestions && (
            <div className="glass p-5" style={{ border:'1px solid rgba(109,40,217,0.2)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px' }}>
                <div style={{ width:26, height:26, borderRadius:'6px', background:'linear-gradient(135deg,#6d28d9,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <span style={{ color:'white', fontSize:'0.75rem' }}>✦</span>
                </div>
                <h2 className="font-display font-semibold" style={{ color:'#e2e8f0', fontSize:'0.9rem' }}>AI Suggestions</h2>
              </div>
              <p style={{ color:'#94a3b8', fontSize:'0.8rem', lineHeight:1.7, whiteSpace:'pre-line', wordBreak:'break-word', overflowWrap:'anywhere' }}>{aiSuggestions}</p>
            </div>
          )}

          {/* Your Skills */}
          <div className="glass p-5">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
              <h2 className="font-display font-semibold" style={{ color:'#e2e8f0', fontSize:'0.9rem' }}>Your Skills</h2>
              <Link to="/profile" style={{ color:'#a78bfa', fontSize:'0.75rem' }}>Edit →</Link>
            </div>
            <p style={{ color:'#6b7280', fontSize:'0.7rem', marginBottom:'5px' }}>OFFERING</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'4px', marginBottom:'10px' }}>
              {user?.skillsOffered?.length ? user.skillsOffered.map(s => <span key={s} className="skill-tag" style={{ fontSize:'0.7rem' }}>{s}</span>) : <span style={{ color:'#4b5563', fontSize:'0.78rem' }}>None added</span>}
            </div>
            <p style={{ color:'#6b7280', fontSize:'0.7rem', marginBottom:'5px' }}>LEARNING</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'4px' }}>
              {user?.skillsWanted?.length ? user.skillsWanted.map(s => <span key={s} className="skill-tag skill-tag-green" style={{ fontSize:'0.7rem' }}>{s}</span>) : <span style={{ color:'#4b5563', fontSize:'0.78rem' }}>None added</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}