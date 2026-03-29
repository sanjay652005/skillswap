import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const SKILLS = ['React', 'Python', 'UI/UX', 'Node.js', 'ML/AI', 'Flutter', 'DevOps', 'TypeScript'];

const FEATURES = [
  { icon: '🎯', title: 'AI Match Engine', desc: 'Get matched with the perfect skill partner in seconds using our AI algorithm.', color: '#f59e0b' },
  { icon: '💬', title: 'Real-time Workspace', desc: 'Chat, assign tasks, share code and track sessions — all in one place.', color: '#6d28d9' },
  { icon: '🤖', title: 'AI Code Reviewer', desc: 'Instant feedback on your code with scores, bugs, and improvement suggestions.', color: '#0891b2' },
  { icon: '🧠', title: 'AI Learning Path', desc: 'Personalized roadmap for any skill with resources, projects and timelines.', color: '#10b981' },
  { icon: '🏆', title: 'Trust Score', desc: 'Every user has a reputation score so you always know who to learn from.', color: '#f472b6' },
  { icon: '📊', title: 'Progress Tracker', desc: 'Set goals, track milestones and celebrate your learning achievements.', color: '#34d399' },
];

const WHY = [
  { icon: '💰', title: 'Save Money', desc: 'Skip expensive courses. Learn from real developers for free.' },
  { icon: '⚡', title: 'Learn Faster', desc: '1-on-1 skill exchange beats watching videos alone every time.' },
  { icon: '🤝', title: 'Build Connections', desc: 'Make real developer friends while growing your skills together.' },
];

