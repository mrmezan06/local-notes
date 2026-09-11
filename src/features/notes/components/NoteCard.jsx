import {
  Trash2,
  Calendar,
  FileText,
  CheckSquare,
  BarChart3,
} from 'lucide-react';

export default function NoteCard({ note, onOpen, onDelete }) {
  return (
    <div className="card doc-card" onClick={onOpen}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(note.id);
        }}
        className="btn-card-trash"
        title="Move to Trash"
      >
        <Trash2 size={16} />
      </button>

      <div>
        <h3 className="doc-card-title">{note.title}</h3>
        <div className="doc-card-preview">
          {note.type === 'markdown' &&
            (note.data.body || 'No content written yet.')}
          {note.type === 'checklist' &&
            `${note.data.items?.length || 0} items tracked.`}
          {note.type === 'ledger' && `Balance sheets asset logs tracking.`}
        </div>
      </div>

      <div className="doc-card-meta">
        <span className={`badge-tag badge-${note.type}`}>
          {note.type === 'markdown' && <FileText size={10} />}
          {note.type === 'checklist' && <CheckSquare size={10} />}
          {note.type === 'ledger' && <BarChart3 size={10} />}
          {note.type}
        </span>
        <span className="date-stamp">
          <Calendar size={10} /> {note.updatedAt}
        </span>
      </div>
    </div>
  );
}
