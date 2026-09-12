import { useMemo } from 'react';

export function useContactSearch(contacts, searchQuery) {
  return useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase().trim();
    if (!normalizedQuery) return contacts; // Return all entries if the input is blank

    return contacts.filter((contact) => {
      // 1. Strict Null Safeguard for Name Field
      const contactName = contact.name || '';
      const nameMatches = contactName.toLowerCase().includes(normalizedQuery);

      // 2. Strict Null Safeguard for Legacy Singular Phone field
      const legacyPhone = contact.phone || '';
      let phoneMatches = legacyPhone.toLowerCase().includes(normalizedQuery);

      // 3. Scan Multiple Plural Phones Array if present
      if (!phoneMatches && contact.phones && contact.phones.length > 0) {
        phoneMatches = contact.phones.some((p) => {
          const singlePhone = p || '';
          return singlePhone.toLowerCase().includes(normalizedQuery);
        });
      }

      // 4. Strict Null Safeguard for Legacy Singular Email field
      const legacyEmail = contact.email || '';
      let emailMatches = legacyEmail.toLowerCase().includes(normalizedQuery);

      // 5. Scan Multiple Plural Emails Array if present
      if (!emailMatches && contact.emails && contact.emails.length > 0) {
        emailMatches = contact.emails.some((e) => {
          const singleEmail = e || '';
          return singleEmail.toLowerCase().includes(normalizedQuery);
        });
      }

      // Match if the search query matches any available text property field safely
      return nameMatches || phoneMatches || emailMatches;
    });
  }, [contacts, searchQuery]);
}
