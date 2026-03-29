import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const SKILLS = ['React', 'Python', 'UI/UX', 'Node.js', 'Flutter', 'ML/AI', 'DevOps', 'TypeScript'];

const FEATURES = [
  { icon: '🎯', title: 'AI Match Engine', desc: 'Our algorithm finds your perfect skill partner in seconds — by compatibility, availability and rating.', color: '#f59e0b' },
  { icon: '💬', title: 'Real-time Workspace', desc: 'Chat, share tasks, track sessions and collaborate live — all inside one dedicated workspace.', color: '#6d28d9' },
  { icon: '🤖', title: 'AI Code Reviewer', desc: 'Get instant feedback on your code with scores, issue detection and suggested improvements.', color: '#0891b2' },
  { icon: '🧠', title: 'AI Learning Path', desc: 'Personalized step-by-step roadmaps for any skill. With resources, projects and partner tips.', color: '#10b981' },
  { icon: '🏆', title: 'Trust Score System', desc: 'Every user earns a reputation score based on completions, ratings and reliability.', color: '#f472b6' },
  { icon: '📊', title: 'Progress Tracker', desc: 'Set goals, track milestones and visualize your learning journey over time.', color: '#34d399' },
];

const HOW_IT_WORKS = [
  { num: '01', icon: '👤', title: 'Create Your Profile', desc: 'Add skills you offer and skills you want to learn. Takes 2 minutes.' },
  { num: '02', icon: '🎯', title: 'Find a Skill Partner', desc: 'Our AI matches you with the best partner based on your goals and availability.' },
  { num: '03', icon: '🚀', title: 'Start Learning Together', desc: 'Collaborate in real-time workspaces. Teach, learn and grow — for free.' },
];

const WHY_SKILLSWAP = [
  { icon: '💰', title: 'Save Money', desc: 'No subscription fees. No course payments. Trade skills directly with other developers.' },
  { icon: '⚡', title: 'Learn Faster', desc: 'Learn from real developers who use the skill daily — not just tutorial creators.' },
  { icon: '🤝', title: 'Build Real Connections', desc: 'Every exchange builds your network. Collaborate on projects. Grow together.' },
];

const SOCIAL_PROOF = [
  { value: '50+', label: 'Active Learners' },
  { value: '100+', label: 'Skills Exchanged' },
  { value: '20+', label: 'Projects Built' },
  { value: '100%', label: 'Free Forever' },
];

