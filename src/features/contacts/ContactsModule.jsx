/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { db } from '../../db/database';
import { useToast } from '../../context/ToastContext';
import { buildVCFString, parseVCFString } from '../../utils/vcfHelper';
import { scanForDuplicateContacts } from '../../utils/dedupeEngine';
import { useContactSearch } from './hooks/useContactSearch';

// Import New Sub-Component Framework Drivers
import ContactHeaderBar from './components/ContactHeaderBar';
import ContactSelectionBar from './components/ContactSelectionBar';
import ContactForm from './components/ContactForm';
import ContactCard from './components/ContactCard';
import ContactSearchBar from './components/ContactSearchBar';
import EmptyContactResults from './components/EmptyContactResults';
import MergeModal from './components/MergeModal';
import { X } from 'lucide-react';

export default function ContactsModule() {
  const { showToast } = useToast();
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [editingContact, setEditingContact] = useState(null);

  // Scan & Merge Engine States
  const [conflictGroups, setConflictGroups] = useState([]);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);

  // Hook Connection: Handles lookups dynamically
  const filteredContacts = useContactSearch(contacts, searchQuery);

  const loadContacts = async () => {
    const list = await db.contacts.where({ isDeleted: 0 }).toArray();
    setContacts(list);
  };

  const handleTriggerDeduplicationScan = () => {
    const duplicates = scanForDuplicateContacts(contacts);
    showToast(`Scan complete!`, 'success');
    showToast(
      `Total ${contacts.length} contacts scanned. Duplicated contacts count: ${duplicates.length}`,
    );
    if (duplicates.length === 0) {
      console.log('No Duplicates Contacts.');
    } else {
      setConflictGroups(duplicates);
      setIsMergeModalOpen(true);
    }
  };

  const handleConfirmMergeResolution = async ({ sourceIds, mergedPayload }) => {
    for (let id of sourceIds) {
      await db.contacts.delete(id);
    }
    await db.contacts.add(mergedPayload);
    showToast(`Merged entries into unified record in the system.`, 'success');
    loadContacts();
  };

  const handleExportAllContactsVCF = () => {
    if (contacts.length === 0)
      return showToast('No contacts available to export.', 'warning');
    const vcfPayload = buildVCFString(contacts);
    const blob = new Blob([vcfPayload], { type: 'text/vcard;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = blobUrl;
    anchor.download = `full_addressbook_export.vcf`;
    anchor.click();
    URL.revokeObjectURL(blobUrl);
    showToast(
      `${contacts.length} contacts exported from the system.`,
      'success',
    );
  };

  const handleCreateOrUpdateContact = async (contactPayload) => {
    if (editingContact) {
      await db.contacts.update(editingContact.id, contactPayload);
      showToast('Contact updated in the system.', 'success');
      setEditingContact(null);
    } else {
      await db.contacts.add({ ...contactPayload, isDeleted: 0 });
      showToast('Contact saved in the system.', 'success');
    }
    loadContacts();
  };

  const softDelete = async (id) => {
    await db.contacts.update(id, { isDeleted: 1 });
    setSelectedIds((prev) => prev.filter((x) => x !== id));
    showToast('Contact removed from system.', 'warning');
    loadContacts();
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const selectAll = () => setSelectedIds(filteredContacts.map((c) => c.id));
  const deselectAll = () => setSelectedIds([]);

  const deleteSelected = async () => {
    for (let id of selectedIds) {
      await db.contacts.update(id, { isDeleted: 1 });
    }
    showToast(`${selectedIds.length} contacts removed from system.`, 'warning');
    setSelectedIds([]);
    loadContacts();
  };

  const exportSelectedVCF = () => {
    const targetContacts = contacts.filter((c) => selectedIds.includes(c.id));
    const vcfPayload = buildVCFString(targetContacts);
    const blob = new Blob([vcfPayload], { type: 'text/vcard;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = blobUrl;
    anchor.download = `Number_of_contacts_${selectedIds.length}.vcf`;
    anchor.click();
    URL.revokeObjectURL(blobUrl);
    showToast(
      `${selectedIds.length} contacts exported from the system.`,
      'success',
    );
  };

  const importVCFFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileReader = new FileReader();
    fileReader.onload = async (event) => {
      try {
        const parsed = parseVCFString(event.target.result);
        if (parsed.length === 0)
          return showToast(
            'No contacts found in imported(.vcf) file.',
            'warning',
          );
        for (let newContact of parsed) {
          await db.contacts.add(newContact);
        }
        showToast(
          `${parsed.length} contacts imported in the system.`,
          'success',
        );
        loadContacts();
      } catch {
        showToast('Error reading imported(.vcf) file.', 'error');
      }
    };
    fileReader.readAsText(file);
    e.target.value = '';
  };

  useEffect(() => {
    loadContacts();
  }, []);

  return (
    <div>
      {/* 1. Modular Header Controller Component */}
      <ContactHeaderBar
        totalCount={contacts.length}
        onTriggerScan={handleTriggerDeduplicationScan}
        onExportAll={handleExportAllContactsVCF}
        onImportVCF={importVCFFile}
      />

      {/* 2. Floating Bulk Selection Operations Ribbon Component */}
      {selectedIds.length > 0 && (
        <ContactSelectionBar
          selectedCount={selectedIds.length}
          isAllMarked={selectedIds.length === filteredContacts.length}
          onSelectAll={selectAll}
          onDeselectAll={deselectAll}
          onExportSelected={exportSelectedVCF}
          onDeleteSelected={deleteSelected}
        />
      )}

      {/* 3. Primary Workspace Grid Layout */}
      <div className="contacts-layout-grid">
        <div>
          {editingContact && (
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
              <span>Editing: {editingContact.name}</span>
              <X
                size={14}
                style={{ cursor: 'pointer' }}
                onClick={() => setEditingContact(null)}
              />
            </div>
          )}
          <ContactForm
            onSave={handleCreateOrUpdateContact}
            initialValues={editingContact}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <ContactSearchBar value={searchQuery} onChange={setSearchQuery} />

          {contacts.length === 0 ? (
            <div
              className="card"
              style={{
                borderStyle: 'dashed',
                textAlign: 'center',
                padding: '4rem',
                color: 'var(--text-muted)',
                fontStyle: 'italic',
                fontSize: '0.85rem',
              }}
            >
              No local contact stored in the system yet.
            </div>
          ) : filteredContacts.length === 0 ? (
            <EmptyContactResults />
          ) : (
            <div className="contacts-cards-grid">
              {filteredContacts.map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  isSelected={selectedIds.includes(contact.id)}
                  onToggleSelect={toggleSelect}
                  onEdit={setEditingContact}
                  onDelete={softDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Modular Deduplication Modal Overlay */}
      <MergeModal
        isOpen={isMergeModalOpen}
        conflictGroups={conflictGroups}
        onClose={() => setIsMergeModalOpen(false)}
        onConfirmMerge={handleConfirmMergeResolution}
      />
    </div>
  );
}
