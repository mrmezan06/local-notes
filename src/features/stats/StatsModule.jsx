/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from 'react';
import { db } from '../../db/database';
import { useAuth } from '../../context/AuthContext';
import { decryptData } from '../../utils/crypto';
import {
  FileText,
  Key,
  Users,
  Database,
  PieChart,
  Activity,
} from 'lucide-react';

export default function StatsModule() {
  const { loginPassword } = useAuth(); // Safely access your active login key for background decryption

  const [metrics, setMetrics] = useState({
    notesCount: 0,
    checklistsCount: 0,
    ledgersCount: 0,
    vaultCount: 0,
    contactsCount: 0,
    trashCount: 0,
    totalTasks: 0,
    completedTasks: 0,
    ledgerNetWorth: 0,
    estimatedStorageBytes: 0,
  });

  const calculateWorkspaceMetrics = useCallback(async () => {
    if (!loginPassword) return;

    try {
      const allNotes = await db.notes.toArray();
      const activeNotes = allNotes.filter((n) => !n.isDeleted);
      const activeVault = await db.vault.where({ isDeleted: 0 }).toArray();
      const activeContacts = await db.contacts
        .where({ isDeleted: 0 })
        .toArray();

      let markdownNotes = 0,
        checklistDocs = 0,
        ledgerDocs = 0;
      let totalTasksCount = 0,
        completedTasksCount = 0;
      let financialNetWorth = 0;

      // Loop through all documents and securely decrypt their payloads for analysis
      for (const note of activeNotes) {
        if (note.type === 'markdown') markdownNotes++;
        if (note.type === 'checklist') checklistDocs++;
        if (note.type === 'ledger') ledgerDocs++;

        try {
          if (note.encryptedPayload) {
            // Decrypt using the master session login key
            const rawText = await decryptData(
              note.encryptedPayload,
              loginPassword,
            );
            const parsedData = JSON.parse(rawText);

            if (parsedData) {
              if (note.type === 'checklist' && parsedData.items) {
                totalTasksCount += parsedData.items.length;
                completedTasksCount += parsedData.items.filter(
                  (i) => i.done,
                ).length;
              }
              if (note.type === 'ledger' && parsedData.rows) {
                financialNetWorth += parsedData.rows.reduce(
                  (sum, row) => sum + (parseFloat(row.amount) || 0),
                  0,
                );
              }
            }
          }
        } catch (err) {
          // Skip corrupt or unreadable files gracefully
        }
      }

      // Calculate total byte size of local databases
      const dataMappingSnapshot =
        JSON.stringify(allNotes) +
        JSON.stringify(activeVault) +
        JSON.stringify(activeContacts);
      const allocationBytes = new Blob([dataMappingSnapshot]).size;

      const trashedNotes = allNotes.filter((n) => n.isDeleted).length;
      const trashedVault = (await db.vault.where({ isDeleted: 1 }).toArray())
        .length;
      const trashedContacts = (
        await db.contacts.where({ isDeleted: 1 }).toArray()
      ).length;

      setMetrics({
        notesCount: markdownNotes,
        checklistsCount: checklistDocs,
        ledgersCount: ledgerDocs,
        vaultCount: activeVault.length,
        contactsCount: activeContacts.length,
        trashCount: trashedNotes + trashedVault + trashedContacts,
        totalTasks: totalTasksCount,
        completedTasks: completedTasksCount,
        ledgerNetWorth: financialNetWorth,
        estimatedStorageBytes: allocationBytes,
      });
    } catch (err) {
      // Fail silently without breaking the UI thread
    }
  }, [loginPassword]);

  useEffect(() => {
    calculateWorkspaceMetrics();
  }, [calculateWorkspaceMetrics]);

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const taskCompletionRate =
    metrics.totalTasks > 0
      ? Math.round((metrics.completedTasks / metrics.totalTasks) * 100)
      : 0;

  return (
    <div>
      <div className="card" style={{ marginBottom: '2rem' }}>
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
          <PieChart size={20} style={{ color: 'var(--color-sky)' }} /> Workspace
          Metrics
        </h1>
        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            marginTop: '0.5rem',
            marginLeft: '1.8rem',
          }}
        >
          Real-time structural health overview, data indexes footprint metrics,
          and audit configurations tracking in the overall system [DB].
        </p>
      </div>

      <div className="stats-grid-wrapper">
        <div className="card stat-metric-card">
          <div className="stat-icon-frame stat-sky">
            <FileText size={18} />
          </div>
          <div>
            <div className="stat-value-big">
              {metrics.notesCount +
                metrics.checklistsCount +
                metrics.ledgersCount}
            </div>
            <div className="stat-label-muted">Local Notes</div>
          </div>
        </div>
        <div className="card stat-metric-card">
          <div className="stat-icon-frame stat-teal">
            <Key size={18} />
          </div>
          <div>
            <div className="stat-value-big">{metrics.vaultCount}</div>
            <div className="stat-label-muted">Vault Passwords</div>
          </div>
        </div>
        <div className="card stat-metric-card">
          <div className="stat-icon-frame stat-purple">
            <Users size={18} />
          </div>
          <div>
            <div className="stat-value-big">{metrics.contactsCount}</div>
            <div className="stat-label-muted">Saved Contacts</div>
          </div>
        </div>
        <div className="card stat-metric-card">
          <div className="stat-icon-frame stat-emerald">
            <Database size={18} />
          </div>
          <div>
            <div className="stat-value-big">
              {formatSize(metrics.estimatedStorageBytes)}
            </div>
            <div className="stat-label-muted">Database Footprint</div>
          </div>
        </div>
      </div>

      <div className="stats-dual-split">
        <div className="card">
          <h3
            style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.25rem',
              paddingBottom: '0.5rem',
              borderBottom: '1px solid #e2e8f0',
            }}
          >
            <Activity size={15} style={{ color: 'var(--color-teal)' }} /> Module
            Components Analytics
          </h3>
          <table
            className="ledger-table-framework"
            style={{ fontSize: '0.8rem' }}
          >
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ paddingBottom: '0.5rem' }}>
                  Storage Data Namespace
                </th>
                <th style={{ paddingBottom: '0.5rem' }}>
                  Local Row Metric Count
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '0.65rem 0' }}>
                  📝 Markdown Text Notes Log
                </td>
                <td>
                  <strong>{metrics.notesCount} items</strong>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '0.65rem 0' }}>
                  ✓ Interactive Task Checklists
                </td>
                <td>
                  <strong>{metrics.checklistsCount} lists</strong>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '0.65rem 0' }}>
                  📊 Financial Calculable Ledger Boards
                </td>
                <td>
                  <strong>{metrics.ledgersCount} sheets</strong>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '0.65rem 0' }}>
                  🗑️ Soft-Deleted Recycler Trash Log
                </td>
                <td
                  style={{
                    color:
                      metrics.trashCount > 0 ? 'var(--color-red)' : 'inherit',
                  }}
                >
                  <strong>{metrics.trashCount} records</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          className="card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h3
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                marginBottom: '1rem',
              }}
            >
              Task Completion Efficiency
            </h3>
            <div
              style={{
                fontSize: '1.75rem',
                fontWeight: 700,
                color: 'var(--color-sky)',
              }}
            >
              {taskCompletionRate}%
            </div>
            <p className="stat-label-muted" style={{ marginTop: '0.25rem' }}>
              {metrics.completedTasks} of {metrics.totalTasks} task rows
              completed.
            </p>
            <div className="storage-progress-bar-track">
              <div
                className="storage-progress-bar-fill"
                style={{ width: `${taskCompletionRate}%` }}
              ></div>
            </div>
          </div>

          <div
            style={{
              marginTop: '2rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid #f1f5f9',
            }}
          >
            <h3
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
              }}
            >
              Ledger Sheet Net Valuation
            </h3>
            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color:
                  metrics.ledgerNetWorth >= 0
                    ? 'var(--color-emerald)'
                    : 'var(--color-red)',
                fontFamily: 'monospace',
                marginTop: '0.25rem',
              }}
            >
              ${metrics.ledgerNetWorth.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
