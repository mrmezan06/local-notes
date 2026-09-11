import { useState, useEffect } from 'react';
import { db } from '../../db/database';
import { useToast } from '../../context/ToastContext';
import TrashRowItem from './components/TrashRowItem';
import { Trash2 } from 'lucide-react';

export default function TrashModule() {
  const { showToast } = useToast();
  const [trashPile, setTrashPile] = useState([]);

  const loadTrashRecords = async () => {
    const deletedNotes = (await db.notes.where({ isDeleted: 1 }).toArray()).map(
      (note) => ({
        id: note.id,
        sourceTable: 'notes',
        displayTitle: note.title,
      }),
    );

    const deletedVault = (await db.vault.where({ isDeleted: 1 }).toArray()).map(
      (vault) => ({
        id: vault.id,
        sourceTable: 'vault',
        displayTitle: vault.label,
      }),
    );

    const deletedContacts = (
      await db.contacts.where({ isDeleted: 1 }).toArray()
    ).map((contact) => ({
      id: contact.id,
      sourceTable: 'contacts',
      displayTitle: contact.name,
    }));

    setTrashPile([...deletedNotes, ...deletedVault, ...deletedContacts]);
  };

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
    showToast(`"${item.displayTitle}" permanently erased.`, 'error');
    loadTrashRecords();
  };

  // Bulk operation to empty the entire trash collection instantly
  const handleEmptyAllTrash = async () => {
    if (trashPile.length === 0) return;

    try {
      // Find and purge all matching records with isDeleted set to 1
      await db.notes.where({ isDeleted: 1 }).delete();
      await db.vault.where({ isDeleted: 1 }).delete();
      await db.contacts.where({ isDeleted: 1 }).delete();

      showToast(
        `Successfully emptied the trash bin (${trashPile.length} records purged).`,
        'success',
      );
      loadTrashRecords();
    } catch (error) {
      console.log(error);
      showToast(
        'An error occurred while clearing out database clusters.',
        'error',
      );
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTrashRecords();
  }, []);

  return (
    <div>
      <div className="card trash-header-layout">
        <div>
          <h1
            style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              margin: 0,
            }}
          >
            <Trash2 size={20} style={{ color: 'var(--color-red)' }} /> Workspace
            Trash Bin
          </h1>
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              marginTop: '0.25rem',
              margin: 0,
            }}
          >
            Review soft-deleted entries. Restore items instantly back to their
            respective sections, or delete them permanently from the browser
            sandbox storage.
          </p>
        </div>

        {/* Dynamic Empty Trash control button element */}
        {trashPile.length > 0 && (
          <button
            onClick={handleEmptyAllTrash}
            className="btn btn-purge-bulk"
            style={{ borderRadius: 'var(--radius-md)' }}
          >
            <Trash2 size={13} /> Empty Trash
          </button>
        )}
      </div>

      {trashPile.length === 0 ? (
        <div
          className="card"
          style={{
            borderStyle: 'dashed',
            textAlign: 'center',
            padding: '5rem',
            color: 'var(--text-muted)',
            fontStyle: 'italic',
            fontSize: '0.85rem',
            marginTop: '1.5rem',
          }}
        >
          <Trash2
            size={28}
            style={{ color: '#e2e8f0', marginBottom: '0.5rem' }}
          />
          The local trash bin is empty.
        </div>
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
