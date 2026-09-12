import { useState } from 'react';
import { Lock, HelpCircle } from 'lucide-react';

export default function VaultGate({
  isVaultConfigured,
  onGateSubmit,
  onRecoveryReset,
}) {
  const [gateInput, setGateInput] = useState('');
  const [isGateRecoverMode, setIsGateRecoverMode] = useState(false);
  const [recoveryToken, setRecoveryToken] = useState('');
  const [newVaultKey, setNewVaultKey] = useState('');

  const handleStandardSubmit = (e) => {
    e.preventDefault();
    onGateSubmit(gateInput);
    setGateInput('');
  };

  const handleRecoverSubmit = (e) => {
    e.preventDefault();
    onRecoveryReset(recoveryToken, newVaultKey);
    setRecoveryToken('');
    setNewVaultKey('');
  };

  return (
    <div className="vault-gate-screen card">
      {!isGateRecoverMode ? (
        <>
          <div className="vault-gate-icon-frame">
            <Lock size={24} />
          </div>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              marginBottom: '0.5rem',
            }}
          >
            Vault Access Locked
          </h2>
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              marginBottom: '1.5rem',
              lineHeight: 1.4,
            }}
          >
            Required Isolated Vault Master Key [DB].
          </p>
          <form
            onSubmit={handleStandardSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
          >
            <input
              type="password"
              placeholder={
                isVaultConfigured ? '*****************' : '*****************'
              }
              required
              value={gateInput}
              onChange={(e) => setGateInput(e.target.value)}
              className="form-input"
              style={{
                backgroundColor: '#f8fafc',
                borderColor: '#e2e8f0',
                color: '#0f172a',
              }}
            />
            <button
              type="submit"
              className="btn btn-sky"
              style={{ padding: '0.7rem' }}
            >
              {isVaultConfigured ? 'Authorize Master Key' : 'Commit Master Key'}
            </button>
          </form>
          {isVaultConfigured && (
            <button
              type="button"
              onClick={() => setIsGateRecoverMode(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '0.7rem',
                cursor: 'pointer',
                marginTop: '1rem',
                backgroundColor: '#056f6c',
                padding: '0.4rem',
                borderRadius: '0.2rem',
              }}
            >
              Lost Vault Key? Recover Vault
            </button>
          )}
        </>
      ) : (
        <>
          <div
            className="vault-gate-icon-frame"
            style={{ backgroundColor: '#fef3c7', color: '#d97706' }}
          >
            <HelpCircle size={24} />
          </div>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              marginBottom: '0.5rem',
            }}
          >
            Recover Vault Access Key
          </h2>
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              marginBottom: '1.5rem',
              lineHeight: 1.4,
            }}
          >
            Required System Emergency Token [DB].
          </p>
          <form
            onSubmit={handleRecoverSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
          >
            <input
              type="text"
              placeholder="Emergency Recovery Token *"
              required
              value={recoveryToken}
              onChange={(e) => setRecoveryToken(e.target.value.toUpperCase())}
              className="form-input"
              style={{
                backgroundColor: '#f8fafc',
                borderColor: '#e2e8f0',
                color: '#0f172a',
                fontFamily: 'monospace',
              }}
            />
            <input
              type="password"
              placeholder="Assign Vault Master Key *"
              required
              value={newVaultKey}
              onChange={(e) => setNewVaultKey(e.target.value)}
              className="form-input"
              style={{
                backgroundColor: '#f8fafc',
                borderColor: '#e2e8f0',
                color: '#0f172a',
              }}
            />
            <div
              style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}
            >
              <button
                type="button"
                onClick={() => setIsGateRecoverMode(false)}
                className="btn"
                style={{
                  backgroundColor: '#e2e8f0',
                  color: '#475569',
                  width: '40%',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-sky"
                style={{ width: '60%' }}
              >
                Override Master Key
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
