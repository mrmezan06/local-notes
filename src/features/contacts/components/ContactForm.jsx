import { useState, useEffect } from 'react';
import { User, ImagePlus, X } from 'lucide-react';

export default function ContactForm({ onSave, initialValues }) {
  const [name, setName] = useState('');

  // Requirement: Change single fields into Array structures
  const [phones, setPhones] = useState(['']);
  const [emails, setEmails] = useState(['']);
  const [avatar, setAvatar] = useState('');

  useEffect(() => {
    const handleStateInjection = () => {
      if (initialValues) {
        setName(initialValues.name || '');
        // Load existing arrays, fallback to baseline row if empty
        setPhones(
          initialValues.phones && initialValues.phones.length > 0
            ? initialValues.phones
            : [''],
        );
        setEmails(
          initialValues.emails && initialValues.emails.length > 0
            ? initialValues.emails
            : [''],
        );
        setAvatar(initialValues.avatar || '');
      } else {
        setName('');
        setPhones(['']);
        setEmails(['']);
        setAvatar('');
      }
    };

    const microTaskTimer = setTimeout(handleStateInjection, 0);
    return () => clearTimeout(microTaskTimer);
  }, [initialValues]);

  const handleArrayFieldChange = (index, value, type) => {
    if (type === 'phone') {
      const updated = [...phones];
      updated[index] = value;
      setPhones(updated);
    } else {
      const updated = [...emails];
      updated[index] = value;
      setEmails(updated);
    }
  };

  const addFieldRow = (type) => {
    if (type === 'phone') setPhones([...phones, '']);
    else setEmails([...emails, '']);
  };

  const removeFieldRow = (index, type) => {
    if (type === 'phone') {
      const updated = phones.filter((_, idx) => idx !== index);
      setPhones(updated.length === 0 ? [''] : updated);
    } else {
      const updated = emails.filter((_, idx) => idx !== index);
      setEmails(updated.length === 0 ? [''] : updated);
    }
  };

  const handleImageConversion = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setAvatar(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Filter out blank inputs before saving to database
    const filteredPhones = phones.filter((p) => p.trim() !== '');
    const filteredEmails = emails.filter((m) => m.trim() !== '');

    if (!name || filteredPhones.length === 0) return;

    onSave({
      name,
      phones: filteredPhones,
      emails: filteredEmails,
      avatar,
    });
  };

  return (
    <div className="card">
      <h2
        style={{
          fontSize: '0.85rem',
          fontWeight: 700,
          marginBottom: '1rem',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '0.5rem',
        }}
      >
        {initialValues ? 'Modify Contact Profile' : 'Create Contact Record'}
      </h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        <div className="avatar-frame-wrapper">
          <label className="avatar-interactive-trigger">
            <div className="avatar-display-circle">
              {avatar ? (
                <img
                  src={avatar}
                  alt="Preview"
                  className="avatar-image-render"
                />
              ) : (
                <User size={28} />
              )}
            </div>
            <div className="avatar-badge-plus">
              <ImagePlus size={10} />
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageConversion}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        <div>
          <label className="form-label">Full Name *</label>
          <input
            type="text"
            placeholder="e.g., Shohag"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-input"
            style={{
              backgroundColor: 'white',
              borderColor: '#e2e8f0',
              color: '#0f172a',
            }}
          />
        </div>

        {/* Dynamic Multiple Phone Numbers Area */}
        <div>
          <label className="form-label">Phone Numbers *</label>
          {phones.map((phone, idx) => (
            <div
              key={idx}
              style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}
            >
              <input
                type="text"
                placeholder="e.g., 01718635644"
                required={idx === 0}
                value={phone}
                onChange={(e) =>
                  handleArrayFieldChange(idx, e.target.value, 'phone')
                }
                className="form-input"
                style={{
                  backgroundColor: 'white',
                  borderColor: '#e2e8f0',
                  color: '#0f172a',
                }}
              />
              {phones.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeFieldRow(idx, 'phone')}
                  className="btn btn-red"
                  style={{ padding: '0 0.5rem' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addFieldRow('phone')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-sky)',
              fontSize: '0.7rem',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            + Add Another Phone
          </button>
        </div>

        {/* Dynamic Multiple Email Addresses Area */}
        <div>
          <label className="form-label">Email Addresses</label>
          {emails.map((email, idx) => (
            <div
              key={idx}
              style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}
            >
              <input
                type="email"
                placeholder="e.g., name@domain.com"
                value={email}
                onChange={(e) =>
                  handleArrayFieldChange(idx, e.target.value, 'email')
                }
                className="form-input"
                style={{
                  backgroundColor: 'white',
                  borderColor: '#e2e8f0',
                  color: '#0f172a',
                }}
              />
              {emails.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeFieldRow(idx, 'email')}
                  className="btn btn-red"
                  style={{ padding: '0 0.5rem' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addFieldRow('email')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-sky)',
              fontSize: '0.7rem',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            + Add Another Email
          </button>
        </div>

        <button
          type="submit"
          className="btn btn-sky"
          style={{ width: '100%', padding: '0.7rem' }}
        >
          {initialValues ? 'Apply Updates' : 'Save Contact'}
        </button>
      </form>
    </div>
  );
}
