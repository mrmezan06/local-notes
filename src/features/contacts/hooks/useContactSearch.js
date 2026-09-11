import { useMemo } from 'react';

export function useContactSearch(contacts, searchQuery) {
  return useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase().trim();
    if (!normalizedQuery) return contacts; // Return all entries if the input is blank

    return contacts.filter((contact) => {
      const nameMatches = contact.name.toLowerCase().includes(normalizedQuery);
      const phoneMatches = contact.phone
        .toLowerCase()
        .includes(normalizedQuery);
      const emailMatches = contact.email
        ? contact.email.toLowerCase().includes(normalizedQuery)
        : false;

      // Match if the query appears in the name, phone number, or email fields
      return nameMatches || phoneMatches || emailMatches;
    });
  }, [contacts, searchQuery]);
}
