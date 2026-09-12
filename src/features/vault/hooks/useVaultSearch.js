import { useMemo } from 'react';

export function useVaultSearch(records, searchQuery) {
  return useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase().trim();
    if (!normalizedQuery) return records;

    return records.filter(
      (r) =>
        r.label.toLowerCase().includes(normalizedQuery) ||
        (r.secret?.username &&
          r.secret.username.toLowerCase().includes(normalizedQuery)),
    );
  }, [records, searchQuery]);
}
