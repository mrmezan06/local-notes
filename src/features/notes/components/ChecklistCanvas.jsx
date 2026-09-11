import { useEffect } from 'react';
import { X, Plus } from 'lucide-react';

export default function ChecklistCanvas({ items, onChange }) {
  // Requirement 1: If the canvas mounts completely empty, auto-initialize one blank task slot
  useEffect(() => {
    if (!items || items.length === 0) {
      onChange([{ text: '', done: false }]);
    }
  }, [items, onChange]);

  const handleTextChange = (index, value) => {
    const updated = [...items];
    updated[index].text = value;

    // Requirement 2: When typing in the LAST entry block, check if it's no longer empty.
    // If true, automatically append another pristine blank task line underneath it.
    const isActiveIndexTheLastItem = index === items.length - 1;
    if (isActiveIndexTheLastItem && value.trim() !== '') {
      updated.push({ text: '', done: false });
    }

    onChange(updated);
  };

  const handleToggleCheckbox = (index, isChecked) => {
    const updated = [...items];
    updated[index].done = isChecked;
    onChange(updated);
  };

  // Requirement 3: Close button logic to instantly drop specific row indices
  const handleRemoveRow = (index) => {
    const updated = items.filter((_, idx) => idx !== index);
    // Maintain a safe baseline row if everything gets deleted
    if (updated.length === 0) {
      updated.push({ text: '', done: false });
    }
    onChange(updated);
  };

  const handleManualAddRow = () => {
    onChange([...items, { text: '', done: false }]);
  };

  // Requirement 4: Split items dynamically between ongoing tasks and completed lines

  const completedTasks = items.filter((item) => item.done);

  return (
    <div style={{ marginTop: '1rem' }}>
      {/* Active Tasks Group */}
      {items.map((item, originalIndex) => {
        // Only render non-completed items in the main primary stream block
        if (item.done) return null;

        return (
          <div key={originalIndex} className="checklist-row-wrapper">
            <div className="checklist-input-group">
              <input
                type="checkbox"
                checked={item.done}
                onChange={(e) =>
                  handleToggleCheckbox(originalIndex, e.target.checked)
                }
              />
              <input
                type="text"
                value={item.text}
                onChange={(e) =>
                  handleTextChange(originalIndex, e.target.value)
                }
                className="checklist-text-input"
                placeholder="Write a task or summary log entry..."
              />
            </div>
            <button
              type="button"
              onClick={() => handleRemoveRow(originalIndex)}
              className="btn-row-clear"
              title="Delete task row"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}

      <button
        type="button"
        onClick={handleManualAddRow}
        className="btn"
        style={{
          backgroundColor: '#f1f5f9',
          color: 'var(--color-sky)',
          marginTop: '0.5rem',
        }}
      >
        <Plus size={12} /> Add Entry
      </button>

      {/* Requirement 4: Struck out Completed Task Section Container Block */}
      {completedTasks.length > 0 && (
        <div className="completed-tasks-divider">
          <div className="completed-tasks-title">
            Completed Tasks ({completedTasks.length})
          </div>

          {items.map((item, originalIndex) => {
            if (!item.done) return null;

            return (
              <div key={originalIndex} className="checklist-row-wrapper">
                <div className="checklist-input-group">
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={(e) =>
                      handleToggleCheckbox(originalIndex, e.target.checked)
                    }
                  />
                  <span className="checklist-text-input text-struck-out">
                    {item.text || (
                      <span style={{ fontStyle: 'italic', color: '#cbd5e1' }}>
                        Empty task
                      </span>
                    )}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveRow(originalIndex)}
                  className="btn-row-clear"
                  title="Delete task row"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
