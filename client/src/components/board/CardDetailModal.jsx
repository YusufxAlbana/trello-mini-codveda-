import { useState } from 'react';
import { X, Trash2, Calendar, Flag, Tag, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateCard } from '../../api/cardApi.js';

const PRIORITY_OPTS = [
  { value: 'low', label: 'Low', color: '#059669', bg: '#ecfdf5' },
  { value: 'medium', label: 'Medium', color: '#d97706', bg: '#fffbeb' },
  { value: 'high', label: 'High', color: '#ea580c', bg: '#fff7ed' },
  { value: 'urgent', label: 'Urgent', color: '#FF4757', bg: '#fff0f0' },
];
const COVER_COLORS = ['#6C63FF','#FF6584','#43E6C5','#FFB347','#4FACFE','#f093fb','#f5576c','#43e97b','#fa709a',null];
const LABEL_COLORS = ['#6C63FF','#FF6584','#43E6C5','#FFB347','#FF4757','#059669','#ea580c','#4FACFE'];

export default function CardDetailModal({ card, listTitle, onClose, onUpdate, onDelete }) {
  const [form, setForm] = useState({
    title: card.title,
    description: card.description || '',
    priority: card.priority,
    dueDate: card.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : '',
    coverColor: card.coverColor || null,
    completed: card.completed || false,
    labels: card.labels || [],
  });
  const [saving, setSaving] = useState(false);
  const [newLabel, setNewLabel] = useState({ text: '', color: LABEL_COLORS[0] });
  const [showLabelForm, setShowLabelForm] = useState(false);

  const save = async (updates) => {
    const merged = { ...form, ...updates };
    setForm(merged);
    setSaving(true);
    try {
      const payload = { ...merged, dueDate: merged.dueDate || null };
      const res = await updateCard(card._id, payload);
      onUpdate(res.data.card);
    } catch { toast.error('Failed to save changes'); }
    finally { setSaving(false); }
  };

  const addLabel = () => {
    if (!newLabel.text.trim()) return;
    const labels = [...form.labels, { ...newLabel }];
    save({ labels });
    setNewLabel({ text: '', color: LABEL_COLORS[0] });
    setShowLabelForm(false);
  };

  const removeLabel = (i) => {
    const labels = form.labels.filter((_, idx) => idx !== i);
    save({ labels });
  };

  const isOverdue = form.dueDate && !form.completed && new Date(form.dueDate) < new Date();

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-wide card-detail-modal" onClick={e => e.stopPropagation()}>
        {/* Cover */}
        {form.coverColor && <div className="card-detail-cover" style={{ background: form.coverColor }} />}

        {/* Header */}
        <div className="modal-header" style={{ borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
            <span style={{ fontSize: 12, background: 'var(--border)', padding: '3px 10px', borderRadius: 99, fontWeight: 600, color: 'var(--text-muted)' }}>
              📋 {listTitle}
            </span>
            {form.completed && <span style={{ fontSize: 12, background: '#ecfdf5', color: '#059669', padding: '3px 10px', borderRadius: 99, fontWeight: 600 }}>✓ Completed</span>}
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="card-detail-body">
          {/* Main */}
          <div className="card-detail-main">
            <textarea className="card-detail-title-input" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              onBlur={() => save({})} rows={2} />

            {/* Labels */}
            {form.labels.length > 0 && (
              <div className="card-detail-section">
                <h4>Labels</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {form.labels.map((l, i) => (
                    <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: l.color + '20', color: l.color, padding: '4px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600 }}>
                      {l.text}
                      <X size={10} style={{ cursor: 'pointer' }} onClick={() => removeLabel(i)} />
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="card-detail-section">
              <h4>Description</h4>
              <textarea className="input" placeholder="Add a description..." value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                onBlur={() => save({})} rows={4} />
            </div>

            {/* Priority */}
            <div className="card-detail-section">
              <h4><Flag size={12} style={{ marginRight: 4 }} />Priority</h4>
              <div className="priority-select">
                {PRIORITY_OPTS.map(p => (
                  <button key={p.value} className={`priority-option ${form.priority === p.value ? 'active' : ''}`}
                    style={{ background: form.priority === p.value ? p.bg : 'transparent', color: p.color, borderColor: form.priority === p.value ? p.color : 'var(--border)' }}
                    onClick={() => save({ priority: p.value })}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Due Date */}
            <div className="card-detail-section">
              <h4><Calendar size={12} style={{ marginRight: 4 }} />Due Date</h4>
              <input className="input" type="date" value={form.dueDate}
                onChange={e => save({ dueDate: e.target.value })}
                style={{ borderColor: isOverdue ? 'var(--danger)' : undefined }} />
              {isOverdue && <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>⚠️ This card is overdue!</p>}
            </div>
          </div>

          {/* Sidebar */}
          <div className="card-detail-sidebar">
            <button className="sidebar-btn" onClick={() => save({ completed: !form.completed })} style={{ color: form.completed ? '#059669' : undefined }}>
              <CheckCircle size={15} /> {form.completed ? 'Mark Incomplete' : 'Mark Complete'}
            </button>

            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 8 }}>Cover Color</div>
            <div className="color-picker">
              {COVER_COLORS.map((c, i) => (
                <div key={i} className={`color-swatch ${form.coverColor === c ? 'active' : ''}`}
                  style={{ background: c || '#f4f5f7', border: c === null ? '2px dashed var(--border)' : undefined, borderColor: form.coverColor === c ? 'var(--text)' : undefined }}
                  title={c || 'No cover'} onClick={() => save({ coverColor: c })} />
              ))}
            </div>

            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 8 }}>Add Label</div>
            {showLabelForm ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <input className="input" style={{ fontSize: 13 }} placeholder="Label text" value={newLabel.text}
                  onChange={e => setNewLabel({ ...newLabel, text: e.target.value })} />
                <div className="color-picker">
                  {LABEL_COLORS.map(c => (
                    <div key={c} className={`color-swatch ${newLabel.color === c ? 'active' : ''}`}
                      style={{ background: c, width: 22, height: 22 }} onClick={() => setNewLabel({ ...newLabel, color: c })} />
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="btn btn-primary btn-sm" onClick={addLabel}>Add</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setShowLabelForm(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <button className="sidebar-btn" onClick={() => setShowLabelForm(true)}><Tag size={14} /> Add Label</button>
            )}

            <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <button className="sidebar-btn danger" style={{ color: 'var(--danger)' }} onClick={() => onDelete(card._id)}>
                <Trash2 size={14} /> Delete Card
              </button>
            </div>

            {saving && <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>Saving...</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
