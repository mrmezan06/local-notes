export function parseVaultCSV(csvText) {
  const lines = [];
  let currentField = '';
  let insideQuotes = false;
  let currentRow = [];

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      currentRow.push(currentField.trim());
      if (currentRow.length > 0 && currentRow.some((cell) => cell !== '')) {
        lines.push(currentRow);
      }
      currentField = '';
      currentRow = [];
    } else {
      currentField += char;
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    lines.push(currentRow);
  }

  if (lines.length < 2) return [];

  const headers = lines[0].map((h) => h.toLowerCase().replace(/[\s_]/g, ''));

  // Independent Column Lookup Indexes
  const nameIdx = headers.findIndex((h) => h === 'name' || h === 'title');
  const urlIdx = headers.findIndex(
    (h) => h.includes('url') || h.includes('website') || h.includes('link'),
  );
  const userIdx = headers.findIndex(
    (h) => h.includes('user') || h.includes('email') || h.includes('login'),
  );
  const passIdx = headers.findIndex((h) => h.includes('pass'));
  const notesIdx = headers.findIndex(
    (h) => h.includes('note') || h.includes('comment') || h.includes('meta'),
  );

  const matchingRecords = [];

  for (let j = 1; j < lines.length; j++) {
    const row = lines[j];

    // Explicitly parse fields separately
    let name = nameIdx !== -1 ? row[nameIdx] : '';
    const url = urlIdx !== -1 ? row[urlIdx] : ''; // Preserves full URL parameters cleanly
    const username = userIdx !== -1 ? row[userIdx] : '';
    const password = passIdx !== -1 ? row[passIdx] : '';
    const metadata = notesIdx !== -1 ? row[notesIdx] : '';

    // Fallback: Use URL as Name if the Name column is missing
    if (!name && url) name = url;

    if (name && username && password) {
      matchingRecords.push({ name, url, username, password, metadata });
    }
  }

  return matchingRecords;
}
