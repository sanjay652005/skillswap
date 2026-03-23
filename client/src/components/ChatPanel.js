import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../utils/socket';
import api from '../utils/api';

const initials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || 'U';
const formatTime = (date) => new Date(date).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });

// Render message content with highlighted @mentions
const MessageContent = ({ content, mentions = [] }) => {
  if (!mentions?.length) return <span style={{ whiteSpace:'pre-wrap' }}>{content}</span>;
  const mentionNames = mentions.map(m => m.name || m);
  const parts = content.split(/(@\w[\w\s]*)/g);
  return (
    <span style={{ whiteSpace:'pre-wrap' }}>
      {parts.map((part, i) => {
        const name = part.startsWith('@') ? part.slice(1).trim() : null;
        const isMention = name && mentionNames.some(m => m.toLowerCase() === name.toLowerCase());
        return isMention ? (
          <span key={i} style={{ color:'#a78bfa', fontWeight:600, background:'rgba(109,40,217,0.15)', borderRadius:'4px', padding:'0 3px' }}>{part}</span>
        ) : <span key={i}>{part}</span>;
      })}
    </span>
  );
};

export default function ChatPanel({ roomId, roomType, participants = [] }) {
  const { user }  = useAuth();
  const socket    = getSocket();
  const [messages, setMessages]       = useState([]);
  const [pinned, setPinned]           = useState([]);
  const [showPinned, setShowPinned]   = useState(false);
  const [typing, setTyping]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionList, setMentionList]   = useState([]);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [openMenu, setOpenMenu]         = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // message _id pending delete
  const messagesEndRef  = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  // Load messages + pinned
  useEffect(() => {
    if (!roomId) return;
    Promise.all([
      api.get(`/messages/${roomType}/${roomId}`),
      api.get(`/messages/pinned/${roomId}`)
    ]).then(([msgRes, pinRes]) => {
      setMessages(msgRes.data);
      setPinned(pinRes.data);
    }).finally(() => setLoading(false));

    if (socket) {
      socket.emit('join_room', roomId);
      socket.on('new_message', (msg) => {
        if (msg.roomId === roomId) {
          // DMs: own messages added via API response already
          if (roomType === 'direct' && String(msg.sender?._id || msg.sender) === String(user._id)) return;
          setMessages(prev => [...prev, msg]);
        }
      });
      socket.on('message_pinned', (msg) => {
        if (msg.roomId === roomId) {
          setPinned(prev => [msg, ...prev.filter(p => p._id !== msg._id)]);
          setMessages(prev => prev.map(m => m._id === msg._id ? { ...m, isPinned:true, pinnedBy:msg.pinnedBy } : m));
        }
      });
      socket.on('message_unpinned', ({ messageId, roomId: rId }) => {
        if (rId === roomId) {
          setPinned(prev => prev.filter(p => p._id !== messageId));
          setMessages(prev => prev.map(m => m._id === messageId ? { ...m, isPinned:false } : m));
        }
      });
      socket.on('user_typing', ({ userId, name, roomId: rId }) => {
        if (rId === roomId && userId !== user._id)
          setTyping(prev => prev.includes(name) ? prev : [...prev, name]);
      });
      socket.on('user_stop_typing', ({ userId, roomId: rId }) => {
        if (rId === roomId) {
          const u = participants.find(p => p._id === userId);
          if (u) setTyping(prev => prev.filter(n => n !== u.name));
        }
      });
    }
    return () => {
      if (socket) {
        socket.emit('leave_room', roomId);
        socket.off('new_message');
        socket.off('message_pinned');
        socket.off('message_unpinned');
        socket.off('user_typing');
        socket.off('user_stop_typing');
      }
    };
  }, [roomId]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  // @mention detection
  const handleInputChange = () => {
    if (socket) {
      socket.emit('typing_start', { roomId });
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => socket.emit('typing_stop', { roomId }), 1500);
    }
    const val = inputRef.current?.value || '';
    const cursor = inputRef.current?.selectionStart || 0;
    const textUpToCursor = val.slice(0, cursor);
    const match = textUpToCursor.match(/@(\w*)$/);
    if (match) {
      const q = match[1].toLowerCase();
      setMentionQuery(q);
      setMentionList(participants.filter(p =>
        p._id !== user._id && p.name?.toLowerCase().includes(q)
      ));
      setMentionIndex(0);
    } else {
      setMentionList([]);
      setMentionQuery('');
    }
  };

  const insertMention = (participant) => {
    const val = inputRef.current?.value || '';
    const cursor = inputRef.current?.selectionStart || 0;
    const before = val.slice(0, cursor).replace(/@\w*$/, '');
    const after  = val.slice(cursor);
    const newVal = `${before}@${participant.name} ${after}`;
    inputRef.current.value = newVal;
    const newPos = before.length + participant.name.length + 2;
    inputRef.current.setSelectionRange(newPos, newPos);
    inputRef.current.focus();
    setMentionList([]);
  };

  // Extract mentioned user IDs from content
  const extractMentions = (content) => {
    const mentioned = [];
    participants.forEach(p => {
      if (content.includes(`@${p.name}`)) mentioned.push(p._id);
    });
    return mentioned;
  };

  const sendMessage = () => {
    const val = inputRef.current?.value?.trim();
    if (!val) return;
    const mentions = extractMentions(val);
    inputRef.current.value = '';
    inputRef.current.style.height = 'auto';
    if (socket) socket.emit('typing_stop', { roomId });

    if (roomType === 'direct') {
      // DMs use REST API — extract partner ID from roomId
      const partnerId = roomId.split('_').find(id => id !== participants[0]?._id && id !== '');
      const toUserId  = participants[0]?._id;
      api.post('/messages/dm', { content: val, toUserId, mentions })
        .then(res => setMessages(prev => [...prev, res.data]))
        .catch(console.error);
    } else {
      if (socket) socket.emit('send_message', { content: val, roomId, roomType, mentions });
    }
    setMentionList([]);
  };

  const handleKeyDown = (e) => {
    if (mentionList.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setMentionIndex(i => Math.min(i+1, mentionList.length-1)); return; }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setMentionIndex(i => Math.max(i-1, 0)); return; }
      if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); insertMention(mentionList[mentionIndex]); return; }
      if (e.key === 'Escape') { setMentionList([]); return; }
    }
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const togglePin = async (msg) => {
    try {
      if (msg.isPinned) {
        await api.put(`/messages/${msg._id}/unpin`);
      } else {
        await api.put(`/messages/${msg._id}/pin`);
      }
    } catch (e) { console.error(e); }
  };

  const deleteMsg = async (msg) => {
    try {
      await api.delete(`/messages/${msg._id}`);
      setMessages(prev => prev.filter(m => m._id !== msg._id));
      setPinned(prev => prev.filter(p => p._id !== msg._id));
      setConfirmDelete(null);
    } catch(e) { alert('Could not delete message'); }
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden', position:'relative' }}>

      {/* ── Pinned banner ── */}
      {pinned.length > 0 && (
        <button onClick={() => setShowPinned(!showPinned)}
          style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 14px', background:'rgba(109,40,217,0.1)', border:'none', borderBottom:'1px solid rgba(109,40,217,0.2)', cursor:'pointer', textAlign:'left', width:'100%', flexShrink:0 }}>
          <span style={{ fontSize:'0.85rem' }}>📌</span>
          <span style={{ color:'#a78bfa', fontSize:'0.8rem', fontWeight:600 }}>
            {pinned.length} pinned message{pinned.length>1?'s':''}
          </span>
          <span style={{ color:'#6b7280', fontSize:'0.75rem', marginLeft:'auto' }}>{showPinned ? '▲ Hide' : '▼ Show'}</span>
        </button>
      )}

      {/* ── Pinned messages dropdown ── */}
      {showPinned && pinned.length > 0 && (
        <div style={{ background:'#12121a', borderBottom:'1px solid #2a2a3d', padding:'10px 14px', maxHeight:'180px', overflowY:'auto', flexShrink:0 }}>
          {pinned.map(msg => (
            <div key={msg._id} style={{ display:'flex', gap:'10px', alignItems:'flex-start', padding:'8px 10px', borderRadius:'8px', background:'rgba(109,40,217,0.06)', border:'1px solid rgba(109,40,217,0.15)', marginBottom:'6px' }}>
              <span style={{ fontSize:'0.9rem', flexShrink:0 }}>📌</span>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ color:'#a78bfa', fontSize:'0.72rem', marginBottom:'2px' }}>
                  {msg.sender?.name} · pinned by {msg.pinnedBy?.name}
                </p>
                <p style={{ color:'#e2e8f0', fontSize:'0.82rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {msg.content}
                </p>
              </div>
              <button onClick={() => togglePin(msg)}
                style={{ background:'none', border:'none', color:'#6b7280', cursor:'pointer', fontSize:'0.75rem', flexShrink:0, padding:'2px 4px' }}>
                Unpin
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Messages area ── */}
      <div style={{ flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:'12px' }}
      onClick={() => { setOpenMenu(null); setConfirmDelete(null); }}>
        {loading ? (
          <div style={{ textAlign:'center', paddingTop:'40px' }}>
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" style={{ margin:'0 auto' }}/>
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign:'center', paddingTop:'60px' }}>
            <p style={{ fontSize:'2rem', marginBottom:'8px' }}>💬</p>
            <p style={{ color:'#6b7280', fontSize:'0.9rem' }}>No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isSelf    = msg.sender?._id === user?._id;
            const showName  = !isSelf && (i === 0 || messages[i-1]?.sender?._id !== msg.sender?._id);
            const isOpen    = openMenu === msg._id;
            return (
              <div key={msg._id || i}
                style={{ display:'flex', flexDirection: isSelf ? 'row-reverse' : 'row', alignItems:'flex-end', gap:'8px', position:'relative' }}>

                {/* Avatar */}
                {!isSelf ? (
                  <div style={{ width:30, height:30, borderRadius:'50%', flexShrink:0, background:'linear-gradient(135deg,#6d28d9,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.65rem', fontWeight:700, color:'white' }}>
                    {initials(msg.sender?.name)}
                  </div>
                ) : <div style={{ width:30, flexShrink:0 }}/>}

                {/* Bubble */}
                <div style={{ display:'flex', flexDirection:'column', alignItems: isSelf ? 'flex-end' : 'flex-start', maxWidth:'65%', minWidth:0 }}>
                  {showName && <p style={{ fontSize:'0.72rem', color:'#6b7280', marginBottom:'3px', paddingLeft:'2px' }}>{msg.sender?.name}</p>}
                  <div style={{ position:'relative' }}>
                    {/* Tap bubble to open action menu */}
                    <div onClick={(e) => { e.stopPropagation(); setOpenMenu(isOpen ? null : msg._id); }}
                      style={{
                        padding:'10px 14px', minWidth:'60px', cursor:'pointer', userSelect:'none',
                        borderRadius: isSelf ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        background: msg.isPinned
                          ? (isSelf ? 'linear-gradient(135deg,#5b21b6,#7c3aed)' : 'rgba(109,40,217,0.12)')
                          : (isSelf ? 'linear-gradient(135deg,#6d28d9,#8b5cf6)' : '#1a1a26'),
                        border: msg.isPinned ? '1px solid rgba(109,40,217,0.4)' : (isSelf ? 'none' : '1px solid #2a2a3d'),
                        color:'#e2e8f0', fontSize:'0.875rem', lineHeight:'1.5',
                        wordBreak:'break-word', overflowWrap:'anywhere'
                      }}>
                      {msg.messageType === 'code' ? (
                        <pre style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.78rem', overflowX:'auto', margin:0, whiteSpace:'pre-wrap', wordBreak:'break-all' }}>
                          <code>{msg.content}</code>
                        </pre>
                      ) : (
                        <MessageContent content={msg.content} mentions={msg.mentions} />
                      )}
                    </div>
                    {msg.isPinned && (
                      <span style={{ position:'absolute', top:'-6px', [isSelf?'right':'left']:'-6px', fontSize:'0.75rem' }}>📌</span>
                    )}
                    {/* Action popover */}
                    {isOpen && (
                      <div style={{
                        position:'absolute', [isSelf?'right':'left']:0,
                        bottom:'calc(100% + 6px)', zIndex:30,
                        background:'#1e1e2e', border:'1px solid #2a2a3d',
                        borderRadius:'12px', overflow:'hidden',
                        boxShadow:'0 8px 24px rgba(0,0,0,0.5)', minWidth:'150px'
                      }}>
                        <button onClick={() => { togglePin(msg); setOpenMenu(null); }}
                          style={{ display:'flex', alignItems:'center', gap:'10px', width:'100%', padding:'13px 16px', background:'none', border:'none', borderBottom: isSelf ? '1px solid #2a2a3d' : 'none', color: msg.isPinned ? '#a78bfa' : '#e2e8f0', cursor:'pointer', fontSize:'0.9rem' }}>
                          📌 {msg.isPinned ? 'Unpin' : 'Pin'}
                        </button>
                        {isSelf && (confirmDelete === msg._id ? (
                          <div style={{ padding:'10px 14px' }}>
                            <p style={{ color:'#f87171', fontSize:'0.78rem', marginBottom:'8px', textAlign:'center' }}>Delete for everyone?</p>
                            <div style={{ display:'flex', gap:'6px' }}>
                              <button onClick={() => setConfirmDelete(null)}
                                style={{ flex:1, padding:'7px', background:'#2a2a3d', border:'none', borderRadius:'8px', color:'#e2e8f0', cursor:'pointer', fontSize:'0.8rem' }}>
                                Cancel
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); deleteMsg(msg); }}
                                style={{ flex:1, padding:'7px', background:'#ef4444', border:'none', borderRadius:'8px', color:'white', cursor:'pointer', fontSize:'0.8rem', fontWeight:600 }}>
                                Delete
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(msg._id); }}
                            style={{ display:'flex', alignItems:'center', gap:'10px', width:'100%', padding:'13px 16px', background:'none', border:'none', color:'#ef4444', cursor:'pointer', fontSize:'0.9rem' }}>
                            🗑 Delete
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <p style={{ fontSize:'0.7rem', color:'#4b5563', marginTop:'3px', paddingLeft:'2px' }}>{formatTime(msg.createdAt)}</p>
                </div>
              </div>
            );
          })
        )}

        {typing.length > 0 && (
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <div style={{ padding:'10px 14px', borderRadius:'18px 18px 18px 4px', background:'#1a1a26', border:'1px solid #2a2a3d', display:'flex', gap:'4px', alignItems:'center' }}>
              {[0,150,300].map(d => <span key={d} style={{ width:6, height:6, borderRadius:'50%', background:'#6b7280', display:'inline-block', animation:`bounce 1s ${d}ms infinite` }}/>)}
            </div>
            <span style={{ fontSize:'0.75rem', color:'#6b7280' }}>{typing.join(', ')} typing...</span>
          </div>
        )}
        <div ref={messagesEndRef}/>
      </div>

      {/* ── @mention autocomplete ── */}
      {mentionList.length > 0 && (
        <div style={{ position:'absolute', bottom:'70px', left:'16px', right:'16px', background:'#1a1a26', border:'1px solid #2a2a3d', borderRadius:'10px', overflow:'hidden', zIndex:20, boxShadow:'0 -4px 20px rgba(0,0,0,0.4)' }}>
          <p style={{ color:'#6b7280', fontSize:'0.72rem', padding:'6px 12px', borderBottom:'1px solid #2a2a3d' }}>Mention a person</p>
          {mentionList.map((p, i) => (
            <button key={p._id} onClick={() => insertMention(p)}
              style={{ display:'flex', alignItems:'center', gap:'10px', width:'100%', padding:'8px 12px', background: i===mentionIndex ? 'rgba(109,40,217,0.15)' : 'none', border:'none', cursor:'pointer', textAlign:'left' }}>
              <div style={{ width:26, height:26, borderRadius:'50%', background:'linear-gradient(135deg,#6d28d9,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.6rem', color:'white', fontWeight:700 }}>
                {initials(p.name)}
              </div>
              <span style={{ color:'#e2e8f0', fontSize:'0.85rem' }}>{p.name}</span>
              {p.isOnline && <span style={{ marginLeft:'auto', color:'#22c55e', fontSize:'0.7rem' }}>● online</span>}
            </button>
          ))}
        </div>
      )}

      {/* ── Input bar ── */}
      <div style={{ padding:'12px 16px', borderTop:'1px solid #2a2a3d', background:'#12121a', flexShrink:0 }}>
        <div style={{ display:'flex', gap:'8px', alignItems:'flex-end' }}>
          <textarea ref={inputRef}
            onChange={e => { handleInputChange(); e.target.style.height='auto'; e.target.style.height=Math.min(e.target.scrollHeight,120)+'px'; }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... @ to mention someone"
            rows={1}
            style={{ flex:1, background:'#1a1a26', border:'1px solid #2a2a3d', borderRadius:'10px', color:'#e2e8f0', padding:'10px 14px', fontSize:'0.875rem', fontFamily:'DM Sans, sans-serif', resize:'none', outline:'none', lineHeight:'1.5', maxHeight:'120px', overflowY:'auto', height:'40px' }}
          />
          <button onClick={sendMessage}
            style={{ background:'linear-gradient(135deg,#6d28d9,#8b5cf6)', border:'none', borderRadius:'10px', color:'white', width:42, height:42, cursor:'pointer', fontSize:'1.1rem', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}
