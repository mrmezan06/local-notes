import { useMemo } from 'react';

export function useDocSearch(notes, searchQuery) {
  return useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase().trim();
    if (!normalizedQuery) return notes; // Return all entries if the input is blank

    return notes.filter((note) => {
      // 1. Scan title boundaries
      const titleMatches = note.title.toLowerCase().includes(normalizedQuery);
      if (titleMatches) return true;

      // 2. Scan internal unsealed text components
      if (!note.data) return false;

      if (note.type === 'markdown' && note.data.body) {
        return note.data.body.toLowerCase().includes(normalizedQuery);
      }

      if (note.type === 'checklist' && note.data.items) {
        return note.data.items.some((item) =>
          item.text.toLowerCase().includes(normalizedQuery),
        );
      }

      if (note.type === 'ledger' && note.data.rows) {
        return note.data.rows.some((row) =>
          row.label.toLowerCase().includes(normalizedQuery),
        );
      }

      return false;
    });
  }, [notes, searchQuery]);
}
