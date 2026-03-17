'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';


import CryptoJS from 'crypto-js';

function decryptData(ciphertext) {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, process.env.NEXT_PUBLIC_AES_SECRET || 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2');
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
  } catch {
    return null;
  }
}


function TaskModal({ task, onClose, onSave }) {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'todo',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{task ? 'Edit Task' : 'Create New Task'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {error && <div className="alert alert-error">⚠ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="modal-title">Title</label>
            <input
              id="modal-title"
              name="title"
              type="text"
              className="form-input"
              placeholder="Enter task title..."
              value={form.title}
              onChange={handleChange}
              maxLength={100}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="modal-description">Description</label>
            <textarea
              id="modal-description"
              name="description"
              className="form-textarea"
              placeholder="Enter task description (optional)..."
              value={form.description}
              onChange={handleChange}
              maxLength={500}
              rows={4}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="modal-status">Status</label>
            <select
              id="modal-status"
              name="status"
              className="form-select"
              value={form.status}
              onChange={handleChange}
            >
              <option value="todo">📋 To Do</option>
              <option value="in-progress">🔄 In Progress</option>
              <option value="done">✅ Done</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? (
                <><span className="spinner" style={{ borderTopColor: 'white', width: 16, height: 16 }}></span> Saving...</>
              ) : (
                task ? 'Update Task' : 'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


function TaskCard({ task, onEdit, onDelete, index }) {
  const [deleting, setDeleting] = useState(false);

  const statusMap = {
    'todo': { label: 'To Do', className: 'badge-todo' },
    'in-progress': { label: 'In Progress', className: 'badge-in-progress' },
    'done': { label: 'Done', className: 'badge-done' },
  };

  const status = statusMap[task.status] || statusMap['todo'];
  const date = new Date(task.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    setDeleting(true);
    try {
      await onDelete(task._id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="task-card" style={{ animationDelay: `${index * 0.05}s` }}>
      <div className="task-card-header">
        <h3 className="task-title">{task.title}</h3>
        <span className={`badge ${status.className}`}>{status.label}</span>
      </div>
      {task.description && (
        <p className="task-description">{task.description}</p>
      )}
      <div className="task-footer">
        <span className="task-date">📅 {date}</span>
        <div className="task-actions">
          <button
            className="task-action-btn edit"
            onClick={() => onEdit(task)}
            title="Edit task"
            aria-label="Edit task"
          >
            ✏️
          </button>
          <button
            className="task-action-btn delete"
            onClick={handleDelete}
            disabled={deleting}
            title="Delete task"
            aria-label="Delete task"
          >
            {deleting ? '⏳' : '🗑️'}
          </button>
        </div>
      </div>
    </div>
  );
}


function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages, hasNextPage, hasPrevPage } = pagination;

  const getPages = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="pagination">
      <button
        className="pagination-btn"
        onClick={() => onPageChange(page - 1)}
        disabled={!hasPrevPage}
        aria-label="Previous page"
      >
        ‹
      </button>
      {getPages().map((p) => (
        <button
          key={p}
          className={`pagination-btn ${p === page ? 'active' : ''}`}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}
      <button
        className="pagination-btn"
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNextPage}
        aria-label="Next page"
      >
        ›
      </button>
    </div>
  );
}


export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState(null);
  const searchTimeout = useRef(null);


  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setUser(data.user);
    } catch {
      router.push('/login');
    }
  }, [router]);


  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '9');
      if (statusFilter) params.set('status', statusFilter);
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`/api/tasks?${params.toString()}`);
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch tasks');
      }

      const data = await res.json();
      if (data.encrypted && data.data) {
        const decrypted = decryptData(data.data);
        if (decrypted) {
          setTasks(decrypted.tasks || []);
          setPagination(decrypted.pagination || null);
        }
      }
    } catch (err) {
      showMessage('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search, router]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user) fetchTasks();
  }, [user, fetchTasks]);


  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };


  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(1);
    }, 400);
  };

  const handleFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };


  const handleCreate = async (formData) => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create task');
    showMessage('Task created successfully!');
    fetchTasks();
  };


  const handleUpdate = async (formData) => {
    const res = await fetch(`/api/tasks/${editingTask._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update task');
    showMessage('Task updated successfully!');
    setEditingTask(null);
    fetchTasks();
  };


  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete task');
      showMessage('Task deleted successfully!');
      fetchTasks();
    } catch (err) {
      showMessage(err.message, 'error');
    }
  };


  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };


  const stats = {
    total: pagination?.total || 0,
    todo: tasks.filter((t) => t.status === 'todo').length,
    inProgress: tasks.filter((t) => t.status === 'in-progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
  };

  return (
    <div>

      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          <div className="dashboard-logo"> TaskFlow</div>
          <div className="dashboard-user">
            {user && (
              <>
                <span className="dashboard-user-name">Hi, {user.name}</span>
                <div className="dashboard-user-avatar">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              </>
            )}
            <button className="btn btn-ghost btn-sm" onClick={handleLogout} id="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>


      <main className="dashboard-content">

        {message && (
          <div className={`alert alert-${message.type}`}>
            {message.type === 'success' ? '✓' : '⚠'} {message.text}
          </div>
        )}


        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Total Tasks</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">To Do</div>
            <div className="stat-value todo">{stats.todo}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">In Progress</div>
            <div className="stat-value in-progress">{stats.inProgress}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Done</div>
            <div className="stat-value done">{stats.done}</div>
          </div>
        </div>


        <div className="toolbar">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search tasks by title..."
              value={search}
              onChange={handleSearchChange}
              id="search-input"
            />
          </div>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={handleFilterChange}
            id="status-filter"
          >
            <option value="">All Status</option>
            <option value="todo">📋 To Do</option>
            <option value="in-progress">🔄 In Progress</option>
            <option value="done">✅ Done</option>
          </select>

          <button
            className="btn btn-primary"
            onClick={() => { setEditingTask(null); setShowModal(true); }}
            id="add-task-btn"
          >
            + New Task
          </button>
        </div>


        {loading ? (
          <div className="task-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="task-card" style={{ height: '180px' }}>
                <div className="loading-skeleton" style={{ height: '20px', width: '60%', marginBottom: '12px' }}></div>
                <div className="loading-skeleton" style={{ height: '14px', width: '100%', marginBottom: '8px' }}></div>
                <div className="loading-skeleton" style={{ height: '14px', width: '80%' }}></div>
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3 className="empty-title">
              {search || statusFilter ? 'No tasks match your filters' : 'No tasks yet'}
            </h3>
            <p className="empty-text">
              {search || statusFilter
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first task to get started!'
              }
            </p>
            {!search && !statusFilter && (
              <button
                className="btn btn-primary"
                onClick={() => { setEditingTask(null); setShowModal(true); }}
              >
                + Create First Task
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="task-grid">
              {tasks.map((task, i) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  index={i}
                  onEdit={(t) => { setEditingTask(t); setShowModal(true); }}
                  onDelete={handleDelete}
                />
              ))}
            </div>
            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
        )}
      </main>


      {showModal && (
        <TaskModal
          task={editingTask}
          onClose={() => { setShowModal(false); setEditingTask(null); }}
          onSave={editingTask ? handleUpdate : handleCreate}
        />
      )}
    </div>
  );
}
