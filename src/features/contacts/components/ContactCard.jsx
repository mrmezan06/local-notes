/* eslint-disable no-unused-vars */
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
      const phonesList = contact.phones ? contact.phones.join(', ') : '';
      const emailsList = contact.emails ? contact.emails.join(', ') : '';
      const contactInfo = `Name: ${contact.name}\nPhones: ${phonesList}${emailsList ? `\nEmails: ${emailsList}` : ''}`;

      await navigator.clipboard.writeText(contactInfo);
      showToast(`Copied ${contact.name}'s info to clipboard.`, 'success');
    } catch (err) {
      showToast('Clipboard access was denied.', 'error');
    }
  };

  return (
    <div className="card contact-profile-card" style={{ minHeight: '260px' }}>
      <div className="card-select-anchor">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(contact.id)}
          className="custom-circle-checkbox"
        />
      </div>

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
          title="Copy Info"
        >
          <Clipboard size={13} />
        </button>
        <button
          onClick={() => onDelete(contact.id)}
          className="toolbar-btn delete"
          title="Move to Trash"
        >
          <Trash2 size={13} />
        </button>
      </div>

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

      <h3
        className="contact-item-name"
        style={{ fontSize: '1rem', marginBottom: '0.5rem' }}
      >
        {contact.name}
      </h3>

      {/* Loop through multiple phone numbers */}
      {contact.phones?.map((phone, i) => (
        <div key={i} className="contact-communication-row">
          <Phone size={11} style={{ color: '#94a3b8' }} />
          <span style={{ color: '#475569', fontWeight: 500 }}>{phone}</span>
        </div>
      ))}

      {/* Loop through multiple email addresses */}
      {contact.emails?.map((email, i) => (
        <div
          key={i}
          className="contact-communication-row"
          style={{ marginTop: '0.1rem' }}
        >
          <Mail size={11} style={{ color: '#94a3b8' }} />
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{email}</span>
        </div>
      ))}
    </div>
  );
}
