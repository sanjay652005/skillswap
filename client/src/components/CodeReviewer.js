import React, { useState, useRef } from 'react';
import api from '../utils/api';

const LANGUAGES = ['javascript','typescript','python','java','c','cpp','go','rust','php','ruby','swift','kotlin','sql','html','css'];
const SEVERITY_COLORS = { error: '#ef4444', warning: '#f59e0b', info: '#6b7280' };
const SEVERITY_BG     = { error: 'rgba(239,68,68,0.08)', warning: 'rgba(245,158,11,0.08)', info: 'rgba(107,114,128,0.08)' };
const TYPE_ICONS = { bug: '🐛', suggestion: '💡', style: '🎨', performance: '⚡', security: '🔒' };

const ScoreRing = ({ score }) => {
  if (!score) return null;
  const color = score >= 8 ? '#10b981' : score >= 5 ? '#f59e0b' : '#ef4444';
  const r = 28, circ = 2 * Math.PI * r;
  const dash = circ * (score / 10);
  return (
    <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
      <svg width="72" height="72" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="36" cy="36" r={r} fill="none" stroke="#2a2a3d" strokeWidth="5"/>
        <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s ease' }}/>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color, fontWeight: 800, fontSize: '1.2rem', lineHeight: 1 }}>{score}</span>
        <span style={{ color: '#6b7280', fontSize: '0.6rem' }}>/10</span>
      </div>
    </div>
  );
};

