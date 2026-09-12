import { useState } from 'react';
import { useToast } from '../../../context/ToastContext';
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Trash2,
  Clipboard,
  Pencil,
} from 'lucide-react';

export default function VaultRecordRow({
  item,
  isSelected,
  onToggleSelect,
  onEdit,
  onDelete,
}) {
  const { showToast } = useToast();
  const [reveal, setReveal] = useState(false);

  const cleartextPassword =
    item.secret.accountPassword || item.secret.password || '';
  const targetUrl = item.secret.url || '';

  const triggerClipboardCopy = async (textToCopy, fieldName) => {
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      showToast(`Copied ${fieldName} to clipboard.`, 'success');
    } catch {
      showToast('Clipboard access was denied.', 'error');
    }
  };

  return (
    <div className="card vault-record-card">
      {/* 1. Selection Checkbox Anchor */}
      <div className="card-select-anchor">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(item.id)}
          className="custom-circle-checkbox"
        />
      </div>

      {/* 2. Floating Hover Action Toolbar */}
      <div className="vault-card-hover-toolbar">
        <button
          type="button"
          onClick={() => onEdit(item)}
          className="toolbar-btn edit"
          title="Edit Credential"
        >
          <Pencil size={13} />
        </button>
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          className="toolbar-btn delete"
          title="Move to Trash"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* 3. Credentials Presentation Data */}
      <div>
        <div className="vault-item-title" style={{ paddingRight: '6rem' }}>
          <ShieldCheck size={16} style={{ color: 'var(--color-emerald)' }} />{' '}
          {item.label}
        </div>

        {targetUrl && (
          <div className="vault-item">
            <span
              className="vault-item-url-line"
              style={{ wordBreak: 'break-all' }}
            >
              URL: {targetUrl}
            </span>
            <button
              type="button"
              onClick={() => triggerClipboardCopy(targetUrl, 'URL')}
              className="inline-copy-trigger"
              title="Copy URL"
            >
              <Clipboard size={11} />
            </button>
          </div>
        )}

        <div className="vault-item-crypto-row">
          <span>Username: {item.secret.username}</span>
          <button
            type="button"
            onClick={() =>
              triggerClipboardCopy(item.secret.username, 'Username')
            }
            className="inline-copy-trigger"
            title="Copy Username"
          >
            <Clipboard size={11} />
          </button>
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
          <button
            type="button"
            onClick={() => triggerClipboardCopy(cleartextPassword, 'Password')}
            className="inline-copy-trigger"
            title="Copy Password"
          >
            <Clipboard size={11} />
          </button>
        </div>

        {item.secret.metadata && (
          <div className="vault-item-meta-note">
            Note: {item.secret.metadata}
          </div>
        )}
      </div>
    </div>
  );
}
