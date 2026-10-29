import test from 'node:test';
import assert from 'node:assert/strict';

// Test implementation of grading logic corresponding to lib/grading.ts
const DEFAULT_GRADING_RULES = [
  { grade: 'A+', min_percentage: 90.0, max_percentage: 100.0, gpa_point: 4.0 },
  { grade: 'A',  min_percentage: 80.0, max_percentage: 89.99, gpa_point: 3.75 },
  { grade: 'B+', min_percentage: 70.0, max_percentage: 79.99, gpa_point: 3.25 },
  { grade: 'B',  min_percentage: 60.0, max_percentage: 69.99, gpa_point: 2.75 },
  { grade: 'C',  min_percentage: 50.0, max_percentage: 59.99, gpa_point: 2.0 },
  { grade: 'D',  min_percentage: 40.0, max_percentage: 49.99, gpa_point: 1.0 },
  { grade: 'F',  min_percentage: 0.0,  max_percentage: 39.99, gpa_point: 0.0 },
];

function calculatePercentage(obtained, max) {
  if (max <= 0) return 0;
  if (obtained < 0) return 0;
  const pct = (obtained / max) * 100;
  return Math.min(100, Math.round(pct * 100) / 100);
}

function isValidMark(obtained, max) {
  if (isNaN(obtained) || isNaN(max)) {
    return { valid: false, message: 'Marks must be valid numbers' };
  }
  if (max <= 0) {
    return { valid: false, message: 'Maximum marks must be greater than 0' };
  }
  if (obtained < 0) {
    return { valid: false, message: 'Marks obtained cannot be negative' };
  }
  if (obtained > max) {
    return { valid: false, message: `Marks obtained (${obtained}) cannot exceed maximum marks (${max})` };
  }
  return { valid: true };
}

function calculateGrade(percentage, rules = DEFAULT_GRADING_RULES) {
  const sorted = [...rules].sort((a, b) => b.min_percentage - a.min_percentage);
  for (const rule of sorted) {
    if (percentage >= rule.min_percentage && percentage <= rule.max_percentage + 0.01) {
      return { grade: rule.grade, gpaPoint: rule.gpa_point };
    }
  }
  return { grade: 'F', gpaPoint: 0 };
}

test('calculatePercentage correctly computes standard percentages', () => {
  assert.equal(calculatePercentage(85, 100), 85);
  assert.equal(calculatePercentage(45, 50), 90);
  assert.equal(calculatePercentage(0, 100), 0);
  assert.equal(calculatePercentage(100, 100), 100);
});

test('calculatePercentage handles edge cases gracefully', () => {
  assert.equal(calculatePercentage(50, 0), 0);
  assert.equal(calculatePercentage(-10, 100), 0);
  assert.equal(calculatePercentage(120, 100), 100);
});

test('isValidMark prevents marks exceeding maximum and negative marks', () => {
  assert.equal(isValidMark(95, 100).valid, true);
  assert.equal(isValidMark(100, 100).valid, true);

  const overflow = isValidMark(105, 100);
  assert.equal(overflow.valid, false);
  assert.match(overflow.message, /cannot exceed maximum marks/);

  const negative = isValidMark(-5, 100);
  assert.equal(negative.valid, false);
  assert.match(negative.message, /cannot be negative/);

  const zeroMax = isValidMark(50, 0);
  assert.equal(zeroMax.valid, false);
  assert.match(zeroMax.message, /must be greater than 0/);
});

test('calculateGrade assigns correct letter grade and GPA points', () => {
  assert.deepEqual(calculateGrade(95), { grade: 'A+', gpaPoint: 4.0 });
  assert.deepEqual(calculateGrade(85), { grade: 'A', gpaPoint: 3.75 });
  assert.deepEqual(calculateGrade(72), { grade: 'B+', gpaPoint: 3.25 });
  assert.deepEqual(calculateGrade(65), { grade: 'B', gpaPoint: 2.75 });
  assert.deepEqual(calculateGrade(55), { grade: 'C', gpaPoint: 2.0 });
  assert.deepEqual(calculateGrade(42), { grade: 'D', gpaPoint: 1.0 });
  assert.deepEqual(calculateGrade(30), { grade: 'F', gpaPoint: 0.0 });
});
