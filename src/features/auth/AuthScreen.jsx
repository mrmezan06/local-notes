import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ShieldCheck, ShieldAlert, RefreshCw, Key } from 'lucide-react';

export default function AuthScreen() {
  const {
    hasAccount,
    registerMaster,
    loginMaster,
    resetLoginPasswordWithRecovery,
  } = useAuth();
  const { showToast } = useToast();

  // Credentials Field states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Emergency Display States
  const [generatedRecovery, setGeneratedRecovery] = useState('');
  const [backedUpUsername, setBackedUpUsername] = useState('');
  const [backedUpPassword, setBackedUpPassword] = useState('');

  // Recover Logic Modes
  const [isRecoverMode, setIsRecoverMode] = useState(false);
  const [inputRecoveryToken, setInputRecoveryToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleInitializationSequence = (e) => {
    e.preventDefault();
    if (password.length < 6) {
      return showToast('Password must contain at least 6 characters.', 'error');
    }

    // 1. Generate the emergency 16-character sequence token string
    const token =
      Math.random().toString(36).substring(2, 10).toUpperCase() +
      Math.random().toString(36).substring(2, 10).toUpperCase();

    // 2. Backup inputs locally to prevent them from wiping during the view shift
    setBackedUpUsername(username);
    setBackedUpPassword(password);
    setGeneratedRecovery(token);

    showToast('Secure recovery signature generated.', 'success');
  };

  const handleFinalizeRegistration = async () => {
    try {
      // 3. Commit inputs to local Dexie database only when clicking the confirmation button
      await registerMaster(
        backedUpUsername,
        backedUpPassword,
        generatedRecovery,
      );
      showToast('System Initialization Successfull ...', 'success');
    } catch {
      showToast('System Initialization Failed ...', 'error');
    }
  };

  const handleStandardLogin = async (e) => {
    e.preventDefault();
    const success = await loginMaster(username, password);
    if (success) {
      showToast('System decrypted successfully...', 'success');
    } else {
      showToast('Invalid System parameters mapping entry.', 'error');
    }
  };

  const handleAccountRecovery = async (e) => {
    e.preventDefault();
    const success = await resetLoginPasswordWithRecovery(
      inputRecoveryToken,
      newPassword,
    );
    if (success) {
      showToast('System password updated. Identity authorized.', 'success');
      setIsRecoverMode(false);
      setInputRecoveryToken('');
      setNewPassword('');
    } else {
      showToast('Invalid Recovery Token. Update sequence aborted.', 'error');
    }
  };

  // Critical Fixed View: Render the explicit key backup shield card BEFORE calling registerMaster
  if (generatedRecovery) {
    return (
      <div className="auth-screen">
        <div className="auth-card" style={{ maxWidth: '460px' }}>
          <div className="auth-header">
            <div
              className="auth-icon-wrapper"
              style={{ color: 'var(--color-emerald)' }}
            >
              <Key size={44} />
            </div>
            <h2 className="auth-title">Save Recovery Token</h2>
            <p className="auth-subtitle">
              This token is required to reset your system or vault password.
              Secured it now.
            </p>
          </div>

          <div
            className="recovery-hint-box"
            style={{
              textAlign: 'center',
              fontSize: '1.15rem',
              letterSpacing: '1px',
              fontWeight: 700,
              fontFamily: 'monospace',
              padding: '1.25rem',
            }}
          >
            {generatedRecovery}
          </div>

          <button
            onClick={handleFinalizeRegistration}
            className="btn btn-sky"
            style={{ width: '100%', padding: '0.75rem', fontSize: '0.85rem' }}
          >
            [ I have stored the recovery token, Open System ]
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        {!isRecoverMode ? (
          <>
            <div className="auth-header">
              <div className="auth-icon-wrapper">
                {hasAccount ? (
                  <ShieldCheck size={44} />
                ) : (
                  <ShieldAlert size={44} />
                )}
              </div>
              <h2 className="auth-title">
                {hasAccount ? 'Unlock System' : 'Setup System Identity'}
              </h2>
              <p className="auth-subtitle">
                {hasAccount
                  ? '[ Decrypt your local system database ]'
                  : '[ Initialize zero-knowledge encryption system database ]'}
              </p>
            </div>

            <form
              onSubmit={
                hasAccount ? handleStandardLogin : handleInitializationSequence
              }
            >
              <div className="form-field">
                <label className="form-label">System Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-field">
                <label className="form-label">System Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                />
              </div>
              <button type="submit" className="btn btn-sky btn-auth-submit">
                {hasAccount ? 'Unlock System' : 'Generate Core System Password'}
              </button>
            </form>

            {hasAccount && (
              <button
                onClick={() => setIsRecoverMode(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '0.7rem',
                  display: 'block',
                  margin: '1.5rem auto 0 auto',
                  cursor: 'pointer',
                  backgroundColor: '#056f6c',
                  padding: '0.4rem',
                  borderRadius: '0.2rem',
                }}
              >
                Forgot Password? Recover Account
              </button>
            )}
          </>
        ) : (
          <>
            <div className="auth-header">
              <div className="auth-icon-wrapper" style={{ color: '#f59e0b' }}>
                <RefreshCw size={44} />
              </div>
              <h2 className="auth-title">Reset System Password</h2>
              <p className="auth-subtitle">
                [ Provide your emergency recovery token to override your system
                password. ]
              </p>
            </div>

            <form onSubmit={handleAccountRecovery}>
              <div className="form-field">
                <label className="form-label">Emergency Recovery Token</label>
                <input
                  type="text"
                  placeholder="16-LETTER SYMMETRIC CODE"
                  required
                  value={inputRecoveryToken}
                  onChange={(e) =>
                    setInputRecoveryToken(e.target.value.toUpperCase())
                  }
                  className="form-input"
                  style={{ fontFamily: 'monospace' }}
                />
              </div>
              <div className="form-field">
                <label className="form-label">New System Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-input"
                />
              </div>
              <div
                style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}
              >
                <button
                  type="button"
                  onClick={() => setIsRecoverMode(false)}
                  className="btn"
                  style={{ backgroundColor: '#334155', width: '40%' }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn btn-sky"
                  style={{ width: '60%' }}
                >
                  Reset System Password
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
