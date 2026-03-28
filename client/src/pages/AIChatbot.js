import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const QUICK_PROMPTS = [
  'Explain React hooks with examples',
  'How do I optimize MongoDB queries?',
  'What\'s the best way to learn TypeScript?',
  'Review my approach to REST API design',
  'Explain async/await vs Promises',
  'How to implement JWT authentication?'
];

const renderMarkdown = (text) => {
  return text
    .replace(/### (.*?)(\n|$)/g, '<p style="color:#a78bfa;font-weight:700;font-size:0.9rem;margin:10px 0 4px">$1</p>')
    .replace(/## (.*?)(\n|$)/g, '<p style="color:#e2e8f0;font-weight:700;font-size:0.95rem;margin:12px 0 4px">$1</p>')
    .replace(/# (.*?)(\n|$)/g, '<p style="color:#e2e8f0;font-weight:800;font-size:1rem;margin:14px 0 6px">$1</p>')
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#e2e8f0;font-weight:600">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em style="color:#c4b5fd">$1</em>')
    .replace(/^- (.*)/gm, '<div style="display:flex;gap:6px;margin:3px 0"><span style="color:#6d28d9;margin-top:2px">•</span><span>$1</span></div>')
    .replace(/^\d+\. (.*)/gm, '<div style="display:flex;gap:6px;margin:3px 0"><span style="color:#6d28d9;font-weight:600;min-width:16px">›</span><span>$1</span></div>')
    .replace(/\n/g, '<br/>');
};

const MessageBubble = ({ msg }) => {
  const isAI = msg.role === 'assistant';

  const renderContent = () => {
    const parts = msg.content.split('```');
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        const [lang, ...lines] = part.split('\n');
        return (
          <pre key={i} className="my-3 p-3 rounded-lg overflow-x-auto text-xs"
            style={{ background: '#0a0a0f', border: '1px solid #2a2a3d', fontFamily: 'JetBrains Mono, monospace', color: '#a78bfa' }}>
            <code>{lines.join('\n')}</code>
          </pre>
        );
      }
      if (isAI) {
        return <div key={i} dangerouslySetInnerHTML={{ __html: renderMarkdown(part) }} />;
      }
      return <span key={i} className="whitespace-pre-wrap">{part}</span>;
    });
  };

  return (
    <div className={`flex gap-3 ${isAI ? '' : 'flex-row-reverse'} fade-in`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold`}
        style={{ background: isAI ? 'linear-gradient(135deg, #6d28d9, #8b5cf6)' : '#1a1a26', color: 'white', border: isAI ? 'none' : '1px solid #2a2a3d' }}>
        {isAI ? '✦' : 'U'}
      </div>
      <div className={`flex-1 max-w-2xl`}>
        <div className={`p-4 rounded-xl text-sm leading-relaxed`}
          style={{
            background: isAI ? '#1a1a26' : 'rgba(109,40,217,0.15)',
            border: `1px solid ${isAI ? '#2a2a3d' : 'rgba(109,40,217,0.3)'}`,
            color: '#94a3b8'
          }}>
          {renderContent()}
        </div>
        <p className="text-xs mt-1 px-1" style={{ color: '#4b5563' }}>
          {isAI ? 'AI Assistant' : 'You'} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

export default function AIChatbot() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello ${user?.name?.split(' ')[0]}! 👋 I'm your AI coding assistant powered by Gemini.

I can help you with:
- **Code debugging** and problem-solving
- **Learning** new technologies and concepts  
- **Architecture** decisions and best practices
- **Career advice** for developers
- **Code review** and optimization

What would you like to work on today?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (content = input) => {
    if (!content.trim() || loading) return;

    const userMsg = { role: 'user', content: content.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const context = `User profile: ${user?.name}, offers ${user?.skillsOffered?.join(', ')}, wants to learn ${user?.skillsWanted?.join(', ')}`;
      const apiMessages = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));

      const res = await api.post('/ai/chat', { messages: apiMessages, context });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.message, timestamp: new Date() }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please check if the OpenAI API key is configured in the server.',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const clearChat = () => setMessages([{
    role: 'assistant',
    content: "Chat cleared! How can I help you?",
    timestamp: new Date()
  }]);

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto">
      {/* Header */}
      <div className="px-8 py-5 border-b" style={{ borderColor: '#2a2a3d' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6d28d9, #8b5cf6)', boxShadow: '0 0 20px rgba(109,40,217,0.3)' }}>
              <span className="text-white">✦</span>
            </div>
            <div>
              <h1 className="font-display text-xl font-bold gradient-text">AI Assistant</h1>
              <p className="text-xs" style={{ color: '#6b7280' }}>Powered by Gemini • Your personal coding mentor</p>
            </div>
          </div>
          <button onClick={clearChat} className="btn-secondary text-sm py-1.5 px-3">Clear Chat</button>
        </div>
      </div>

      {/* Quick prompts (only show at start) */}
      {messages.length <= 1 && (
        <div className="px-8 py-4">
          <p className="text-xs mb-3 font-medium" style={{ color: '#6b7280' }}>QUICK PROMPTS</p>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_PROMPTS.map(p => (
              <button key={p} onClick={() => sendMessage(p)}
                className="text-left text-sm p-3 rounded-lg transition-all hover:border-violet-500/40"
                style={{ background: '#1a1a26', border: '1px solid #2a2a3d', color: '#94a3b8' }}>
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 py-4 space-y-5">
        {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}

        {loading && (
          <div className="flex gap-3 fade-in">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6d28d9, #8b5cf6)' }}>
              <span className="text-white text-sm">✦</span>
            </div>
            <div className="p-4 rounded-xl" style={{ background: '#1a1a26', border: '1px solid #2a2a3d' }}>
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-8 py-5 border-t" style={{ borderColor: '#2a2a3d' }}>
        <div className="flex gap-3">
          <textarea
            className="input flex-1 resize-none"
            rows={2}
            placeholder="Ask me anything about coding, architecture, learning paths..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          />
          <button className="btn-primary px-5" onClick={() => sendMessage()} disabled={loading || !input.trim()}>
            {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></span> : '↑'}
          </button>
        </div>
        <p className="text-xs mt-2" style={{ color: '#4b5563' }}>Press Enter to send • Shift+Enter for new line</p>
      </div>
    </div>
  );
}