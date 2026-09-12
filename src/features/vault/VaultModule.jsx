/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from 'react';
import { db } from '../../db/database';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { encryptData, decryptData } from '../../utils/crypto';
import { parseVaultCSV } from '../../utils/csvParser';
import { buildVaultCSVString } from '../../utils/csvBuilder';
import { useVaultSearch } from './hooks/useVaultSearch';

import VaultGate from './components/VaultGate';
import VaultHeaderBar from './components/VaultHeaderBar';
import VaultSelectionBar from './components/VaultSelectionBar';
import VaultLogForm from './components/VaultLogForm';
import VaultRecordRow from './components/VaultRecordRow';
import { Search, X } from 'lucide-react';

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
  const [selectedIds, setSelectedIds] = useState([]);

  // Edit mode tracking state
  const [editingRecord, setEditingContact] = useState(null);

  const filteredLogs = useVaultSearch(records, search);

  const localTimestamp = new Date()
    .toLocaleString()
    // eslint-disable-next-line no-useless-escape
    .replace(/[\/:]/g, '-')
    .replace(/,/g, '')
    .replace(/\s+/g, '_');

  const loadVault = useCallback(async () => {
    if (!vaultPassword) return;
    try {
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
    } catch {
      // Fail silently
    }
  }, [vaultPassword]);

  useEffect(() => {
    if (vaultPassword) loadVault();
  }, [vaultPassword, loadVault]);

  // Handle both dynamic new row entries or existing encryption modifications [INDEX]
  const handleAddRecord = async (formPayload) => {
    try {
      const encryptedCipher = await encryptData(
        JSON.stringify(formPayload),
        vaultPassword,
      );

      if (editingRecord) {
        // Modify the entry in your local database [INDEX]
        await db.vault.update(editingRecord.id, {
          label: formPayload.name,
          encryptedCipher,
        });
        showToast('Password record modified successfully.', 'success');
        setEditingContact(null);
      } else {
        // Create an entirely new row index [INDEX]
        await db.vault.add({
          label: formPayload.name,
          encryptedCipher,
          isDeleted: 0,
        });
        showToast('Log committed to vault ledger.', 'success');
      }
      loadVault();
    } catch {
      showToast('Encryption write transaction failed.', 'error');
    }
  };

  const softDelete = async (id) => {
    await db.vault.update(id, { isDeleted: 1 });
    setSelectedIds((prev) => prev.filter((x) => x !== id));
    showToast('Record moved to trash bin.', 'warning');
    loadVault();
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const selectAllFiltered = () => {
    setSelectedIds(filteredLogs.map((r) => r.id));
  };

  const triggerCSVDownloadStream = (targetArray, filename) => {
    const csvContent = buildVaultCSVString(targetArray);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportSelectedCSV = () => {
    const targets = records.filter((r) => selectedIds.includes(r.id));
    triggerCSVDownloadStream(
      targets,
      `selected_${selectedIds.length}_passwords_exported_at_${localTimestamp}.csv`,
    );
  };

  // Place this method directly under your clearSelectionArrays() block:
  const handleDeleteSelectedBulk = async () => {
    if (selectedIds.length === 0) return;

    try {
      for (let id of selectedIds) {
        await db.vault.update(id, { isDeleted: 1 });
      }
      showToast(
        `Bulk complete: ${selectedIds.length} records moved to Trash Bin.`,
        'warning',
      );
      setSelectedIds([]); // Clear selection check states array cleanly
      loadVault();
    } catch {
      showToast('A bulk operation database write error occurred.', 'error');
    }
  };

  const handleExportAllFullCSV = () => {
    if (records.length === 0)
      return showToast('No data available to export.', 'warning');

    triggerCSVDownloadStream(
      records,
      `full_vault_exported_at_${localTimestamp}.csv`,
    );

    showToast('All secrets packaged and downloaded safely.', 'success');
  };

  const handleImportCSVPasswords = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !vaultPassword) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsedAccounts = parseVaultCSV(event.target.result);
        if (parsedAccounts.length === 0)
          return showToast('No valid account founded!', 'warning');
        for (let account of parsedAccounts) {
          const cipherPayload = {
            url: account.url,
            username: account.username,
            accountPassword: account.password,
            metadata: account.metadata,
          };
          const encryptedCipher = await encryptData(
            JSON.stringify(cipherPayload),
            vaultPassword,
          );
          await db.vault.add({
            label: account.name,
            encryptedCipher,
            isDeleted: 0,
          });
        }
        showToast(
          `Successfully imported ${parsedAccounts.length} accounts.`,
          'success',
        );
        loadVault();
      } catch {
        showToast('Error parsing file layout framework.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleGateKeyValidation = async (inputKey) => {
    if (!isVaultConfigured) {
      if (inputKey.length < 6) {
        return showToast(
          'Vault master key must contain at least 6 characters.',
          'error',
        );
      }
      try {
        await configureVaultKey(inputKey);
        showToast('Vault master key initialized successfully.', 'success');
        loadVault();
      } catch {
        showToast('Failed to write vault master key.', 'error');
      }
    } else {
      try {
        const authorized = await unlockVault(inputKey);
        if (authorized) {
          showToast('Vault Unlocked With Master Key.', 'success');
          loadVault();
        } else {
          showToast('Invalid vault master key.', 'error');
        }
      } catch {
        showToast('System encryption validation stucked', 'error');
      }
    }
  };

  if (!vaultPassword) {
    return (
      <VaultGate
        isVaultConfigured={isVaultConfigured}
        onGateSubmit={handleGateKeyValidation}
        onRecoveryReset={resetVaultKeyWithRecovery}
      />
    );
  }

  return (
    <div>
      <VaultHeaderBar
        totalCount={records.length}
        onExportAll={handleExportAllFullCSV}
        onImportCSV={handleImportCSVPasswords}
      />

      {selectedIds.length > 0 && (
        <VaultSelectionBar
          selectedCount={selectedIds.length}
          isAllMarked={selectedIds.length === filteredLogs.length}
          onSelectAll={selectAllFiltered}
          onDeselectAll={() => setSelectedIds([])}
          onExportSelected={handleExportSelectedCSV}
          onDeleteSelected={handleDeleteSelectedBulk}
        />
      )}

      <div className="vault-layout-grid">
        <div className="vault-sidebar-stack">
          {/* Active Edit Context Indicator Row Banner */}
          {editingRecord && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                backgroundColor: '#f0f9ff',
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid #bae6fd',
                fontSize: '0.7rem',
                color: '#0369a1',
                fontWeight: 600,
                marginBottom: '0.5rem',
                alignItems: 'center',
              }}
            >
              <span>Editing: {editingRecord.label}</span>
              <X
                size={14}
                style={{ cursor: 'pointer' }}
                onClick={() => setEditingContact(null)}
              />
            </div>
          )}
          <VaultLogForm
            onCommit={handleAddRecord}
            initialValues={editingRecord}
          />
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
              <VaultRecordRow
                key={item.id}
                item={item}
                isSelected={selectedIds.includes(item.id)}
                onToggleSelect={toggleSelect}
                onEdit={setEditingContact}
                onDelete={softDelete}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
