import StatusBadge from './StatusBadge';

const TYPE_ICONS = { fire: '🔥', medical: '🏥', security: '🔒', other: '⚠️' };

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function IncidentCard({ incident, onAccept, onResolve, showActions = false }) {
  const { type, description, roomNumber, status, reportedBy, assignedTo, createdAt } = incident;

  return (
    <div className={`incident-card type-${type}`}>
      <div className="incident-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span className="incident-type-icon">{TYPE_ICONS[type]}</span>
            <span style={{ fontWeight: 700, fontSize: '1rem', textTransform: 'capitalize' }}>
              {type} Emergency
            </span>
          </div>
          <div className="incident-meta">
            <StatusBadge status={status} />
            <span className="incident-room">🏨 Room {roomNumber}</span>
          </div>
        </div>
        <span className="incident-time">{timeAgo(createdAt)}</span>
      </div>

      <p className="incident-description">{description}</p>

      <div className="incident-footer">
        <div>
          <div className="incident-reporter">
            Reported by: <strong>{reportedBy?.name || 'Unknown'}</strong>
          </div>
          {assignedTo && (
            <div className="assigned-badge mt-2">
              👷 Assigned: <span>{assignedTo.name}</span>
            </div>
          )}
        </div>

        {showActions && (
          <div className="incident-actions">
            {status === 'reported' && onAccept && (
              <button
                id={`accept-btn-${incident._id}`}
                className="btn btn-orange btn-sm"
                onClick={() => onAccept(incident._id)}
              >
                ✋ Accept
              </button>
            )}
            {status === 'in_progress' && onResolve && (
              <button
                id={`resolve-btn-${incident._id}`}
                className="btn btn-success btn-sm"
                onClick={() => onResolve(incident._id)}
              >
                ✅ Resolve
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
