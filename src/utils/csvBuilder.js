export function buildVaultCSVString(recordsArray) {
  const headers = ['Name', 'URL', 'Username', 'Password', 'Notes'];
  const rows = [headers.join(',')];

  recordsArray.forEach((item) => {
    // Read clean, separate database entries
    const name = item.label ? `"${item.label.replace(/"/g, '""')}"` : '""';
    const url = item.secret?.url
      ? `"${item.secret.url.replace(/"/g, '""')}"`
      : '""';
    const user = item.secret?.username
      ? `"${item.secret.username.replace(/"/g, '""')}"`
      : '""';
    const pass = item.secret
      ? `"${(item.secret.accountPassword || item.secret.password || '').replace(/"/g, '""')}"`
      : '""';
    const notes = item.secret?.metadata
      ? `"${item.secret.metadata.replace(/"/g, '""')}"`
      : '""';

    rows.push([name, url, user, pass, notes].join(','));
  });

  return rows.join('\r\n');
}
