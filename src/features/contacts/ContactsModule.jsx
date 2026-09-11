/* eslint-disable react-hooks/immutability */
import { useState, useEffect } from 'react';
import { db } from '../../db/database';
import { useToast } from '../../context/ToastContext';
import { buildVCFString, parseVCFString } from '../../utils/vcfHelper';
import { useContactSearch } from './hooks/useContactSearch';
import ContactForm from './components/ContactForm';
import ContactCard from './components/ContactCard';
import ContactSearchBar from './components/ContactSearchBar';
import EmptyContactResults from './components/EmptyContactResults';
import { Download, Upload, CheckSquare, Square, Trash2, X } from 'lucide-react';

export default function ContactsModule() {
  const { showToast } = useToast();
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState(''); // Live search string state
  const [selectedIds, setSelectedIds] = useState([]);
  const [editingContact, setEditingContact] = useState(null);

  // Hook Connection: Automatically processes contact matches in real time
  const filteredContacts = useContactSearch(contacts, searchQuery);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    const list = await db.contacts.where({ isDeleted: 0 }).toArray();
    setContacts(list);
  };

  const handleCreateOrUpdateContact = async (contactPayload) => {
    if (editingContact) {
      await db.contacts.update(editingContact.id, contactPayload);
      showToast('Contact card updated successfully.', 'success');
      setEditingContact(null);
    } else {
      await db.contacts.add({ ...contactPayload, isDeleted: 0 });
      showToast('New contact saved.', 'success');
    }
    loadContacts();
  };

  const softDelete = async (id) => {
    await db.contacts.update(id, { isDeleted: 1 });
    setSelectedIds((prev) => prev.filter((x) => x !== id));
    showToast('Contact moved to Trash Bin.', 'warning');
    loadContacts();
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const selectAll = () => {
    setSelectedIds(filteredContacts.map((c) => c.id));
  };

  const deselectAll = () => {
    setSelectedIds([]);
  };

  const deleteSelected = async () => {
    if (selectedIds.length === 0) return;
    for (let id of selectedIds) {
      await db.contacts.update(id, { isDeleted: 1 });
    }
    showToast(
      `Bulk processing complete: ${selectedIds.length} items hidden.`,
      'warning',
    );
    setSelectedIds([]);
    loadContacts();
  };

  const exportSelectedVCF = () => {
    if (selectedIds.length === 0) return;
    const targetContacts = contacts.filter((c) => selectedIds.includes(c.id));
    const vcfPayload = buildVCFString(targetContacts);

    const blob = new Blob([vcfPayload], { type: 'text/vcard;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = blobUrl;
    anchor.download = `exported_contacts_${selectedIds.length}.vcf`;
    anchor.click();

    URL.revokeObjectURL(blobUrl);
    showToast(
      `${selectedIds.length} contacts exported to vCard file.`,
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
          return showToast('No contacts found in VCF file.', 'warning');

        for (let newContact of parsed) {
          await db.contacts.add(newContact);
        }
        showToast(
          `Successfully appended ${parsed.length} imported contacts.`,
          'success',
        );
        loadContacts();
      } catch {
        showToast('Error reading VCF formatting syntax.', 'error');
      }
    };
    fileReader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div>
      <div className="doc-header-block">
        <h1
          className="doc-title-main"
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
        >
          Local Workspace
          <span
            style={{
              fontSize: '0.75rem',
              backgroundColor: '#e2e8f0',
              color: '#475569',
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              fontFamily: 'monospace',
            }}
          >
            Active count: {contacts.length}
          </span>
        </h1>

        <label
          className="btn btn-teal"
          style={{ cursor: 'pointer', fontSize: '0.7rem' }}
        >
          <Upload size={14} /> Import VCF AddressBook
          <input
            type="file"
            accept=".vcf"
            onChange={importVCFFile}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      {selectedIds.length > 0 && (
        <div className="selection-action-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>Selected count: {selectedIds.length} items</span>
            {selectedIds.length < filteredContacts.length ? (
              <button
                onClick={selectAll}
                className="btn"
                style={{
                  backgroundColor: '#e2e8f0',
                  color: '#334155',
                  padding: '0.35rem 0.6rem',
                }}
              >
                <CheckSquare size={12} /> Mark All
              </button>
            ) : (
              <button
                onClick={deselectAll}
                className="btn"
                style={{
                  backgroundColor: '#e2e8f0',
                  color: '#334155',
                  padding: '0.35rem 0.6rem',
                }}
              >
                <Square size={12} /> Unmark All
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={exportSelectedVCF}
              className="btn btn-sky"
              style={{ padding: '0.4rem 0.75rem' }}
            >
              <Download size={12} /> Export Selected (.vcf)
            </button>
            <button
              onClick={deleteSelected}
              className="btn btn-red"
              style={{ padding: '0.4rem 0.75rem' }}
            >
              <Trash2 size={12} /> Delete Selected
            </button>
            <button
              onClick={deselectAll}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '0 4px',
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="contacts-layout-grid">
        <div>
          {editingContact && (
            <div
              style={{
                display: 'flex',
                justifycontent: 'space-between',
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
              <span>Context Mode: Editing profile ({editingContact.name})</span>
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
          {/* New Clean Modular Contact Search Input Bar Component */}
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
              No local contact cards stored in the database yet.
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
    </div>
  );
}
