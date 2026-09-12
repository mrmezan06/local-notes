import { Trash2, RotateCcw } from 'lucide-react';

export default function TrashHeaderBar({
  trashCount,
  onRestoreAll,
  onEmptyAll,
}) {
  return (
    <div className="card trash-header-layout">
      <div>
        <h1
          style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            color: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            margin: 0,
          }}
        >
          <Trash2 size={20} style={{ color: 'var(--color-red)' }} /> System-wide
          Recycle Bin
        </h1>
        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            marginTop: '0.3rem',
            marginLeft: '1.8rem',
          }}
        >
          Review deleted entries. Restore items instantly back to their
          workspace, or delete them permanently from the database [DB].
        </p>
      </div>

      {/* Render Twin Bulk Actions Cluster dynamically if items exist */}
      {trashCount > 0 && (
        <div className="trash-bulk-actions-cluster">
          <button
            type="button"
            onClick={onRestoreAll}
            className="btn btn-restore-bulk"
            style={{ borderRadius: 'var(--radius-md)' }}
          >
            <RotateCcw size={13} /> Restore All
          </button>
          <button
            type="button"
            onClick={onEmptyAll}
            className="btn btn-purge-bulk"
            style={{ borderRadius: 'var(--radius-md)' }}
          >
            <Trash2 size={13} /> Empty Trash
          </button>
        </div>
      )}
    </div>
  );
}
