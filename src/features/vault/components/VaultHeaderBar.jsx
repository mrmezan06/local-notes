import { Download, Upload } from 'lucide-react';

export default function VaultHeaderBar({
  totalCount,
  onExportAll,
  onImportCSV,
}) {
  return (
    <div className="vault-header-actions-row">
      <div>
        <h2
          style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            color: '#0f172a',
            margin: 0,
          }}
        >
          📦 Secured Password Vault
        </h2>
        <p
          style={{
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            marginTop: '0.8rem',
            marginLeft: '1.6rem',
            marginBottom: '0rem',
            marginRight: '0rem',
          }}
        >
          Total credentials: <strong>{totalCount}</strong>
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          type="button"
          onClick={onExportAll}
          className="btn"
          style={{
            backgroundColor: '#005838',
            color: '#ffffff',
            border: '1px solid #e2e8f0',
            fontSize: '0.72rem',
          }}
        >
          <Download size={14} /> Export (.csv)
        </button>

        <label
          type="button"
          className="btn"
          style={{
            backgroundColor: '#ba3c02',
            color: '#ffffff',
            border: '1px solid #e2e8f0',
            fontSize: '0.72rem',
          }}
        >
          <Upload size={14} /> Import (.csv)
          <input
            type="file"
            accept=".csv"
            onChange={onImportCSV}
            style={{ display: 'none' }}
          />
        </label>
      </div>
    </div>
  );
}
