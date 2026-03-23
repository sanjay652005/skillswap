import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../utils/socket';
import api from '../utils/api';

const initials = (name) => name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)||'U';

const LEVEL_COLORS = {
  1:'#6b7280', 2:'#34d399', 3:'#60a5fa',
  4:'#a78bfa', 5:'#f59e0b', 6:'#ef4444', 7:'#ec4899', 8:'#8b5cf6'
};

// ── XP Toast (real-time popup) ─────────────────────────────────
export const XPToast = ({ event, onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 4000); return () => clearTimeout(t); }, []);
  return (
    <div style={{
      position:'fixed', bottom:'24px', right:'24px', zIndex:9999,
      background:'#12121a', border:'1px solid rgba(109,40,217,0.5)',
      borderRadius:'12px', padding:'14px 18px', minWidth:'240px',
      boxShadow:'0 8px 32px rgba(0,0,0,0.4)', animation:'slideInRight 0.3s ease'
    }}>
      <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
        <span style={{fontSize:'1.5rem'}}>⚡</span>
        <div>
          <p style={{color:'#a78bfa',fontWeight:700,fontSize:'0.85rem'}}>+{event.amount} XP</p>
          <p style={{color:'#e2e8f0',fontSize:'0.8rem'}}>{event.action?.replace(/_/g,' ')}</p>
        </div>
        <span style={{
          marginLeft:'auto', background:'rgba(109,40,217,0.2)',
          color:'#a78bfa', borderRadius:'999px', padding:'2px 8px', fontSize:'0.75rem', fontWeight:600
        }}>{event.total} XP</span>
      </div>
      {event.leveledUp && (
        <div style={{marginTop:'8px',padding:'6px 10px',borderRadius:'8px',background:'rgba(245,158,11,0.15)',border:'1px solid rgba(245,158,11,0.3)'}}>
          <p style={{color:'#fbbf24',fontWeight:700,fontSize:'0.82rem'}}>🎉 Level Up! → {event.levelTitle}</p>
        </div>
      )}
      {event.newBadges?.length > 0 && event.newBadges.map(b => (
        <div key={b.id} style={{marginTop:'6px',padding:'6px 10px',borderRadius:'8px',background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.3)'}}>
          <p style={{color:'#34d399',fontWeight:700,fontSize:'0.82rem'}}>{b.icon} Badge Unlocked: {b.name}</p>
        </div>
      ))}
    </div>
  );
};

