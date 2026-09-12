/**
 * Packages structural entries safely into highly-compatible standard vCard blocks [INDEX]
 */
export function buildVCFString(contactsArray) {
  return contactsArray
    .map((c) => {
      let card = [];
      card.push('BEGIN:VCARD');
      card.push('VERSION:3.0');
      card.push(`FN:${c.name}`);

      const targetPhones = c.phones || (c.phone ? [c.phone] : []);
      const targetEmails = c.emails || (c.email ? [c.email] : []);

      targetPhones.forEach((phone) => {
        card.push(`TEL;TYPE=CELL:${phone}`);
      });

      targetEmails.forEach((email) => {
        card.push(`EMAIL;TYPE=INTERNET:${email}`);
      });

      if (c.avatar && c.avatar.startsWith('data:image/')) {
        const base64Data = c.avatar.split(',');
        if (base64Data[1]) {
          card.push(
            `PHOTO;TYPE=JPEG;ENCODING=b:${base64Data[1].replace(/\s/g, '')}`,
          );
        }
      }
      card.push('END:VCARD');
      return card.join('\r\n');
    })
    .join('\r\n');
}

/**
 * FIXED: Advanced parser supporting both standard modern VCF 3.0/4.0 
 * and alternative legacy VCF 2.1 Base64 inline photo parameters [INDEX]
 */
export function parseVCFString(rawText) {
  const cards = rawText.split('BEGIN:VCARD');
  const extractedContacts = [];

  cards.forEach((card) => {
    if (!card.includes('END:VCARD')) return;

    let name = 'Imported Contact';
    let phones = [];
    let emails = [];
    let avatar = '';

    const lines = card.split(/\r?\n/);

    // Trackers for multi-line base64 image strings
    let readingPhotoData = false;
    let photoDataBuffer = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      // --- 1. Handle Multi-line Photo Buffering Blocks ---
      if (readingPhotoData) {
        // VCF 2.1 wraps multi-line base64 blocks using spaces or tabs at the start of new lines
        if (
          line.startsWith(' ') ||
          line.startsWith('\t') ||
          /^[A-Za-z0-9+/=\s]+$/.test(trimmedLine)
        ) {
          photoDataBuffer += trimmedLine.replace(/\s/g, '');
          continue;
        } else {
          // Finished reading the image block, format it cleanly into an HTML readable image src string [INDEX]
          avatar = `data:image/jpeg;base64,${photoDataBuffer}`;
          readingPhotoData = false;
        }
      }

      // --- 2. Standard Line Ingestion Field Mapping Parsers ---
      if (trimmedLine.toUpperCase().startsWith('FN:')) {
        name = trimmedLine.substring(3).trim();
      } else if (trimmedLine.toUpperCase().startsWith('TEL')) {
        const pieces = trimmedLine.split(':');
        if (pieces.length > 1) {
          const numberValue = pieces[1].trim();
          if (numberValue) phones.push(numberValue);
        }
      } else if (trimmedLine.toUpperCase().startsWith('EMAIL')) {
        const pieces = trimmedLine.split(':');
        if (pieces.length > 1) {
          const emailValue = pieces[1].trim();
          if (emailValue) emails.push(emailValue);
        }
      } else if (trimmedLine.toUpperCase().startsWith('PHOTO')) {
        // FIXED: Catch all variations like PHOTO;, PHOTO:, ENCODING=BASE64, etc. [INDEX]
        const colonIndex = trimmedLine.indexOf(':');
        if (colonIndex !== -1) {
          const remainingContent = trimmedLine
            .substring(colonIndex + 1)
            .trim()
            .replace(/\s/g, '');

          photoDataBuffer = remainingContent;
          readingPhotoData = true; // Engage multi-line accumulator flag
        }
      }
    }

    // Edge-case check if the file ended right as the image finished reading
    if (readingPhotoData && photoDataBuffer) {
      avatar = `data:image/jpeg;base64,${photoDataBuffer}`;
    }

    if (name && (phones.length > 0 || emails.length > 0)) {
      extractedContacts.push({
        name,
        phones,
        emails,
        avatar,
        isDeleted: 0,
      });
    }
  });

  return extractedContacts;
}
