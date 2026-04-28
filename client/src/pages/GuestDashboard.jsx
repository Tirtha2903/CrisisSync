import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import SOSButton from '../components/SOSButton';
import IncidentCard from '../components/IncidentCard';

export default function GuestDashboard() {
  const { user } = useAuth();
  const socket = useSocket();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchIncidents = async () => {
    try {
      const res = await api.get('/incidents/mine');
      setIncidents(res.data);
    } catch {
      toast.error('Failed to load your incidents');
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  // Listen for real-time updates to guest's own incidents
  useEffect(() => {
    if (!socket) return;
    const handleUpdate = (updated) => {
      setIncidents((prev) =>
        prev.map((inc) => (inc._id === updated._id ? updated : inc))
      );
    };
    socket.on('incident_updated', handleUpdate);
    return () => socket.off('incident_updated', handleUpdate);
  }, [socket]);

  const handleSOS = async (form) => {
    setLoading(true);
    try {
      const res = await api.post('/incidents', form);
      setIncidents((prev) => [res.data, ...prev]);
      toast.success('🚨 Emergency alert sent! Help is on the way.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send alert');
    } finally {
      setLoading(false);
    }
  };

  const active = incidents.filter((i) => i.status !== 'resolved');
  const resolved = incidents.filter((i) => i.status === 'resolved');

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="container">
          <div className="dashboard-header">
            <h1 className="dashboard-title">Guest Emergency Panel</h1>
            <p className="dashboard-subtitle">
              Hello, {user?.name}
              {user?.roomNumber ? ` · Room ${user.roomNumber}` : ''} — Press SOS if you need immediate help
            </p>
          </div>

          <div className="guest-layout">
            {/* SOS Section */}
            <div className="card" style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '1px' }}>
                Emergency Alert
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                In an emergency, press the button below
              </p>
              <SOSButton onSubmit={handleSOS} loading={loading} />
            </div>

            {/* My Incidents */}
            <div>
              <div className="section-title">
                <span className="live-dot" />
                My Alerts ({incidents.length})
              </div>

              {active.length > 0 && (
                <>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 10 }}>ACTIVE</p>
                  <div className="incident-list" style={{ marginBottom: 24 }}>
                    {active.map((inc) => (
                      <IncidentCard key={inc._id} incident={inc} />
                    ))}
                  </div>
                </>
              )}

              {resolved.length > 0 && (
                <>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 10 }}>RESOLVED</p>
                  <div className="incident-list">
                    {resolved.map((inc) => (
                      <IncidentCard key={inc._id} incident={inc} />
                    ))}
                  </div>
                </>
              )}

              {incidents.length === 0 && (
                <div className="empty-state card">
                  <div className="empty-icon">✅</div>
                  <p>No active emergencies. Stay safe!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
