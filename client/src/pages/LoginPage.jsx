import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginUser } from '../api/authApi.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginUser(form);
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}! 👋`);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <h1>Manage your work,<br />beautifully.</h1>
          <p>Taskly helps teams move work forward with visual boards, powerful cards, and seamless collaboration.</p>
          <div className="auth-features">
            {[['📋', 'Kanban boards with drag & drop'], ['🎨', 'Colorful cards and priority labels'], ['📅', 'Due dates and overdue tracking'], ['⚡', 'Fast and intuitive workflow']].map(([icon, text]) => (
              <div className="auth-feature" key={text}>
                <div className="auth-feature-icon">{icon}</div>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-form-box">
          <div className="auth-logo">
            <img src="/logo.png" alt="Taskly" style={{ width: 44, height: 44, borderRadius: 12, objectFit: 'cover' }} />
            <span>Taskly</span>
          </div>
          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-subtitle">Sign in to continue to your boards</p>
          {error && <div className="auth-error">{error}</div>}
          <form className="auth-form" onSubmit={submit}>
            <div className="input-group">
              <label className="input-label">Email address</label>
              <input className="input" type="email" name="email" placeholder="you@example.com"
                value={form.email} onChange={handle} required />
            </div>
            <div className="input-group">
              <label className="input-label">Password</label>
              <input className="input" type="password" name="password" placeholder="Enter your password"
                value={form.password} onChange={handle} required />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '13px' }}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <p className="auth-divider" style={{ marginTop: 20 }}>
            Don't have an account? <Link to="/register" className="auth-link">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
