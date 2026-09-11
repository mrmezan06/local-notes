import { useState } from 'react';
import { ShieldCheck, Eye, EyeOff, Trash2 } from 'lucide-react';

export default function VaultRecordRow({ item, onDelete }) {
  const [reveal, setReveal] = useState(false);

  // FIXED: Check for both 'accountPassword' (from CSV tool) and 'password' (from standard form)
  const cleartextPassword =
    item.secret.accountPassword || item.secret.password || '';

  return (
    <div className="card vault-record-card">
      <div>
        <div className="vault-item-title">
          <ShieldCheck size={16} style={{ color: 'var(--color-emerald)' }} />{' '}
          {item.label}
        </div>
        <div className="vault-item-crypto-row">
          <span>User: {item.secret.username}</span>
        </div>
        <div className="vault-item-crypto-row">
          <span>Password:</span>
          <span className="pass-cipher-block">
            {reveal ? cleartextPassword : '••••••••••••'}
          </span>
          <button
            type="button"
            onClick={() => setReveal(!reveal)}
            className="btn-icon-toggle"
            style={{ marginLeft: '0.25rem' }}
          >
            {reveal ? <EyeOff size={12} /> : <Eye size={12} />}
          </button>
        </div>
        {item.secret.metadata && (
          <div className="vault-item-meta-note">
            Note: {item.secret.metadata}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDelete(item.id)}
        className="btn-vault-delete"
        title="Move to Trash"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
