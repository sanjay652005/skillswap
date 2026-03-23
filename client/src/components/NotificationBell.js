import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSocket } from '../utils/socket';
import api from '../utils/api';

const TYPE_ICON = {
  exchange_request:  '⇄',
  exchange_accepted: '✅',
  exchange_declined: '❌',
  project_invite:    '📨',
  join_request:      '🙋',
  join_accepted:     '✅',
  join_declined:     '❌',
  new_message:       '💬',
  compliment:        '⭐',
  project_completed: '🏁',
};

const TYPE_COLOR = {
  exchange_accepted: '#34d399',
  join_accepted:     '#34d399',
  compliment:        '#fbbf24',
  project_completed: '#34d399',
  exchange_declined: '#f87171',
  join_declined:     '#f87171',
  exchange_request:  '#a78bfa',
  project_invite:    '#a78bfa',
  join_request:      '#60a5fa',
  new_message:       '#94a3b8',
};

const timeAgo = (date) => {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60)   return 'just now';
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400)return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [open, setOpen]                   = useState(false);
  const [loading, setLoading]             = useState(false);
  const dropdownRef = useRef(null);
  const navigate    = useNavigate();
  const socket      = getSocket();

  // Fetch on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Real-time via socket
  useEffect(() => {
    if (!socket) return;
    socket.on('new_notification', (notif) => {
      setNotifications(prev => [notif, ...prev]);
      setUnreadCount(prev => prev + 1);
      // Play a subtle sound or flash
      document.title = `(🔔) SkillSwap`;
      setTimeout(() => { document.title = 'SkillSwap'; }, 3000);
    });
    return () => socket.off('new_notification');
  }, [socket]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleOpen = (e) => {
    e.stopPropagation();
    setOpen(prev => !prev);
    if (!open) fetchNotifications();
  };

  const markRead = async (notif) => {
    if (!notif.read) {
      try {
        await api.put(`/notifications/${notif._id}/read`);
        setNotifications(prev => prev.map(n => n._id === notif._id ? {...n, read: true} : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch(e) {}
    }
    if (notif.link) {
      setOpen(false);
      navigate(notif.link);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({...n, read: true})));
      setUnreadCount(0);
    } catch(e) {}
  };

  const deleteNotif = async (e, id) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      setUnreadCount(prev => {
        const wasUnread = notifications.find(n => n._id === id && !n.read);
        return wasUnread ? Math.max(0, prev - 1) : prev;
      });
    } catch(e) {}
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Bell button */}
      <button onClick={handleOpen}
        style={{
          position: 'relative', background: 'none', border: 'none',
          cursor: 'pointer', padding: '6px', borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.2s'
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#1a1a26'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
        title="Notifications">
        <span style={{ fontSize: '1.2rem' }}>🔔</span>
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 0, right: 0,
            background: 'linear-gradient(135deg, #ef4444, #f87171)',
            color: 'white', borderRadius: '999px',
            fontSize: '0.62rem', fontWeight: 700,
            minWidth: '16px', height: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 3px', border: '2px solid #12121a',
            animation: 'pulse 2s infinite'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          width: '340px', maxHeight: '480px',
          background: '#12121a', border: '1px solid #2a2a3d',
          borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
          display: 'flex', flexDirection: 'column', zIndex: 9999,
          animation: 'fadeIn 0.15s ease'
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 16px', borderBottom: '1px solid #2a2a3d',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.9rem' }}>Notifications</span>
              {unreadCount > 0 && (
                <span style={{
                  background: 'rgba(109,40,217,0.2)', color: '#a78bfa',
                  border: '1px solid rgba(109,40,217,0.3)',
                  borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600,
                  padding: '1px 7px'
                }}>{unreadCount} new</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead}
                style={{ background: 'none', border: 'none', color: '#a78bfa', fontSize: '0.78rem', cursor: 'pointer' }}>
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {loading ? (
              <div style={{ padding: '32px', textAlign: 'center' }}>
                <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" style={{ margin: '0 auto' }}></div>
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '40px 16px', textAlign: 'center' }}>
                <p style={{ fontSize: '2rem', marginBottom: '8px' }}>🔔</p>
                <p style={{ color: '#4b5563', fontSize: '0.875rem' }}>No notifications yet</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div key={notif._id}
                  onClick={() => markRead(notif)}
                  style={{
                    padding: '12px 16px', cursor: 'pointer',
                    borderBottom: '1px solid #1a1a26',
                    background: notif.read ? 'transparent' : 'rgba(109,40,217,0.06)',
                    display: 'flex', gap: '10px', alignItems: 'flex-start',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#1a1a26'}
                  onMouseLeave={e => e.currentTarget.style.background = notif.read ? 'transparent' : 'rgba(109,40,217,0.06)'}>

                  {/* Icon */}
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    background: `${TYPE_COLOR[notif.type]}20`,
                    border: `1px solid ${TYPE_COLOR[notif.type]}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem'
                  }}>
                    {TYPE_ICON[notif.type] || '🔔'}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      color: notif.read ? '#94a3b8' : '#e2e8f0',
                      fontSize: '0.82rem', fontWeight: notif.read ? 400 : 600,
                      marginBottom: '2px', lineHeight: 1.4
                    }}>{notif.title}</p>
                    {notif.body && (
                      <p style={{ color: '#6b7280', fontSize: '0.76rem', lineHeight: 1.4 }}>{notif.body}</p>
                    )}
                    <p style={{ color: '#4b5563', fontSize: '0.7rem', marginTop: '4px' }}>
                      {notif.sender?.name && <span style={{ color: '#6b7280' }}>{notif.sender.name} · </span>}
                      {timeAgo(notif.createdAt)}
                    </p>
                  </div>

                  {/* Unread dot + delete */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    {!notif.read && (
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#8b5cf6' }}></div>
                    )}
                    <button onClick={(e) => deleteNotif(e, notif._id)}
                      style={{ background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', fontSize: '0.8rem', lineHeight: 1 }}
                      title="Dismiss">×</button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div style={{ padding: '10px 16px', borderTop: '1px solid #2a2a3d', textAlign: 'center', flexShrink: 0 }}>
              <button onClick={async () => {
                try {
                  await Promise.all(notifications.map(n => api.delete(`/notifications/${n._id}`)));
                  setNotifications([]); setUnreadCount(0);
                } catch(e) {}
              }} style={{ background: 'none', border: 'none', color: '#4b5563', fontSize: '0.78rem', cursor: 'pointer' }}>
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
