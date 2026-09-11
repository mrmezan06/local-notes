import { Search, X } from 'lucide-react';

export default function DocSearchBar({ value, onChange }) {
  return (
    <div className="doc-search-panel-row">
      <Search size={16} style={{ color: '#94a3b8', flexShrink: 0 }} />
      <input
        type="text"
        placeholder="Search through titles, notes markdown lines, checklist entries, or ledger labels..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="doc-search-input-field"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          style={{
            background: 'none',
            border: 'none',
            color: '#cbd5e1',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
