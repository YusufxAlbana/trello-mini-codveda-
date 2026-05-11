import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <div className="navbar-logo-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="7" height="14" rx="2" fill="white" />
            <rect x="14" y="3" width="7" height="9" rx="2" fill="white" opacity="0.7"/>
          </svg>
        </div>
        <span>Taskly</span>
      </Link>
      <div className="navbar-spacer" />
      <div style={{ position: 'relative' }} ref={ref}>
        <div className="navbar-avatar" style={{ background: user?.avatarColor || '#6C63FF' }}
          onClick={() => setOpen(!open)}>
          {initials}
          <ChevronDown size={12} style={{ position: 'absolute', bottom: -2, right: -2, background: '#fff', borderRadius: '50%', color: 'var(--text-muted)' }} />
        </div>
        {open && (
          <div className="navbar-dropdown">
            <div className="navbar-dropdown-user">
              <div className="navbar-dropdown-name">{user?.name}</div>
              <div className="navbar-dropdown-email">{user?.email}</div>
            </div>
            <Link to="/" className="navbar-dropdown-item" onClick={() => setOpen(false)}>
              <LayoutDashboard size={15} /> Dashboard
            </Link>
            <div className="navbar-dropdown-item danger" onClick={handleLogout}>
              <LogOut size={15} /> Sign out
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
