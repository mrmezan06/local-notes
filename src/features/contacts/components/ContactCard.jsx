import { Phone, Mail, Pencil, Clipboard, Trash2 } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';

export default function ContactCard({
  contact,
  isSelected,
  onToggleSelect,
  onEdit,
  onDelete,
}) {
  const { showToast } = useToast();

  const handleCopyToClipboard = async () => {
    try {
      // Formats contact data into a clean text snippet
      const contactInfo = `Name: ${contact.name}\nPhone: ${contact.phone}${contact.email ? `\nEmail: ${contact.email}` : ''}`;

      await navigator.clipboard.writeText(contactInfo);
      showToast(`Copied ${contact.name}'s info to clipboard.`, 'success');
    } catch (err) {
      showToast('Clipboard access was denied.' + err, 'error');
    }
  };

  return (
    <div className="card contact-profile-card">
      {/* 1. Multiple-Selection Circular Checkbox Toggle */}
      <div className="card-select-anchor">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(contact.id)}
          className="custom-circle-checkbox"
        />
      </div>

      {/* 2. On-Hover Interactive Floating Action Toolbar Bar */}
      <div className="card-hover-toolbar">
        <button
          onClick={() => onEdit(contact)}
          className="toolbar-btn edit"
          title="Edit Contact Card"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={handleCopyToClipboard}
          className="toolbar-btn clone"
          title="Copy Info to Clipboard"
        >
          <Clipboard size={13} />
        </button>
        <button
          onClick={() => onDelete(contact.id)}
          className="toolbar-btn delete"
          title="Move to Trash Bin"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* 3. Local Avatar Frame Graphic */}
      <div
        className="avatar-display-circle"
        style={{
          width: '64px',
          height: '64px',
          fontSize: '1.25rem',
          marginBottom: '1rem',
        }}
      >
        {contact.avatar ? (
          <img
            src={contact.avatar}
            alt={contact.name}
            className="avatar-image-render"
          />
        ) : (
          contact.name.charAt(0).toUpperCase()
        )}
      </div>

      {/* 4. Text Meta Labels Data Output */}
      <h3
        className="contact-item-name"
        style={{ fontSize: '1rem', marginBottom: '0.35rem' }}
      >
        {contact.name}
      </h3>

      <div className="contact-communication-row">
        <Phone size={12} style={{ color: '#94a3b8' }} />
        <span style={{ color: '#475569', fontWeight: 500 }}>
          {contact.phone}
        </span>
      </div>

      {contact.email && (
        <div
          className="contact-communication-row"
          style={{ marginTop: '0.15rem' }}
        >
          <Mail size={12} style={{ color: '#94a3b8' }} />
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
            {contact.email}
          </span>
        </div>
      )}
    </div>
  );
}
