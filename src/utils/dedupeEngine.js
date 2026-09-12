export function normalizePhoneNumber(phoneString) {
  if (!phoneString) return '';
  let digits = phoneString.replace(/[\s\-()]/g, '');

  if (digits.startsWith('+880')) digits = digits.substring(4);
  else if (digits.startsWith('880')) digits = digits.substring(3);
  else if (digits.startsWith('0')) digits = digits.substring(1);

  return digits.trim();
}

/**
 * Sweeps all contacts and accurately maps individual array items into the conflict group model
 */
export function scanForDuplicateContacts(contactsList) {
  const groups = [];
  const processedIds = new Set();

  for (let i = 0; i < contactsList.length; i++) {
    const current = contactsList[i];
    if (processedIds.has(current.id)) continue;

    const duplicates = [current];
    const currentPhonesNormalized = (current.phones || []).map((p) =>
      normalizePhoneNumber(p),
    );
    const currentEmailsNormalized = (current.emails || []).map((e) =>
      e.toLowerCase().trim(),
    );

    for (let j = i + 1; j < contactsList.length; j++) {
      const target = contactsList[j];
      if (processedIds.has(target.id)) continue;

      let isMatch = false;

      // 1. Evaluate Name Match
      if (
        current.name.toLowerCase().trim() === target.name.toLowerCase().trim()
      ) {
        isMatch = true;
      }

      // 2. Evaluate Phone Arrays Overlap Match
      if (!isMatch && target.phones) {
        const targetPhonesNormalized = target.phones.map((p) =>
          normalizePhoneNumber(p),
        );
        isMatch = targetPhonesNormalized.some(
          (p) => currentPhonesNormalized.includes(p) && p !== '',
        );
      }

      // 3. Evaluate Email Arrays Overlap Match
      if (!isMatch && target.emails) {
        const targetEmailsNormalized = target.emails.map((e) =>
          e.toLowerCase().trim(),
        );
        isMatch = targetEmailsNormalized.some(
          (e) => currentEmailsNormalized.includes(e) && e !== '',
        );
      }

      if (isMatch) {
        duplicates.push(target);
      }
    }

    if (duplicates.length > 1) {
      duplicates.forEach((d) => processedIds.add(d.id));

      // FIXED: Safely read index [0] properties of the duplicates array list
      groups.push({
        id: Date.now() + Math.random(),
        contacts: duplicates,
        resolvedName: duplicates[0].name, // Fixed: Grab from array index [0] to avoid undefined stalls
        availableNames: [...new Set(duplicates.map((d) => d.name))],
        selectedPhones: [...new Set(duplicates.flatMap((d) => d.phones || []))],
        selectedEmails: [...new Set(duplicates.flatMap((d) => d.emails || []))],
        avatar: duplicates.find((d) => d.avatar)?.avatar || '',
      });
    }
  }

  return groups;
}
