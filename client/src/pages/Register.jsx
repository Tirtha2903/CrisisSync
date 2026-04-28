import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const ROLES = [
  { value: 'guest', label: '🛎️ Guest', desc: 'I am staying at the hotel' },
  { value: 'staff', label: '👷 Staff', desc: 'I am a hotel employee' },
  { value: 'admin', label: '🔑 Admin', desc: 'I manage hotel operations' },
];

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'guest', roomNumber: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      login(res.data.token, res.data.user);
      toast.success(`Welcome to CrisisSync, ${res.data.user.name}!`);
      const role = res.data.user.role;
      navigate(role === 'admin' ? '/admin' : role === 'staff' ? '/staff' : '/guest');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">🚨</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>CrisisSync</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Emergency Response System</div>
          </div>
        </div>

        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join the crisis coordination network</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              id="reg-name"
              name="name"
              className="form-input"
              placeholder="John Smith"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              id="reg-email"
              name="email"
              type="email"
              className="form-input"
              placeholder="you@hotel.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="reg-password"
              name="password"
              type="password"
              className="form-input"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ROLES.map((r) => (
                <label
                  key={r.value}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    background: form.role === r.value ? 'rgba(255,45,45,0.08)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${form.role === r.value ? 'rgba(255,45,45,0.4)' : 'var(--border)'}`,
                    borderRadius: 8,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r.value}
                    checked={form.role === r.value}
                    onChange={handleChange}
                    style={{ accentColor: 'var(--red)' }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.label}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{r.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {form.role === 'guest' && (
            <div className="form-group">
              <label className="form-label">Room Number (optional)</label>
              <input
                id="reg-room"
                name="roomNumber"
                className="form-input"
                placeholder="e.g. 304"
                value={form.roomNumber}
                onChange={handleChange}
              />
            </div>
          )}

          <button
            id="register-submit-btn"
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            style={{ marginTop: 8 }}
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : '🚀 Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
