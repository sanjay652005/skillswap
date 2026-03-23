import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../utils/socket';
import ChatPanel from '../components/ChatPanel';
import TaskManager from '../components/TaskManager';

const LANGUAGES = ['javascript','typescript','python','go','rust','java','cpp','html','css','sql'];
const JUDGE0_LANG = { javascript:63, typescript:74, python:71, go:60, rust:73, java:62, cpp:54 };
const TABS = ['code','chat','tasks','resources'];

const initials = (name) => name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)||'U';

// ── Compliment Modal ──────────────────────────────────────────────
const ComplimentModal = ({ project, currentUser, onClose }) => {
  const teammates = project?.collaborators
    ?.map(c => c.user)
    .filter(u => u && u._id !== currentUser._id) || [];

  const [selected, setSelected] = useState(teammates[0]?._id || '');
  const [rating, setRating]     = useState(5);
  const [feedback, setFeedback] = useState('');
  const [skill, setSkill]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);
  const [error, setError]       = useState('');

  const COMPLIMENTS = [
    'Great communicator 💬',
    'Excellent problem solver 🧠',
    'Clean code writer ✨',
    'Amazing teamwork 🤝',
    'Super reliable 🎯',
    'Creative thinker 💡',
    'Helped me learn a lot 📚',
    'Great mentor 🌟',
  ];

  const handleSubmit = async () => {
    if (!selected || !feedback.trim()) return;
    setLoading(true); setError('');
    try {
      await api.post('/reviews', {
        revieweeId: selected,
        referenceId: project._id,
        referenceType: 'project',
        rating,
        feedback,
        skillReviewed: skill
      });
      setDone(true);
    } catch(err) {
      setError(err.response?.data?.error || 'Failed to send compliment');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{background:'rgba(0,0,0,0.75)',backdropFilter:'blur(4px)'}}>
      <div className="glass p-6 w-full max-w-md fade-in" style={{maxHeight:'90vh',overflowY:'auto'}}>

        {done ? (
          <div style={{textAlign:'center',padding:'32px 0'}}>
            <div style={{fontSize:'3rem',marginBottom:'12px'}}>🌟</div>
            <h3 className="font-display font-bold text-xl mb-2" style={{color:'#e2e8f0'}}>Compliment Sent!</h3>
            <p style={{color:'#94a3b8',marginBottom:'24px'}}>Your feedback helps the community grow.</p>
            <button className="btn-primary px-8" onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'20px'}}>
              <div>
                <h3 className="font-display font-bold text-lg" style={{color:'#e2e8f0'}}>Send Compliment</h3>
                <p style={{color:'#6b7280',fontSize:'0.8rem'}}>Recognize a teammate's contribution</p>
              </div>
              <button onClick={onClose} style={{background:'none',border:'none',color:'#6b7280',fontSize:'1.3rem',cursor:'pointer'}}>×</button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg text-sm" style={{background:'rgba(239,68,68,0.1)',color:'#f87171',border:'1px solid rgba(239,68,68,0.3)'}}>
                {error}
              </div>
            )}

            {teammates.length === 0 ? (
              <p style={{color:'#6b7280',textAlign:'center',padding:'24px 0'}}>No teammates to compliment yet.</p>
            ) : (
              <div className="space-y-4">
                {/* Pick teammate */}
                <div>
                  <label className="block text-sm mb-2" style={{color:'#94a3b8'}}>Who are you complimenting?</label>
                  <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
                    {teammates.map((u,i) => (
                      <button key={u._id} onClick={()=>setSelected(u._id)}
                        style={{
                          display:'flex',alignItems:'center',gap:'10px',padding:'10px 12px',
                          borderRadius:'8px',border:`1px solid ${selected===u._id?'rgba(109,40,217,0.6)':'#2a2a3d'}`,
                          background: selected===u._id?'rgba(109,40,217,0.15)':'#1a1a26',
                          cursor:'pointer',textAlign:'left'
                        }}>
                        <div style={{
                          width:32,height:32,borderRadius:'50%',flexShrink:0,
                          background:`hsl(${(i*67+250)%360},55%,48%)`,
                          display:'flex',alignItems:'center',justifyContent:'center',
                          fontSize:'0.7rem',fontWeight:700,color:'white'
                        }}>{initials(u.name)}</div>
                        <div>
                          <p style={{color:'#e2e8f0',fontSize:'0.875rem',fontWeight:500}}>{u.name}</p>
                          <p style={{color:'#6b7280',fontSize:'0.75rem'}}>{u.skillsOffered?.slice(0,2).join(', ')}</p>
                        </div>
                        {selected===u._id && <span style={{marginLeft:'auto',color:'#a78bfa'}}>✓</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Star rating */}
                <div>
                  <label className="block text-sm mb-2" style={{color:'#94a3b8'}}>Rating</label>
                  <div style={{display:'flex',gap:'8px'}}>
                    {[1,2,3,4,5].map(n => (
                      <button key={n} onClick={()=>setRating(n)}
                        style={{
                          fontSize:'1.6rem',background:'none',border:'none',cursor:'pointer',
                          filter: n<=rating ? 'none' : 'grayscale(1) opacity(0.3)',
                          transform: n<=rating ? 'scale(1.1)' : 'scale(1)',
                          transition:'all 0.15s'
                        }}>⭐</button>
                    ))}
                    <span style={{color:'#6b7280',fontSize:'0.85rem',alignSelf:'center',marginLeft:'4px'}}>
                      {['','Poor','Fair','Good','Great','Excellent!'][rating]}
                    </span>
                  </div>
                </div>

                {/* Quick compliment chips */}
                <div>
                  <label className="block text-sm mb-2" style={{color:'#94a3b8'}}>Quick tags <span style={{color:'#4b5563'}}>(click to add)</span></label>
                  <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
                    {COMPLIMENTS.map(c => (
                      <button key={c} onClick={()=>setFeedback(prev => prev ? prev+' '+c : c)}
                        style={{
                          fontSize:'0.75rem',padding:'4px 10px',borderRadius:'999px',cursor:'pointer',
                          background:'#1a1a26',border:'1px solid #2a2a3d',color:'#94a3b8',
                          transition:'all 0.15s'
                        }}
                        onMouseEnter={e=>{e.target.style.borderColor='#6d28d9';e.target.style.color='#a78bfa';}}
                        onMouseLeave={e=>{e.target.style.borderColor='#2a2a3d';e.target.style.color='#94a3b8';}}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Skill reviewed */}
                <div>
                  <label className="block text-sm mb-2" style={{color:'#94a3b8'}}>Skill they showed <span style={{color:'#4b5563'}}>(optional)</span></label>
                  <input className="input" placeholder="e.g. React, Python, System Design..."
                    value={skill} onChange={e=>setSkill(e.target.value)}/>
                </div>

                {/* Written feedback */}
                <div>
                  <label className="block text-sm mb-2" style={{color:'#94a3b8'}}>Your message *</label>
                  <textarea className="input" rows={3}
                    placeholder="Tell them what they did well..."
                    value={feedback} onChange={e=>setFeedback(e.target.value)}/>
                </div>

                <div style={{display:'flex',gap:'10px'}}>
                  <button className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
                  <button className="btn-primary flex-1" onClick={handleSubmit}
                    disabled={loading||!selected||!feedback.trim()}>
                    {loading?'Sending...':'🌟 Send Compliment'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ── Complete Project Modal ────────────────────────────────────────
const CompleteModal = ({ project, onClose, onCompleted }) => {
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    try {
      await api.put(`/projects/${project._id}/complete`);
      onCompleted();
      onClose();
    } catch(err) {
      alert(err.response?.data?.error || 'Failed to complete project');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{background:'rgba(0,0,0,0.75)',backdropFilter:'blur(4px)'}}>
      <div className="glass p-6 w-full max-w-sm fade-in" style={{textAlign:'center'}}>
        <div style={{fontSize:'3rem',marginBottom:'12px'}}>🏁</div>
        <h3 className="font-display font-bold text-xl mb-2" style={{color:'#e2e8f0'}}>Complete Project?</h3>
        <p style={{color:'#94a3b8',fontSize:'0.9rem',marginBottom:'8px'}}>
          Mark <strong style={{color:'#e2e8f0'}}>{project?.title}</strong> as completed.
        </p>
        <p style={{color:'#6b7280',fontSize:'0.82rem',marginBottom:'24px'}}>
          The workspace stays accessible. You can then send compliments to your teammates.
        </p>
        <div style={{display:'flex',gap:'10px'}}>
          <button className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
          <button onClick={handleComplete} disabled={loading}
            style={{
              flex:1,padding:'10px',borderRadius:'8px',border:'none',cursor:'pointer',fontWeight:600,
              background:'linear-gradient(135deg,#059669,#10b981)',color:'white',fontSize:'0.875rem'
            }}>
            {loading?'Completing...':'✓ Complete'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Workspace ────────────────────────────────────────────────
export default function ProjectWorkspace() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [workspace, setWorkspace]   = useState(null);
  const [project, setProject]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState('code');
  const [code, setCode]             = useState('// Start coding...');
  const [language, setLanguage]     = useState('javascript');
  const [saving, setSaving]         = useState(false);
  const [running, setRunning]       = useState(false);
  const [output, setOutput]         = useState(null);
  const [showOutput, setShowOutput] = useState(false);
  const [resource, setResource]     = useState({ title:'', url:'', type:'link', content:'' });
  const [showAddResource, setShowAddResource] = useState(false);
  const [showComplete, setShowComplete]       = useState(false);
  const [showCompliment, setShowCompliment]   = useState(false);

  const saveTimeoutRef = useRef(null);
  const socket = getSocket();
  const isEditing = useRef(false);

  useEffect(() => {
    api.get(`/projects/workspace/${id}`)
      .then(res => {
        setWorkspace(res.data);
        setCode(res.data.liveCode?.content || '// Start coding here...');
        setLanguage(res.data.liveCode?.language || 'javascript');
        return api.get(`/projects/${res.data.project._id || res.data.project}`);
      })
      .then(res => setProject(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));

    if (socket) {
      socket.emit('join_code_session', id);
      socket.on('code_updated', (data) => {
        if (!isEditing.current) {
          setCode(data.content);
          if (data.language) setLanguage(data.language);
        }
      });
    }
    return () => { if (socket) socket.off('code_updated'); };
  }, [id]);

  const handleCodeChange = useCallback((value) => {
    isEditing.current = true;
    setCode(value);
    if (socket) socket.emit('code_change', { workspaceId: id, content: value, language });
    clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        setSaving(true);
        await api.put(`/projects/workspace/${id}/code`, { content: value, language });
      } catch(err) { console.error(err); }
      finally { setSaving(false); isEditing.current = false; }
    }, 2000);
  }, [id, language, socket]);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    if (socket) socket.emit('code_change', { workspaceId: id, content: code, language: lang });
  };

  const runCode = async () => {
    setRunning(true); setShowOutput(true); setOutput(null);
    const langId = JUDGE0_LANG[language];
    if (!langId) {
      setOutput({ stderr: `Running "${language}" is not supported yet.\nSupported: ${Object.keys(JUDGE0_LANG).join(', ')}` });
      setRunning(false); return;
    }
    try {
      const res = await fetch('https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true', {
        method:'POST',
        headers:{'Content-Type':'application/json','X-RapidAPI-Key':'SIGN-UP-FOR-KEY','X-RapidAPI-Host':'judge0-ce.p.rapidapi.com'},
        body: JSON.stringify({ language_id: langId, source_code: code, stdin: '' })
      });
      if (!res.ok) { await runPublic(langId); return; }
      setOutput(await res.json());
    } catch { await runPublic(langId); }
    finally { setRunning(false); }
  };

  const runPublic = async (langId) => {
    try {
      const sub = await fetch('https://ce.judge0.com/submissions?base64_encoded=false',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({language_id:langId,source_code:code,stdin:''})
      });
      const {token} = await sub.json();
      let result = null;
      for(let i=0;i<10;i++){
        await new Promise(r=>setTimeout(r,1000));
        const r = await fetch(`https://ce.judge0.com/submissions/${token}?base64_encoded=false`);
        result = await r.json();
        if(result.status?.id > 2) break;
      }
      setOutput(result);
    } catch {
      setOutput({ stderr: 'Could not connect to code execution service.' });
    } finally { setRunning(false); }
  };

  const addResource = async () => {
    try {
      const res = await api.post(`/exchanges/workspace/${id}/resources`, resource);
      setWorkspace(prev => ({ ...prev, resources: res.data.resources }));
      setResource({ title:'', url:'', type:'link', content:'' });
      setShowAddResource(false);
    } catch { alert('Failed to add resource'); }
  };

  const getOutputColor = (status) => {
    if (!status) return '#94a3b8';
    if (status.id === 3) return '#34d399';
    if (status.id >= 6) return '#f87171';
    return '#fbbf24';
  };

  const getStatusLabel = (status) => {
    if (!status) return '';
    const map = {1:'In Queue',2:'Processing',3:'✓ Accepted',4:'✗ Wrong Answer',5:'⏱ Time Limit Exceeded',6:'✗ Compilation Error',7:'✗ Runtime Error'};
    return map[status.id] || status.description;
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const isOwner = String(project?.owner?._id || project?.owner) === String(user?._id);
  const isMember = project?.collaborators?.some(c => String(c.user?._id || c.user) === String(user?._id));
  const isCompleted = project?.status === 'completed';
  const participants = project?.collaborators?.map(c => c.user).filter(Boolean) || [];

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100vh'}}>

      {/* Header */}
      <div className="px-6 py-3 border-b flex items-center justify-between"
        style={{background:'#12121a',borderColor:'#2a2a3d',flexShrink:0}}>
        <div className="flex items-center gap-3">
          <Link to="/projects" className="text-sm" style={{color:'#94a3b8'}}>← Projects</Link>
          <span style={{color:'#2a2a3d'}}>/</span>
          <h1 className="font-display font-semibold" style={{color:'#e2e8f0'}}>{project?.title}</h1>
          {saving && <span className="text-xs" style={{color:'#6b7280'}}>Saving...</span>}
        </div>

        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
          {project?.githubRepo && (
            <a href={project.githubRepo} target="_blank" rel="noreferrer" className="btn-secondary text-xs py-1 px-3">GitHub ↗</a>
          )}

          {/* Compliment button — any member */}
          {isMember && (
            <button onClick={()=>setShowCompliment(true)}
              style={{
                padding:'5px 12px',borderRadius:'8px',border:'1px solid rgba(250,204,21,0.3)',
                background:'rgba(250,204,21,0.08)',color:'#fbbf24',fontSize:'0.8rem',
                cursor:'pointer',fontWeight:500,display:'flex',alignItems:'center',gap:'5px'
              }}>
              🌟 Compliment
            </button>
          )}

          {/* Complete button — owner only, not yet completed */}
          {isOwner && !isCompleted && (
            <button onClick={()=>setShowComplete(true)}
              style={{
                padding:'5px 12px',borderRadius:'8px',border:'none',
                background:'linear-gradient(135deg,#059669,#10b981)',
                color:'white',fontSize:'0.8rem',cursor:'pointer',fontWeight:600,
                display:'flex',alignItems:'center',gap:'5px'
              }}>
              🏁 Complete Project
            </button>
          )}

          <span className={`badge badge-${project?.status==='in-progress'?'in-progress':project?.status}`}>
            {project?.status}
          </span>
        </div>
      </div>

      {/* Completed banner */}
      {isCompleted && (
        <div style={{
          padding:'10px 24px',background:'rgba(16,185,129,0.1)',
          borderBottom:'1px solid rgba(16,185,129,0.3)',
          display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0
        }}>
          <p style={{color:'#34d399',fontSize:'0.875rem',fontWeight:500}}>
            🏁 This project is complete!
          </p>
          {isMember && (
            <button onClick={()=>setShowCompliment(true)}
              style={{
                padding:'4px 14px',borderRadius:'6px',border:'1px solid rgba(250,204,21,0.4)',
                background:'rgba(250,204,21,0.1)',color:'#fbbf24',fontSize:'0.8rem',cursor:'pointer',fontWeight:500
              }}>
              🌟 Send a compliment to a teammate
            </button>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b px-4" style={{background:'#12121a',borderColor:'#2a2a3d',flexShrink:0}}>
        {TABS.map(t => (
          <button key={t} onClick={()=>setTab(t)}
            className="px-4 py-3 text-sm font-medium capitalize transition-all border-b-2"
            style={{borderColor:tab===t?'#8b5cf6':'transparent',color:tab===t?'#a78bfa':'#94a3b8'}}>
            {t==='code'?'💻 Live Code':t==='chat'?'💬 Chat':t==='tasks'?'✓ Tasks':'📎 Resources'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{flex:1,overflow:'hidden',background:'#0a0a0f',display:'flex',flexDirection:'column'}}>

        {/* CODE TAB */}
        {tab==='code' && (
          <div style={{display:'flex',flexDirection:'column',height:'100%'}}>
            <div className="flex items-center gap-3 px-4 py-2 border-b"
              style={{background:'#12121a',borderColor:'#2a2a3d',flexShrink:0}}>
              <select value={language} onChange={e=>handleLanguageChange(e.target.value)}
                style={{background:'#1a1a26',border:'1px solid #2a2a3d',color:'#e2e8f0',outline:'none',padding:'4px 10px',borderRadius:'6px',fontSize:'0.85rem'}}>
                {LANGUAGES.map(l=><option key={l} value={l}>{l}</option>)}
              </select>
              <button onClick={runCode} disabled={running}
                style={{
                  background:running?'#1a1a26':'linear-gradient(135deg,#059669,#10b981)',
                  border:'none',borderRadius:'6px',color:'white',padding:'5px 16px',
                  fontSize:'0.85rem',fontWeight:600,cursor:running?'not-allowed':'pointer',
                  display:'flex',alignItems:'center',gap:'6px',transition:'all 0.2s'
                }}>
                {running?(
                  <><span style={{width:12,height:12,border:'2px solid white',borderTopColor:'transparent',borderRadius:'50%',display:'inline-block',animation:'spin 0.8s linear infinite'}}></span> Running...</>
                ):<>▶ Run Code</>}
              </button>
              {showOutput && (
                <button onClick={()=>setShowOutput(false)}
                  style={{background:'transparent',border:'1px solid #2a2a3d',borderRadius:'6px',color:'#94a3b8',padding:'4px 10px',fontSize:'0.8rem',cursor:'pointer'}}>
                  Hide Output
                </button>
              )}
              <span className="text-xs ml-auto" style={{color:'#4b5563'}}>Real-time collaborative editing</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-xs" style={{color:'#6b7280'}}>Live</span>
              </div>
            </div>

            <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
              <div style={{flex:showOutput?'1 1 60%':'1 1 100%',minHeight:0}}>
                <Editor key={language} height="100%" defaultLanguage={language} value={code} onChange={handleCodeChange} theme="vs-dark"
                  options={{fontSize:14,fontFamily:'JetBrains Mono, monospace',minimap:{enabled:false},scrollBeyondLastLine:false,automaticLayout:true,tabSize:2,wordWrap:'on',padding:{top:16}}}/>
              </div>
              {showOutput && (
                <div style={{flex:'0 0 38%',borderTop:'1px solid #2a2a3d',background:'#0d0d14',display:'flex',flexDirection:'column',overflow:'hidden'}}>
                  <div style={{padding:'8px 16px',borderBottom:'1px solid #2a2a3d',display:'flex',alignItems:'center',justifyContent:'space-between',background:'#12121a',flexShrink:0}}>
                    <div className="flex items-center gap-3">
                      <span style={{fontSize:'0.8rem',fontWeight:600,color:'#94a3b8',fontFamily:'JetBrains Mono'}}>OUTPUT</span>
                      {output?.status && (
                        <span style={{fontSize:'0.75rem',fontWeight:600,color:getOutputColor(output.status),background:`${getOutputColor(output.status)}15`,border:`1px solid ${getOutputColor(output.status)}40`,padding:'1px 8px',borderRadius:'999px'}}>
                          {getStatusLabel(output.status)}
                        </span>
                      )}
                      {output?.time && <span style={{fontSize:'0.72rem',color:'#4b5563'}}>⏱ {output.time}s 💾 {output.memory}KB</span>}
                    </div>
                    <button onClick={()=>setOutput(null)} style={{background:'none',border:'none',color:'#4b5563',cursor:'pointer',fontSize:'0.8rem'}}>Clear</button>
                  </div>
                  <div style={{flex:1,overflow:'auto',padding:'12px 16px'}}>
                    {running ? (
                      <div style={{color:'#6b7280',fontSize:'0.85rem',fontFamily:'JetBrains Mono'}}>● Executing...</div>
                    ) : !output ? (
                      <p style={{color:'#4b5563',fontSize:'0.85rem',fontFamily:'JetBrains Mono'}}>Press ▶ Run Code to execute</p>
                    ) : (
                      <div style={{fontFamily:'JetBrains Mono',fontSize:'0.85rem'}}>
                        {output.stdout && <pre style={{color:'#34d399',margin:0,whiteSpace:'pre-wrap',wordBreak:'break-word'}}>{output.stdout}</pre>}
                        {output.stderr && <pre style={{color:'#f87171',margin:0,marginTop:output.stdout?'8px':0,whiteSpace:'pre-wrap',wordBreak:'break-word'}}>{output.stderr}</pre>}
                        {output.compile_output && <pre style={{color:'#fbbf24',margin:0,marginTop:'8px',whiteSpace:'pre-wrap',wordBreak:'break-word'}}>{output.compile_output}</pre>}
                        {!output.stdout&&!output.stderr&&!output.compile_output && <p style={{color:'#6b7280'}}>No output produced.</p>}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {tab==='chat' && <div style={{height:'100%'}}><ChatPanel roomId={id} roomType="project" participants={participants}/></div>}
        {tab==='tasks' && <TaskManager workspaceId={id} workspaceType="project" participants={participants}/>}

        {tab==='resources' && (
          <div className="p-6 overflow-y-auto h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold" style={{color:'#e2e8f0'}}>Resources</h3>
              <button className="btn-primary text-sm py-1.5 px-3" onClick={()=>setShowAddResource(!showAddResource)}>+ Add</button>
            </div>
            {showAddResource && (
              <div className="glass p-4 mb-4 fade-in">
                <div className="space-y-3">
                  <input className="input" placeholder="Title" value={resource.title} onChange={e=>setResource({...resource,title:e.target.value})}/>
                  <select className="input" value={resource.type} onChange={e=>setResource({...resource,type:e.target.value})}>
                    <option value="link">🔗 Link</option>
                    <option value="note">📝 Note</option>
                    <option value="code">💻 Code</option>
                  </select>
                  {resource.type==='link'
                    ? <input className="input" placeholder="URL" value={resource.url} onChange={e=>setResource({...resource,url:e.target.value})}/>
                    : <textarea className="input font-mono" rows={4} value={resource.content} onChange={e=>setResource({...resource,content:e.target.value})}/>
                  }
                  <div className="flex gap-2">
                    <button className="btn-secondary flex-1" onClick={()=>setShowAddResource(false)}>Cancel</button>
                    <button className="btn-primary flex-1" onClick={addResource} disabled={!resource.title}>Add</button>
                  </div>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {workspace?.resources?.map((r,i) => (
                <div key={i} className="glass p-4">
                  <div className="flex items-start gap-2">
                    <span>{r.type==='link'?'🔗':r.type==='code'?'💻':'📝'}</span>
                    <div>
                      <p className="font-medium text-sm" style={{color:'#e2e8f0'}}>{r.title}</p>
                      {r.url && <a href={r.url} target="_blank" rel="noreferrer" className="text-xs" style={{color:'#a78bfa'}}>{r.url}</a>}
                      {r.content && <pre className="text-xs mt-2 p-2 rounded overflow-x-auto" style={{background:'#0a0a0f',color:'#94a3b8'}}>{r.content}</pre>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showComplete && (
        <CompleteModal
          project={project}
          onClose={()=>setShowComplete(false)}
          onCompleted={()=>setProject(prev=>({...prev,status:'completed'}))}
        />
      )}
      {showCompliment && (
        <ComplimentModal
          project={project}
          currentUser={user}
          onClose={()=>setShowCompliment(false)}
        />
      )}
    </div>
  );
}
