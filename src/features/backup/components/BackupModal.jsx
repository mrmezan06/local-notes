import { useState } from 'react';
import { Lock } from 'lucide-react';

export default function BackupModal({ isOpen, onClose, onVerify }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const success = await onVerify(username, password);
    if (!success) {
      setError('Invalid local account verification credentials.');
    } else {
      setUsername('');
      setPassword('');
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header-row">
          <Lock size={16} style={{ color: 'var(--color-sky)' }} /> Verify Master
          Credentials
        </div>

        {error && (
          <div
            className="auth-error"
            style={{ padding: '0.5rem', fontSize: '0.75rem' }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
        >
          <div>
            <label className="form-label">Username</label>
            <input
              type="text"
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
            <label className="form-label">Master Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              style={{
                backgroundColor: 'white',
                borderColor: '#e2e8f0',
                color: '#0f172a',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn"
              style={{
                backgroundColor: '#f1f5f9',
                color: '#64748b',
                width: '50%',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-sky"
              style={{ width: '50%' }}
            >
              Verify & Pack
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
