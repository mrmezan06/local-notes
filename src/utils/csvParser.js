/**
 * Splits raw CSV file string contents into a clean array of credential data objects.
 */
export function parseVaultCSV(csvText) {
  const lines = [];
  let currentField = '';
  let insideQuotes = false;
  let currentRow = [];

  // Parse character by character to handle nested commas inside quotes correctly
  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"'; // Handle escaped double quotes
        i++;
      } else {
        insideQuotes = !insideQuotes; // Toggle quote state boundary
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') i++; // Handle Windows CRLF line endings
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

  // Append remaining text tail fields
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    lines.push(currentRow);
  }

  if (lines.length < 2) return [];

  // Extract index mappings from the column header row
  const headers = lines[0].map((h) => h.toLowerCase().replace(/[\s_]/g, ''));
  const urlIdx = headers.findIndex(
    (h) =>
      h.includes('url') ||
      h.includes('title') ||
      h.includes('name') ||
      h.includes('website'),
  );
  const userIdx = headers.findIndex(
    (h) => h.includes('user') || h.includes('email') || h.includes('login'),
  );
  const passIdx = headers.findIndex((h) => h.includes('pass'));
  const notesIdx = headers.findIndex(
    (h) => h.includes('note') || h.includes('comment') || h.includes('meta'),
  );

  const matchingRecords = [];

  // Map remaining row index items into structured credential logs
  for (let j = 1; j < lines.length; j++) {
    const row = lines[j];
    const url = urlIdx !== -1 ? row[urlIdx] : '';
    const username = userIdx !== -1 ? row[userIdx] : '';
    const password = passIdx !== -1 ? row[passIdx] : '';
    const metadata = notesIdx !== -1 ? row[notesIdx] : '';

    if (url && username && password) {
      matchingRecords.push({ url, username, password, metadata });
    }
  }

  return matchingRecords;
}