// ── My Stats Card ──────────────────────────────────────────────
const MyStatsCard = ({ stats }) => {
  if (!stats) return null;
  const { xp, levelInfo, rank, badges, stats: s } = stats;
  const color = LEVEL_COLORS[levelInfo?.level] || '#6b7280';

  return (
    <div className="glass p-5 mb-6 fade-in" style={{border:`1px solid ${color}40`}}>
      <div style={{display:'flex',alignItems:'center',gap:'16px',flexWrap:'wrap'}}>
        {/* Level badge */}
        <div style={{
          width:64, height:64, borderRadius:'50%', flexShrink:0,
          background:`${color}20`, border:`3px solid ${color}`,
          display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'
        }}>
          <span style={{color,fontWeight:800,fontSize:'1.3rem',lineHeight:1}}>{levelInfo?.level}</span>
          <span style={{color,fontSize:'0.55rem',fontWeight:600,letterSpacing:'0.05em'}}>LVL</span>
        </div>

        {/* XP + level */}
        <div style={{flex:1,minWidth:'180px'}}>
          <div style={{display:'flex',alignItems:'baseline',gap:'8px',marginBottom:'4px'}}>
            <span className="font-display font-bold" style={{color,fontSize:'1.1rem'}}>{levelInfo?.title}</span>
            <span style={{color:'#6b7280',fontSize:'0.8rem'}}>Rank #{rank} globally</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'6px'}}>
            <span style={{color:'#e2e8f0',fontWeight:700}}>{xp} XP</span>
            {levelInfo?.next && <span style={{color:'#4b5563',fontSize:'0.78rem'}}>{levelInfo.xpForNext} XP to {levelInfo.next.title}</span>}
          </div>
          {/* Progress bar */}
          <div style={{height:6,borderRadius:'999px',background:'#1a1a26',overflow:'hidden'}}>
            <div style={{
              height:'100%', width:`${levelInfo?.progress||0}%`,
              background:`linear-gradient(90deg,${color},${color}cc)`,
              borderRadius:'999px', transition:'width 0.8s ease'
            }}/>
          </div>
        </div>

        {/* Quick stats */}
        <div style={{display:'flex',gap:'16px',flexWrap:'wrap'}}>
          {[
            { label:'Exchanges', value: s?.exchangesCompleted||0, icon:'⇄' },
            { label:'Projects',  value: s?.projectsCompleted||0,  icon:'◈' },
            { label:'Badges',    value: badges?.length||0,         icon:'🏅' },
            { label:'Rating',    value: (stats.rating||0).toFixed(1), icon:'⭐' },
          ].map(stat => (
            <div key={stat.label} style={{textAlign:'center'}}>
              <p style={{fontSize:'1.1rem',marginBottom:'2px'}}>{stat.icon}</p>
              <p style={{color:'#e2e8f0',fontWeight:700,fontSize:'1rem'}}>{stat.value}</p>
              <p style={{color:'#6b7280',fontSize:'0.7rem'}}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent badges */}
      {badges?.length > 0 && (
        <div style={{marginTop:'14px',paddingTop:'14px',borderTop:'1px solid #2a2a3d'}}>
          <p style={{color:'#6b7280',fontSize:'0.72rem',fontWeight:600,letterSpacing:'0.05em',marginBottom:'8px'}}>YOUR BADGES</p>
          <div style={{display:'flex',flexWrap:'wrap',gap:'8px'}}>
            {badges.map(b => (
              <div key={b.id} title={b.desc} style={{
                display:'flex',alignItems:'center',gap:'5px',
                padding:'4px 10px',borderRadius:'999px',
                background:'rgba(109,40,217,0.15)',border:'1px solid rgba(109,40,217,0.3)'
              }}>
                <span style={{fontSize:'0.9rem'}}>{b.icon}</span>
                <span style={{color:'#a78bfa',fontSize:'0.75rem',fontWeight:500}}>{b.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Badges Grid ────────────────────────────────────────────────
const BadgesGrid = ({ allBadges }) => (
  <div>
    <h3 className="font-display font-semibold mb-4" style={{color:'#e2e8f0'}}>All Badges</h3>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:'10px'}}>
      {allBadges?.map(b => (
        <div key={b.id} style={{
          padding:'14px',borderRadius:'10px',textAlign:'center',
          background: b.earned ? 'rgba(109,40,217,0.1)' : '#12121a',
          border: `1px solid ${b.earned ? 'rgba(109,40,217,0.4)' : '#2a2a3d'}`,
          opacity: b.earned ? 1 : 0.5, transition:'all 0.2s'
        }}>
          <p style={{fontSize:'1.8rem',marginBottom:'6px',filter:b.earned?'none':'grayscale(1)'}}>{b.icon}</p>
          <p style={{color: b.earned ? '#e2e8f0' : '#6b7280', fontSize:'0.8rem',fontWeight:600,marginBottom:'3px'}}>{b.name}</p>
          <p style={{color:'#4b5563',fontSize:'0.7rem',lineHeight:1.3}}>{b.desc}</p>
          {b.earned && b.earnedAt && (
            <p style={{color:'#6d28d9',fontSize:'0.65rem',marginTop:'4px'}}>
              ✓ {new Date(b.earnedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      ))}
    </div>
  </div>
);

// ── Leaderboard Table ──────────────────────────────────────────
const LeaderboardTable = ({ data, currentUserId }) => (
  <div>
    <h3 className="font-display font-semibold mb-4" style={{color:'#e2e8f0'}}>Top Players</h3>
    <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
      {data.map((u, i) => {
        const isMe = String(u._id) === String(currentUserId);
        const color = LEVEL_COLORS[u.level] || '#6b7280';
        const medal = i===0?'🥇':i===1?'🥈':i===2?'🥉':null;
        return (
          <div key={u._id} style={{
            display:'flex', alignItems:'center', gap:'12px',
            padding:'12px 16px', borderRadius:'10px',
            background: isMe ? 'rgba(109,40,217,0.12)' : '#12121a',
            border: `1px solid ${isMe ? 'rgba(109,40,217,0.4)' : '#2a2a3d'}`,
            transition:'all 0.15s'
          }}>
            {/* Rank */}
            <div style={{width:32,textAlign:'center',flexShrink:0}}>
              {medal
                ? <span style={{fontSize:'1.3rem'}}>{medal}</span>
                : <span style={{color:'#4b5563',fontWeight:700,fontSize:'0.9rem'}}>#{u.rank}</span>
              }
            </div>

            {/* Avatar */}
            <div style={{
              width:38,height:38,borderRadius:'50%',flexShrink:0,
              background:`hsl(${(i*67+250)%360},55%,48%)`,
              display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:'0.78rem',fontWeight:700,color:'white',
              border:`2px solid ${color}60`
            }}>{initials(u.name)}</div>

            {/* Name + level */}
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                <p style={{color: isMe?'#a78bfa':'#e2e8f0', fontWeight: isMe?700:500, fontSize:'0.875rem'}}>
                  {u.name} {isMe && <span style={{color:'#6b7280',fontSize:'0.75rem'}}>(you)</span>}
                </p>
                <span style={{
                  background:`${color}20`,color,border:`1px solid ${color}40`,
                  borderRadius:'999px',fontSize:'0.65rem',fontWeight:600,padding:'1px 7px',flexShrink:0
                }}>Lv.{u.level} {u.levelInfo?.title}</span>
              </div>
              {/* Mini XP bar */}
              <div style={{display:'flex',alignItems:'center',gap:'6px',marginTop:'4px'}}>
                <div style={{flex:1,height:4,borderRadius:'999px',background:'#1a1a26',overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${u.levelInfo?.progress||0}%`,background:color,borderRadius:'999px'}}/>
                </div>
                <span style={{color:'#6b7280',fontSize:'0.7rem',flexShrink:0}}>{u.xp} XP</span>
              </div>
            </div>

            {/* Badges + stats */}
            <div style={{display:'flex',alignItems:'center',gap:'12px',flexShrink:0}}>
              <div style={{textAlign:'center'}}>
                <p style={{color:'#e2e8f0',fontWeight:700,fontSize:'0.9rem'}}>{u.badgeCount}</p>
                <p style={{color:'#4b5563',fontSize:'0.65rem'}}>badges</p>
              </div>
              <div style={{textAlign:'center'}}>
                <p style={{color:'#e2e8f0',fontWeight:700,fontSize:'0.9rem'}}>{u.stats?.exchangesCompleted||0}</p>
                <p style={{color:'#4b5563',fontSize:'0.65rem'}}>exchanges</p>
              </div>
              <div style={{display:'flex',gap:'2px'}}>
                {u.topBadges?.map(b => (
                  <span key={b.id} title={b.name} style={{fontSize:'1rem'}}>{b.icon}</span>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

// ── Main Page ──────────────────────────────────────────────────
export default function Leaderboard() {
  const { user } = useAuth();
  const socket   = getSocket();
  const [tab, setTab]           = useState('leaderboard');
  const [myStats, setMyStats]   = useState(null);
  const [board, setBoard]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [xpEvent, setXpEvent]   = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/gamification/me'),
      api.get('/gamification/leaderboard')
    ]).then(([me, lb]) => {
      setMyStats(me.data);
      setBoard(lb.data);
    }).catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  // Real-time XP toast
  useEffect(() => {
    if (!socket) return;
    socket.on('xp_gained', (event) => {
      setXpEvent(event);
      // Refresh my stats
      api.get('/gamification/me').then(r => setMyStats(r.data)).catch(()=>{});
    });
    return () => socket.off('xp_gained');
  }, [socket]);

  const TABS = [
    { id:'leaderboard', label:'🏆 Leaderboard' },
    { id:'badges',      label:'🏅 Badges' },
    { id:'levels',      label:'⚡ How XP Works' },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 slide-up">
        <h1 className="font-display text-3xl font-bold gradient-text mb-1">Leaderboard</h1>
        <p style={{color:'#94a3b8'}}>Earn XP by exchanging skills, completing projects, and helping teammates</p>
      </div>

      {/* My stats */}
      {!loading && <MyStatsCard stats={myStats} />}

      {/* Tabs */}
      <div style={{display:'flex',gap:'8px',marginBottom:'20px'}}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              padding:'7px 16px', borderRadius:'8px', border:'none', cursor:'pointer',
              background: tab===t.id ? 'rgba(109,40,217,0.2)' : '#1a1a26',
              color: tab===t.id ? '#a78bfa' : '#94a3b8',
              outline: tab===t.id ? '1px solid rgba(109,40,217,0.4)' : '1px solid #2a2a3d',
              fontWeight: tab===t.id ? 600 : 400, fontSize:'0.875rem'
            }}>{t.label}</button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : (
        <>
          {tab === 'leaderboard' && <LeaderboardTable data={board} currentUserId={user?._id} />}
          {tab === 'badges'      && <BadgesGrid allBadges={myStats?.allBadges} />}
          {tab === 'levels'      && (
            <div>
              <h3 className="font-display font-semibold mb-4" style={{color:'#e2e8f0'}}>Level Progression</h3>
              <div style={{display:'flex',flexDirection:'column',gap:'8px',marginBottom:'28px'}}>
                {[
                  {level:1,xp:0,title:'Newcomer',color:'#6b7280'},
                  {level:2,xp:100,title:'Explorer',color:'#34d399'},
                  {level:3,xp:300,title:'Contributor',color:'#60a5fa'},
                  {level:4,xp:600,title:'Builder',color:'#a78bfa'},
                  {level:5,xp:1000,title:'Collaborator',color:'#f59e0b'},
                  {level:6,xp:1500,title:'Expert',color:'#ef4444'},
                  {level:7,xp:2500,title:'Mentor',color:'#ec4899'},
                  {level:8,xp:4000,title:'Legend',color:'#8b5cf6'},
                ].map(l => {
                  const isCurrent = myStats?.level === l.level;
                  return (
                    <div key={l.level} style={{
                      display:'flex',alignItems:'center',gap:'12px',padding:'10px 14px',
                      borderRadius:'8px',background: isCurrent?`${l.color}15`:'#12121a',
                      border:`1px solid ${isCurrent?l.color+'60':'#2a2a3d'}`
                    }}>
                      <div style={{
                        width:36,height:36,borderRadius:'50%',flexShrink:0,
                        background:`${l.color}20`,border:`2px solid ${l.color}`,
                        display:'flex',alignItems:'center',justifyContent:'center',
                        color:l.color,fontWeight:800,fontSize:'0.9rem'
                      }}>{l.level}</div>
                      <div style={{flex:1}}>
                        <span style={{color:l.color,fontWeight:600,fontSize:'0.875rem'}}>{l.title}</span>
                        {isCurrent && <span style={{color:'#6b7280',fontSize:'0.75rem',marginLeft:'8px'}}>← you are here</span>}
                      </div>
                      <span style={{color:'#6b7280',fontSize:'0.8rem'}}>{l.xp} XP</span>
                    </div>
                  );
                })}
              </div>

              <h3 className="font-display font-semibold mb-4" style={{color:'#e2e8f0'}}>How to Earn XP</h3>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:'10px'}}>
                {[
                  { action:'Complete an exchange',  xp:100, icon:'⇄' },
                  { action:'Complete a project',    xp:150, icon:'◈' },
                  { action:'Receive a compliment',  xp:30,  icon:'⭐' },
                  { action:'Give a compliment',     xp:10,  icon:'💛' },
                  { action:'Get accepted to project',xp:20, icon:'✅' },
                  { action:'3-day login streak',    xp:25,  icon:'🔥' },
                  { action:'7-day login streak',    xp:75,  icon:'💪' },
                ].map(a => (
                  <div key={a.action} style={{
                    padding:'12px',borderRadius:'8px',background:'#12121a',
                    border:'1px solid #2a2a3d',display:'flex',alignItems:'center',gap:'10px'
                  }}>
                    <span style={{fontSize:'1.3rem'}}>{a.icon}</span>
                    <div>
                      <p style={{color:'#e2e8f0',fontSize:'0.8rem'}}>{a.action}</p>
                      <p style={{color:'#a78bfa',fontWeight:700,fontSize:'0.85rem'}}>+{a.xp} XP</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* XP Toast */}
      {xpEvent && <XPToast event={xpEvent} onDone={() => setXpEvent(null)} />}
    </div>
  );
}
