import test from 'node:test';
import assert from 'node:assert/strict';

function validateStudentPayload(data) {
  const errors = [];
  if (!data.first_name || !data.first_name.trim()) {
    errors.push('First name is required');
  }
  if (!data.last_name || !data.last_name.trim()) {
    errors.push('Last name is required');
  }
  if (!data.roll_number || !data.roll_number.trim()) {
    errors.push('Roll number is required');
  }
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email format');
  }
  return {
    valid: errors.length === 0,
    errors,
  };
}

function checkDuplicateRollNumber(existingList, rollNumber, classId, currentId = null) {
  return existingList.some(
    (s) =>
      s.roll_number.toLowerCase() === rollNumber.toLowerCase() &&
      s.class_id === classId &&
      s.id !== currentId
  );
}

test('validateStudentPayload accepts complete valid student', () => {
  const res = validateStudentPayload({
    first_name: 'Aarav',
    last_name: 'Sharma',
    roll_number: '2024CS001',
    email: 'aarav@apexcollege.edu',
  });
  assert.equal(res.valid, true);
  assert.equal(res.errors.length, 0);
});

test('validateStudentPayload catches missing required fields', () => {
  const res = validateStudentPayload({
    first_name: '',
    last_name: '',
    roll_number: '',
    email: 'invalid-email',
  });
  assert.equal(res.valid, false);
  assert.equal(res.errors.length, 4);
});

test('checkDuplicateRollNumber correctly detects conflicts within same class', () => {
  const roster = [
    { id: '1', roll_number: '2024CS001', class_id: 'c1' },
    { id: '2', roll_number: '2024CS002', class_id: 'c1' },
  ];

  // Conflict in same class
  assert.equal(checkDuplicateRollNumber(roster, '2024CS001', 'c1'), true);

  // Different class -> no conflict
  assert.equal(checkDuplicateRollNumber(roster, '2024CS001', 'c2'), false);

  // Editing self -> no conflict
  assert.equal(checkDuplicateRollNumber(roster, '2024CS001', 'c1', '1'), false);
});
