import { RotateCcw, Trash2, FileText, Key, User } from 'lucide-react';

export default function TrashRowItem({ item, onRestore, onPurge }) {
  const getIcon = () => {
    if (item.sourceTable === 'notes')
      return <FileText size={14} style={{ color: '#0369a1' }} />;
    if (item.sourceTable === 'vault')
      return <Key size={14} style={{ color: '#b91c1c' }} />;
    return <User size={14} style={{ color: '#6b21a8' }} />;
  };

  return (
    <div className="card trash-row-item">
      <div className="trash-item-label-group">
        {getIcon()}
        <span className={`trash-badge-prefix prefix-${item.sourceTable}`}>
          {item.sourceTable}
        </span>
        <span className="trash-item-display-text">{item.displayTitle}</span>
      </div>

      <div className="trash-actions-cluster">
        <button
          onClick={() => onRestore(item)}
          className="btn-trash-action btn-restore-back"
          title="Restore record to live workspace"
        >
          <RotateCcw size={13} /> Restore
        </button>
        <button
          onClick={() => onPurge(item)}
          className="btn-trash-action btn-purge-permanent"
          title="Permanently remove from local storage"
        >
          <Trash2 size={13} /> Burn Forever
        </button>
      </div>
    </div>
  );
}
