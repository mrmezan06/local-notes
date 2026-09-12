import { useState } from 'react';
import { db } from '../../db/database';
import { hashPassword } from '../../utils/crypto';
import { useToast } from '../../context/ToastContext';
import BackupNode from './components/BackupNode';
import BackupModal from './components/BackupModal';
import { Download, Upload } from 'lucide-react';

export default function BackupModule() {
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const localTimestamp = new Date()
    .toLocaleString()
    // eslint-disable-next-line no-useless-escape
    .replace(/[\/:]/g, '-')
    .replace(/,/g, '')
    .replace(/\s+/g, '_');

  const verifyAndDownload = async (username, password) => {
    const account = await db.auth.where({ username }).first();
    if (!account) return false;

    const targetHash = await hashPassword(password);
    if (account.keycheck !== targetHash) return false;

    try {
      const dataPackage = {
        notes: await db.notes.toArray(),
        vault: await db.vault.toArray(),
        contacts: await db.contacts.toArray(),
        timestamp: new Date().toISOString(),
      };

      const dataBlob = new Blob([JSON.stringify(dataPackage, null, 2)], {
        type: 'application/json',
      });
      const downloadUrl = URL.createObjectURL(dataBlob);

      const anchor = document.createElement('a');
      anchor.href = downloadUrl;
      anchor.download = `backup_package_at_${localTimestamp}.json`;
      anchor.click();

      URL.revokeObjectURL(downloadUrl);
      showToast('Database all modules packed.', 'success');
      return true;
    } catch {
      showToast('Failed to generate package file.', 'error');
      return false;
    }
  };

  const handleImportRestore = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileReader = new FileReader();
    fileReader.onload = async (event) => {
      try {
        const payload = JSON.parse(event.target.result);

        if (payload.notes) {
          for (let item of payload.notes) {
            delete item.id;
            await db.notes.add(item);
          }
        }
        if (payload.vault) {
          for (let item of payload.vault) {
            delete item.id;
            await db.vault.add(item);
          }
        }
        if (payload.contacts) {
          for (let item of payload.contacts) {
            delete item.id;
            await db.contacts.add(item);
          }
        }

        showToast(
          'Package appeneded successfully. Sync with system completed.',
          'success',
        );
        setTimeout(() => window.location.reload(), 1500);
      } catch {
        showToast('Invalid system package.', 'error');
      }
    };
    fileReader.readAsText(file);
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
          🔒 System Backup & Restore Center
        </h1>
        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            marginTop: '0.3rem',
            marginLeft: '1.6rem',
          }}
        >
          Export are symmetrically validated in the system. Uploading a backup
          package in the system doesn't override system data [DB].
        </p>
      </div>

      <div className="backup-grid">
        <BackupNode
          title="System Export"
          description="Export all documents, checklists, phonebooks, and password logs into a single package. Requires system credentials to package securely [DB]."
          icon={<Download size={20} />}
          actionText="Download Master Backup"
          actionColor="sky"
          onAction={() => setModalOpen(true)}
          isUpload={false}
        />
        <BackupNode
          title="System Restore Backup"
          description="Upload your backup package to recover data. System didn't override previous data [DB]."
          icon={<Upload size={20} />}
          actionText="Upload System Backup Data"
          actionColor="teal"
          onAction={handleImportRestore}
          isUpload={true}
        />
      </div>

      <BackupModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onVerify={verifyAndDownload}
      />
    </div>
  );
}
