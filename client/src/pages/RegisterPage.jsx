import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { registerUser } from '../api/authApi.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const res = await registerUser(form);
      login(res.data.token, res.data.user);
      toast.success(`Account created! Welcome, ${res.data.user.name}! 🎉`);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <h1>Start organizing<br />your work today.</h1>
          <p>Join thousands of teams using Taskly to manage projects visually and get more done.</p>
          <div className="auth-features">
            {[['🚀', 'Free forever, no credit card'], ['🔒', 'Secure JWT authentication'], ['📱', 'Works on all devices'], ['🎯', 'CRUD operations made beautiful']].map(([icon, text]) => (
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
            <div className="auth-logo-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="14" rx="2" fill="white" />
                <rect x="14" y="3" width="7" height="9" rx="2" fill="white" opacity="0.7"/>
              </svg>
            </div>
            <span>Taskly</span>
          </div>
          <h2 className="auth-title">Create your account</h2>
          <p className="auth-subtitle">Free forever. No credit card required.</p>
          {error && <div className="auth-error">{error}</div>}
          <form className="auth-form" onSubmit={submit}>
            <div className="input-group">
              <label className="input-label">Full name</label>
              <input className="input" type="text" name="name" placeholder="John Doe"
                value={form.name} onChange={handle} required />
            </div>
            <div className="input-group">
              <label className="input-label">Email address</label>
              <input className="input" type="email" name="email" placeholder="you@example.com"
                value={form.email} onChange={handle} required />
            </div>
            <div className="input-group">
              <label className="input-label">Password</label>
              <input className="input" type="password" name="password" placeholder="At least 6 characters"
                value={form.password} onChange={handle} required />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '13px' }}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
          <p className="auth-divider" style={{ marginTop: 20 }}>
            Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