export default function Landing() {
  const [scrolled, setScrolled]     = useState(false);
  const [activeSkill, setActiveSkill] = useState(0);
  const [stats, setStats]           = useState(SOCIAL_PROOF);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const i = setInterval(() => setActiveSkill(p => (p + 1) % SKILLS.length), 2000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    fetch(`${API}/users/stats`)
      .then(r => r.json())
      .then(d => {
        if (d.users) setStats([
          { value: d.users + '+', label: 'Active Learners' },
          { value: d.exchanges + '+', label: 'Skills Exchanged' },
          { value: d.projects + '+', label: 'Projects Built' },
          { value: '100%', label: 'Free Forever' },
        ]);
      }).catch(() => {});
  }, []);

  return (
    <div style={{ background: '#0a0a0f', color: '#e2e8f0', fontFamily: 'DM Sans, sans-serif', overflowX: 'hidden' }}>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes glow  { 0%,100%{opacity:0.4} 50%{opacity:0.9} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .skill-pill { animation: float 3s ease-in-out infinite; }
        .glow-orb   { animation: glow 4s ease-in-out infinite; }
        .fade-up    { animation: fadeUp 0.6s ease forwards; }
        .hover-lift { transition: transform 0.2s, box-shadow 0.2s; }
        .hover-lift:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(109,40,217,0.2); }
        .cta-btn { transition: all 0.2s; }
        .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 0 40px rgba(109,40,217,0.5); }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(10,10,15,0.95)' : 'transparent',
        borderBottom: scrolled ? '1px solid #1a1a26' : 'none',
        backdropFilter: scrolled ? 'blur(16px)' : 'none', transition: 'all 0.3s'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'linear-gradient(135deg,#6d28d9,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(109,40,217,0.4)', flexShrink: 0 }}>
            <span style={{ color: 'white', fontWeight: 800, fontSize: '0.85rem' }}>S</span>
          </div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.1rem', background: 'linear-gradient(135deg,#a78bfa,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SkillSwap</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link to="/login" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.88rem', padding: '8px 14px' }}>Sign In</Link>
          <Link to="/register" className="cta-btn" style={{ background: 'linear-gradient(135deg,#6d28d9,#8b5cf6)', color: 'white', textDecoration: 'none', fontSize: '0.88rem', padding: '9px 18px', borderRadius: '8px', fontWeight: 700, boxShadow: '0 0 20px rgba(109,40,217,0.3)', whiteSpace: 'nowrap' }}>
            Start Free
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(110px,18vw,150px) 20px 60px', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
        {/* Orbs */}
        <div className="glow-orb" style={{ position: 'absolute', top: '20%', left: '5%', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(109,40,217,0.14) 0%, transparent 70%)', pointerEvents: 'none' }}/>
        <div className="glow-orb" style={{ position: 'absolute', bottom: '15%', right: '5%', width: '280px', height: '280px', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', pointerEvents: 'none', animationDelay: '2s' }}/>

        <div style={{ maxWidth: '720px', position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 14px', borderRadius: '999px', background: 'rgba(109,40,217,0.12)', border: '1px solid rgba(109,40,217,0.3)', marginBottom: '24px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#a78bfa', display: 'inline-block' }}/>
            <span style={{ color: '#a78bfa', fontSize: '0.76rem', fontWeight: 600 }}>No money. Just skills.</span>
          </div>

          {/* Headline */}
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(2rem, 7vw, 4.2rem)', fontWeight: 800, lineHeight: 1.08, marginBottom: '16px', letterSpacing: '-0.02em' }}>
            Learn Any Skill<br/>
            <span style={{ background: 'linear-gradient(135deg,#c4b5fd,#8b5cf6,#6d28d9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Without Paying Money</span>
          </h1>

          {/* Subheading */}
          <p style={{ color: '#6b7280', fontSize: 'clamp(1rem, 2.5vw, 1.15rem)', lineHeight: 1.7, marginBottom: '8px' }}>
            Exchange your skills with real developers.
          </p>
          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.15rem)', lineHeight: 1.7, marginBottom: '36px' }}>
            <span style={{ color: '#6b7280' }}>Teach what you know. Learn </span>
            <span style={{ color: '#a78bfa', fontWeight: 700 }}>{SKILLS[activeSkill]}</span>
            <span style={{ color: '#6b7280' }}> for free.</span>
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
            <Link to="/register" className="cta-btn" style={{
              background: 'linear-gradient(135deg,#6d28d9,#8b5cf6)', color: 'white',
              textDecoration: 'none', padding: 'clamp(12px,3vw,16px) clamp(20px,5vw,36px)',
              borderRadius: '12px', fontWeight: 700, fontSize: 'clamp(0.95rem,2.5vw,1.05rem)',
              boxShadow: '0 0 40px rgba(109,40,217,0.4)', display: 'inline-block', whiteSpace: 'nowrap'
            }}>
              🚀 Start Learning Free
            </Link>
            <Link to="/register" style={{
              color: '#94a3b8', textDecoration: 'none',
              padding: 'clamp(12px,3vw,16px) clamp(20px,5vw,36px)',
              borderRadius: '12px', fontWeight: 600, fontSize: 'clamp(0.95rem,2.5vw,1.05rem)',
              border: '1px solid #2a2a3d', background: 'rgba(255,255,255,0.02)',
              display: 'inline-block', whiteSpace: 'nowrap'
            }}>
              Find a Skill Partner →
            </Link>
          </div>
          <p style={{ color: '#2e2e42', fontSize: '0.76rem' }}>Free forever · No credit card · Open source</p>
        </div>
      </section>

      {/* ── PROBLEM SECTION ── */}
      <section style={{ padding: 'clamp(48px,8vw,80px) 20px', background: 'linear-gradient(180deg,#0d0d14,#0a0a0f)', borderTop: '1px solid #1a1a26' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: '#7c3aed', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '16px' }}>THE PROBLEM</p>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, marginBottom: '16px', lineHeight: 1.2 }}>
            Learning is expensive.<br/>
            <span style={{ color: '#4b5563' }}>It doesn't have to be.</span>
          </h2>
          <p style={{ color: '#4b5563', fontSize: 'clamp(0.9rem,2vw,1rem)', lineHeight: 1.8, marginBottom: '32px' }}>
            Courses cost hundreds of dollars. Bootcamps cost thousands. But the best learning happens between two people who genuinely want to help each other grow.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', background: 'rgba(109,40,217,0.1)', border: '1px solid rgba(109,40,217,0.25)' }}>
            <span style={{ fontSize: '1.2rem' }}>💡</span>
            <span style={{ color: '#a78bfa', fontWeight: 600, fontSize: '0.95rem' }}>SkillSwap makes learning free — forever.</span>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section style={{ padding: 'clamp(40px,6vw,64px) 20px', borderTop: '1px solid #1a1a26', borderBottom: '1px solid #1a1a26', background: 'rgba(109,40,217,0.02)' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '24px', textAlign: 'center' }}>
          {stats.map(s => (
            <div key={s.label}>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(2rem,5vw,2.8rem)', fontWeight: 800, background: 'linear-gradient(135deg,#c4b5fd,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '4px' }}>{s.value}</p>
              <p style={{ color: '#4b5563', fontSize: '0.82rem' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: 'clamp(60px,10vw,100px) 20px', background: '#0d0d14' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ color: '#7c3aed', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '12px' }}>HOW IT WORKS</p>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>Start learning in 3 steps</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '24px' }}>
            {HOW_IT_WORKS.map((s, i) => (
              <div key={s.num} className="hover-lift" style={{ padding: '28px 24px', borderRadius: '16px', background: '#12121a', border: '1px solid #1e1e2e', textAlign: 'center' }}>
                <div style={{ width: 52, height: 52, borderRadius: '12px', background: 'rgba(109,40,217,0.15)', border: '1px solid rgba(109,40,217,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto 16px' }}>{s.icon}</div>
                <p style={{ color: '#3d3d52', fontFamily: 'Syne, sans-serif', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '8px' }}>STEP {s.num}</p>
                <h3 style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.95rem', marginBottom: '8px' }}>{s.title}</h3>
                <p style={{ color: '#4b5563', fontSize: '0.83rem', lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: 'clamp(60px,10vw,100px) 20px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p style={{ color: '#7c3aed', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '12px' }}>FEATURES</p>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.02em' }}>Everything you need to grow</h2>
          <p style={{ color: '#4b5563', fontSize: '0.95rem', maxWidth: '440px', margin: '0 auto', lineHeight: 1.7 }}>Not just another learning platform. SkillSwap puts AI at the core of every interaction.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '16px' }}>
          {FEATURES.map(f => (
            <div key={f.title} className="hover-lift" style={{ padding: '24px', borderRadius: '14px', background: '#12121a', border: '1px solid #1e1e2e', cursor: 'default' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = f.color + '55'; e.currentTarget.style.background = f.color + '08'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e1e2e'; e.currentTarget.style.background = '#12121a'; }}>
              <div style={{ width: 44, height: 44, borderRadius: '10px', background: f.color + '18', border: `1px solid ${f.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', marginBottom: '14px' }}>{f.icon}</div>
              <h3 style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.92rem', marginBottom: '8px' }}>{f.title}</h3>
              <p style={{ color: '#4b5563', fontSize: '0.82rem', lineHeight: 1.75 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHY SKILLSWAP ── */}
      <section style={{ padding: 'clamp(60px,10vw,100px) 20px', background: 'linear-gradient(180deg,#0d0d14,#0a0a0f)', borderTop: '1px solid #1a1a26' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ color: '#7c3aed', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '12px' }}>WHY SKILLSWAP</p>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>Built different. For developers.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '20px' }}>
            {WHY_SKILLSWAP.map(w => (
              <div key={w.title} className="hover-lift" style={{ padding: '28px 24px', borderRadius: '14px', background: '#12121a', border: '1px solid #1e1e2e', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '14px' }}>{w.icon}</div>
                <h3 style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.95rem', marginBottom: '8px' }}>{w.title}</h3>
                <p style={{ color: '#4b5563', fontSize: '0.83rem', lineHeight: 1.7 }}>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEMO PREVIEW ── */}
      <section style={{ padding: 'clamp(60px,10vw,100px) 20px', borderTop: '1px solid #1a1a26' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: '#7c3aed', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '12px' }}>SEE IT IN ACTION</p>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.02em' }}>Your workspace. Supercharged by AI.</h2>
          <p style={{ color: '#4b5563', fontSize: '0.95rem', marginBottom: '40px', lineHeight: 1.7 }}>Every exchange gets a dedicated workspace with chat, tasks, AI tools and progress tracking.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '16px', textAlign: 'left' }}>
            {[
              { icon: '💬', label: 'Real-time Chat', desc: '@mentions, pin messages, instant delivery' },
              { icon: '✅', label: 'Task Board', desc: 'Create, assign and track learning tasks' },
              { icon: '🤖', label: 'AI Assistant', desc: 'Generate tasks, summaries and next steps' },
              { icon: '💡', label: 'Code Review', desc: 'AI scores your code with detailed feedback' },
            ].map(item => (
              <div key={item.label} style={{ padding: '20px', borderRadius: '12px', background: '#12121a', border: '1px solid #1e1e2e' }}>
                <div style={{ fontSize: '1.4rem', marginBottom: '10px' }}>{item.icon}</div>
                <p style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>{item.label}</p>
                <p style={{ color: '#4b5563', fontSize: '0.78rem', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: 'clamp(80px,12vw,120px) 20px', textAlign: 'center', position: 'relative', overflow: 'hidden', borderTop: '1px solid #1a1a26' }}>
        <div className="glow-orb" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '500px', height: '300px', background: 'radial-gradient(ellipse, rgba(109,40,217,0.14) 0%, transparent 65%)', pointerEvents: 'none' }}/>
        <div style={{ position: 'relative', maxWidth: '580px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.8rem,5vw,3rem)', fontWeight: 800, marginBottom: '14px', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            Ready to start swapping?
          </h2>
          <p style={{ color: '#4b5563', fontSize: 'clamp(0.9rem,2vw,1rem)', marginBottom: '16px', lineHeight: 1.7 }}>
            Join SkillSwap today and find your perfect skill exchange partner in seconds.
          </p>
          <p style={{ color: '#a78bfa', fontWeight: 700, fontSize: '1rem', marginBottom: '32px' }}>No money. Just skills.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="cta-btn" style={{
              display: 'inline-block', background: 'linear-gradient(135deg,#6d28d9,#8b5cf6)',
              color: 'white', textDecoration: 'none', padding: 'clamp(13px,3vw,16px) clamp(24px,5vw,44px)',
              borderRadius: '12px', fontWeight: 700, fontSize: 'clamp(0.95rem,2.5vw,1.05rem)',
              boxShadow: '0 0 50px rgba(109,40,217,0.4)', whiteSpace: 'nowrap'
            }}>
              🚀 Start Learning Free
            </Link>
            <a href="https://github.com/sanjay652005/skillswap" target="_blank" rel="noreferrer" style={{
              display: 'inline-block', color: '#6b7280', textDecoration: 'none',
              padding: 'clamp(13px,3vw,16px) clamp(24px,5vw,44px)',
              borderRadius: '12px', fontWeight: 600, fontSize: 'clamp(0.95rem,2.5vw,1.05rem)',
              border: '1px solid #2a2a3d', background: 'rgba(255,255,255,0.02)', whiteSpace: 'nowrap'
            }}>
              View on GitHub ↗
            </a>
          </div>
          <p style={{ color: '#2e2e42', fontSize: '0.76rem', marginTop: '16px' }}>Free forever · Open source · No credit card</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: '24px 20px', borderTop: '1px solid #1a1a26', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 26, height: 26, borderRadius: '6px', background: 'linear-gradient(135deg,#6d28d9,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontWeight: 800, fontSize: '0.72rem' }}>S</span>
          </div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#4b5563', fontSize: '0.85rem' }}>SkillSwap</span>
          <span style={{ color: '#2e2e42', fontSize: '0.78rem' }}>· No money. Just skills.</span>
        </div>
        <p style={{ color: '#2e2e42', fontSize: '0.75rem' }}>MERN + Groq AI · Built for developers</p>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link to="/login" style={{ color: '#3d3d52', textDecoration: 'none', fontSize: '0.8rem' }}>Sign In</Link>
          <Link to="/register" style={{ color: '#3d3d52', textDecoration: 'none', fontSize: '0.8rem' }}>Register</Link>
          <a href="https://github.com/sanjay652005/skillswap" target="_blank" rel="noreferrer" style={{ color: '#3d3d52', textDecoration: 'none', fontSize: '0.8rem' }}>GitHub ↗</a>
        </div>
      </footer>
    </div>
  );
}