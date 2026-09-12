/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from 'react';
import { db } from '../../db/database';
import { useToast } from '../../context/ToastContext';

// Import Modular Presentation Sub-Components
import TrashHeaderBar from './components/TrashHeaderBar';
import EmptyTrashView from './components/EmptyTrashView';
import TrashRowItem from './components/TrashRowItem';

export default function TrashModule() {
  const { showToast } = useToast();
  const [trashPile, setTrashPile] = useState([]);

  // 1. Data Retrieval: Gathers soft-deleted items across tables safely
  const loadTrashRecords = useCallback(async () => {
    try {
      const deletedNotes = (
        await db.notes.where({ isDeleted: 1 }).toArray()
      ).map((note) => ({
        id: note.id,
        sourceTable: 'notes',
        displayTitle: note.title,
      }));

      const deletedVault = (
        await db.vault.where({ isDeleted: 1 }).toArray()
      ).map((vault) => ({
        id: vault.id,
        sourceTable: 'vault',
        displayTitle: vault.label,
      }));

      const deletedContacts = (
        await db.contacts.where({ isDeleted: 1 }).toArray()
      ).map((contact) => ({
        id: contact.id,
        sourceTable: 'contacts',
        displayTitle: contact.name,
      }));

      setTrashPile([...deletedNotes, ...deletedVault, ...deletedContacts]);
    } catch {
      // Fail silently without breaking the UI render threads
    }
  }, []);

  useEffect(() => {
    loadTrashRecords();
  }, [loadTrashRecords]);

  // 2. Single Item Actions
  const handleRestoreRecord = async (item) => {
    if (item.sourceTable === 'notes')
      await db.notes.update(item.id, { isDeleted: 0 });
    if (item.sourceTable === 'vault')
      await db.vault.update(item.id, { isDeleted: 0 });
    if (item.sourceTable === 'contacts')
      await db.contacts.update(item.id, { isDeleted: 0 });
    showToast(
      `"${item.displayTitle}" restored to active workspace.`,
      'success',
    );
    loadTrashRecords();
  };

  const handleHardDeleteRecord = async (item) => {
    if (item.sourceTable === 'notes') await db.notes.delete(item.id);
    if (item.sourceTable === 'vault') await db.vault.delete(item.id);
    if (item.sourceTable === 'contacts') await db.contacts.delete(item.id);
    showToast(
      `"${item.displayTitle}" permanently erased from database.`,
      'error',
    );
    loadTrashRecords();
  };

  // 3. Global Bulk Recovery Operation [INDEX]
  const handleRestoreAllTrash = async () => {
    if (trashPile.length === 0) return;

    try {
      // Remap all soft-deleted records back to an active state (0) [INDEX]
      const notesToRestore = await db.notes.where({ isDeleted: 1 }).toArray();
      for (let note of notesToRestore) {
        await db.notes.update(note.id, { isDeleted: 0 });
      }

      const vaultToRestore = await db.vault.where({ isDeleted: 1 }).toArray();
      for (let item of vaultToRestore) {
        await db.vault.update(item.id, { isDeleted: 0 });
      }

      const contactsToRestore = await db.contacts
        .where({ isDeleted: 1 })
        .toArray();
      for (let contact of contactsToRestore) {
        await db.contacts.update(contact.id, { isDeleted: 0 });
      }

      showToast(
        `Successfully restored all ${trashPile.length} entries to live workspaces.`,
        'success',
      );
      loadTrashRecords();
    } catch (error) {
      showToast('An error occurred during bulk database recovery.', 'error');
    }
  };

  // 4. Global Bulk Permanent Purge Operation
  const handleEmptyAllTrash = async () => {
    if (trashPile.length === 0) return;

    const doubleCheck = confirm(
      `Are you absolutely sure you want to permanently destroy all ${trashPile.length} items from your browser storage? This cannot be undone.`,
    );
    if (!doubleCheck) return;

    try {
      await db.notes.where({ isDeleted: 1 }).delete();
      await db.vault.where({ isDeleted: 1 }).delete();
      await db.contacts.where({ isDeleted: 1 }).delete();

      showToast(
        `Successfully emptied the trash bin (${trashPile.length} records purged).`,
        'success',
      );
      loadTrashRecords();
    } catch (error) {
      showToast(
        'An error occurred while clearing out database clusters.',
        'error',
      );
    }
  };

  return (
    <div>
      {/* Clean Modular Header Controller Component */}
      <TrashHeaderBar
        trashCount={trashPile.length}
        onRestoreAll={handleRestoreAllTrash}
        onEmptyAll={handleEmptyAllTrash}
      />

      {/* Conditional Content Layout Split */}
      {trashPile.length === 0 ? (
        <EmptyTrashView />
      ) : (
        <div className="trash-list-container">
          {trashPile.map((item, idx) => (
            <TrashRowItem
              key={`${item.sourceTable}-${item.id}-${idx}`}
              item={item}
              onRestore={handleRestoreRecord}
              onPurge={handleHardDeleteRecord}
            />
          ))}
        </div>
      )}
    </div>
  );
}
