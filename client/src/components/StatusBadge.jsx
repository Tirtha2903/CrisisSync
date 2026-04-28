const STATUS_MAP = {
  reported: { label: 'Reported', icon: '🔴' },
  in_progress: { label: 'In Progress', icon: '🟡' },
  resolved: { label: 'Resolved', icon: '🟢' },
};

export default function StatusBadge({ status }) {
  const { label, icon } = STATUS_MAP[status] || STATUS_MAP.reported;
  return (
    <span className={`status-badge ${status}`}>
      <span className="status-dot" />
      {icon} {label}
    </span>
  );
}
