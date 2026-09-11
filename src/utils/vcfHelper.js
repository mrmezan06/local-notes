/**
 * Transforms an array of contact objects into a clean VCF vCard raw text stream.
 */
export function buildVCFString(contactsArray) {
  return contactsArray
    .map((c) => {
      let card = [];
      card.push('BEGIN:VCARD');
      card.push('VERSION:3.0');
      card.push(`FN:${c.name}`);
      card.push(`TEL;TYPE=CELL:${c.phone}`);
      if (c.email) card.push(`EMAIL;TYPE=INTERNET:${c.email}`);
      if (c.avatar && c.avatar.startsWith('data:image/')) {
        // Strips content type prefixes to output standard Base64 photo lines
        const base64Data = c.avatar.split(',')[1];
        card.push(
          `PHOTO;TYPE=JPEG;ENCODING=b:${base64Data.replace(/\s/g, '')}`,
        );
      }
      card.push('END:VCARD');
      return card.join('\r\n');
    })
    .join('\r\n');
}

/**
 * Parses raw textual data strings extracted out of VCF files back into application data.
 */
export function parseVCFString(rawText) {
  const cards = rawText.split('BEGIN:VCARD');
  const extractedContacts = [];

  cards.forEach((card) => {
    if (!card.includes('END:VCARD')) return;

    let name = 'Imported Contact';
    let phone = '00000000';
    let email = '';
    let avatar = '';

    const lines = card.split(/\r?\n/);
    lines.forEach((line) => {
      if (line.startsWith('FN:')) {
        name = line.substring(3).trim();
      } else if (line.startsWith('TEL')) {
        // Captures parameters skipping semicolon type allocations
        const pieces = line.split(':');
        if (pieces.length > 1) phone = pieces[1].trim();
      } else if (line.startsWith('EMAIL')) {
        const pieces = line.split(':');
        if (pieces.length > 1) email = pieces[1].trim();
      } else if (line.startsWith('PHOTO')) {
        const pieces = line.split(':');
        if (pieces.length > 1) {
          avatar = `data:image/jpeg;base64,${pieces[1].trim()}`;
        }
      }
    });

    extractedContacts.push({ name, phone, email, avatar, isDeleted: 0 });
  });

  return extractedContacts;
}
