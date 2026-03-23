import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../utils/socket';
import api from '../utils/api';
import ChatPanel from '../components/ChatPanel';

const initials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || 'U';
const timeAgo = (date) => {
  if (!date) return '';
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60)    return 'now';
  if (diff < 3600)  return `${Math.floor(diff/60)}m`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h`;
  return new Date(date).toLocaleDateString();
};

const Avatar = ({ name, size=36, online=false, color=0 }) => (
  <div style={{ position:'relative', flexShrink:0 }}>
    <div style={{
      width:size, height:size, borderRadius:'50%',
      background:`hsl(${(color*67+250)%360},55%,48%)`,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:size*0.32+'px', fontWeight:700, color:'white'
    }}>{initials(name)}</div>
    {online && <div style={{ position:'absolute', bottom:1, right:1, width:size*0.28, height:size*0.28, borderRadius:'50%', background:'#22c55e', border:'2px solid #12121a' }}/>}
  </div>
);

// ── New Conversation Modal ─────────────────────────────────────────
const NewConvoModal = ({ onClose, onStart }) => {
  const [search, setSearch]     = useState('');
  const [results, setResults]   = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!search.trim()) { setResults([]); return; }
      setSearching(true);
      try { const res = await api.get(`/users?search=${search}`); setResults(res.data.slice(0,8)); }
      catch(e) { console.error(e); }
      finally { setSearching(false); }
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background:'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)' }}>
      <div className="glass p-5 w-full max-w-sm fade-in">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
          <h3 className="font-display font-semibold" style={{ color:'#e2e8f0' }}>New Message</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'#6b7280', fontSize:'1.2rem', cursor:'pointer' }}>×</button>
        </div>
        <div style={{ position:'relative', marginBottom:'10px' }}>
          <input className="input" placeholder="Search people..." value={search} onChange={e=>setSearch(e.target.value)} autoFocus/>
          {searching && <div style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)' }}><div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"/></div>}
        </div>
        <div style={{ maxHeight:'260px', overflowY:'auto' }}>
          {!search.trim() ? (
            <p style={{ color:'#4b5563', fontSize:'0.85rem', textAlign:'center', padding:'20px 0' }}>Type a name to search</p>
          ) : results.length===0 && !searching ? (
            <p style={{ color:'#4b5563', fontSize:'0.85rem', textAlign:'center', padding:'20px 0' }}>No users found</p>
          ) : results.map((u,i) => (
            <button key={u._id} onClick={()=>{ onStart(u); onClose(); }}
              style={{ width:'100%', display:'flex', alignItems:'center', gap:'10px', padding:'9px 10px', borderRadius:'8px', background:'none', border:'none', cursor:'pointer', textAlign:'left', marginBottom:'4px', transition:'background 0.15s' }}
              onMouseEnter={e=>e.currentTarget.style.background='#1a1a26'}
              onMouseLeave={e=>e.currentTarget.style.background='none'}>
              <Avatar name={u.name} size={34} online={u.isOnline} color={i}/>
              <div>
                <p style={{ color:'#e2e8f0', fontSize:'0.875rem', fontWeight:500 }}>{u.name}</p>
                <p style={{ color:'#6b7280', fontSize:'0.75rem' }}>{u.skillsOffered?.slice(0,2).join(', ')}</p>
              </div>
              {u.isOnline && <span style={{ marginLeft:'auto', color:'#22c55e', fontSize:'0.72rem' }}>● online</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Main Messages Page ─────────────────────────────────────────────
export default function Messages() {
  const { userId } = useParams();
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const socket     = getSocket();

  const [conversations, setConversations] = useState([]);
  const [activeUser, setActiveUser]       = useState(null);
  const [roomId, setRoomId]               = useState(null);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [showNew, setShowNew]             = useState(false);
  const [isMobile, setIsMobile]           = useState(window.innerWidth < 768);
  const [mobileView, setMobileView]       = useState('list');

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => { setMobileView(false); }, []);

  // Load conversations
  useEffect(() => {
    api.get('/messages/conversations')
      .then(res => setConversations(res.data))
      .catch(console.error)
      .finally(() => setLoadingConvos(false));
  }, []);

  // Open from URL param
  useEffect(() => { if (userId) openConversation(userId); }, [userId]);

  // Socket: live unread count updates
  useEffect(() => {
    if (!socket) return;
    socket.on('new_message', (msg) => {
      if (msg.roomType !== 'direct') return;
      setConversations(prev => {
        const partnerId = msg.roomId.split('_').find(p => p !== String(user._id));
        const existing  = prev.find(c => String(c.partner._id) === partnerId);
        if (existing) {
          return [
            { ...existing, lastMessage: msg, unread: msg.roomId === roomId ? 0 : (existing.unread||0)+1 },
            ...prev.filter(c => String(c.partner._id) !== partnerId)
          ];
        }
        return prev;
      });
    });
    socket.on('user_online',  ({ userId: uid }) => updateOnline(uid, true));
    socket.on('user_offline', ({ userId: uid }) => updateOnline(uid, false));
    return () => { socket.off('new_message'); socket.off('user_online'); socket.off('user_offline'); };
  }, [socket, roomId]);

  const updateOnline = (uid, status) => {
    setConversations(prev => prev.map(c =>
      String(c.partner._id) === String(uid) ? { ...c, partner:{ ...c.partner, isOnline:status } } : c
    ));
    setActiveUser(prev => prev && String(prev._id) === String(uid) ? { ...prev, isOnline:status } : prev);
  };

  const openConversation = async (partnerUserId) => {
    try {
      const [dmRes, userRes] = await Promise.all([
        api.get(`/messages/dm/${partnerUserId}`),
        api.get(`/messages/dm-user/${partnerUserId}`)
      ]);
      setRoomId(dmRes.data.roomId);
      setActiveUser(userRes.data);
      setConversations(prev => prev.map(c =>
        String(c.partner._id) === String(partnerUserId) ? { ...c, unread:0 } : c
      ));
      navigate(`/messages/${partnerUserId}`, { replace:true });
      if (window.innerWidth < 768) setMobileView('chat');
    } catch(e) { console.error(e); }
  };

  const startNewConversation = (partnerUser) => {
    setConversations(prev => {
      const exists = prev.find(c => String(c.partner._id) === String(partnerUser._id));
      if (!exists) return [{ partner:partnerUser, roomId:null, lastMessage:null, unread:0 }, ...prev];
      return prev;
    });
    openConversation(partnerUser._id);
  };

  return (
    <div style={{ display:'flex', height:'100%', overflow:'hidden', background:'#0a0a0f' }}>

      {/* ── LEFT: Conversation list ── */}
      <div style={{
        width: isMobile ? '100%' : '300px', flexShrink:0,
        borderRight: isMobile ? 'none' : '1px solid #2a2a3d',
        display: isMobile && mobileView === 'chat' ? 'none' : 'flex',
        flexDirection:'column', background:'#12121a'
      }}>
        {/* Header */}
        <div style={{ padding:'16px', borderBottom:'1px solid #2a2a3d', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h2 className="font-display font-bold" style={{ color:'#e2e8f0', fontSize:'1.1rem' }}>Messages</h2>
          <button onClick={()=>setShowNew(true)}
            style={{ background:'linear-gradient(135deg,#6d28d9,#8b5cf6)', border:'none', borderRadius:'8px', color:'white', width:32, height:32, cursor:'pointer', fontSize:'1.1rem', display:'flex', alignItems:'center', justifyContent:'center' }}>
            ✏️
          </button>
        </div>

        {/* Conversation list */}
        <div style={{ flex:1, overflowY:'auto' }}>
          {loadingConvos ? (
            <div style={{ padding:'40px', textAlign:'center' }}>
              <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" style={{ margin:'0 auto' }}/>
            </div>
          ) : conversations.length===0 ? (
            <div style={{ padding:'40px 16px', textAlign:'center' }}>
              <p style={{ fontSize:'2rem', marginBottom:'8px' }}>💬</p>
              <p style={{ color:'#6b7280', fontSize:'0.85rem', marginBottom:'12px' }}>No conversations yet</p>
              <button onClick={()=>setShowNew(true)} className="btn-primary text-sm py-1.5 px-4">Start one</button>
            </div>
          ) : conversations.map((convo, i) => {
            const isActive = String(activeUser?._id) === String(convo.partner._id);
            return (
              <button key={convo.partner._id} onClick={()=>openConversation(convo.partner._id)}
                style={{ width:'100%', display:'flex', alignItems:'center', gap:'10px', padding:'12px 14px', background: isActive ? 'rgba(109,40,217,0.15)' : 'none', border:'none', borderLeft:`3px solid ${isActive?'#8b5cf6':'transparent'}`, cursor:'pointer', textAlign:'left', transition:'all 0.15s' }}
                onMouseEnter={e=>{ if(!isActive) e.currentTarget.style.background='#1a1a26'; }}
                onMouseLeave={e=>{ if(!isActive) e.currentTarget.style.background='none'; }}>
                <Avatar name={convo.partner.name} size={40} online={convo.partner.isOnline} color={i}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <p style={{ color:'#e2e8f0', fontSize:'0.875rem', fontWeight: convo.unread>0 ? 700 : 500 }}>{convo.partner.name}</p>
                    <span style={{ color:'#4b5563', fontSize:'0.7rem' }}>{timeAgo(convo.lastMessage?.createdAt)}</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'2px' }}>
                    <p style={{ color: convo.unread>0 ? '#94a3b8' : '#6b7280', fontSize:'0.78rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'160px' }}>
                      {convo.lastMessage?.content || 'No messages yet'}
                    </p>
                    {convo.unread>0 && (
                      <span style={{ background:'#6d28d9', color:'white', borderRadius:'999px', fontSize:'0.65rem', padding:'1px 6px', fontWeight:700, flexShrink:0 }}>{convo.unread}</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── RIGHT: Chat using ChatPanel ── */}
      {(!isMobile || mobileView==='chat') && (
        !activeUser ? (
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'12px' }}>
            <p style={{ fontSize:'3rem' }}>💬</p>
            <p className="font-display font-semibold" style={{ color:'#e2e8f0', fontSize:'1.1rem' }}>Your Messages</p>
            <p style={{ color:'#6b7280', fontSize:'0.875rem' }}>Select a conversation or start a new one</p>
            <button onClick={()=>setShowNew(true)} className="btn-primary px-6 mt-2">✏️ New Message</button>
          </div>
        ) : (
          <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
            {/* Chat header */}
            <div style={{ padding:'12px 20px', borderBottom:'1px solid #2a2a3d', background:'#12121a', display:'flex', alignItems:'center', gap:'12px', flexShrink:0 }}>
              {isMobile && (
                <button onClick={()=>setMobileView('list')}
                  style={{ background:'none', border:'none', color:'#a78bfa', cursor:'pointer', fontSize:'1.2rem', padding:'0 4px', flexShrink:0 }}>←</button>
              )}
              <Avatar name={activeUser.name} size={38} online={activeUser.isOnline} color={0}/>
              <div style={{ flex:1 }}>
                <p className="font-display font-semibold" style={{ color:'#e2e8f0' }}>{activeUser.name}</p>
                <p style={{ color: activeUser.isOnline ? '#22c55e' : '#6b7280', fontSize:'0.75rem' }}>
                  {activeUser.isOnline ? '● Online' : `Last seen ${timeAgo(activeUser.lastSeen)}`}
                </p>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                {activeUser.skillsOffered?.slice(0,3).map(s => (
                  <span key={s} className="skill-tag" style={{ fontSize:'0.7rem', padding:'1px 7px' }}>{s}</span>
                ))}
                <button onClick={async () => {
                  if (!window.confirm(`Clear entire conversation with ${activeUser.name}? This cannot be undone.`)) return;
                  try {
                    await api.delete(`/messages/clear/${activeUser._id}`);
                    // signal ChatPanel to clear via key change — remount
                    window.location.reload();
                  } catch(e) { alert('Could not clear chat'); }
                }} title="Clear conversation"
                  style={{ background:'none', border:'1px solid #2a2a3d', borderRadius:'8px', color:'#6b7280', cursor:'pointer', padding:'5px 10px', fontSize:'0.75rem', flexShrink:0 }}>
                  🗑 Clear
                </button>
              </div>
            </div>

            {/* ChatPanel handles everything: messages, pinned, @mentions, input */}
            <div style={{ flex:1, overflow:'hidden' }}>
              <ChatPanel
                key={roomId}
                roomId={roomId}
                roomType="direct"
                participants={[activeUser]}
              />
            </div>
          </div>
        )
      )}

      {showNew && <NewConvoModal onClose={()=>setShowNew(false)} onStart={startNewConversation}/>}
    </div>
  );
}
