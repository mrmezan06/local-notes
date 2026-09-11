import { useEffect } from 'react';
import { X, Plus } from 'lucide-react';

export default function LedgerCanvas({ rows, onChange }) {
  // Requirement 1: If the ledger canvas mounts completely empty, auto-populate one blank grid item row
  useEffect(() => {
    if (!rows || rows.length === 0) {
      onChange([{ label: '', amount: '' }]);
    }
  }, [rows, onChange]);

  const handleUpdateField = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;

    // Requirement 2: When typing inside the description of the LAST row item,
    // verify it has text content. If true, auto-append a new transaction row.
    const isTargetIndexTheLastLineItem = index === rows.length - 1;
    if (
      field === 'label' &&
      isTargetIndexTheLastLineItem &&
      value.trim() !== ''
    ) {
      updated.push({ label: '', amount: '' });
    }

    onChange(updated);
  };

  // Requirement 3: Inline deletion method to immediately drop row index keys
  const handleRemoveRow = (index) => {
    const updated = rows.filter((_, idx) => idx !== index);

    // Maintain a safe baseline row parameters tracking block if all items are cleared
    if (updated.length === 0) {
      updated.push({ label: '', amount: '' });
    }
    onChange(updated);
  };

  const handleManualAddRow = () => {
    onChange([...rows, { label: '', amount: '' }]);
  };

  // Live calculation total balance runner math
  const grandTotal = rows.reduce(
    (sum, row) => sum + (parseFloat(row.amount) || 0),
    0,
  );

  return (
    <div style={{ marginTop: '1rem' }}>
      <table className="ledger-table-framework">
        <thead>
          <tr>
            <th>Line Item Description</th>
            <th style={{ width: '150px' }}>Value ($)</th>
            <th className="ledger-action-col">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx}>
              <td>
                <input
                  type="text"
                  value={row.label}
                  onChange={(e) =>
                    handleUpdateField(idx, 'label', e.target.value)
                  }
                  className="ledger-input"
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    padding: '0.4rem 0',
                  }}
                  placeholder="Log reference tracking asset or expense..."
                />
              </td>
              <td>
                <input
                  type="number"
                  value={row.amount}
                  onChange={(e) =>
                    handleUpdateField(idx, 'amount', e.target.value)
                  }
                  className="ledger-input"
                  style={{
                    fontFamily: 'monospace',
                    borderBottom: '1px solid #f1f5f9',
                    padding: '0.4rem 0',
                  }}
                  placeholder="0.00"
                />
              </td>
              {/* Requirement 3: Inline close deletion button element layout matching checklists */}
              <td className="ledger-action-col">
                <button
                  type="button"
                  onClick={() => handleRemoveRow(idx)}
                  className="btn-row-clear"
                  title="Delete statement line item"
                >
                  <X size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="ledger-summary-footer">
        <button
          type="button"
          onClick={handleManualAddRow}
          className="btn"
          style={{ backgroundColor: '#f1f5f9', color: 'var(--color-emerald)' }}
        >
          <Plus size={12} /> Add Row
        </button>
        <div>
          Total Ledger Sum:{' '}
          <span
            style={{
              fontFamily: 'monospace',
              color: 'var(--color-emerald)',
              fontWeight: 700,
            }}
          >
            ${grandTotal.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