export default function CodeReviewer() {
  const [code, setCode]         = useState('');
  const [language, setLanguage] = useState('javascript');
  const [review, setReview]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [showRefactor, setShowRefactor] = useState(false);
  const [copied, setCopied]     = useState(false);
  const textareaRef = useRef(null);

  const handleReview = async () => {
    if (!code.trim()) { setError('Please paste some code first'); return; }
    setLoading(true); setError(''); setReview(null); setShowRefactor(false);
    try {
      const res = await api.post('/ai/review-code', { code, language });
      setReview(res.data);
    } catch (err) {
      setError('Failed to review code. Please try again.');
    } finally { setLoading(false); }
  };

  const copyRefactored = () => {
    if (!review?.refactored) return;
    navigator.clipboard.writeText(review.refactored);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTab = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = textareaRef.current;
      const start = ta.selectionStart, end = ta.selectionEnd;
      const newVal = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newVal);
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + 2; }, 0);
    }
  };

  const issuesByType = review?.issues?.reduce((acc, i) => {
    acc[i.severity] = (acc[i.severity] || 0) + 1; return acc;
  }, {});

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Left — code input */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid #2a2a3d', minWidth: 0 }}>
        {/* Toolbar */}
        <div style={{ padding: '10px 14px', borderBottom: '1px solid #2a2a3d', background: '#12121a', display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
          <select value={language} onChange={e => setLanguage(e.target.value)}
            style={{ background: '#1a1a26', border: '1px solid #2a2a3d', color: '#e2e8f0', borderRadius: '8px', padding: '6px 10px', fontSize: '0.8rem', cursor: 'pointer' }}>
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <button onClick={() => { setCode(''); setReview(null); setError(''); }}
            style={{ background: 'none', border: '1px solid #2a2a3d', borderRadius: '8px', color: '#6b7280', padding: '6px 10px', fontSize: '0.78rem', cursor: 'pointer' }}>
            Clear
          </button>
          <div style={{ flex: 1 }}/>
          <button onClick={handleReview} disabled={loading || !code.trim()}
            style={{
              background: loading || !code.trim() ? '#1a1a26' : 'linear-gradient(135deg,#6d28d9,#8b5cf6)',
              border: 'none', borderRadius: '8px', color: 'white', padding: '7px 18px',
              fontSize: '0.82rem', fontWeight: 600, cursor: loading || !code.trim() ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}>
            {loading ? (
              <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"/>Reviewing...</>
            ) : '✦ Review Code'}
          </button>
        </div>

        {/* Code textarea */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={e => setCode(e.target.value)}
          onKeyDown={handleTab}
          placeholder={`// Paste your ${language} code here...\n// Tab key supported`}
          spellCheck={false}
          style={{
            flex: 1, background: '#0a0a0f', border: 'none', outline: 'none',
            color: '#e2e8f0', padding: '16px', fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.82rem', lineHeight: '1.6', resize: 'none',
            overflowY: 'auto'
          }}
        />

        {error && (
          <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', borderTop: '1px solid rgba(239,68,68,0.2)' }}>
            <p style={{ color: '#f87171', fontSize: '0.82rem' }}>{error}</p>
          </div>
        )}
      </div>

      {/* Right — review results */}
      <div style={{ width: '380px', flexShrink: 0, overflowY: 'auto', background: '#0d0d14' }}>
        {!review && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '24px', textAlign: 'center' }}>
            <p style={{ fontSize: '2.5rem', marginBottom: '12px' }}>💡</p>
            <p style={{ color: '#e2e8f0', fontWeight: 600, marginBottom: '6px' }}>AI Code Reviewer</p>
            <p style={{ color: '#6b7280', fontSize: '0.85rem', lineHeight: 1.6 }}>Paste your code on the left and click Review to get instant feedback on bugs, style, performance and security.</p>
          </div>
        )}

        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px' }}>
            <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"/>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Analysing your code...</p>
          </div>
        )}

        {review && !loading && (
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Score + summary */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '14px', borderRadius: '10px', background: '#12121a', border: '1px solid #2a2a3d' }}>
              <ScoreRing score={review.score} />
              <div style={{ flex: 1 }}>
                <p style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '4px' }}>OVERALL ASSESSMENT</p>
                <p style={{ color: '#e2e8f0', fontSize: '0.84rem', lineHeight: 1.6 }}>{review.summary}</p>
                {issuesByType && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                    {issuesByType.error   && <span style={{ fontSize: '0.72rem', color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '2px 7px', borderRadius: '999px' }}>🔴 {issuesByType.error} error{issuesByType.error > 1 ? 's':''}</span>}
                    {issuesByType.warning && <span style={{ fontSize: '0.72rem', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '2px 7px', borderRadius: '999px' }}>🟡 {issuesByType.warning} warning{issuesByType.warning > 1 ? 's':''}</span>}
                    {issuesByType.info    && <span style={{ fontSize: '0.72rem', color: '#6b7280', background: 'rgba(107,114,128,0.1)', padding: '2px 7px', borderRadius: '999px' }}>ℹ️ {issuesByType.info} suggestion{issuesByType.info > 1 ? 's':''}</span>}
                  </div>
                )}
              </div>
            </div>

            {/* Positives */}
            {review.positives?.length > 0 && (
              <div>
                <p style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '8px' }}>✅ WHAT'S GOOD</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {review.positives.map((p, i) => (
                    <div key={i} style={{ padding: '7px 10px', borderRadius: '8px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <span style={{ color: '#10b981', flexShrink: 0 }}>✓</span>
                      <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Issues */}
            {review.issues?.length > 0 && (
              <div>
                <p style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '8px' }}>🔍 ISSUES FOUND</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {review.issues.map((issue, i) => (
                    <div key={i} style={{
                      padding: '10px 12px', borderRadius: '8px',
                      background: SEVERITY_BG[issue.severity],
                      border: `1px solid ${SEVERITY_COLORS[issue.severity]}30`
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.85rem' }}>{TYPE_ICONS[issue.type] || '💡'}</span>
                        <span style={{ color: SEVERITY_COLORS[issue.severity], fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase' }}>{issue.type}</span>
                        {issue.line && <span style={{ color: '#4b5563', fontSize: '0.7rem', marginLeft: 'auto' }}>line {issue.line}</span>}
                      </div>
                      <p style={{ color: '#e2e8f0', fontSize: '0.82rem', lineHeight: 1.5 }}>{issue.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Refactored version */}
            {review.refactored && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <p style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.05em' }}>⚡ REFACTORED VERSION</p>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => setShowRefactor(!showRefactor)}
                      style={{ background: 'none', border: '1px solid #2a2a3d', borderRadius: '6px', color: '#94a3b8', padding: '3px 8px', fontSize: '0.72rem', cursor: 'pointer' }}>
                      {showRefactor ? 'Hide' : 'Show'}
                    </button>
                    <button onClick={copyRefactored}
                      style={{ background: copied ? 'rgba(16,185,129,0.1)' : 'none', border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : '#2a2a3d'}`, borderRadius: '6px', color: copied ? '#10b981' : '#94a3b8', padding: '3px 8px', fontSize: '0.72rem', cursor: 'pointer' }}>
                      {copied ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
                {showRefactor && (
                  <pre style={{ background: '#0a0a0f', border: '1px solid #2a2a3d', borderRadius: '8px', padding: '12px', fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace', color: '#a78bfa', overflowX: 'auto', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                    {review.refactored}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
