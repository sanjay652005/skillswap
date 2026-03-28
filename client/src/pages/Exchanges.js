import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
};

// ── Workspace stats badge fetched per active card ─────────────
function WorkspaceStats({ workspaceId }) {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    if (!workspaceId) return;
    api.get(`/app/exchanges/workspace/${workspaceId}/stats`)
      .then(r => setStats(r.data)).catch(() => {});
  }, [workspaceId]);

  if (!stats) return null;
  return (
    <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
      <span style={{ fontSize: '0.75rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span>💬</span> {stats.messages} messages
      </span>
      <span style={{ fontSize: '0.75rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span>✓</span> {stats.doneTasks}/{stats.tasks} tasks
      </span>
    </div>
  );
}

export default function Exchanges() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState('all');
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    api.get('/exchanges').then(res => setExchanges(res.data)).finally(() => setLoading(false));
  }, []);

  const respond = async (id, status) => {
    try {
      const res = await api.put(`/exchanges/${id}/respond`, { status });
      setExchanges(prev => prev.map(e => e._id === id ? res.data : e));
    } catch (err) { alert(err.response?.data?.error || 'Failed'); }
  };

  const complete = async (id) => {
    try {
      const res = await api.put(`/exchanges/${id}/complete`);
      setExchanges(prev => prev.map(e => e._id === id ? res.data : e));
    } catch (err) { alert(err.response?.data?.error || 'Failed'); }
  };

  const cancel = async (id) => {
    if (!window.confirm('Cancel this exchange request?')) return;
    setCancelling(id);
    try {
      await api.put(`/exchanges/${id}/cancel`);
      setExchanges(prev => prev.filter(e => e._id !== id));
    } catch (err) { alert(err.response?.data?.error || 'Failed'); }
    finally { setCancelling(null); }
  };

  const filtered = exchanges.filter(e => {
    if (tab === 'incoming')  return e.receiver?._id === user?._id && e.status === 'pending';
    if (tab === 'outgoing')  return e.sender?._id === user?._id   && e.status === 'pending';
    if (tab === 'active')    return e.status === 'accepted';
    if (tab === 'completed') return e.status === 'completed';
    return e.status !== 'cancelled';
  });

  const initials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || 'U';

  const tabs = [
    { id: 'all',       label: 'All',       count: exchanges.filter(e => e.status !== 'cancelled').length },
    { id: 'incoming',  label: 'Incoming',  count: exchanges.filter(e => e.receiver?._id === user?._id && e.status === 'pending').length },
    { id: 'outgoing',  label: 'Sent',      count: exchanges.filter(e => e.sender?._id === user?._id   && e.status === 'pending').length },
    { id: 'active',    label: 'Active',    count: exchanges.filter(e => e.status === 'accepted').length },
    { id: 'completed', label: 'Completed', count: exchanges.filter(e => e.status === 'completed').length },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8 slide-up">
        <h1 className="font-display text-3xl font-bold gradient-text mb-2">SkillSwaps</h1>
        <p style={{ color: '#94a3b8' }}>Manage your skill exchange requests and active collaborations</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: tab === t.id ? 'rgba(109,40,217,0.2)' : '#1a1a26',
              color: tab === t.id ? '#a78bfa' : '#94a3b8',
              border: `1px solid ${tab === t.id ? 'rgba(109,40,217,0.4)' : '#2a2a3d'}`
            }}>
            {t.label}
            {t.count > 0 && <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(109,40,217,0.2)', color: '#a78bfa' }}>{t.count}</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20"><div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
      ) : filtered.length === 0 ? (
        <div className="glass p-12 text-center">
          <p className="text-4xl mb-3">⇄</p>
          <p className="font-display text-lg" style={{ color: '#e2e8f0' }}>No exchanges found</p>
          <p className="text-sm mt-1 mb-4" style={{ color: '#6b7280' }}>Head to Explore to find skill exchange partners</p>
          <Link to="/explore" className="btn-primary">Find Developers</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(e => {
            const isReceiver = e.receiver?._id === user?._id;
            const partner    = isReceiver ? e.sender : e.receiver;
            const wsId       = e.workspace?._id || e.workspace;

            return (
              <div key={e._id} className="glass p-5 fade-in">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-3 flex-1">
                    {/* Avatar — clickable to profile */}
                    <button onClick={() => navigate(`/app/profile/${partner?._id}`)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      <div className="avatar" title={`View ${partner?.name}'s profile`}>{initials(partner?.name)}</div>
                    </button>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Partner name — link to profile */}
                        <Link to={`/app/profile/${partner?._id}`}
                          style={{ color: '#e2e8f0', fontWeight: 600, textDecoration: 'none' }}
                          onMouseEnter={e => e.target.style.color = '#a78bfa'}
                          onMouseLeave={e => e.target.style.color = '#e2e8f0'}>
                          {partner?.name}
                        </Link>
                        <span className={`badge badge-${e.status}`}>{e.status}</span>
                        {isReceiver && e.status === 'pending' && (
                          <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}>Incoming</span>
                        )}
                      </div>

                      <div className="flex gap-4 mt-2 text-sm flex-wrap">
                        <span>
                          <span style={{ color: '#6b7280' }}>Offers: </span>
                          <span className="skill-tag inline-flex">{e.skillOffered}</span>
                        </span>
                        <span>
                          <span style={{ color: '#6b7280' }}>Wants: </span>
                          <span className="skill-tag skill-tag-green inline-flex">{e.skillWanted}</span>
                        </span>
                      </div>

                      {e.message && <p className="text-sm mt-2 italic" style={{ color: '#94a3b8' }}>"{e.message}"</p>}

                      {/* Workspace quick stats for active exchanges */}
                      {e.status === 'accepted' && wsId && <WorkspaceStats workspaceId={wsId} />}

                      <p className="text-xs mt-2" style={{ color: '#4b5563' }}>{timeAgo(e.createdAt)}</p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 flex-wrap items-start">
                    {/* Incoming pending — accept / decline */}
                    {isReceiver && e.status === 'pending' && (
                      <>
                        <button className="btn-primary text-sm py-1.5 px-4" onClick={() => respond(e._id, 'accepted')}>Accept</button>
                        <button className="btn-danger text-sm py-1.5 px-4" onClick={() => respond(e._id, 'declined')}>Decline</button>
                      </>
                    )}

                    {/* Outgoing pending — cancel */}
                    {!isReceiver && e.status === 'pending' && (
                      <button className="btn-danger text-sm py-1.5 px-4"
                        onClick={() => cancel(e._id)}
                        disabled={cancelling === e._id}>
                        {cancelling === e._id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    )}

                    {/* Active — open workspace + complete */}
                    {e.status === 'accepted' && wsId && (
                      <>
                        <Link to={`/app/exchanges/workspace/${wsId}`} className="btn-primary text-sm py-1.5 px-4">
                          Open Workspace →
                        </Link>
                        <button className="btn-secondary text-sm py-1.5 px-4" onClick={() => complete(e._id)}>
                          Complete
                        </button>
                      </>
                    )}

                    {/* Completed — leave review */}
                    {e.status === 'completed' && (
                      <Link to={`/app/profile/${partner?._id}`} className="btn-secondary text-sm py-1.5 px-4">
                        Leave Review
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}