import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import IncidentCard from '../components/IncidentCard';

export default function AdminDashboard() {
  const socket = useSocket();
  const [incidents, setIncidents] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, resolved: 0, byType: [] });
  const [filter, setFilter] = useState('all');

  const fetchAll = async () => {
    try {
      const [incRes, statRes] = await Promise.all([
        api.get('/incidents'),
        api.get('/incidents/stats'),
      ]);
      setIncidents(incRes.data);
      setStats(statRes.data);
    } catch {
      toast.error('Failed to load data');
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleNew = (incident) => {
      setIncidents((prev) => [incident, ...prev]);
      setStats((s) => ({ ...s, total: s.total + 1, active: s.active + 1 }));
      toast(`🚨 New ${incident.type} emergency!`, { icon: '🚨' });
    };
    const handleUpdate = (updated) => {
      setIncidents((prev) =>
        prev.map((inc) => (inc._id === updated._id ? updated : inc))
      );
      if (updated.status === 'resolved') {
        setStats((s) => ({ ...s, resolved: s.resolved + 1, active: Math.max(0, s.active - 1) }));
      }
    };
    socket.on('new_incident', handleNew);
    socket.on('incident_updated', handleUpdate);
    return () => {
      socket.off('new_incident', handleNew);
      socket.off('incident_updated', handleUpdate);
    };
  }, [socket]);

  const handleAccept = async (id) => {
    try {
      await api.patch(`/incidents/${id}/accept`);
      toast.success('Incident accepted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  const handleResolve = async (id) => {
    try {
      await api.patch(`/incidents/${id}/status`, { status: 'resolved' });
      toast.success('Incident resolved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  const TYPE_ICON = { fire: '🔥', medical: '🏥', security: '🔒', other: '⚠️' };

  const displayed = filter === 'all' ? incidents : incidents.filter((i) => i.status === filter);

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="container">
          <div className="dashboard-header">
            <h1 className="dashboard-title">Admin Control Center</h1>
            <p className="dashboard-subtitle">
              Full oversight of all incidents across the property
            </p>
          </div>

          {/* Main Stats */}
          <div className="dashboard-grid dashboard-grid-3" style={{ marginBottom: 24 }}>
            <div className="stat-card blue">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Incidents</div>
            </div>
            <div className="stat-card red">
              <div className="stat-value">{stats.active}</div>
              <div className="stat-label">🔴 Active</div>
            </div>
            <div className="stat-card green">
              <div className="stat-value">{stats.resolved}</div>
              <div className="stat-label">🟢 Resolved</div>
            </div>
          </div>

          {/* Incidents by Type */}
          {stats.byType.length > 0 && (
            <div className="card" style={{ marginBottom: 28 }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 16 }}>
                Incidents by Type
              </h3>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {stats.byType.map((t) => (
                  <div
                    key={t._id}
                    style={{
                      padding: '12px 20px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--border)',
                      borderRadius: 10,
                      textAlign: 'center',
                      minWidth: 100,
                    }}
                  >
                    <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{TYPE_ICON[t._id] || '⚠️'}</div>
                    <div style={{ fontWeight: 800, fontSize: '1.4rem' }}>{t.count}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{t._id}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {['all', 'reported', 'in_progress', 'resolved'].map((f) => (
              <button
                key={f}
                id={`admin-filter-${f}`}
                className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter(f)}
                style={{ textTransform: 'capitalize' }}
              >
                {f === 'all' ? 'All Incidents' : f.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Full Incident List */}
          <div className="section-title">
            <span className="live-dot" />
            All Incidents — {displayed.length} records
          </div>

          {displayed.length === 0 ? (
            <div className="empty-state card">
              <div className="empty-icon">📋</div>
              <p>No incidents found for this filter.</p>
            </div>
          ) : (
            <div className="incident-list" style={{ paddingBottom: 40 }}>
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
