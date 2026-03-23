import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const SKILL_SUGGESTIONS = ['React','Node.js','Python','TypeScript','Go','Rust','Docker','AWS','GraphQL','MongoDB','PostgreSQL','Machine Learning','DevOps','Vue.js','Flutter'];
const initials = (name) => name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)||'U';
const Avatar = ({ name, size=32, color=0 }) => (
  <div title={name} style={{
    width: size, height: size, borderRadius: '50%', flexShrink: 0,
    background: `hsl(${(color*67+250)%360},55%,48%)`,
    display:'flex',alignItems:'center',justifyContent:'center',
    fontSize: size*0.32+'px', fontWeight:700, color:'white'
  }}>{initials(name)}</div>
);

// ── Team Panel (slide-in) ──────────────────────────────────────────
const TeamPanel = ({ project, isOwner, onClose, onUpdate }) => {
  const [responding, setResponding] = useState(null);

  const respondJoin = async (requestUserId, status) => {
    setResponding(requestUserId);
    try {
      const res = await api.put(`/projects/${project._id}/join-request/respond`, { requestUserId, status });
      onUpdate(res.data);
    } catch(err){ alert(err.response?.data?.error||'Failed'); }
    finally { setResponding(null); }
  };

  const pendingRequests = project.joinRequests?.filter(r => r.status === 'pending') || [];
  const pendingInvites  = project.invites?.filter(i => i.status === 'pending') || [];

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:60, display:'flex', justifyContent:'flex-end',
      background:'rgba(0,0,0,0.6)', backdropFilter:'blur(3px)'
    }} onClick={onClose}>
      <div style={{
        width:'360px', height:'100%', background:'#12121a',
        borderLeft:'1px solid #2a2a3d', overflowY:'auto', padding:'24px',
        animation:'slideInRight 0.25s ease'
      }} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'20px'}}>
          <div>
            <h2 className="font-display font-bold text-lg" style={{color:'#e2e8f0'}}>Team</h2>
            <p style={{color:'#6b7280',fontSize:'0.8rem'}}>{project.title}</p>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',color:'#6b7280',fontSize:'1.3rem',cursor:'pointer'}}>×</button>
        </div>

        {/* Members */}
        <div style={{marginBottom:'24px'}}>
          <p style={{fontSize:'0.72rem',fontWeight:600,color:'#6b7280',letterSpacing:'0.05em',marginBottom:'10px'}}>MEMBERS ({project.collaborators?.length||0})</p>
          <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
            {project.collaborators?.map((c,i)=>{
              const u=c.user; if(!u) return null;
              const isProjectOwner = (project.owner?._id||project.owner)===u._id;
              return (
                <div key={i} style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px',borderRadius:'8px',background:'#1a1a26',border:'1px solid #2a2a3d'}}>
                  <Avatar name={u.name} size={36} color={i} />
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{color:'#e2e8f0',fontSize:'0.875rem',fontWeight:500}}>{u.name}</p>
                    <div style={{display:'flex',flexWrap:'wrap',gap:'4px',marginTop:'3px'}}>
                      {u.skillsOffered?.slice(0,2).map(s=>(
                        <span key={s} className="skill-tag" style={{fontSize:'0.65rem',padding:'1px 5px'}}>{s}</span>
                      ))}
                    </div>
                  </div>
                  <span style={{
                    fontSize:'0.7rem',padding:'2px 8px',borderRadius:'999px',flexShrink:0,
                    background: isProjectOwner ? 'rgba(109,40,217,0.2)' : 'rgba(16,185,129,0.15)',
                    color: isProjectOwner ? '#a78bfa' : '#34d399',
                    border: `1px solid ${isProjectOwner ? 'rgba(109,40,217,0.3)' : 'rgba(16,185,129,0.3)'}`
                  }}>{isProjectOwner ? 'owner' : c.role}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pending invites (owner sees these) */}
        {isOwner && pendingInvites.length > 0 && (
          <div style={{marginBottom:'24px'}}>
            <p style={{fontSize:'0.72rem',fontWeight:600,color:'#6b7280',letterSpacing:'0.05em',marginBottom:'10px'}}>PENDING INVITES ({pendingInvites.length})</p>
            <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
              {pendingInvites.map((inv,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:'8px',padding:'8px 10px',borderRadius:'8px',background:'rgba(245,158,11,0.07)',border:'1px solid rgba(245,158,11,0.2)'}}>
                  <Avatar name={inv.user?.name} size={28} color={i+5}/>
                  <span style={{flex:1,fontSize:'0.82rem',color:'#fbbf24'}}>{inv.user?.name}</span>
                  <span style={{fontSize:'0.7rem',color:'#6b7280'}}>awaiting</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Join requests (owner sees + approves) */}
        {isOwner && pendingRequests.length > 0 && (
          <div>
            <p style={{fontSize:'0.72rem',fontWeight:600,color:'#f87171',letterSpacing:'0.05em',marginBottom:'10px'}}>
              JOIN REQUESTS ({pendingRequests.length})
            </p>
            <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
              {pendingRequests.map((req,i)=>{
                const u=req.user; if(!u) return null;
                return (
                  <div key={i} style={{padding:'12px',borderRadius:'8px',background:'rgba(239,68,68,0.07)',border:'1px solid rgba(239,68,68,0.2)'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'8px'}}>
                      <Avatar name={u.name} size={30} color={i+10}/>
                      <div>
                        <p style={{color:'#e2e8f0',fontSize:'0.85rem',fontWeight:500}}>{u.name}</p>
                        <div style={{display:'flex',gap:'3px',marginTop:'2px'}}>
                          {u.skillsOffered?.slice(0,2).map(s=>(
                            <span key={s} className="skill-tag" style={{fontSize:'0.62rem',padding:'0px 5px'}}>{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    {req.message && (
                      <p style={{fontSize:'0.78rem',color:'#94a3b8',fontStyle:'italic',marginBottom:'8px',paddingLeft:'4px'}}>
                        "{req.message}"
                      </p>
                    )}
                    <div style={{display:'flex',gap:'6px'}}>
                      <button
                        onClick={()=>respondJoin(u._id,'accepted')}
                        disabled={responding===u._id}
                        style={{flex:1,padding:'5px',borderRadius:'6px',background:'rgba(16,185,129,0.2)',border:'1px solid rgba(16,185,129,0.4)',color:'#34d399',fontSize:'0.78rem',cursor:'pointer',fontWeight:600}}>
                        {responding===u._id?'...':'✓ Accept'}
                      </button>
                      <button
                        onClick={()=>respondJoin(u._id,'declined')}
                        disabled={responding===u._id}
                        style={{flex:1,padding:'5px',borderRadius:'6px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',color:'#f87171',fontSize:'0.78rem',cursor:'pointer',fontWeight:600}}>
                        ✗ Decline
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!isOwner && pendingRequests.length === 0 && pendingInvites.length === 0 && (
          <p style={{color:'#4b5563',fontSize:'0.85rem',textAlign:'center',paddingTop:'12px'}}>No pending requests</p>
        )}
      </div>
    </div>
  );
};

// ── Join Request Modal ────────────────────────────────────────────
const JoinRequestModal = ({ project, onClose, onSent }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    setLoading(true); setError('');
    try {
      await api.post(`/projects/${project._id}/join-request`, { message });
      onSent();
      onClose();
    } catch(err) {
      setError(err.response?.data?.error || 'Failed to send request');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{background:'rgba(0,0,0,0.7)',backdropFilter:'blur(4px)'}}>
      <div className="glass p-6 w-full max-w-md fade-in">
        <h3 className="font-display font-semibold text-lg mb-1" style={{color:'#e2e8f0'}}>Request to Join</h3>
        <p style={{color:'#6b7280',fontSize:'0.85rem',marginBottom:'20px'}}>{project.title}</p>
        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{background:'rgba(239,68,68,0.1)',color:'#f87171',border:'1px solid rgba(239,68,68,0.3)'}}>
            {error}
          </div>
        )}
        <div style={{marginBottom:'16px'}}>
          <label className="block text-sm mb-2" style={{color:'#94a3b8'}}>Message to project owner <span style={{color:'#4b5563'}}>(optional)</span></label>
          <textarea className="input" rows={4}
            placeholder="Introduce yourself — your skills, why you want to join, what you can contribute..."
            value={message} onChange={e=>setMessage(e.target.value)} />
        </div>
        {/* Show their needed skills */}
        {project.skillsNeeded?.length > 0 && (
          <div style={{marginBottom:'16px',padding:'10px 12px',borderRadius:'8px',background:'rgba(109,40,217,0.08)',border:'1px solid rgba(109,40,217,0.2)'}}>
            <p style={{fontSize:'0.75rem',color:'#6b7280',marginBottom:'6px'}}>SKILLS NEEDED BY THIS PROJECT</p>
            <div style={{display:'flex',flexWrap:'wrap',gap:'4px'}}>
              {project.skillsNeeded.map(s=><span key={s} className="skill-tag">{s}</span>)}
            </div>
          </div>
        )}
        <div className="flex gap-3">
          <button className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
          <button className="btn-primary flex-1" onClick={handleSend} disabled={loading}>
            {loading ? 'Sending...' : 'Send Request'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Invite Modal ──────────────────────────────────────────────────
const InviteModal = ({ project, onClose, onUpdate }) => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [inviting, setInviting] = useState(null);
  const [msg, setMsg] = useState('');

  const memberIds = new Set([
    project.owner?._id,
    ...project.collaborators?.map(c=>c.user?._id||c.user)||[],
    ...project.invites?.filter(i=>i.status==='pending').map(i=>i.user?._id||i.user)||[]
  ]);

  useEffect(()=>{
    const t = setTimeout(async()=>{
      if(!search.trim()){setResults([]);return;}
      setSearching(true);
      try{
        const res=await api.get(`/users?search=${search}`);
        setResults(res.data.filter(u=>!memberIds.has(u._id)));
      }catch(e){console.error(e);}
      finally{setSearching(false);}
    },400);
    return ()=>clearTimeout(t);
  },[search]);

  const invite = async(userId)=>{
    setInviting(userId); setMsg('');
    try{
      const res=await api.post(`/projects/${project._id}/invite`,{userId});
      onUpdate(res.data);
      setMsg('✓ Invite sent!');
      setResults(prev=>prev.filter(u=>u._id!==userId));
    }catch(err){ setMsg(`✗ ${err.response?.data?.error||'Failed'}`); }
    finally{ setInviting(null); }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{background:'rgba(0,0,0,0.75)',backdropFilter:'blur(4px)'}}>
      <div className="glass p-6 w-full max-w-md fade-in" style={{maxHeight:'80vh',display:'flex',flexDirection:'column'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px'}}>
          <div>
            <h3 className="font-display font-semibold text-lg" style={{color:'#e2e8f0'}}>Invite Collaborator</h3>
            <p style={{color:'#6b7280',fontSize:'0.8rem'}}>{project.title}</p>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',color:'#6b7280',fontSize:'1.3rem',cursor:'pointer'}}>×</button>
        </div>
        <div style={{position:'relative',marginBottom:'12px'}}>
          <input className="input" placeholder="Search by name or skill..." value={search} onChange={e=>setSearch(e.target.value)} autoFocus />
          {searching && <div style={{position:'absolute',right:'12px',top:'50%',transform:'translateY(-50%)'}}>
            <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
          </div>}
        </div>
        {msg && <div className="mb-3 p-2 rounded-lg text-sm text-center" style={{
          background:msg.startsWith('✓')?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.1)',
          color:msg.startsWith('✓')?'#34d399':'#f87171',
          border:`1px solid ${msg.startsWith('✓')?'rgba(16,185,129,0.3)':'rgba(239,68,68,0.3)'}`
        }}>{msg}</div>}
        <div style={{flex:1,overflowY:'auto'}}>
          {!search.trim() ? (
            <p style={{color:'#4b5563',fontSize:'0.85rem',textAlign:'center',paddingTop:'32px'}}>Type a name or skill to search</p>
          ) : results.length===0 && !searching ? (
            <p style={{color:'#4b5563',fontSize:'0.85rem',textAlign:'center',paddingTop:'32px'}}>No developers found</p>
          ) : results.map(u=>(
            <div key={u._id} style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px',borderRadius:'8px',background:'#12121a',border:'1px solid #2a2a3d',marginBottom:'6px'}}>
              <Avatar name={u.name} size={36} color={u._id.charCodeAt(0)}/>
              <div style={{flex:1,minWidth:0}}>
                <p style={{color:'#e2e8f0',fontSize:'0.875rem',fontWeight:500}}>{u.name}</p>
                <div style={{display:'flex',flexWrap:'wrap',gap:'3px',marginTop:'3px'}}>
                  {u.skillsOffered?.slice(0,3).map(s=><span key={s} className="skill-tag" style={{fontSize:'0.65rem',padding:'1px 5px'}}>{s}</span>)}
                </div>
              </div>
              <button onClick={()=>invite(u._id)} disabled={inviting===u._id} className="btn-primary text-xs py-1.5 px-3" style={{flexShrink:0}}>
                {inviting===u._id?'...':'Invite'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Create Project Modal ──────────────────────────────────────────
const CreateProjectModal = ({ onClose, onCreate }) => {
  const [form, setForm] = useState({ title:'', description:'', techStack:[], skillsNeeded:[], githubRepo:'', isPublic:true });
  const [techInput, setTechInput] = useState('');
  const [needInput, setNeedInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addTech = () => {
    if(techInput.trim()&&!form.techStack.includes(techInput.trim())){
      setForm({...form,techStack:[...form.techStack,techInput.trim()]});setTechInput('');
    }
  };
  const addNeed = () => {
    if(needInput.trim()&&!form.skillsNeeded.includes(needInput.trim())){
      setForm({...form,skillsNeeded:[...form.skillsNeeded,needInput.trim()]});setNeedInput('');
    }
  };

  const handleCreate = async () => {
    setLoading(true); setError('');
    try{
      const res=await api.post('/projects',form);
      onCreate(res.data); onClose();
    }catch(err){ setError(err.response?.data?.error||'Failed'); }
    finally{ setLoading(false); }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{background:'rgba(0,0,0,0.7)',backdropFilter:'blur(4px)'}}>
      <div className="glass p-6 w-full max-w-lg fade-in" style={{maxHeight:'90vh',overflowY:'auto'}}>
        <h3 className="font-display font-semibold text-xl mb-5" style={{color:'#e2e8f0'}}>Create Project</h3>
        {error&&<div className="mb-4 p-3 rounded-lg text-sm" style={{background:'rgba(239,68,68,0.1)',color:'#f87171',border:'1px solid rgba(239,68,68,0.3)'}}>{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-2" style={{color:'#94a3b8'}}>Title *</label>
            <input className="input" placeholder="My Awesome Project" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
          </div>
          <div>
            <label className="block text-sm mb-2" style={{color:'#94a3b8'}}>Description *</label>
            <textarea className="input" rows={3} placeholder="What are you building?" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
          </div>
          <div>
            <label className="block text-sm mb-2" style={{color:'#94a3b8'}}>Tech Stack</label>
            <div className="flex gap-2 mb-2">
              <input className="input flex-1" placeholder="e.g. React" value={techInput} onChange={e=>setTechInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),addTech())}/>
              <button className="btn-primary px-4" onClick={addTech}>+</button>
            </div>
            <div className="flex flex-wrap gap-1 mb-1">
              {form.techStack.map(s=><span key={s} className="skill-tag cursor-pointer" onClick={()=>setForm({...form,techStack:form.techStack.filter(t=>t!==s)})}>{s} ×</span>)}
            </div>
            <div className="flex flex-wrap gap-1">
              {SKILL_SUGGESTIONS.filter(s=>!form.techStack.includes(s)).slice(0,6).map(s=>(
                <button key={s} onClick={()=>setForm({...form,techStack:[...form.techStack,s]})} className="text-xs px-2 py-1 rounded" style={{background:'#1a1a26',color:'#6b7280',border:'1px solid #2a2a3d'}}>+ {s}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm mb-2" style={{color:'#94a3b8'}}>Skills Needed <span style={{color:'#4b5563'}}>(helps people know if they fit)</span></label>
            <div className="flex gap-2 mb-2">
              <input className="input flex-1" placeholder="e.g. Backend, ML" value={needInput} onChange={e=>setNeedInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),addNeed())}/>
              <button className="btn-primary px-4" onClick={addNeed}>+</button>
            </div>
            <div className="flex flex-wrap gap-1">
              {form.skillsNeeded.map(s=><span key={s} className="skill-tag skill-tag-green cursor-pointer" onClick={()=>setForm({...form,skillsNeeded:form.skillsNeeded.filter(t=>t!==s)})}>{s} ×</span>)}
            </div>
          </div>
          <div>
            <label className="block text-sm mb-2" style={{color:'#94a3b8'}}>GitHub Repo</label>
            <input className="input" placeholder="https://github.com/..." value={form.githubRepo} onChange={e=>setForm({...form,githubRepo:e.target.value})}/>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="pub" checked={form.isPublic} onChange={e=>setForm({...form,isPublic:e.target.checked})}/>
            <label htmlFor="pub" className="text-sm" style={{color:'#94a3b8'}}>Make project public</label>
          </div>
          <div className="flex gap-3">
            <button className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
            <button className="btn-primary flex-1" onClick={handleCreate} disabled={loading||!form.title||!form.description}>
              {loading?'Creating...':'Create Project'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Project Card ──────────────────────────────────────────────────
const ProjectCard = ({ project, currentUserId, onInvite, onViewTeam, onJoinRequest, onUpdate }) => {
  const navigate = useNavigate();

  const isOwner = (project.owner?._id||project.owner) === currentUserId;
  const isMember = project.collaborators?.some(c=>(c.user?._id||c.user)===currentUserId);
  const hasPendingRequest = project.joinRequests?.some(r=>(r.user?._id||r.user)===currentUserId && r.status==='pending');
  const hasPendingInvite = project.invites?.some(i=>(i.user?._id||i.user)===currentUserId && i.status==='pending');
  const pendingJoinCount = project.joinRequests?.filter(r=>r.status==='pending').length || 0;

  const handleOpenWorkspace = async () => {
    const wid = project.workspace?._id || project.workspace;
    if(wid){ navigate(`/projects/workspace/${wid}`); return; }
    try{
      const res=await api.get(`/projects/${project._id}`);
      const w=res.data.workspace?._id||res.data.workspace;
      if(w) navigate(`/projects/workspace/${w}`);
    }catch{ alert('Could not load workspace'); }
  };

  return (
    <div className="glass p-5 flex flex-col gap-3 hover:border-violet-500/30 transition-all fade-in">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display font-semibold" style={{color:'#e2e8f0'}}>{project.title}</h3>
        <span className={`badge badge-${project.status==='in-progress'?'in-progress':project.status}`}>{project.status}</span>
      </div>

      <p className="text-sm line-clamp-3" style={{color:'#94a3b8'}}>{project.description}</p>

      <div className="flex flex-wrap gap-1">
        {project.techStack?.slice(0,5).map(s=><span key={s} className="skill-tag">{s}</span>)}
        {project.techStack?.length>5 && <span style={{color:'#6b7280',fontSize:'0.78rem'}}>+{project.techStack.length-5}</span>}
      </div>

      {project.skillsNeeded?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          <span style={{color:'#6b7280',fontSize:'0.72rem',marginRight:'2px'}}>needs:</span>
          {project.skillsNeeded.slice(0,3).map(s=><span key={s} className="skill-tag skill-tag-green">{s}</span>)}
        </div>
      )}

      {/* Team avatars row */}
      <button onClick={()=>onViewTeam(project)}
        style={{display:'flex',alignItems:'center',gap:'8px',background:'none',border:'none',cursor:'pointer',padding:'4px 0',width:'100%',textAlign:'left'}}>
        <div style={{display:'flex'}}>
          {project.collaborators?.slice(0,5).map((c,i)=>{
            const u=c.user; if(!u) return null;
            return <div key={i} style={{marginLeft: i>0?'-8px':0, border:'2px solid #12121a', borderRadius:'50%', zIndex:5-i}}>
              <Avatar name={u.name} size={26} color={i}/>
            </div>;
          })}
        </div>
        <span style={{color:'#6b7280',fontSize:'0.78rem'}}>
          {project.collaborators?.length||0} member{project.collaborators?.length!==1?'s':''}
          {isOwner && pendingJoinCount>0 && <span style={{color:'#f87171',fontWeight:600}}> · {pendingJoinCount} request{pendingJoinCount>1?'s':''}</span>}
        </span>
        <span style={{color:'#a78bfa',fontSize:'0.75rem',marginLeft:'auto'}}>View team →</span>
      </button>

      <p style={{color:'#4b5563',fontSize:'0.75rem'}}>by {project.owner?.name}</p>

      {/* Action buttons */}
      <div style={{display:'flex',gap:'8px',marginTop:'auto',paddingTop:'12px',borderTop:'1px solid #2a2a3d',flexWrap:'nowrap'}}>
        {isMember ? (
          <>
            <button onClick={handleOpenWorkspace} className="btn-primary text-sm py-2" style={{flex:1}}>
              Open Workspace →
            </button>
            {isOwner && (
              <button onClick={()=>onInvite(project)} className="btn-secondary text-sm py-2 px-3" title="Invite someone">
                + Invite
              </button>
            )}
          </>
        ) : hasPendingInvite ? (
          <div style={{flex:1,padding:'8px',borderRadius:'8px',background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.3)',textAlign:'center'}}>
            <span style={{color:'#fbbf24',fontSize:'0.85rem'}}>⏳ Invite pending — check My Projects</span>
          </div>
        ) : hasPendingRequest ? (
          <div style={{flex:1,padding:'8px',borderRadius:'8px',background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.3)',textAlign:'center'}}>
            <span style={{color:'#818cf8',fontSize:'0.85rem'}}>⏳ Join request sent</span>
          </div>
        ) : (
          <button onClick={()=>onJoinRequest(project)} className="btn-secondary text-sm py-2" style={{flex:1}}>
            Request to Join
          </button>
        )}
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────
export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects]   = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState('explore');
  const [search, setSearch]       = useState('');
  const [showCreate, setShowCreate]   = useState(false);
  const [inviteProject, setInviteProject]   = useState(null);
  const [teamProject, setTeamProject]       = useState(null);
  const [joinProject, setJoinProject]       = useState(null);

  // Invites pending for current user
  const pendingInvites = myProjects.filter(p =>
    p.invites?.some(i=>(i.user?._id||i.user)===user?._id && i.status==='pending')
  );

  const fetchProjects = () => {
    setLoading(true);
    Promise.all([api.get('/projects'), api.get('/projects/my')])
      .then(([all,my])=>{ setProjects(all.data); setMyProjects(my.data); })
      .catch(console.error)
      .finally(()=>setLoading(false));
  };

  useEffect(()=>{ fetchProjects(); },[]);

  const respondInvite = async(projectId, status)=>{
    try{
      await api.put(`/projects/${projectId}/invite/respond`,{status});
      fetchProjects();
    }catch(err){ alert(err.response?.data?.error||'Failed'); }
  };

  const updateProject = (updated) => {
    setProjects(prev=>prev.map(p=>p._id===updated._id?updated:p));
    setMyProjects(prev=>prev.map(p=>p._id===updated._id?updated:p));
    if(teamProject?._id===updated._id) setTeamProject(updated);
    if(inviteProject?._id===updated._id) setInviteProject(updated);
  };

  const displayed = (tab==='my'?myProjects:projects).filter(p=>
    !search ||
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 slide-up">
        <div>
          <h1 className="font-display text-3xl font-bold gradient-text mb-2">Projects</h1>
          <p style={{color:'#94a3b8'}}>Build together — find projects to join or start your own</p>
        </div>
        <button className="btn-primary" onClick={()=>setShowCreate(true)}>+ New Project</button>
      </div>

      {/* Pending invites banner */}
      {pendingInvites.length>0 && (
        <div className="glass p-4 mb-6 fade-in" style={{border:'1px solid rgba(245,158,11,0.3)'}}>
          <p className="text-sm font-semibold mb-3 flex items-center gap-2" style={{color:'#fbbf24'}}>
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse inline-block"></span>
            {pendingInvites.length} pending project invite{pendingInvites.length>1?'s':''}
          </p>
          <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
            {pendingInvites.map(p=>(
              <div key={p._id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'12px',padding:'10px 12px',borderRadius:'8px',background:'#12121a',border:'1px solid #2a2a3d'}}>
                <div>
                  <p style={{color:'#e2e8f0',fontSize:'0.875rem',fontWeight:500}}>{p.title}</p>
                  <p style={{color:'#6b7280',fontSize:'0.78rem',marginTop:'2px'}}>by {p.owner?.name} · {p.techStack?.slice(0,3).join(', ')}</p>
                </div>
                <div style={{display:'flex',gap:'8px',flexShrink:0}}>
                  <button className="btn-primary text-xs py-1.5 px-3" onClick={()=>respondInvite(p._id,'accepted')}>Accept</button>
                  <button className="btn-danger text-xs py-1.5 px-3"  onClick={()=>respondInvite(p._id,'declined')}>Decline</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 mb-6 flex-wrap items-center">
        <div className="flex gap-2">
          {[{id:'explore',label:'Explore All'},{id:'my',label:'My Projects'}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background:tab===t.id?'rgba(109,40,217,0.2)':'#1a1a26',
                color:tab===t.id?'#a78bfa':'#94a3b8',
                border:`1px solid ${tab===t.id?'rgba(109,40,217,0.4)':'#2a2a3d'}`
              }}>
              {t.label}
              {t.id==='my'&&myProjects.length>0 && (
                <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full" style={{background:'rgba(109,40,217,0.2)',color:'#a78bfa'}}>{myProjects.length}</span>
              )}
            </button>
          ))}
        </div>
        <input className="input" style={{maxWidth:'280px'}} placeholder="Search projects..."
          value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : displayed.length===0 ? (
        <div className="glass p-12 text-center">
          <p className="text-4xl mb-3">◈</p>
          <p className="font-display text-lg mb-2" style={{color:'#e2e8f0'}}>
            {tab==='my'?"No projects yet":'No projects found'}
          </p>
          <button className="btn-primary mt-2" onClick={()=>setShowCreate(true)}>+ Create Project</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {displayed.map(p=>(
            <ProjectCard
              key={p._id}
              project={p}
              currentUserId={user?._id}
              onInvite={setInviteProject}
              onViewTeam={setTeamProject}
              onJoinRequest={setJoinProject}
              onUpdate={updateProject}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreate && (
        <CreateProjectModal onClose={()=>setShowCreate(false)}
          onCreate={p=>{ setMyProjects(prev=>[p,...prev]); if(p.isPublic) setProjects(prev=>[p,...prev]); }}/>
      )}
      {inviteProject && (
        <InviteModal project={inviteProject} onClose={()=>setInviteProject(null)} onUpdate={updateProject}/>
      )}
      {joinProject && (
        <JoinRequestModal project={joinProject} onClose={()=>setJoinProject(null)}
          onSent={()=>{ fetchProjects(); }}/>
      )}
      {teamProject && (
        <TeamPanel
          project={teamProject}
          isOwner={(teamProject.owner?._id||teamProject.owner)===user?._id}
          onClose={()=>setTeamProject(null)}
          onUpdate={p=>{ updateProject(p); setTeamProject(p); }}
        />
      )}
    </div>
  );
}
