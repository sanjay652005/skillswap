import React, { useState } from 'react';
import api from '../utils/api';

const TAB_ICONS = { tasks: '📋', summary: '📝', next: '🚀' };

export default function SmartWorkspace({ exchange, messages = [] }) {
  const [activeTab, setActiveTab] = useState('tasks');
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState({ tasks: null, summary: null, next: null });

  const skillOffered = exchange?.skillOffered || 'the skill';
  const skillWanted  = exchange?.skillWanted  || 'the skill';

  const callAI = async (type) => {
    if (result[type]) return; // cached
    setLoading(true);
    try {
      let prompt = '';
      if (type === 'tasks') {
        prompt = `Generate a structured task list for a skill exchange session where one person teaches "${skillOffered}" and learns "${skillWanted}".
Return ONLY a JSON array of tasks like:
[{"title":"Task name","description":"What to do","priority":"high|medium|low","duration":"X mins"}]
Max 6 tasks. Be specific and practical.`;
      } else if (type === 'summary') {
        const chatHistory = messages.slice(-20).map(m => `${m.sender?.name || 'User'}: ${m.content}`).join('\n');
        prompt = `Summarize this skill exchange session chat in a structured way.
Chat: ${chatHistory || 'No messages yet.'}
Return a brief summary with: what was taught, what was learned, key takeaways, and action items.`;
      } else if (type === 'next') {
        prompt = `Suggest the next steps for a skill exchange session on "${skillOffered}" ↔ "${skillWanted}".
Give 4 specific, actionable next steps the pair should take to progress their learning. Be concise.`;
      }

      const res = await api.post('/ai/chat', {
        messages: [{ role: 'user', content: prompt }],
        context: `Skill exchange: ${skillOffered} ↔ ${skillWanted}`
      });

      let parsed = res.data.message;
      if (type === 'tasks') {
        try { parsed = JSON.parse(res.data.message.replace(/```json|```/g, '').trim()); }
        catch { parsed = res.data.message; }
      }
      setResult(prev => ({ ...prev, [type]: parsed }));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleTab = (tab) => {
    setActiveTab(tab);
    callAI(tab);
  };

  const PRIORITY_COLOR = { high: '#f87171', medium: '#fbbf24', low: '#34d399' };

  return (
    <div style={{ background: '#12121a', border: '1px solid #2a2a3d', borderRadius: '12px', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #2a2a3d', background: 'rgba(109,40,217,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1rem' }}>✦</span>
          <span style={{ color: '#a78bfa', fontWeight: 700, fontSize: '0.85rem' }}>AI Workspace Assistant</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #2a2a3d' }}>
        {[
          { key: 'tasks',   label: 'Task Generator' },
          { key: 'summary', label: 'Session Summary' },
          { key: 'next',    label: 'Next Steps' }
        ].map(tab => (
          <button key={tab.key} onClick={() => handleTab(tab.key)}
            style={{
              flex: 1, padding: '10px 8px', border: 'none', cursor: 'pointer',
              background: activeTab === tab.key ? 'rgba(109,40,217,0.15)' : 'transparent',
              color: activeTab === tab.key ? '#a78bfa' : '#6b7280',
              fontSize: '0.75rem', fontWeight: activeTab === tab.key ? 600 : 400,
              borderBottom: activeTab === tab.key ? '2px solid #8b5cf6' : '2px solid transparent',
              transition: 'all 0.15s'
            }}>
            {TAB_ICONS[tab.key]} {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '14px 16px', minHeight: '140px' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '0.85rem' }}>
            <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"/>
            Generating with AI...
          </div>
        ) : !result[activeTab] ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <p style={{ color: '#4b5563', fontSize: '0.85rem', marginBottom: '10px' }}>
              {activeTab === 'tasks'   && 'Generate a task list for this session'}
              {activeTab === 'summary' && 'Summarize what was discussed in this session'}
              {activeTab === 'next'    && 'Get AI-suggested next steps'}
            </p>
            <button className="btn-primary text-sm" style={{ padding: '7px 18px' }} onClick={() => callAI(activeTab)}>
              {TAB_ICONS[activeTab]} Generate
            </button>
          </div>
        ) : activeTab === 'tasks' && Array.isArray(result.tasks) ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {result.tasks.map((task, i) => (
              <div key={i} style={{ padding: '10px 12px', borderRadius: '8px', background: '#1a1a26', border: '1px solid #2a2a3d' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                  <span style={{ color: '#e2e8f0', fontSize: '0.82rem', fontWeight: 600 }}>{task.title}</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '999px', background: `${PRIORITY_COLOR[task.priority]}20`, color: PRIORITY_COLOR[task.priority] }}>{task.priority}</span>
                    <span style={{ fontSize: '0.68rem', color: '#4b5563' }}>{task.duration}</span>
                  </div>
                </div>
                <p style={{ color: '#6b7280', fontSize: '0.75rem' }}>{task.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
            {typeof result[activeTab] === 'string' ? result[activeTab] : JSON.stringify(result[activeTab], null, 2)}
          </p>
        )}
      </div>

      {/* Regenerate */}
      {result[activeTab] && !loading && (
        <div style={{ padding: '8px 16px', borderTop: '1px solid #2a2a3d', textAlign: 'right' }}>
          <button onClick={() => { setResult(prev => ({ ...prev, [activeTab]: null })); callAI(activeTab); }}
            style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '0.75rem', cursor: 'pointer' }}>
            ↻ Regenerate
          </button>
        </div>
      )}
    </div>
  );
}
