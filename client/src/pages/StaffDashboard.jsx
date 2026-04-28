import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import IncidentCard from '../components/IncidentCard';

const FILTERS = ['all', 'reported', 'in_progress', 'resolved'];

export default function StaffDashboard() {
  const socket = useSocket();
  const [incidents, setIncidents] = useState([]);
  const [filter, setFilter] = useState('all');

  const fetchIncidents = async () => {
    try {
      const res = await api.get('/incidents');
      setIncidents(res.data);
    } catch {
      toast.error('Failed to load incidents');
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  // Real-time listeners
  useEffect(() => {
    if (!socket) return;

    const handleNew = (incident) => {
      setIncidents((prev) => [incident, ...prev]);
      toast(`🚨 New ${incident.type.toUpperCase()} alert — Room ${incident.roomNumber}!`, {
        duration: 6000,
        style: { background: '#1a0a0a', color: '#ff2d2d', border: '1px solid rgba(255,45,45,0.3)', fontWeight: 600 },
        icon: '🚨',
      });
      // Browser notification
      if (Notification.permission === 'granted') {
        new Notification('CrisisSync — New Emergency!', {
          body: `${incident.type.toUpperCase()} at Room ${incident.roomNumber}: ${incident.description}`,
        });
      }
    };

    const handleUpdate = (updated) => {
      setIncidents((prev) =>
        prev.map((inc) => (inc._id === updated._id ? updated : inc))
      );
    };

    socket.on('new_incident', handleNew);
    socket.on('incident_updated', handleUpdate);

    return () => {
      socket.off('new_incident', handleNew);
      socket.off('incident_updated', handleUpdate);
    };
  }, [socket]);

  // Request notification permission
  useEffect(() => {
    if (Notification.permission === 'default') Notification.requestPermission();
  }, []);

  const handleAccept = async (id) => {
    try {
      await api.patch(`/incidents/${id}/accept`);
      toast.success('Incident accepted — you are now responding');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept incident');
    }
  };

  const handleResolve = async (id) => {
    try {
      await api.patch(`/incidents/${id}/status`, { status: 'resolved' });
      toast.success('✅ Incident marked as resolved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resolve incident');
    }
  };

  const displayed = filter === 'all' ? incidents : incidents.filter((i) => i.status === filter);
  const reported = incidents.filter((i) => i.status === 'reported').length;
  const inProgress = incidents.filter((i) => i.status === 'in_progress').length;

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="container">
          <div className="dashboard-header">
            <h1 className="dashboard-title">Staff Response Center</h1>
            <p className="dashboard-subtitle">
              Real-time incident feed — respond immediately to active emergencies
            </p>
          </div>

          {/* Quick Stats */}
          <div className="dashboard-grid dashboard-grid-3" style={{ marginBottom: 32 }}>
            <div className="stat-card red">
              <div className="stat-value">{reported}</div>
              <div className="stat-label">🔴 Awaiting Response</div>
            </div>
            <div className="stat-card yellow">
              <div className="stat-value">{inProgress}</div>
              <div className="stat-label">🟡 In Progress</div>
            </div>
            <div className="stat-card green">
              <div className="stat-value">{incidents.filter((i) => i.status === 'resolved').length}</div>
              <div className="stat-label">🟢 Resolved</div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {FILTERS.map((f) => (
              <button
                key={f}
                id={`filter-${f}`}
                className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter(f)}
                style={{ textTransform: 'capitalize' }}
              >
                {f === 'all' ? 'All' : f.replace('_', ' ')}
                {f !== 'all' && (
                  <span style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '1px 6px', fontSize: '0.7rem' }}>
                    {incidents.filter((i) => i.status === f).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Live Feed */}
          <div className="section-title">
            <span className="live-dot" />
            Live Incident Feed ({displayed.length})
          </div>

          {displayed.length === 0 ? (
            <div className="empty-state card">
              <div className="empty-icon">🛡️</div>
              <p>No {filter === 'all' ? '' : filter.replace('_', ' ')} incidents. All clear!</p>
            </div>
          ) : (
            <div className="incident-list">
              {displayed.map((inc) => (
                <IncidentCard
                  key={inc._id}
                  incident={inc}
                  showActions
                  onAccept={handleAccept}
                  onResolve={handleResolve}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
