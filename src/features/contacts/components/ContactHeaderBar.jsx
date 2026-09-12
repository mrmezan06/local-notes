import { Download, Upload, HeartPulseIcon } from 'lucide-react';

export default function ContactHeaderBar({
  totalCount,
  onTriggerScan,
  onExportAll,
  onImportVCF,
}) {
  return (
    <div className="doc-header-block">
      <h1
        className="doc-title-main"
        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
      >
        Local Phonebook
        <span
          style={{
            fontSize: '0.75rem',
            backgroundColor: '#e2e8f0',
            color: '#475569',
            padding: '0.2rem 0.6rem',
            borderRadius: '9999px',
            fontFamily: 'monospace',
          }}
        >
          Total: {totalCount}
        </span>
      </h1>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          type="button"
          onClick={onTriggerScan}
          className="btn"
          style={{
            backgroundColor: '#0b6fe1',
            color: '#ffffff',
            border: '1px solid #687bd8',
            fontSize: '0.7rem',
          }}
        >
          <HeartPulseIcon size={14} /> Scanner
        </button>

        <button
          type="button"
          onClick={onExportAll}
          className="btn"
          style={{
            backgroundColor: '#005838',
            color: '#ffffff',
            border: '1px solid #e2e8f0',
            fontSize: '0.7rem',
          }}
        >
          <Download size={14} /> Export (.vcf)
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
          <Upload size={14} /> Import (.vcf)
          <input
            type="file"
            accept=".vcf"
            onChange={onImportVCF}
            style={{ display: 'none' }}
          />
        </label>
      </div>
    </div>
  );
}
