import { useState } from 'react';

const TYPE_ICONS = { fire: '🔥', medical: '🏥', security: '🔒', other: '⚠️' };
const CRISIS_TYPES = [
  { value: 'fire', label: 'Fire Emergency' },
  { value: 'medical', label: 'Medical Emergency' },
  { value: 'security', label: 'Security Threat' },
  { value: 'other', label: 'Other Emergency' },
];

export default function SOSButton({ onSubmit, loading }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ type: 'fire', description: '', roomNumber: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(form);
    setOpen(false);
    setForm({ type: 'fire', description: '', roomNumber: '' });
  };

  return (
    <>
      <div className="sos-wrapper">
        <button
          id="sos-trigger-btn"
          className="sos-btn"
          onClick={() => setOpen(true)}
          disabled={loading}
        >
          🆘
          <span>SOS</span>
          <span className="sos-sub">PRESS FOR HELP</span>
        </button>
        <p className="sos-label">
          Tap the button above to instantly alert on-site staff and emergency responders.
        </p>
      </div>

      {open && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
          <div className="modal-card">
            <div className="modal-title">
              🚨 Report Emergency
            </div>
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Emergency Type</label>
                <select
                  id="incident-type"
                  name="type"
                  className="form-select"
                  value={form.type}
                  onChange={handleChange}
                  required
                >
                  {CRISIS_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {TYPE_ICONS[t.value]} {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Room Number</label>
                <input
                  id="incident-room"
                  name="roomNumber"
                  className="form-input"
                  placeholder="e.g. 304"
                  value={form.roomNumber}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Brief Description</label>
                <textarea
                  id="incident-description"
                  name="description"
                  className="form-textarea"
                  placeholder="Describe the emergency briefly..."
                  value={form.description}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary btn-full"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>
                <button
                  id="submit-sos-btn"
                  type="submit"
                  className="btn btn-primary btn-full"
                  disabled={loading}
                >
                  {loading ? <span className="spinner" /> : '🚨 Send Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
