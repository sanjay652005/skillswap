import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const STATUS_COLS = ['todo', 'in-progress', 'review', 'done'];
const STATUS_LABELS = { 'todo': 'To Do', 'in-progress': 'In Progress', 'review': 'Review', 'done': 'Done' };
const PRIORITY_COLORS = { low: '#10b981', medium: '#f59e0b', high: '#ef4444' };

export default function TaskManager({ workspaceId, workspaceType, participants = [] }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', assignedTo: '', priority: 'medium', dueDate: '' });

  useEffect(() => {
    if (workspaceId) api.get(`/tasks/${workspaceId}`).then(res => setTasks(res.data)).catch(console.error);
  }, [workspaceId]);

  const createTask = async () => {
    try {
      const res = await api.post('/tasks', { ...form, workspaceId, workspaceType });
      setTasks(prev => [...prev, res.data]);
      setForm({ title: '', description: '', assignedTo: '', priority: 'medium', dueDate: '' });
      setShowAdd(false);
    } catch (err) { alert(err.response?.data?.error || 'Failed'); }
  };

  const updateTask = async (id, updates) => {
    try {
      const res = await api.put(`/tasks/${id}`, updates);
      setTasks(prev => prev.map(t => t._id === id ? res.data : t));
    } catch (err) { console.error(err); }
  };

  const deleteTask = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    await api.delete(`/tasks/${id}`);
    setTasks(prev => prev.filter(t => t._id !== id));
  };

  return (
    <div className="h-full flex flex-col p-4 overflow-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold" style={{ color: '#e2e8f0' }}>Tasks</h3>
        <button className="btn-primary text-sm py-1.5 px-3" onClick={() => setShowAdd(!showAdd)}>
          + Add Task
        </button>
      </div>

      {showAdd && (
        <div className="glass p-4 mb-4 fade-in">
          <div className="space-y-3">
            <input className="input" placeholder="Task title *" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })} />
            <textarea className="input" rows={2} placeholder="Description (optional)" value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <select className="input" value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })}>
                <option value="">Unassigned</option>
                {participants.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
              <select className="input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
            <input className="input" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
            <div className="flex gap-2">
              <button className="btn-secondary flex-1" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn-primary flex-1" onClick={createTask} disabled={!form.title}>Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Kanban columns */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 flex-1">
        {STATUS_COLS.map(status => (
          <div key={status} className="flex flex-col gap-2">
            <div className="flex items-center gap-2 pb-2 border-b" style={{ borderColor: '#2a2a3d' }}>
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#94a3b8' }}>{STATUS_LABELS[status]}</span>
              <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#1a1a26', color: '#6b7280' }}>
                {tasks.filter(t => t.status === status).length}
              </span>
            </div>
            <div className="space-y-2 flex-1">
              {tasks.filter(t => t.status === status).map(task => (
                <div key={task._id} className={`p-3 rounded-lg task-${status.replace('-', '-')} fade-in`}
                  style={{ background: '#12121a', border: '1px solid #2a2a3d', borderLeft: `3px solid ${status === 'todo' ? '#6b7280' : status === 'in-progress' ? '#f59e0b' : status === 'review' ? '#8b5cf6' : '#10b981'}` }}>
                  <div className="flex items-start justify-between gap-1">
                    <p className="text-sm font-medium flex-1" style={{ color: '#e2e8f0' }}>{task.title}</p>
                    <button onClick={() => deleteTask(task._id)} className="text-xs hover:text-red-400 transition-colors" style={{ color: '#4b5563' }}>×</button>
                  </div>
                  {task.description && <p className="text-xs mt-1 line-clamp-2" style={{ color: '#6b7280' }}>{task.description}</p>}

                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-xs" style={{ color: PRIORITY_COLORS[task.priority] }}>● {task.priority}</span>
                    {task.assignedTo && (
                      <span className="text-xs" style={{ color: '#94a3b8' }}>@{task.assignedTo.name?.split(' ')[0]}</span>
                    )}
                    {task.dueDate && (
                      <span className="text-xs" style={{ color: new Date(task.dueDate) < new Date() ? '#ef4444' : '#6b7280' }}>
                        📅 {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <select className="mt-2 text-xs py-1 px-2 rounded w-full" value={task.status}
                    onChange={e => updateTask(task._id, { status: e.target.value })}
                    style={{ background: '#0a0a0f', border: '1px solid #2a2a3d', color: '#94a3b8', outline: 'none' }}>
                    {STATUS_COLS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
