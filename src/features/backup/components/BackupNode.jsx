export default function BackupNode({
  title,
  description,
  icon,
  actionText,
  actionColor,
  onAction,
  isUpload,
}) {
  return (
    <div className="card backup-node-card">
      <div className={`backup-icon-badge badge-${actionColor}`}>{icon}</div>
      <div>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>
          {title}
        </h3>
        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            marginTop: '0.35rem',
            lineHeight: 1.4,
            maxWidth: '280px',
          }}
        >
          {description}
        </p>
      </div>

      {isUpload ? (
        <label
          className={`btn btn-${actionColor}`}
          style={{
            width: '100%',
            maxWidth: '240px',
            marginTop: '1rem',
            cursor: 'pointer',
          }}
        >
          {actionText}
          <input
            type="file"
            accept=".json"
            onChange={onAction}
            style={{ display: 'none' }}
          />
        </label>
      ) : (
        <button
          onClick={onAction}
          className={`btn btn-${actionColor}`}
          style={{ width: '100%', maxWidth: '240px', marginTop: '1rem' }}
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
