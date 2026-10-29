/**
 * CSV Export Utility
 * Safely serializes objects into RFC 4180 compliant CSV strings
 * and triggers client-side file downloads.
 */

export function convertToCSV<T extends Record<string, unknown>>(
  data: T[],
  columnHeaders: { key: keyof T | string; label: string }[]
): string {
  if (!data || data.length === 0) {
    return columnHeaders.map((h) => escapeCSV(h.label)).join(',');
  }

  const headerRow = columnHeaders.map((h) => escapeCSV(h.label)).join(',');

  const rows = data.map((row) => {
    return columnHeaders
      .map((header) => {
        const keys = (header.key as string).split('.');
        let val: unknown = row;
        for (const k of keys) {
          if (val && typeof val === 'object' && k in val) {
            val = (val as Record<string, unknown>)[k];
          } else {
            val = '';
            break;
          }
        }
        return escapeCSV(val);
      })
      .join(',');
  });

  return [headerRow, ...rows].join('\r\n');
}

function escapeCSV(val: unknown): string {
  if (val === null || val === undefined) return '""';
  let str = String(val);
  // Mitigate CSV Formula Injection by prepending space if starts with =, +, -, @
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  // Double quotes escape
  str = str.replace(/"/g, '""');
  return `"${str}"`;
}

export function downloadCSV(filename: string, csvContent: string): void {
  if (typeof window === 'undefined') return;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
