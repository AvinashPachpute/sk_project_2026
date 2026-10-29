import test from 'node:test';
import assert from 'node:assert/strict';

function convertToCSV(data, columnHeaders) {
  if (!data || data.length === 0) {
    return columnHeaders.map((h) => escapeCSV(h.label)).join(',');
  }

  const headerRow = columnHeaders.map((h) => escapeCSV(h.label)).join(',');
  const rows = data.map((row) => {
    return columnHeaders
      .map((header) => {
        const val = row[header.key] ?? '';
        return escapeCSV(val);
      })
      .join(',');
  });

  return [headerRow, ...rows].join('\r\n');
}

function escapeCSV(val) {
  if (val === null || val === undefined) return '""';
  let str = String(val);
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  str = str.replace(/"/g, '""');
  return `"${str}"`;
}

test('convertToCSV generates compliant CSV header and data rows', () => {
  const data = [
    { name: 'Aarav Sharma', roll: '2024CS001', score: 95 },
    { name: 'Ananya Iyer', roll: '2024CS002', score: 88 },
  ];
  const headers = [
    { key: 'roll', label: 'Roll Number' },
    { key: 'name', label: 'Student Name' },
    { key: 'score', label: 'Score' },
  ];

  const csv = convertToCSV(data, headers);
  const lines = csv.split('\r\n');

  assert.equal(lines.length, 3);
  assert.equal(lines[0], '"Roll Number","Student Name","Score"');
  assert.equal(lines[1], '"2024CS001","Aarav Sharma","95"');
  assert.equal(lines[2], '"2024CS002","Ananya Iyer","88"');
});

test('convertToCSV escapes double quotes properly', () => {
  const data = [{ text: 'He said "Hello"' }];
  const headers = [{ key: 'text', label: 'Quote' }];
  const csv = convertToCSV(data, headers);

  assert.match(csv, /"He said ""Hello"""/);
});

test('convertToCSV sanitizes formula injection characters', () => {
  const malicious = [{ evil: '=1+1', macro: '@cmd' }];
  const headers = [
    { key: 'evil', label: 'Formula' },
    { key: 'macro', label: 'Macro' },
  ];
  const csv = convertToCSV(malicious, headers);

  // Checks that formula prefix ' is added
  assert.match(csv, /"'=1\+1"/);
  assert.match(csv, /"'@cmd"/);
});
