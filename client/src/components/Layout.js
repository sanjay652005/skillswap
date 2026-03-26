import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const icons = { dashboard:'⬡', explore:'◎', exchanges:'⇄', projects:'◈', messages:'💬', learning:'🧠', progress:'📊', ai:'✦', profile:'◉', logout:'⏻' };

const BOTTOM_TABS = [
  { to: '/app/dashboard',  icon: '⬡', label: 'Home'    },
  { to: '/app/explore',    icon: '◎', label: 'Explore' },
  { to: '/app/messages',   icon: '💬', label: 'Messages'},
  { to: '/app/ai',         icon: '✦', label: 'AI'      },
  { to: '/app/profile',    icon: '◉', label: 'Profile' },
];

const SIDEBAR_GROUPS = [
  {
    label: 'CORE',
    items: [
      { to: '/app/dashboard',  icon: '⬡',  label: 'Dashboard',  accent: true },
      { to: '/app/ai-matches', icon: '🎯', label: 'AI Matches',  highlight: true, accent: true },
      { to: '/app/explore',    icon: '◎',  label: 'Explore'    },
    ]
  },
  {
    label: 'WORK',
    items: [
      { to: '/app/exchanges', icon: '⇄',  label: 'Exchanges' },
      { to: '/app/projects',  icon: '◈',  label: 'Projects'  },
      { to: '/app/messages',  icon: '💬', label: 'Messages'  },
    ]
  },
  {
    label: 'AI / LEARNING',
    items: [
      { to: '/app/learning-path', icon: '🧠', label: 'Learning Path' },
      { to: '/app/progress',      icon: '📊', label: 'Progress'      },
      { to: '/app/ai',            icon: '✦',  label: 'AI Assistant'  },
    ]
  },
];

