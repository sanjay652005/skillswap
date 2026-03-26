import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const FEATURES = [
  { icon: '🎯', title: 'AI Match Engine', desc: 'Ranks developers by skill compatibility, availability, rating and activity — finding your perfect partner instantly.', color: '#f59e0b' },
  { icon: '⇄', title: 'Skill Exchange', desc: 'Teach what you know, learn what you need. No money — just knowledge. Request, accept and collaborate.', color: '#6d28d9' },
  { icon: '🤖', title: 'AI Code Reviewer', desc: 'Instant AI-powered code reviews with scores, issue detection, severity ratings and refactored suggestions.', color: '#0891b2' },
  { icon: '🧠', title: 'AI Learning Path', desc: 'Personalized roadmaps for any skill — with phases, resources, hands-on projects. Export as PDF.', color: '#10b981' },
  { icon: '💬', title: 'Smart Workspace', desc: 'Chat, collaborate and code together with AI task generation, session summaries and next step suggestions.', color: '#f472b6' },
  { icon: '🏆', title: 'Trust & Reputation', desc: 'Every user has a trust score based on completion rate, ratings and activity — so you always know who to learn from.', color: '#34d399' },
];

const STEPS = [
  { num: '01', title: 'Create Your Profile', desc: 'Add your skills, what you offer and want to learn. Takes 2 minutes.' },
  { num: '02', title: 'Find Your Match', desc: 'Our AI engine ranks the best skill exchange partners for you automatically.' },
  { num: '03', title: 'Exchange & Grow', desc: 'Collaborate in real-time workspaces, track progress and build your reputation.' },
];

const STATS = [
  { value: '10+', label: 'AI-Powered Features' },
  { value: '100%', label: 'Free to Use' },
  { value: '3s', label: 'To Find a Match' },
  { value: '∞', label: 'Skills to Exchange' },
];

const SKILLS = ['React', 'Python', 'Node.js', 'UI/UX', 'Flutter', 'ML', 'DevOps', 'TypeScript', 'MongoDB', 'Go'];

// Floating skill pill
const FloatingPill = ({ skill, style }) => (
  <div style={{
    position: 'absolute', padding: '6px 14px', borderRadius: '999px',
    background: 'rgba(109,40,217,0.15)', border: '1px solid rgba(109,40,217,0.3)',
    color: '#a78bfa', fontSize: '0.78rem', fontWeight: 600,
    backdropFilter: 'blur(8px)', whiteSpace: 'nowrap', ...style
  }}>{skill}</div>
);