export default function Landing() {
  const [scrolled, setScrolled]     = useState(false);
  const [activeSkill, setActiveSkill] = useState(0);
  const [stats, setStats] = useState({ users: '50+', exchanges: '100+', projects: '20+' });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveSkill(p => (p + 1) % SKILLS.length), 2000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    fetch(`${API}/users/stats`)
      .then(r => r.json())
      .then(d => {
        if (d.users) setStats({
          users: d.users + '+',
          exchanges: d.exchanges + '+',
          projects: d.projects + '+'
        });
      }).catch(() => {});
  }, []);

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', color: '#e2e8f0', fontFamily: 'DM Sans, sans-serif', overflowX: 'hidden' }}>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes glow  { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .hover-lift:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(109,40,217,0.2); }
        .hover-lift { transition: all 0.25s; }
        .cta-btn:hover { opacity: 0.88; transform: translateY(-2px); }
        .cta-btn { transition: all 0.2s; }
        @media(max-width:768px){
          .hide-mobile { display:none!important; }
          .mobile-full { width:100%!important; }
          .mobile-col { flex-direction:column!important; }
          .mobile-pad { padding:20px 16px!important; }
          .mobile-text-sm { font-size:0.85rem!important; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(10,10,15,0.95)' : 'transparent',
        borderBottom: scrolled ? '1px solid #1a1a26' : 'none',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        transition: 'all 0.3s'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 34, height: 34, borderRadius: '9px', background: 'linear-gradient(135deg,#6d28d9,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(109,40,217,0.4)' }}>
            <span style={{ color: 'white', fontWeight: 800, fontSize: '0.9rem' }}>S</span>
          </div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.15rem', background: 'linear-gradient(135deg,#a78bfa,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SkillSwap</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Link to="/login" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', padding: '8px 14px', borderRadius: '8px', whiteSpace: 'nowrap' }}>Sign In</Link>
          <Link to="/register" className="cta-btn" style={{ background: 'linear-gradient(135deg,#6d28d9,#8b5cf6)', color: 'white', textDecoration: 'none', fontSize: '0.9rem', padding: '9px 18px', borderRadius: '9px', fontWeight: 700, whiteSpace: 'nowrap', boxShadow: '0 0 20px rgba(109,40,217,0.3)' }}>
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* ── 1. HERO ── */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(100px,15vw,140px) 20px 60px', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '400px', background: 'radial-gradient(ellipse, rgba(109,40,217,0.14) 0%, transparent 70%)', animation: 'glow 5s ease-in-out infinite', pointerEvents: 'none' }}/>

        <div style={{ maxWidth: '780px', position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 14px', borderRadius: '999px', background: 'rgba(109,40,217,0.12)', border: '1px solid rgba(109,40,217,0.3)', marginBottom: '28px' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#a78bfa', display: 'inline-block', animation: 'glow 2s infinite' }}/>
            <span style={{ color: '#a78bfa', fontSize: '0.78rem', fontWeight: 600 }}>No money. Just skills.</span>
          </div>

          {/* Main headline */}
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(2.2rem, 6vw, 4.5rem)', fontWeight: 800, lineHeight: 1.05, marginBottom: '12px', letterSpacing: '-0.02em' }}>
            Learn Any Skill
          </h1>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(2.2rem, 6vw, 4.5rem)', fontWeight: 800, lineHeight: 1.05, marginBottom: '24px', letterSpacing: '-0.02em', background: 'linear-gradient(135deg,#c4b5fd,#8b5cf6,#6d28d9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Without Paying Money
          </h1>

          <p style={{ color: '#94a3b8', fontSize: 'clamp(1rem, 2.5vw, 1.15rem)', lineHeight: 1.7, marginBottom: '8px', maxWidth: '560px', margin: '0 auto 8px' }}>
            Exchange your skills with real developers.
          </p>
          <p style={{ color: '#6b7280', fontSize: 'clamp(0.9rem, 2vw, 1rem)', lineHeight: 1.7, marginBottom: '36px' }}>
            Teach <span style={{ color: '#a78bfa', fontWeight: 600 }}>{SKILLS[activeSkill]}</span> → Learn anything in return.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
            <Link to="/register" className="cta-btn" style={{
              background: 'linear-gradient(135deg,#6d28d9,#8b5cf6)', color: 'white',
              textDecoration: 'none', padding: '15px 32px', borderRadius: '12px',
              fontWeight: 700, fontSize: 'clamp(0.95rem,2.5vw,1.05rem)',
              boxShadow: '0 0 40px rgba(109,40,217,0.4)', whiteSpace: 'nowrap'
            }}>
              🚀 Start Learning Free
            </Link>
            <Link to="/explore" className="cta-btn" style={{
              color: '#a78bfa', textDecoration: 'none', padding: '15px 32px',
              borderRadius: '12px', fontWeight: 600, fontSize: 'clamp(0.95rem,2.5vw,1.05rem)',
              border: '1px solid rgba(109,40,217,0.4)', background: 'rgba(109,40,217,0.08)',
              whiteSpace: 'nowrap'
            }}>
              🔍 Find a Skill Partner
            </Link>
          </div>
          <p style={{ color: '#2e2e42', fontSize: '0.78rem' }}>Free forever · No credit card · Open source</p>

          {/* Social proof numbers */}
          <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', marginTop: '40px', flexWrap: 'wrap' }}>
            {[
              { val: stats.users, label: 'Active Learners' },
              { val: stats.exchanges, label: 'Skills Exchanged' },
              { val: stats.projects, label: 'Projects Built' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.6rem', fontWeight: 800, color: '#a78bfa', marginBottom: '2px' }}>{s.val}</p>
                <p style={{ color: '#4b5563', fontSize: '0.75rem' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. PROBLEM ── */}
      <section style={{ padding: 'clamp(60px,8vw,100px) 20px', background: '#0d0d14', borderTop: '1px solid #1a1a26', borderBottom: '1px solid #1a1a26', textAlign: 'center' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <p style={{ color: '#7c3aed', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.18em', marginBottom: '16px' }}>THE PROBLEM</p>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.02em' }}>
            Learning is expensive. <span style={{ color: '#4b5563' }}>It doesn't have to be.</span>
          </h2>
          <p style={{ color: '#6b7280', fontSize: 'clamp(0.9rem, 2vw, 1.05rem)', lineHeight: 1.8, marginBottom: '32px' }}>
            Courses cost hundreds of dollars. Bootcamps cost thousands. Most developers already have skills others need — but there's no platform to exchange them.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '14px 24px', borderRadius: '12px', background: 'rgba(109,40,217,0.1)', border: '1px solid rgba(109,40,217,0.25)' }}>
            <span style={{ fontSize: '1.4rem' }}>💡</span>
            <span style={{ color: '#a78bfa', fontWeight: 600, fontSize: 'clamp(0.9rem,2vw,1rem)' }}>SkillSwap fixes this. Teach what you know, learn what you don't.</span>
          </div>
        </div>
      </section>

      {/* ── 3. HOW IT WORKS ── */}
      <section style={{ padding: 'clamp(60px,8vw,100px) 20px', maxWidth: '960px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <p style={{ color: '#7c3aed', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.18em', marginBottom: '14px' }}>HOW IT WORKS</p>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>Start learning in 3 steps</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
          {[
            { num: '01', icon: '👤', title: 'Create Your Profile', desc: 'Add the skills you offer and what you want to learn. Takes 2 minutes.' },
            { num: '02', icon: '🎯', title: 'Find a Skill Partner', desc: 'Our AI engine instantly ranks the best matching developers for you.' },
            { num: '03', icon: '🚀', title: 'Start Learning Together', desc: 'Chat, collaborate and grow in your real-time shared workspace.' },
          ].map(s => (
            <div key={s.num} className="hover-lift" style={{ padding: '28px 24px', borderRadius: '16px', background: '#12121a', border: '1px solid #1e1e2e', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>{s.icon}</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.7rem', fontWeight: 700, color: '#3d3d52', letterSpacing: '0.15em', marginBottom: '8px' }}>STEP {s.num}</div>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '10px', color: '#e2e8f0' }}>{s.title}</h3>
              <p style={{ color: '#4b5563', fontSize: '0.85rem', lineHeight: 1.75 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. WHY SKILLSWAP ── */}
      <section style={{ padding: 'clamp(60px,8vw,100px) 20px', background: '#0d0d14', borderTop: '1px solid #1a1a26', borderBottom: '1px solid #1a1a26' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <p style={{ color: '#7c3aed', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.18em', marginBottom: '14px' }}>WHY SKILLSWAP</p>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>Built for real developers</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {WHY.map(w => (
              <div key={w.title} className="hover-lift" style={{ padding: '28px', borderRadius: '16px', background: 'rgba(109,40,217,0.06)', border: '1px solid rgba(109,40,217,0.15)', textAlign: 'center' }}>
                <div style={{ fontSize: '2.2rem', marginBottom: '14px' }}>{w.icon}</div>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '8px', color: '#e2e8f0' }}>{w.title}</h3>
                <p style={{ color: '#6b7280', fontSize: '0.85rem', lineHeight: 1.7 }}>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. FEATURES ── */}
      <section style={{ padding: 'clamp(60px,8vw,100px) 20px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <p style={{ color: '#7c3aed', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.18em', marginBottom: '14px' }}>FEATURES</p>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.02em' }}>Everything you need to grow</h2>
          <p style={{ color: '#4b5563', fontSize: 'clamp(0.9rem,2vw,1rem)', maxWidth: '480px', margin: '0 auto' }}>Not just another learning platform. SkillSwap puts AI at the core of every interaction.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {FEATURES.map(f => (
            <div key={f.title} className="hover-lift" style={{ padding: '24px', borderRadius: '16px', background: '#12121a', border: '1px solid #1e1e2e' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = f.color + '55'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e1e2e'; }}>
              <div style={{ width: 46, height: 46, borderRadius: '12px', background: f.color + '18', border: `1px solid ${f.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', marginBottom: '16px' }}>{f.icon}</div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.95rem', marginBottom: '8px', color: '#e2e8f0' }}>{f.title}</h3>
              <p style={{ color: '#4b5563', fontSize: '0.83rem', lineHeight: 1.75 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. SOCIAL PROOF ── */}
      <section style={{ padding: 'clamp(60px,8vw,80px) 20px', background: '#0d0d14', borderTop: '1px solid #1a1a26', borderBottom: '1px solid #1a1a26' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: '#7c3aed', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.18em', marginBottom: '32px' }}>TRUSTED BY DEVELOPERS</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '24px', marginBottom: '40px' }}>
            {[
              { val: stats.users, label: 'Active Learners', icon: '👥' },
              { val: stats.exchanges, label: 'Skills Exchanged', icon: '⇄' },
              { val: stats.projects, label: 'Projects Built', icon: '🚀' },
              { val: '100%', label: 'Free Forever', icon: '💚' },
            ].map(s => (
              <div key={s.label} style={{ padding: '20px', borderRadius: '14px', background: 'rgba(109,40,217,0.06)', border: '1px solid rgba(109,40,217,0.15)' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>{s.icon}</div>
                <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.8rem', fontWeight: 800, color: '#a78bfa', marginBottom: '4px' }}>{s.val}</p>
                <p style={{ color: '#4b5563', fontSize: '0.75rem' }}>{s.label}</p>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['✔ No credit card required', '✔ Open source', '✔ Built for developers'].map(t => (
              <span key={t} style={{ color: '#34d399', fontSize: '0.82rem', fontWeight: 500 }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. CTA ── */}
      <section style={{ padding: 'clamp(80px,10vw,120px) 20px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '500px', height: '300px', background: 'radial-gradient(ellipse, rgba(109,40,217,0.14) 0%, transparent 65%)', pointerEvents: 'none', animation: 'glow 4s ease-in-out infinite' }}/>
        <div style={{ position: 'relative', maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Ready to start swapping?
          </h2>
          <p style={{ color: '#6b7280', fontSize: 'clamp(0.95rem,2vw,1.05rem)', marginBottom: '36px', lineHeight: 1.7 }}>
            Join SkillSwap today. Find your perfect skill partner in seconds. <br/>
            <span style={{ color: '#a78bfa', fontWeight: 600 }}>No money. Just skills.</span>
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="cta-btn" style={{
              background: 'linear-gradient(135deg,#6d28d9,#8b5cf6)', color: 'white',
              textDecoration: 'none', padding: '16px 36px', borderRadius: '12px',
              fontWeight: 700, fontSize: 'clamp(0.95rem,2.5vw,1.05rem)',
              boxShadow: '0 0 50px rgba(109,40,217,0.4)', whiteSpace: 'nowrap'
            }}>
              🚀 Start Learning Free
            </Link>
            <Link to="/login" className="cta-btn" style={{
              color: '#94a3b8', textDecoration: 'none', padding: '16px 36px',
              borderRadius: '12px', fontWeight: 600, fontSize: 'clamp(0.95rem,2.5vw,1.05rem)',
              border: '1px solid #2a2a3d', background: 'rgba(255,255,255,0.02)', whiteSpace: 'nowrap'
            }}>
              Sign In
            </Link>
          </div>
          <p style={{ color: '#2e2e42', fontSize: '0.78rem', marginTop: '16px' }}>Free forever · No credit card · Open source</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: '24px 20px', borderTop: '1px solid #1a1a26', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 28, height: 28, borderRadius: '7px', background: 'linear-gradient(135deg,#6d28d9,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontWeight: 800, fontSize: '0.75rem' }}>S</span>
          </div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#4b5563', fontSize: '0.9rem' }}>SkillSwap</span>
          <span style={{ color: '#2e2e42', fontSize: '0.78rem', marginLeft: '8px' }}>· No money. Just skills.</span>
        </div>
        <p style={{ color: '#2e2e42', fontSize: '0.78rem' }}>Built with ❤️ · MERN + Groq AI</p>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link to="/login" style={{ color: '#3d3d52', textDecoration: 'none', fontSize: '0.82rem' }}>Sign In</Link>
          <Link to="/register" style={{ color: '#3d3d52', textDecoration: 'none', fontSize: '0.82rem' }}>Register</Link>
          <a href="https://github.com/sanjay652005/skillswap" target="_blank" rel="noreferrer" style={{ color: '#3d3d52', textDecoration: 'none', fontSize: '0.82rem' }}>GitHub ↗</a>
        </div>
      </footer>
    </div>
  );
}