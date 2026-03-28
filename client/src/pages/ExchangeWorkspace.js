import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import ChatPanel from '../components/ChatPanel';
import TaskManager from '../components/TaskManager';
import CodeReviewer from '../components/CodeReviewer';
import SmartWorkspace from '../components/SmartWorkspace';

const TABS = ['chat', 'tasks', 'resources', 'review', 'ai'];

export default function ExchangeWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('chat');
  const [resource, setResource] = useState({ title: '', url: '', type: 'link', content: '' });
  const [showAddResource, setShowAddResource] = useState(false);

  useEffect(() => {
    api.get(`/exchanges/workspace/${id}`)
      .then(res => setWorkspace(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const addResource = async () => {
    try {
      const res = await api.post(`/exchanges/workspace/${id}/resources`, resource);
      setWorkspace(res.data);
      setResource({ title: '', url: '', type: 'link', content: '' });
      setShowAddResource(false);
    } catch (err) { alert(err.response?.data?.error || 'Failed'); }
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!workspace) return <div className="p-8"><p style={{ color: '#ef4444' }}>Workspace not found</p></div>;

  const participants = workspace.participants || [];

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="px-6 py-4 border-b flex items-center justify-between" style={{ background: '#12121a', borderColor: '#2a2a3d' }}>
        <div className="flex items-center gap-3">
          <Link to="/exchanges" className="text-sm" style={{ color: '#94a3b8' }}>← Exchanges</Link>
          <span style={{ color: '#2a2a3d' }}>/</span>
          <div>
            <h1 className="font-display font-semibold" style={{ color: '#e2e8f0' }}>
              Exchange Workspace
            </h1>
            <div className="flex gap-3 mt-0.5 text-xs">
              <span>Offer: <span className="skill-tag" style={{ fontSize: '0.7rem', padding: '0px 6px' }}>{workspace.skillOffered}</span></span>
              <span>Learn: <span className="skill-tag skill-tag-green" style={{ fontSize: '0.7rem', padding: '0px 6px' }}>{workspace.skillWanted}</span></span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {participants.map(p => (
            <div key={p._id} className="flex items-center gap-1 text-xs" style={{ color: '#94a3b8' }}>
              <div className="avatar" style={{ width: '24px', height: '24px', fontSize: '0.6rem' }}>
                {p.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)}
              </div>
              {p.name?.split(' ')[0]}
            </div>
          ))}
          <span className={`badge badge-${workspace.status}`}>{workspace.status}</span>
          <button onClick={() => navigate('/app/progress')} className="btn-secondary text-xs py-1 px-3">📊 Track Progress</button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex border-b px-4" style={{ background: '#12121a', borderColor: '#2a2a3d' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-3 text-sm font-medium capitalize transition-all border-b-2"
            style={{ borderColor: tab === t ? '#8b5cf6' : 'transparent', color: tab === t ? '#a78bfa' : '#94a3b8' }}>
            {t === 'chat' ? '💬 Chat' : t === 'tasks' ? '✓ Tasks' : t === 'resources' ? '📎 Resources' : t === 'review' ? '💡 AI Review' : '🤖 AI Assistant'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden" style={{ background: '#0a0a0f' }}>
        {tab === 'chat' && (
          <ChatPanel roomId={id} roomType="exchange" participants={participants} />
        )}

        {tab === 'tasks' && (
          <TaskManager workspaceId={id} workspaceType="exchange" participants={participants} />
        )}

        {tab === 'review' && <CodeReviewer />}

        {tab === 'ai' && (
          <div className="p-6 overflow-y-auto h-full">
            <SmartWorkspace exchange={workspace?.exchange} messages={[]} />
          </div>
        )}

        {tab === 'resources' && (
          <div className="p-6 overflow-y-auto h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold" style={{ color: '#e2e8f0' }}>Shared Resources</h3>
              <button className="btn-primary text-sm py-1.5 px-3" onClick={() => setShowAddResource(!showAddResource)}>
                + Add Resource
              </button>
            </div>

            {showAddResource && (
              <div className="glass p-4 mb-4 fade-in">
                <div className="space-y-3">
                  <input className="input" placeholder="Title" value={resource.title}
                    onChange={e => setResource({ ...resource, title: e.target.value })} />
                  <select className="input" value={resource.type} onChange={e => setResource({ ...resource, type: e.target.value })}>
                    <option value="link">🔗 Link</option>
                    <option value="note">📝 Note</option>
                    <option value="code">💻 Code</option>
                  </select>
                  {resource.type === 'link' ? (
                    <input className="input" placeholder="URL" value={resource.url}
                      onChange={e => setResource({ ...resource, url: e.target.value })} />
                  ) : (
                    <textarea className="input font-mono" rows={4} placeholder={resource.type === 'code' ? 'Paste code here...' : 'Write notes here...'}
                      value={resource.content} onChange={e => setResource({ ...resource, content: e.target.value })} />
                  )}
                  <div className="flex gap-2">
                    <button className="btn-secondary flex-1" onClick={() => setShowAddResource(false)}>Cancel</button>
                    <button className="btn-primary flex-1" onClick={addResource} disabled={!resource.title}>Add</button>
                  </div>
                </div>
              </div>
            )}

            {workspace.resources?.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-3xl mb-2">📎</p>
                <p style={{ color: '#6b7280' }}>No resources shared yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {workspace.resources?.map((r, i) => (
                  <div key={i} className="glass p-4 fade-in">
                    <div className="flex items-start gap-2">
                      <span className="text-lg">{r.type === 'link' ? '🔗' : r.type === 'code' ? '💻' : '📝'}</span>
                      <div className="flex-1">
                        <p className="font-medium" style={{ color: '#e2e8f0' }}>{r.title}</p>
                        {r.url && <a href={r.url} target="_blank" rel="noreferrer" className="text-sm break-all" style={{ color: '#a78bfa' }}>{r.url}</a>}
                        {r.content && <pre className="text-xs mt-2 overflow-x-auto p-2 rounded" style={{ background: '#0a0a0f', color: '#94a3b8' }}>{r.content}</pre>}
                        <p className="text-xs mt-2" style={{ color: '#4b5563' }}>{new Date(r.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}