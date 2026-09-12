import { useState } from 'react';
import { db } from '../../db/database';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { hashPassword } from '../../utils/crypto';
import { Settings, Shield, Key, Eye, EyeOff } from 'lucide-react';

export default function SettingsModule() {
  const { logout } = useAuth();
  const { showToast } = useToast();

  // Password Modification field properties state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Emergency Secret Recovery Parameters Token Reset state
  const [recoveryInput, setRecoveryInput] = useState('');
  const [overrideLoginPass, setOverrideLoginPass] = useState('');

  // Individual Visibility Switch states
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showRecoveryToken, setShowRecoveryToken] = useState(false);
  const [showOverridePass, setShowOverridePass] = useState(false);

  const handleUpdateLoginPassword = async (e) => {
    e.preventDefault();
    const account = await db.auth.toCollection().first();
    const verifyOldHash = await hashPassword(oldPassword);

    if (account.keycheck !== verifyOldHash) {
      return showToast('Current workspace password entry invalid.', 'error');
    }

    const hashedNewPass = await hashPassword(newPassword);
    await db.auth.update(account.id, { keycheck: hashedNewPass });

    showToast('Login credentials updated. Please re-authenticate.', 'success');
    setTimeout(() => logout(), 1000);
  };

  const handleSystemWideOverride = async (e) => {
    e.preventDefault();
    const account = await db.auth.toCollection().first();
    const checkRecoveryHash = await hashPassword(recoveryInput);

    if (account.recoveryHash !== checkRecoveryHash) {
      return showToast(
        'Emergency authentication failed: Token rejected.',
        'error',
      );
    }

    const overriddenHash = await hashPassword(overrideLoginPass);
    await db.auth.update(account.id, { keycheck: overriddenHash });

    showToast('Emergency login credentials remapped.', 'success');
    setTimeout(() => logout(), 1000);
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h1
          style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            color: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Settings size={20} style={{ color: 'var(--color-sky)' }} /> Secured
          System Menu
        </h1>
        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            marginTop: '0.25rem',
            marginLeft: '1.8rem',
          }}
        >
          Update system password or reset vault using emergency recovery token
          [DB].
        </p>
      </div>

      <div className="settings-row-grid">
        {/* Left Side: Standard Password Shift Form */}
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
            <Key size={15} style={{ color: 'var(--color-sky)' }} /> Change
            System Password
          </h2>
          <form
            onSubmit={handleUpdateLoginPassword}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            <div>
              <label className="form-label">Current System Password *</label>
              <div className="input-with-toggle-wrapper">
                <input
                  type={showOldPass ? 'text' : 'password'}
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="form-input"
                  style={{
                    backgroundColor: 'white',
                    borderColor: '#e2e8f0',
                    color: '#0f172a',
                  }}
                />
                <button
                  type="button"
                  className="field-visibility-trigger-btn"
                  onClick={() => setShowOldPass(!showOldPass)}
                >
                  {showOldPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label className="form-label">Assign System Password *</label>
              <div className="input-with-toggle-wrapper">
                <input
                  type={showNewPass ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-input"
                  style={{
                    backgroundColor: 'white',
                    borderColor: '#e2e8f0',
                    color: '#0f172a',
                  }}
                />
                <button
                  type="button"
                  className="field-visibility-trigger-btn"
                  onClick={() => setShowNewPass(!showNewPass)}
                >
                  {showNewPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-sky"
              style={{ width: '100%', padding: '0.65rem', marginTop: '0.5rem' }}
            >
              Update System Password
            </button>
          </form>
        </div>

        {/* Right Side: Emergency Override Form with Yellow Theme matching your Mockup */}
        <div
          className="card"
          style={{ backgroundColor: '#fffbeb', borderColor: '#fef3c7' }}
        >
          <h2
            style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
              borderBottom: '1px solid #fde68a',
              paddingBottom: '0.5rem',
              color: '#92400e',
            }}
          >
            <Shield size={15} style={{ color: '#d97706' }} /> Emergency Vault
            Password Recovery
          </h2>
          <form
            onSubmit={handleSystemWideOverride}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            <div>
              <label className="form-label" style={{ color: '#92400e' }}>
                Emergency Recovery Token *
              </label>
              <div className="input-with-toggle-wrapper">
                <input
                  type={showRecoveryToken ? 'text' : 'password'}
                  required
                  value={recoveryInput}
                  onChange={(e) =>
                    setRecoveryInput(e.target.value.toUpperCase())
                  }
                  className="form-input"
                  style={{
                    backgroundColor: 'white',
                    borderColor: '#fcd34d',
                    color: '#0f172a',
                    fontFamily: 'monospace',
                  }}
                />
                <button
                  type="button"
                  className="field-visibility-trigger-btn"
                  onClick={() => setShowRecoveryToken(!showRecoveryToken)}
                >
                  {showRecoveryToken ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label className="form-label" style={{ color: '#92400e' }}>
                Assign Vault Password *
              </label>
              <div className="input-with-toggle-wrapper">
                <input
                  type={showOverridePass ? 'text' : 'password'}
                  required
                  value={overrideLoginPass}
                  onChange={(e) => setOverrideLoginPass(e.target.value)}
                  className="form-input"
                  style={{
                    backgroundColor: 'white',
                    borderColor: '#fcd34d',
                    color: '#0f172a',
                  }}
                />
                <button
                  type="button"
                  className="field-visibility-trigger-btn"
                  onClick={() => setShowOverridePass(!showOverridePass)}
                >
                  {showOverridePass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn"
              style={{
                width: '100%',
                padding: '0.65rem',
                backgroundColor: '#d97706',
                color: 'white',
                marginTop: '0.5rem',
              }}
            >
              Override Vault Passwords
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
