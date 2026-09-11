import { useState } from 'react';
import { Key, Eye, EyeOff } from 'lucide-react';

export default function VaultLogForm({ onCommit }) {
  const [url, setUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [metadata, setMetadata] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url || !username || !password) return;
    onCommit({ url, username, password, metadata });
    setUrl('');
    setUsername('');
    setPassword('');
    setMetadata('');
  };

  return (
    <div className="card">
      <h2
        style={{
          fontSize: '0.85rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1rem',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '0.5rem',
        }}
      >
        <Key
          size={16}
          className="text-sky"
          style={{ color: 'var(--color-sky)' }}
        />{' '}
        Add Secure Log
      </h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        <div>
          <label className="form-label">URL / App Identifier *</label>
          <input
            type="text"
            placeholder="e.g., github.com"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="form-input"
            style={{
              backgroundColor: 'white',
              borderColor: '#e2e8f0',
              color: '#0f172a',
            }}
          />
        </div>
        <div>
          <label className="form-label">Username / Email Address *</label>
          <input
            type="text"
            placeholder="e.g., user@domain.com"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="form-input"
            style={{
              backgroundColor: 'white',
              borderColor: '#e2e8f0',
              color: '#0f172a',
            }}
          />
        </div>
        <div>
          <label className="form-label">Secure Password *</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPass ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              style={{
                backgroundColor: 'white',
                borderColor: '#e2e8f0',
                color: '#0f172a',
                paddingRight: '2.5rem',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="btn-icon-toggle"
              style={{ position: 'absolute', right: '10px', top: '10px' }}
            >
              {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
        <div>
          <label className="form-label">Secure Metadata Notes</label>
          <textarea
            placeholder="Recovery key codes, pins..."
            value={metadata}
            onChange={(e) => setMetadata(e.target.value)}
            className="form-input"
            style={{
              backgroundColor: 'white',
              borderColor: '#e2e8f0',
              color: '#0f172a',
              height: '60px',
              resize: 'none',
            }}
          />
        </div>
        <button
          type="submit"
          className="btn btn-sky"
          style={{ width: '100%', padding: '0.7rem' }}
        >
          + Commit Account
        </button>
      </form>
    </div>
  );
}
