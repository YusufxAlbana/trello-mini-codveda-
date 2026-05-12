import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, LayoutGrid, Star, Trash2, MoreHorizontal, Layout, Clock, User } from 'lucide-react';
import Navbar from '../components/ui/Navbar.jsx';
import Modal from '../components/ui/Modal.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getBoards, createBoard, updateBoard, deleteBoard } from '../api/boardApi.js';

const COLORS = ['#6C63FF','#FF6584','#43E6C5','#FFB347','#4FACFE','#f093fb','#f5576c','#43e97b','#fa709a','#4facfe'];

const GREETING = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', background: COLORS[0] });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchBoards();
  }, []);

  useEffect(() => {
    const close = () => setMenuOpen(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const fetchBoards = async () => {
    try {
      const res = await getBoards();
      setBoards(res.data.boards);
    } catch { toast.error('Failed to load boards'); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setCreating(true);
    try {
      const res = await createBoard(form);
      setBoards([res.data.board, ...boards]);
      setShowCreate(false);
      setForm({ title: '', description: '', background: COLORS[0] });
      toast.success('Board created!');
    } catch { toast.error('Failed to create board'); }
    finally { setCreating(false); }
  };

  const handleStar = async (e, board) => {
    e.preventDefault(); e.stopPropagation();
    try {
      await updateBoard(board._id, { starred: !board.starred });
      setBoards(boards.map(b => b._id === board._id ? { ...b, starred: !b.starred } : b));
    } catch { toast.error('Failed to update board'); }
  };

  const handleDelete = async (e, board) => {
    e.preventDefault(); e.stopPropagation();
    if (!confirm(`Delete board "${board.title}"? This cannot be undone.`)) return;
    try {
      await deleteBoard(board._id);
      setBoards(boards.filter(b => b._id !== board._id));
      toast.success('Board deleted');
    } catch { toast.error('Failed to delete board'); }
  };

  const totalBoards = boards.length;
  const starredBoards = boards.filter(b => b.starred).length;
  const recentBoards = boards.slice(0, 5).length;

  if (loading) return <><Navbar /><LoadingSpinner fullScreen /></>;

  return (
    <>
      <Navbar />
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>{GREETING()}, {user?.name?.split(' ')[0]}!</h1>
          <p>You have <strong>{totalBoards}</strong> board{totalBoards !== 1 ? 's' : ''} in your workspace.</p>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {[
            { icon: <Layout size={24} />, label: 'Total Boards', value: totalBoards, bg: '#ede9ff', color: '#6C63FF' },
            { icon: <Star size={24} />, label: 'Starred', value: starredBoards, bg: '#fff7ed', color: '#FFB347' },
            { icon: <Clock size={24} />, label: 'Recent Activity', value: recentBoards, bg: '#ecfdf5', color: '#43E6C5' },
            { icon: <User size={24} />, label: 'Your Workspace', value: 1, bg: '#fff0f5', color: '#FF6584' },
          ].map(s => (
            <div className="stat-card" key={s.label}>
              <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
              <div className="stat-info"><h3 style={{ color: s.color }}>{s.value}</h3><p>{s.label}</p></div>
            </div>
          ))}
        </div>

        {/* Starred Boards */}
        {starredBoards > 0 && (
          <>
            <div className="section-header">
              <h2 className="section-title"><Star size={18} fill="#FFB347" color="#FFB347" style={{ marginRight: 8, verticalAlign: 'middle' }} />Starred Boards</h2>
            </div>
            <div className="boards-grid" style={{ marginBottom: 40 }}>
              {boards.filter(b => b.starred).map(board => (
                <Link to={`/board/${board._id}`} key={board._id} className="board-card">
                  <div className="board-card-header" style={{ background: board.background }}>
                    <div className="board-card-title">{board.title}</div>
                    <div className="board-card-actions" style={{ opacity: 1 }}>
                      <button className="btn btn-icon" style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', padding: 6 }}
                        onClick={(e) => handleStar(e, board)} title="Unstar">
                        <Star size={14} fill="#fff" />
                      </button>
                    </div>
                  </div>
                  <div className="board-card-body">
                    <div className="board-card-meta">
                      <span className="board-card-stat">
                        {board.description || 'No description'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* All Boards */}
        <div className="section-header">
          <h2 className="section-title"><LayoutGrid size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />All Boards</h2>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
            <Plus size={15} /> New Board
          </button>
        </div>

        <div className="boards-grid">
          {boards.map(board => (
            <Link to={`/board/${board._id}`} key={board._id} className="board-card">
              <div className="board-card-header" style={{ background: board.background }}>
                <div className="board-card-title">{board.title}</div>
                <div className="board-card-actions">
                  <button className="btn btn-icon" style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', padding: 6 }}
                    onClick={(e) => handleStar(e, board)} title={board.starred ? 'Unstar' : 'Star'}>
                    <Star size={14} fill={board.starred ? '#fff' : 'none'} />
                  </button>
                  <button className="btn btn-icon" style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', padding: 6 }}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(e, board); }} title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="board-card-body">
                <div className="board-card-meta">
                  <span className="board-card-stat">
                    {board.description || 'No description'}
                  </span>
                  {board.starred && <Star size={13} fill="#FFB347" color="#FFB347" />}
                </div>
              </div>
            </Link>
          ))}
          <div className="board-add-card" onClick={() => setShowCreate(true)}>
            <Plus size={28} />
            <span>Create new board</span>
          </div>
        </div>
      </div>

      {/* Create Board Modal */}
      {showCreate && (
        <Modal title="Create Board" onClose={() => setShowCreate(false)}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleCreate} disabled={creating}>
              {creating ? 'Creating...' : 'Create Board'}
            </button>
          </>}>
          <div className="input-group">
            <label className="input-label">Board title *</label>
            <input className="input" placeholder="e.g. Product Roadmap" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })} autoFocus />
          </div>
          <div className="input-group">
            <label className="input-label">Description</label>
            <input className="input" placeholder="What is this board about?" value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="input-group">
            <label className="input-label">Background Color</label>
            <div className="color-picker">
              {COLORS.map(c => (
                <div key={c} className={`color-swatch ${form.background === c ? 'active' : ''}`}
                  style={{ background: c }} onClick={() => setForm({ ...form, background: c })} />
              ))}
            </div>
          </div>
          {form.background && (
            <div style={{ height: 60, borderRadius: 10, background: form.background, display: 'flex', alignItems: 'center', paddingLeft: 16 }}>
              <span style={{ color: '#fff', fontWeight: 700 }}>{form.title || 'Board Preview'}</span>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
