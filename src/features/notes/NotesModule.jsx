/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useRef, useCallback } from 'react';
import { db } from '../../db/database';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { encryptData, decryptData } from '../../utils/crypto';
import { useDocSearch } from './hooks/useDocSearch';
import NoteCard from './components/NoteCard';
import MarkdownCanvas from './components/MarkdownCanvas';
import ChecklistCanvas from './components/ChecklistCanvas';
import LedgerCanvas from './components/LedgerCanvas';
import DocSearchBar from './components/DocSearchBar';
import EmptySearchResults from './components/EmptySearchResults';
import { Plus, ChevronLeft, BookOpen, Pencil } from 'lucide-react';

export default function NotesModule() {
  const { loginPassword } = useAuth();
  const { showToast } = useToast();

  // App Tracking Configurations States
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNote, setActiveNote] = useState(null);
  const [isReaderMode, setIsReaderMode] = useState(false);
  const [syncStatus, setSyncStatus] = useState('ready');

  // Input Canvas Tracking Buffers
  const [title, setTitle] = useState('');
  const [type, setType] = useState('markdown');
  const [bodyText, setBodyText] = useState('');
  const [checklist, setChecklist] = useState([]);
  const [ledgerRows, setLedgerRows] = useState([]);

  // Loop references blocks
  const debounceRef = useRef(null);
  const isInitialLoadRef = useRef(true);

  // Modular Hook Connection: Scans and updates matching nodes instantly
  const filteredNotes = useDocSearch(notes, searchQuery);

  const loadNotes = useCallback(async () => {
    if (!loginPassword) return;
    try {
      const list = await db.notes.where({ isDeleted: 0 }).toArray();
      const decryptedList = await Promise.all(
        list.map(async (n) => {
          try {
            const rawText = await decryptData(
              n.encryptedPayload,
              loginPassword,
            );
            return { ...n, data: JSON.parse(rawText) };
          } catch (e) {
            return {
              ...n,
              data: { body: '[Decryption Error]', items: [], rows: [] },
            };
          }
        }),
      );
      setNotes(decryptedList);
    } catch (err) {
      // Fail silently without breaking the UI thread
    }
  }, [loginPassword]);

  const triggerBackgroundSave = useCallback(async () => {
    if (!activeNote) return;
    setSyncStatus('saving');
    try {
      const packedPayload = {
        body: bodyText,
        items: checklist,
        rows: ledgerRows,
      };
      const encrypted = await encryptData(
        JSON.stringify(packedPayload),
        loginPassword,
      );

      await db.notes.update(activeNote.id, {
        title,
        encryptedPayload: encrypted,
        updatedAt: new Date().toLocaleDateString(),
      });
      setSyncStatus('ready');
    } catch {
      setSyncStatus('ready');
      showToast('Background encryption write failed.', 'error');
    }
  }, [
    activeNote,
    title,
    bodyText,
    checklist,
    ledgerRows,
    loginPassword,
    showToast,
  ]);

  const openForEdit = (note) => {
    isInitialLoadRef.current = true;
    setActiveNote(null);
    setTitle(note.title || '');
    setType(note.type || 'markdown');
    setBodyText(note.data?.body || '');
    setChecklist(note.data?.items || []);
    setLedgerRows(note.data?.rows || []);

    setTimeout(() => {
      setActiveNote(note);
      setSyncStatus('ready');
      setTimeout(() => {
        isInitialLoadRef.current = false;
      }, 50);
    }, 50);
  };

  const handleCreate = async (noteType) => {
    const emptyStructure = { body: '', items: [], rows: [] };
    const encrypted = await encryptData(
      JSON.stringify(emptyStructure),
      loginPassword,
    );
    const generatedTitle = `Untitled ${noteType}`;

    await db.notes.add({
      title: generatedTitle,
      type: noteType,
      encryptedPayload: encrypted,
      isDeleted: 0,
      updatedAt: new Date().toLocaleDateString(),
    });

    await loadNotes();
    const records = await db.notes.where({ isDeleted: 0 }).toArray();
    const matchingRecord = records[records.length - 1];
    if (matchingRecord)
      openForEdit({ ...matchingRecord, data: emptyStructure });
  };

  const handleCloseEditor = async () => {
    if (syncStatus === 'typing' || syncStatus === 'saving') {
      await triggerBackgroundSave();
    }
    setActiveNote(null);
    setIsReaderMode(false);
    loadNotes();
  };

  const softDelete = async (id) => {
    await db.notes.update(id, { isDeleted: 1 });
    showToast('Document moved to trash bin.', 'warning');
    loadNotes();
  };

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      loadNotes();
    }
    return () => {
      isMounted = false;
    };
  }, [loadNotes]);

  useEffect(() => {
    if (!activeNote || isInitialLoadRef.current) return;

    const runStateUpdateTask = () => {
      setSyncStatus('typing');
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        triggerBackgroundSave();
      }, 1000);
    };

    const threadTimer = setTimeout(runStateUpdateTask, 0);

    return () => {
      clearTimeout(threadTimer);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [
    title,
    bodyText,
    checklist,
    ledgerRows,
    activeNote,
    triggerBackgroundSave,
  ]);

  return (
    <div>
      {!activeNote ? (
        <>
          <div className="doc-header-block">
            <h1 className="doc-title-main">My Local Documents</h1>
            <div className="action-trigger-row">
              <button
                onClick={() => handleCreate('markdown')}
                className="btn btn-sky"
              >
                + Note (Markdown)
              </button>
              <button
                onClick={() => handleCreate('checklist')}
                className="btn btn-teal"
              >
                + Checklist
              </button>
              <button
                onClick={() => handleCreate('ledger')}
                className="btn btn-emerald"
              >
                + Ledger Board
              </button>
            </div>
          </div>

          {/* Clean Modular Search Input Component */}
          <DocSearchBar value={searchQuery} onChange={setSearchQuery} />

          {filteredNotes.length === 0 ? (
            <EmptySearchResults />
          ) : (
            <div className="doc-grid-system">
              {filteredNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onOpen={() => openForEdit(note)}
                  onDelete={softDelete}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="editor-frame">
          <div className="editor-action-bar">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                width: '60%',
              }}
            >
              <button
                onClick={handleCloseEditor}
                className="btn"
                style={{ backgroundColor: '#f1f5f9', color: '#64748b' }}
              >
                <ChevronLeft size={16} /> Close & Exit
              </button>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-doc-title"
              />
            </div>

            <div className="action-trigger-row">
              <div className="sync-status-indicator">
                {syncStatus === 'typing' && (
                  <span style={{ color: '#f59e0b' }}>● Unsaved Edits</span>
                )}
                {syncStatus === 'saving' && (
                  <>
                    <div className="spinner-dual-ring"></div>
                    <span style={{ color: 'var(--color-sky)' }}>Saving...</span>
                  </>
                )}
                {syncStatus === 'ready' && (
                  <span style={{ color: 'var(--color-emerald)' }}>
                    ✓ Autosaved
                  </span>
                )}
              </div>

              {type === 'markdown' && (
                <button
                  onClick={() => setIsReaderMode(!isReaderMode)}
                  className="btn"
                  style={{
                    backgroundColor: '#f8fafc',
                    color: '#475569',
                    border: '1px solid #e2e8f0',
                  }}
                  title={
                    isReaderMode
                      ? 'Back to Edit Mode'
                      : 'Hide Editor (Reader Mode)'
                  }
                >
                  {isReaderMode ? <Pencil size={14} /> : <BookOpen size={14} />}
                </button>
              )}
            </div>
          </div>

          {type === 'markdown' && (
            <MarkdownCanvas
              value={bodyText}
              onChange={setBodyText}
              isReaderMode={isReaderMode}
            />
          )}
          {type === 'checklist' && (
            <ChecklistCanvas items={checklist} onChange={setChecklist} />
          )}
          {type === 'ledger' && (
            <LedgerCanvas rows={ledgerRows} onChange={setLedgerRows} />
          )}
        </div>
      )}
    </div>
  );
}
