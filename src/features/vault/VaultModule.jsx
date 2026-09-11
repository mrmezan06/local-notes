/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from 'react';
import { db } from '../../db/database';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { encryptData, decryptData } from '../../utils/crypto';
import { parseVaultCSV } from '../../utils/csvParser'; // Import the CSV engine
import VaultLogForm from './components/VaultLogForm';
import VaultRecordRow from './components/VaultRecordRow';
import { Search, Lock, HelpCircle, FileSpreadsheet } from 'lucide-react';

export default function VaultModule() {
  const {
    vaultPassword,
    isVaultConfigured,
    configureVaultKey,
    unlockVault,
    resetVaultKeyWithRecovery,
  } = useAuth();
  const { showToast } = useToast();
  
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');
  
  const [gateInput, setGateInput] = useState('');
  const [isGateRecoverMode, setIsGateRecoverMode] = useState(false);
  const [recoveryToken, setRecoveryToken] = useState('');
  const [newVaultKey, setNewVaultKey] = useState('');

  const loadVault = useCallback(async () => {
    if (!vaultPassword) return;
    const list = await db.vault.where({ isDeleted: 0 }).toArray();
    const decryptedList = await Promise.all(
      list.map(async (item) => {
        try {
          const decryptedStr = await decryptData(
            item.encryptedCipher,
            vaultPassword,
          );
          return { ...item, secret: JSON.parse(decryptedStr) };
        } catch (e) {
          return {
            ...item,
            secret: {
              url: 'Decryption Error',
              username: '',
              password: '',
              metadata: '',
            },
          };
        }
      }),
    );
    setRecords(decryptedList);
  }, [vaultPassword]);

  useEffect(() => {
    if (vaultPassword) loadVault();
  }, [vaultPassword, loadVault]);

  const handleGateSubmit = async (e) => {
    e.preventDefault();
    if (!isVaultConfigured) {
      if (gateInput.length < 6)
        return showToast('Vault key must be 6+ characters.', 'error');
      await configureVaultKey(gateInput);
      showToast('Vault password configured.', 'success');
    } else {
      const authorized = await unlockVault(gateInput);
      if (authorized) {
        showToast('Vault Chamber Unlocked.', 'success');
      } else {
        showToast('Invalid Vault Master Key.', 'error');
      }
    }
    setGateInput('');
  };

  const handleVaultRecoveryReset = async (e) => {
    e.preventDefault();
    const success = await resetVaultKeyWithRecovery(recoveryToken, newVaultKey);
    if (success) {
      showToast('Vault Master key reset successfully.', 'success');
      setIsGateRecoverMode(false);
      setRecoveryToken('');
      setNewVaultKey('');
    } else {
      showToast('Invalid recovery token authentication parameters.', 'error');
    }
  };

  const handleAddRecord = async (formPayload) => {
    const encryptedCipher = await encryptData(
      JSON.stringify(formPayload),
      vaultPassword,
    );
    await db.vault.add({
      label: formPayload.url,
      encryptedCipher,
      isDeleted: 0,
    });
    showToast('Log committed to vault ledger.', 'success');
    loadVault();
  };

  // CSV Ingestion Handler
  const handleImportCSVPasswords = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !vaultPassword) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsedAccounts = parseVaultCSV(event.target.result);
        if (parsedAccounts.length === 0) {
          return showToast(
            'No valid accounts found. Ensure headers contain URL, Username, and Password columns.',
            'warning',
          );
        }

        let importSuccessCount = 0;

        // Loop and independently encrypt each entry using your specific vault password
        for (let account of parsedAccounts) {
          const cipherPayload = {
            url: account.url,
            username: account.username,
            accountPassword: account.password, // map back to form values structure
            metadata: account.metadata,
          };

          const encryptedCipher = await encryptData(
            JSON.stringify(cipherPayload),
            vaultPassword,
          );
          await db.vault.add({
            label: account.url,
            encryptedCipher,
            isDeleted: 0,
          });
          importSuccessCount++;
        }

        showToast(
          `Successfully processed and encrypted ${importSuccessCount} accounts.`,
          'success',
        );
        loadVault();
      } catch (err) {
        showToast(
          'Error parsing file layout. Ensure it is a valid CSV formatting stream.',
          'error',
        );
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Clear file element target reference
  };

  const softDelete = async (id) => {
    await db.vault.update(id, { isDeleted: 1 });
    showToast('Record moved to trash bin.', 'warning');
    loadVault();
  };

  if (!vaultPassword) {
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
              Chamber Access Locked
            </h2>
            <p
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                marginBottom: '1.5rem',
                lineHeight: 1.4,
              }}
            >
              Provide your isolated Vault Master Key to load passwords context
              [INDEX].
            </p>
            <form
              onSubmit={handleGateSubmit}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <input
                type="password"
                placeholder={
                  isVaultConfigured
                    ? 'Enter Vault Master Key *'
                    : 'Configure Vault Master Key *'
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
                {isVaultConfigured
                  ? 'Authorize Cryptography Key'
                  : 'Commit Configuration Map'}
              </button>
            </form>
            {isVaultConfigured && (
              <button
                onClick={() => setIsGateRecoverMode(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                  marginTop: '1rem',
                  textDecoration: 'underline',
                }}
              >
                Lost Vault Key? Recover Chamber
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
              Recover Vault Access
            </h2>
            <p
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                marginBottom: '1.5rem',
                lineHeight: 1.4,
              }}
            >
              Provide your system-wide 16-character Emergency Recovery Token to
              configure a new Vault Master key.
            </p>
            <form
              onSubmit={handleVaultRecoveryReset}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <input
                type="text"
                placeholder="Workspace Emergency Recovery Token"
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
                placeholder="New Vault Master Key *"
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
                  Override Key
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    );
  }

  const filteredLogs = records.filter(
    (r) =>
      r.label.toLowerCase().includes(search.toLowerCase()) ||
      r.secret.username.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      {/* Vault Dashboard Info Header Bar */}
      <div className="vault-header-actions-row">
        <div>
          <h2
            style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color: '#0f172a',
              margin: 0,
            }}
          >
            📦 Secured Password Chamber
          </h2>
          <p
            style={{
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              marginTop: '0.15rem',
              margin: 0,
            }}
          >
            Total active credentials: <strong>{records.length} items</strong>.
          </p>
        </div>

        {/* Bulk Password CSV File Upload trigger */}
        <label
          className="btn btn-teal"
          style={{
            cursor: 'pointer',
            fontSize: '0.72rem',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <FileSpreadsheet size={14} /> Bulk Import CSV Passwords
          <input
            type="file"
            accept=".csv"
            onChange={handleImportCSVPasswords}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      <div className="vault-layout-grid">
        <div className="vault-sidebar-stack">
          <VaultLogForm onCommit={handleAddRecord} />
        </div>
        <div>
          <div className="vault-search-bar">
            <Search size={16} style={{ color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search localized secrets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="vault-search-input"
            />
          </div>
          <div className="vault-records-stack">
            {filteredLogs.map((item) => (
              <VaultRecordRow key={item.id} item={item} onDelete={softDelete} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