// Mock match card
const MockMatchCard = ({ name, score, skills, color, delay }) => (
  <div style={{
    background: 'rgba(18,18,26,0.9)', border: `1px solid ${color}30`,
    borderRadius: '12px', padding: '14px', backdropFilter: 'blur(12px)',
    animation: `floatCard 4s ease-in-out ${delay}s infinite alternate`,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg,${color},${color}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.8rem' }}>
        {name[0]}
      </div>
      <div>
        <p style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.82rem' }}>{name}</p>
        <p style={{ color: color, fontSize: '0.7rem', fontWeight: 700 }}>{score}% match</p>
      </div>
    </div>
    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
      {skills.map(s => (
        <span key={s} style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '0.65rem', background: `${color}15`, color, border: `1px solid ${color}30` }}>{s}</span>
      ))}
    </div>
  </div>
);

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSkill, setActiveSkill] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setActiveSkill(prev => (prev + 1) % SKILLS.length), 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', color: '#e2e8f0', fontFamily: 'DM Sans, sans-serif', overflowX: 'hidden' }}>
      <style>{`
        @keyframes floatCard { from { transform: translateY(0px); } to { transform: translateY(-10px); } }
        @keyframes pulse-glow { 0%,100% { opacity: 0.4; } 50% { opacity: 0.8; } }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .feature-card:hover { transform: translateY(-4px); }
        .feature-card { transition: all 0.25s; }
      `}</style>

      {/* ── Navbar ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '14px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(10,10,15,0.9)' : 'transparent',
        borderBottom: scrolled ? '1px solid #1a1a26' : 'none',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        transition: 'all 0.3s'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 34, height: 34, borderRadius: '9px', background: 'linear-gradient(135deg,#6d28d9,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(109,40,217,0.4)' }}>
            <span style={{ color: 'white', fontWeight: 800, fontSize: '0.9rem' }}>S</span>
          </div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.2rem', background: 'linear-gradient(135deg,#a78bfa,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SkillSwap</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/login" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', padding: '8px 16px', borderRadius: '8px' }}>Sign In</Link>
          <Link to="/register" style={{ background: 'linear-gradient(135deg,#6d28d9,#8b5cf6)', color: 'white', textDecoration: 'none', fontSize: '0.9rem', padding: '9px 22px', borderRadius: '9px', fontWeight: 700, boxShadow: '0 0 20px rgba(109,40,217,0.35)' }}>
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px', position: 'relative', overflow: 'hidden' }}>
        {/* Background orbs */}
        <div style={{ position: 'absolute', top: '15%', left: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(109,40,217,0.12) 0%, transparent 70%)', animation: 'pulse-glow 4s ease-in-out infinite', pointerEvents: 'none' }}/>
        <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', animation: 'pulse-glow 5s ease-in-out 1s infinite', pointerEvents: 'none' }}/>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '700px', height: '500px', background: 'radial-gradient(ellipse, rgba(109,40,217,0.06) 0%, transparent 60%)', pointerEvents: 'none' }}/>

        {/* Floating pills */}
        <FloatingPill skill="React" style={{ top: '22%', left: '8%', animation: 'floatCard 3s ease-in-out infinite alternate' }}/>
        <FloatingPill skill="Python" style={{ top: '35%', right: '6%', animation: 'floatCard 4s ease-in-out 1s infinite alternate' }}/>
        <FloatingPill skill="Node.js" style={{ bottom: '30%', left: '5%', animation: 'floatCard 3.5s ease-in-out 0.5s infinite alternate' }}/>
        <FloatingPill skill="UI/UX" style={{ bottom: '25%', right: '8%', animation: 'floatCard 4.5s ease-in-out 1.5s infinite alternate' }}/>
        <FloatingPill skill="ML / AI" style={{ top: '18%', right: '20%', animation: 'floatCard 3s ease-in-out 2s infinite alternate' }}/>

        <div style={{ maxWidth: '800px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 16px', borderRadius: '999px', background: 'rgba(109,40,217,0.12)', border: '1px solid rgba(109,40,217,0.35)', marginBottom: '32px', backdropFilter: 'blur(8px)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#a78bfa', display: 'inline-block', animation: 'pulse-glow 2s infinite' }}/>
            <span style={{ color: '#a78bfa', fontSize: '0.78rem', fontWeight: 600 }}>AI-Powered Developer Platform</span>
          </div>

          {/* Headline */}
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(2.8rem, 7vw, 5rem)', fontWeight: 800, lineHeight: 1.05, marginBottom: '8px', letterSpacing: '-0.02em' }}>
            Exchange Skills.
          </h1>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(2.8rem, 7vw, 5rem)', fontWeight: 800, lineHeight: 1.05, marginBottom: '28px', letterSpacing: '-0.02em', background: 'linear-gradient(135deg,#c4b5fd,#8b5cf6,#6d28d9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Grow Together.
          </h1>

          {/* Animated skill */}
          <p style={{ color: '#6b7280', fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', lineHeight: 1.7, marginBottom: '12px' }}>
            The platform where developers trade skills instead of money.
          </p>
          <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', lineHeight: 1.7, marginBottom: '40px' }}>
            <span style={{ color: '#6b7280' }}>Learn </span>
            <span style={{ color: '#a78bfa', fontWeight: 700, transition: 'all 0.3s' }}>{SKILLS[activeSkill]}</span>
            <span style={{ color: '#6b7280' }}> from real developers — for free.</span>
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
            <Link to="/register" style={{
              background: 'linear-gradient(135deg,#6d28d9,#8b5cf6)', color: 'white',
              textDecoration: 'none', padding: '15px 36px', borderRadius: '12px',
              fontWeight: 700, fontSize: '1.05rem', boxShadow: '0 0 40px rgba(109,40,217,0.45)',
              transition: 'all 0.2s', display: 'inline-block'
            }}>
              Start Swapping Free →
            </Link>
            <Link to="/login" style={{
              color: '#94a3b8', textDecoration: 'none', padding: '15px 36px',
              borderRadius: '12px', fontWeight: 600, fontSize: '1.05rem',
              border: '1px solid #2a2a3d', background: 'rgba(255,255,255,0.02)',
              transition: 'all 0.2s', display: 'inline-block'
            }}>
              Sign In
            </Link>
          </div>
          <p style={{ color: '#2e2e42', fontSize: '0.78rem' }}>Free forever · No credit card · Open source</p>
        </div>
      </section>

      {/* ── Mock UI Preview ── */}
      <section style={{ padding: '0 24px 80px', position: 'relative' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative' }}>
          <p style={{ textAlign: 'center', color: '#4b5563', fontSize: '0.78rem', marginBottom: '24px', letterSpacing: '0.1em', fontWeight: 600 }}>AI MATCH ENGINE IN ACTION</p>
          <div style={{
            background: '#12121a', border: '1px solid #2a2a3d', borderRadius: '20px',
            padding: '24px', position: 'relative',
            boxShadow: '0 0 80px rgba(109,40,217,0.12), 0 40px 80px rgba(0,0,0,0.5)'
          }}>
            {/* Mock header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #1e1e2e' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }}/>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fbbf24' }}/>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#34d399' }}/>
              <span style={{ color: '#3d3d52', fontSize: '0.75rem', marginLeft: '8px' }}>skillswap.app/ai-matches</span>
            </div>
            {/* Mock match cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
              <MockMatchCard name="Priya S." score={94} skills={['React', 'TypeScript']} color="#f59e0b" delay={0} />
              <MockMatchCard name="Alex M." score={87} skills={['Python', 'ML']} color="#34d399" delay={0.5} />
              <MockMatchCard name="Rahul K." score={76} skills={['Flutter', 'Dart']} color="#60a5fa" delay={1} />
            </div>
            {/* Glow */}
            <div style={{ position: 'absolute', bottom: -40, left: '50%', transform: 'translateX(-50%)', width: '60%', height: '80px', background: 'radial-gradient(ellipse, rgba(109,40,217,0.2) 0%, transparent 70%)', pointerEvents: 'none' }}/>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ padding: '60px 24px', borderTop: '1px solid #1a1a26', borderBottom: '1px solid #1a1a26', background: 'rgba(109,40,217,0.03)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '32px', textAlign: 'center' }}>
          {STATS.map(s => (
            <div key={s.label}>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '2.8rem', fontWeight: 800, background: 'linear-gradient(135deg,#c4b5fd,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '4px' }}>{s.value}</p>
              <p style={{ color: '#4b5563', fontSize: '0.85rem' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '100px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <p style={{ color: '#7c3aed', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.18em', marginBottom: '14px' }}>FEATURES</p>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, marginBottom: '14px', letterSpacing: '-0.02em' }}>
            Everything you need to grow
          </h2>
          <p style={{ color: '#4b5563', fontSize: '1rem', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
            Not just another learning platform. SkillSwap puts AI at the core of every interaction.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {FEATURES.map((f, i) => (
            <div key={f.title} className="feature-card" style={{
              padding: '28px', borderRadius: '16px',
              background: 'linear-gradient(135deg, #12121a, #0f0f18)',
              border: '1px solid #1e1e2e',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = f.color + '60'; e.currentTarget.style.background = `linear-gradient(135deg, ${f.color}08, #12121a)`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e1e2e'; e.currentTarget.style.background = 'linear-gradient(135deg, #12121a, #0f0f18)'; }}>
              <div style={{ width: 48, height: 48, borderRadius: '12px', background: f.color + '18', border: `1px solid ${f.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '18px' }}>
                {f.icon}
              </div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1rem', marginBottom: '10px', color: '#e2e8f0' }}>{f.title}</h3>
              <p style={{ color: '#4b5563', fontSize: '0.85rem', lineHeight: 1.75 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ padding: '100px 24px', background: 'linear-gradient(180deg, #0d0d14 0%, #0a0a0f 100%)', borderTop: '1px solid #1a1a26', borderBottom: '1px solid #1a1a26' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <p style={{ color: '#7c3aed', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.18em', marginBottom: '14px' }}>HOW IT WORKS</p>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Start learning in 3 steps
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '40px', position: 'relative' }}>
            {STEPS.map((s, i) => (
              <div key={s.num} style={{ textAlign: 'center', position: 'relative' }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '4rem', fontWeight: 800, background: 'linear-gradient(135deg,rgba(109,40,217,0.25),rgba(139,92,246,0.05))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '16px', lineHeight: 1 }}>{s.num}</div>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '10px', color: '#e2e8f0' }}>{s.title}</h3>
                <p style={{ color: '#4b5563', fontSize: '0.85rem', lineHeight: 1.75 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '120px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '600px', height: '400px', background: 'radial-gradient(ellipse, rgba(109,40,217,0.15) 0%, transparent 65%)', pointerEvents: 'none', animation: 'pulse-glow 4s ease-in-out infinite' }}/>
        <div style={{ position: 'relative', maxWidth: '640px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 800, marginBottom: '18px', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Ready to start swapping?
          </h2>
          <p style={{ color: '#4b5563', fontSize: '1.05rem', marginBottom: '40px', lineHeight: 1.7 }}>
            Join SkillSwap today and find your perfect skill exchange partner in seconds.
          </p>
          <Link to="/register" style={{
            display: 'inline-block', background: 'linear-gradient(135deg,#6d28d9,#8b5cf6)',
            color: 'white', textDecoration: 'none', padding: '16px 48px',
            borderRadius: '14px', fontWeight: 700, fontSize: '1.1rem',
            boxShadow: '0 0 50px rgba(109,40,217,0.4), 0 20px 40px rgba(0,0,0,0.3)',
            transition: 'all 0.2s'
          }}>
            Create Free Account →
          </Link>
          <p style={{ color: '#2e2e42', fontSize: '0.78rem', marginTop: '18px' }}>Free forever · Open source · Built for developers</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ padding: '28px 40px', borderTop: '1px solid #1a1a26', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 28, height: 28, borderRadius: '7px', background: 'linear-gradient(135deg,#6d28d9,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontWeight: 800, fontSize: '0.75rem' }}>S</span>
          </div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#4b5563', fontSize: '0.9rem' }}>SkillSwap</span>
        </div>
        <p style={{ color: '#2e2e42', fontSize: '0.78rem' }}>Built with ❤️ · MERN + Groq AI</p>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link to="/login" style={{ color: '#3d3d52', textDecoration: 'none', fontSize: '0.82rem' }}>Sign In</Link>
          <Link to="/register" style={{ color: '#3d3d52', textDecoration: 'none', fontSize: '0.82rem' }}>Register</Link>
          <a href="https://github.com/sanjay652005/skillswap" target="_blank" rel="noreferrer" style={{ color: '#3d3d52', textDecoration: 'none', fontSize: '0.82rem' }}>GitHub ↗</a>
        </div>
      </footer>
    </div>
  );
}