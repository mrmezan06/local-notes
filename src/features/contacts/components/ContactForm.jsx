import { useState, useEffect } from 'react';
import { User, ImagePlus } from 'lucide-react';

export default function ContactForm({ onSave, initialValues }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');

  // Fixed Effect: Defers updates to prevent cascading render warnings
  useEffect(() => {
    const handleStateInjection = () => {
      if (initialValues) {
        setName(initialValues.name || '');
        setPhone(initialValues.phone || '');
        setEmail(initialValues.email || '');
        setAvatar(initialValues.avatar || '');
      } else {
        setName('');
        setPhone('');
        setEmail('');
        setAvatar('');
      }
    };

    // Defers execution out of the current synchronous execution timeline
    const microTaskTimer = setTimeout(handleStateInjection, 0);

    return () => clearTimeout(microTaskTimer);
  }, [initialValues]);

  const handleImageConversion = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setAvatar(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !phone) return;
    onSave({ name, phone, email, avatar });
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
        <div>
          <label className="form-label">Phone Number *</label>
          <input
            type="text"
            placeholder="e.g., 017-186-35644"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="form-input"
            style={{
              backgroundColor: 'white',
              borderColor: '#e2e8f0',
              color: '#0f172a',
            }}
          />
        </div>
        <div>
          <label className="form-label">Email Address</label>
          <input
            type="email"
            placeholder="e.g., name@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
            style={{
              backgroundColor: 'white',
              borderColor: '#e2e8f0',
              color: '#0f172a',
            }}
          />
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