// ── Nav Item ─────────────────────────────────────────────────────
const NavItem = ({ to, icon, label, highlight, accent, collapsed }) => (
  <NavLink key={to} to={to} style={({ isActive }) => ({
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: collapsed ? '10px' : '9px 14px',
    margin: '1px 8px', borderRadius: '8px',
    textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500,
    transition: 'all 0.15s', cursor: 'pointer', position: 'relative',
    justifyContent: collapsed ? 'center' : 'flex-start',
    // Active state — purple glow + left border
    background: isActive
      ? 'linear-gradient(135deg, rgba(109,40,217,0.2), rgba(139,92,246,0.1))'
      : 'transparent',
    color: isActive ? '#c4b5fd' : accent ? '#94a3b8' : '#6b7280',
    borderLeft: isActive ? '2px solid #8b5cf6' : '2px solid transparent',
    boxShadow: isActive ? 'inset 0 0 20px rgba(109,40,217,0.08)' : 'none',
  })}>
    <span style={{
      fontSize: '1.1rem', width: 20, textAlign: 'center', flexShrink: 0,
      filter: accent ? 'brightness(1.3)' : 'none'
    }}>{icon}</span>
    {!collapsed && <span style={{ flex: 1 }}>{label}</span>}
    {highlight && !collapsed && (
      <span style={{
        background: 'linear-gradient(135deg,#f59e0b,#fbbf24)',
        color: '#000', fontSize: '0.58rem', fontWeight: 800,
        padding: '1px 6px', borderRadius: '999px', letterSpacing: '0.05em'
      }}>NEW</span>
    )}
  </NavLink>
);

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [isMobile, setIsMobile]     = useState(window.innerWidth < 768);
  const [trustData, setTrustData]   = useState(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => { setMobileMenu(false); }, [location.pathname]);

  // Fetch trust score for sidebar profile card
  useEffect(() => {
    if (user?._id) {
      import('../utils/api').then(({ default: api }) => {
        api.get(`/matching/trust/${user._id}`)
          .then(r => setTrustData(r.data))
          .catch(() => {});
      });
    }
  }, [user?._id]);

  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || 'U';

  // ── Profile Card ─────────────────────────────────────────────
  const ProfileCard = ({ mobile = false }) => (
    <div style={{ padding: mobile ? '12px' : '12px 8px', borderTop: '1px solid #2a2a3d' }}>
      <NavLink to="/profile" style={({ isActive }) => ({
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '8px', borderRadius: '8px', textDecoration: 'none',
        background: isActive ? 'rgba(109,40,217,0.15)' : 'rgba(255,255,255,0.02)',
        border: '1px solid #2a2a3d', marginBottom: '6px', transition: 'all 0.15s'
      })}>
        <div className="avatar" style={{ width: 30, height: 30, fontSize: '0.7rem', flexShrink: 0 }}>{initials}</div>
        {!collapsed && (
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: '#e2e8f0', fontSize: '0.82rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
            {trustData ? (
              <p style={{ fontSize: '0.68rem', color: trustData.trustColor || '#a78bfa' }}>
                ⭐ {trustData.trustLevel} · {trustData.trustScore} score
              </p>
            ) : (
              <p style={{ color: '#4b5563', fontSize: '0.68rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
            )}
          </div>
        )}
      </NavLink>

      {/* Sign out — subtle, stronger on hover */}
      <button onClick={handleLogout}
        style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '7px 8px', borderRadius: '8px', border: 'none',
          background: 'none', cursor: 'pointer', width: '100%',
          color: '#4b5563', fontSize: '0.82rem', transition: 'all 0.15s',
          justifyContent: collapsed ? 'center' : 'flex-start'
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(248,113,113,0.08)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = '#4b5563'; e.currentTarget.style.background = 'none'; }}>
        <span style={{ fontSize: '1rem', width: 20, textAlign: 'center', flexShrink: 0 }}>{icons.logout}</span>
        {!collapsed && <span>Sign Out</span>}
      </button>

      {/* Collapse — icon only with tooltip */}
      {!mobile && (
        <button onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '10px', padding: '7px 8px', borderRadius: '8px', border: 'none',
            background: 'none', cursor: 'pointer', width: '100%',
            color: '#3d3d52', fontSize: '0.85rem', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#3d3d52'; e.currentTarget.style.background = 'none'; }}>
          <span style={{ fontSize: '1rem' }}>{collapsed ? '→' : '←'}</span>
        </button>
      )}
    </div>
  );

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:'#0a0a0f', position:'fixed', top:0, left:0, right:0, bottom:0 }}>
      <div className="animated-bg" />

      {/* ── DESKTOP SIDEBAR ── */}
      {!isMobile && (
        <aside className="sidebar flex flex-col" style={{ width: collapsed ? '64px' : '248px', transition:'width 0.25s ease', flexShrink:0 }}>
          {/* Logo */}
          <div style={{ padding: collapsed ? '16px 0' : '16px 20px', display:'flex', alignItems:'center', gap:'10px', borderBottom:'1px solid #2a2a3d', justifyContent: collapsed ? 'center' : 'flex-start' }}>
            <div style={{ width:32, height:32, borderRadius:'8px', background:'linear-gradient(135deg,#6d28d9,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <span style={{ color:'white', fontWeight:800, fontSize:'0.8rem' }}>S</span>
            </div>
            {!collapsed && <span className="font-display font-bold text-lg gradient-text">SkillSwap</span>}
          </div>

          {/* Nav */}
          <nav style={{ flex:1, paddingTop:'8px', overflowY:'auto' }}>
            {SIDEBAR_GROUPS.map(group => (
              <div key={group.label} style={{ marginBottom: '2px' }}>
                {!collapsed && (
                  <p style={{ color:'#2e2e42', fontSize:'0.62rem', fontWeight:700, letterSpacing:'0.12em', padding:'10px 20px 3px' }}>{group.label}</p>
                )}
                {collapsed && <div style={{ height:'6px' }}/>}
                {group.items.map(item => (
                  <NavItem key={item.to} {...item} collapsed={collapsed} />
                ))}
              </div>
            ))}
          </nav>

          <ProfileCard />
        </aside>
      )}

      {/* ── MOBILE SLIDE-IN MENU ── */}
      {isMobile && mobileMenu && (
        <>
          <div onClick={() => setMobileMenu(false)}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:40, backdropFilter:'blur(4px)' }}/>
          <div style={{ position:'fixed', top:0, left:0, bottom:0, width:'260px', zIndex:50, background:'#12121a', borderRight:'1px solid #2a2a3d', display:'flex', flexDirection:'column', animation:'slideInLeft 0.25s ease' }}>
            <style>{`@keyframes slideInLeft { from { transform: translateX(-100%) } to { transform: translateX(0) } }`}</style>
            <div style={{ padding:'16px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #2a2a3d' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <div style={{ width:30, height:30, borderRadius:'8px', background:'linear-gradient(135deg,#6d28d9,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ color:'white', fontWeight:800, fontSize:'0.8rem' }}>S</span>
                </div>
                <span className="font-display font-bold gradient-text">SkillSwap</span>
              </div>
              <button onClick={() => setMobileMenu(false)} style={{ background:'none', border:'none', color:'#6b7280', fontSize:'1.2rem', cursor:'pointer' }}>✕</button>
            </div>

            <nav style={{ flex:1, paddingTop:'8px', overflowY:'auto' }}>
              {SIDEBAR_GROUPS.map(group => (
                <div key={group.label} style={{ marginBottom:'2px' }}>
                  <p style={{ color:'#2e2e42', fontSize:'0.62rem', fontWeight:700, letterSpacing:'0.12em', padding:'10px 20px 3px' }}>{group.label}</p>
                  {group.items.map(item => <NavItem key={item.to} {...item} collapsed={false} />)}
                </div>
              ))}
            </nav>

            <ProfileCard mobile />
          </div>
        </>
      )}

      {/* ── MAIN CONTENT ── */}
      <main style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0, maxWidth:'100%' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 16px', borderBottom:'1px solid #2a2a3d', background:'#12121a', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            {isMobile && (
              <button onClick={() => setMobileMenu(true)} style={{ background:'none', border:'none', color:'#94a3b8', cursor:'pointer', padding:'4px 8px', display:'flex', flexDirection:'column', gap:'4px' }}>
                <span style={{ display:'block', width:20, height:2, background:'#94a3b8', borderRadius:2 }}/>
                <span style={{ display:'block', width:20, height:2, background:'#94a3b8', borderRadius:2 }}/>
                <span style={{ display:'block', width:20, height:2, background:'#94a3b8', borderRadius:2 }}/>
              </button>
            )}
            {isMobile && <span className="font-display font-bold gradient-text" style={{ fontSize:'1rem' }}>SkillSwap</span>}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginLeft:'auto' }}>
            <NotificationBell />
          </div>
        </div>

        <div style={{ flex:1, overflowY:'auto', overflowX:'hidden', paddingBottom: isMobile ? '72px' : '0', minWidth:0, width:'100%' }}>
          <Outlet />
        </div>
      </main>

      {/* ── MOBILE BOTTOM TAB BAR ── */}
      {isMobile && (
        <nav style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:30, background:'#12121a', borderTop:'1px solid #2a2a3d', display:'flex', height:'64px', boxShadow:'0 -4px 20px rgba(0,0,0,0.4)' }}>
          {BOTTOM_TABS.map(({ to, icon, label }) => {
            const isActive = location.pathname.startsWith(to) && (to !== '/dashboard' || location.pathname === '/dashboard');
            return (
              <NavLink key={to} to={to} style={{
                flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'2px',
                textDecoration:'none', color: isActive ? '#a78bfa' : '#6b7280',
                background: isActive ? 'rgba(109,40,217,0.08)' : 'transparent',
                transition:'all 0.15s', borderTop: isActive ? '2px solid #6d28d9' : '2px solid transparent'
              }}>
                <span style={{ fontSize:'1.2rem', lineHeight:1 }}>{icon}</span>
                <span style={{ fontSize:'0.62rem', fontWeight: isActive ? 600 : 400 }}>{label}</span>
              </NavLink>
            );
          })}
        </nav>
      )}
    </div>
  );
}