import { CheckSquare, Square, Download, Trash2, X } from 'lucide-react';

export default function VaultSelectionBar({
  selectedCount,
  isAllMarked,
  onSelectAll,
  onDeselectAll,
  onExportSelected,
  onDeleteSelected,
}) {
  return (
    <div className="selection-action-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span>Selected passwords: {selectedCount} items</span>
        {!isAllMarked ? (
          <button
            onClick={onSelectAll}
            className="btn"
            style={{
              backgroundColor: '#e2e8f0',
              color: '#334155',
              padding: '0.35rem 0.6rem',
            }}
          >
            <CheckSquare size={12} /> Mark All
          </button>
        ) : (
          <button
            onClick={onDeselectAll}
            className="btn"
            style={{
              backgroundColor: '#e2e8f0',
              color: '#334155',
              padding: '0.35rem 0.6rem',
            }}
          >
            <Square size={12} /> Unmark All
          </button>
        )}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={onExportSelected}
          className="btn btn-sky"
          style={{ padding: '0.4rem 0.75rem' }}
        >
          <Download size={12} /> Export Selected (.csv)
        </button>
        <button
          onClick={onDeleteSelected}
          className="btn btn-red"
          style={{ padding: '0.4rem 0.75rem' }}
        >
          <Trash2 size={12} /> Delete Selected
        </button>
        <button
          type="button"
          onClick={onDeselectAll}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '0 4px',
          }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
