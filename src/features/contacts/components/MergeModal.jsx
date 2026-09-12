/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { ShieldAlert, User, Phone, Mail, X } from 'lucide-react';

export default function MergeModal({
  isOpen,
  conflictGroups,
  onClose,
  onConfirmMerge,
}) {
  const [activeConflicts, setActiveConflicts] = useState([]);

  useEffect(() => {
    if (isOpen && conflictGroups) {
      // Map all incoming conflict groups with custom selection states
      const initializedGroups = conflictGroups.map((g) => ({
        ...g,
        // Propose raw default selections (everything checked initially)
        resolvedName: g.contacts[0]?.name || g.availableNames[0] || '',
        unselectedPhones: [], // Tracks unselected numbers explicitly to keep original arrays intact
        unselectedEmails: [], // Tracks unselected emails explicitly to keep original arrays intact
      }));
      setActiveConflicts(initializedGroups);
    }
  }, [isOpen, conflictGroups]);

  if (!isOpen || activeConflicts.length === 0) return null;

  const handleToggleValueSelection = (groupId, itemValue, type) => {
    setActiveConflicts((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;

        if (type === 'name') {
          return { ...g, resolvedName: itemValue };
        } else if (type === 'phone') {
          const isCurrentlyUnselected = g.unselectedPhones.includes(itemValue);
          return {
            ...g,
            unselectedPhones: isCurrentlyUnselected
              ? g.unselectedPhones.filter((x) => x !== itemValue) // Reselect
              : [...g.unselectedPhones, itemValue], // Unselect
          };
        } else if (type === 'email') {
          const isCurrentlyUnselected = g.unselectedEmails.includes(itemValue);
          return {
            ...g,
            unselectedEmails: isCurrentlyUnselected
              ? g.unselectedEmails.filter((x) => x !== itemValue) // Reselect
              : [...g.unselectedEmails, itemValue], // Unselect
          };
        }
        return g;
      }),
    );
  };

  const executeResolveIndex = async (group) => {
    // Filter out unselected rows to package only checked items
    const finalPhones = group.selectedPhones.filter(
      (p) => !group.unselectedPhones.includes(p),
    );
    const finalEmails = group.selectedEmails.filter(
      (e) => !group.unselectedEmails.includes(e),
    );

    const packedResult = {
      sourceIds: group.contacts.map((c) => c.id),
      mergedPayload: {
        name: group.resolvedName,
        phones: finalPhones.filter((p) => p.trim() !== ''),
        emails: finalEmails.filter((e) => e.trim() !== ''),
        avatar: group.avatar,
        isDeleted: 0,
      },
    };

    await onConfirmMerge(packedResult);
    setActiveConflicts((prev) => prev.filter((x) => x.id !== group.id));
  };

  return (
    <div className="modal-overlay">
      <div className="merge-modal-container" style={{ position: 'relative' }}>
        {/* Requirement: Floating absolute Close (X) button in top right corner */}
        <button
          type="button"
          onClick={onClose}
          className="btn-row-clear"
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            padding: '0.5rem',
            borderRadius: '50%',
          }}
          title="Cancel and Close"
        >
          <X size={18} style={{ color: '#94a3b8' }} />
        </button>

        <div
          className="modal-header-row"
          style={{
            color: '#c2410c',
            fontSize: '1.05rem',
            borderBottom: '1px solid #f1f5f9',
            paddingBottom: '0.75rem',
          }}
        >
          <ShieldAlert size={20} /> Smart Contact Deduplication Manager
        </div>
        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            marginBottom: '1.5rem',
            marginTop: '0.5rem',
            lineHeight: 1.4,
            paddingRight: '2rem',
          }}
        >
          Review overlapping data blocks. Elect the primary identifier name and
          target fields to combine records securely. Checked elements will be
          combined.
        </p>

        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
        >
          {activeConflicts.map((group) => (
            <div
              key={group.id}
              className="merge-conflict-box"
              style={{ margin: 0 }}
            >
              <div className="merge-meta-header-title">
                Conflict Cluster ({group.contacts.length} entries matching
                indices)
              </div>

              <div className="merge-selection-grid">
                {/* 1. Name Selection */}
                <div>
                  <div className="pill-group-title">
                    <User size={10} /> Choose Primary Name Label
                  </div>
                  {group.availableNames.map((name, idx) => {
                    const isNamePicked = group.resolvedName === name;
                    return (
                      <label
                        key={idx}
                        className="merge-option-pill-label"
                        style={{
                          borderColor: isNamePicked
                            ? 'var(--color-sky)'
                            : '#e2e8f0',
                          backgroundColor: isNamePicked ? '#f0f9ff' : 'white',
                          marginBottom: '0.35rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <input
                          type="radio"
                          name={`name-${group.id}`}
                          checked={isNamePicked}
                          onChange={() =>
                            handleToggleValueSelection(group.id, name, 'name')
                          }
                          style={{ cursor: 'pointer' }}
                        />
                        <span style={{ fontWeight: isNamePicked ? 700 : 500 }}>
                          {name}
                        </span>
                      </label>
                    );
                  })}
                </div>

                {/* 2. Phone and Email Selections */}
                <div>
                  {group.selectedPhones.length > 0 && (
                    <div className="pill-group-title">
                      <Phone size={10} /> Select Phones to Keep
                    </div>
                  )}
                  {group.selectedPhones.map((phone, idx) => {
                    const isChecked = !group.unselectedPhones.includes(phone); // Reverse checked state
                    return (
                      <label
                        key={idx}
                        className="merge-option-pill-label"
                        style={{
                          backgroundColor: isChecked ? '#f0fdf4' : 'white',
                          borderColor: isChecked
                            ? 'var(--color-emerald)'
                            : '#e2e8f0',
                          marginBottom: '0.35rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() =>
                            handleToggleValueSelection(group.id, phone, 'phone')
                          }
                          style={{ cursor: 'pointer' }}
                        />
                        <span
                          style={{
                            color: isChecked ? '#166534' : '#94a3b8',
                            textDecoration: isChecked ? 'none' : 'line-through',
                          }}
                        >
                          {phone}
                        </span>
                      </label>
                    );
                  })}

                  {group.selectedEmails.length > 0 && (
                    <div className="pill-group-title">
                      <Mail size={10} /> Select Emails to Keep
                    </div>
                  )}
                  {group.selectedEmails.map((email, idx) => {
                    const isChecked = !group.unselectedEmails.includes(email); // Reverse checked state
                    return (
                      <label
                        key={idx}
                        className="merge-option-pill-label"
                        style={{
                          backgroundColor: isChecked ? '#f0fdf4' : 'white',
                          borderColor: isChecked
                            ? 'var(--color-emerald)'
                            : '#e2e8f0',
                          marginBottom: '0.35rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() =>
                            handleToggleValueSelection(group.id, email, 'email')
                          }
                          style={{ cursor: 'pointer' }}
                        />
                        <span
                          style={{
                            color: isChecked ? '#166534' : '#94a3b8',
                            fontSize: '0.72rem',
                            textDecoration: isChecked ? 'none' : 'line-through',
                          }}
                        >
                          {email}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginTop: '1.25rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid #e2e8f0',
                }}
              >
                <button
                  type="button"
                  onClick={() => executeResolveIndex(group)}
                  className="btn btn-sky"
                  style={{ padding: '0.45rem 1rem', fontSize: '0.75rem' }}
                >
                  Merge & Purge Clones
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
