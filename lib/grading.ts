import { GradingRule } from '@/types/database';

export const DEFAULT_GRADING_RULES: GradingRule[] = [
  {
    id: '1',
    grade: 'A+',
    min_percentage: 90.0,
    max_percentage: 100.0,
    gpa_point: 4.0,
    description: 'Outstanding Performance',
  },
  {
    id: '2',
    grade: 'A',
    min_percentage: 80.0,
    max_percentage: 89.99,
    gpa_point: 3.75,
    description: 'Excellent',
  },
  {
    id: '3',
    grade: 'B+',
    min_percentage: 70.0,
    max_percentage: 79.99,
    gpa_point: 3.25,
    description: 'Very Good',
  },
  {
    id: '4',
    grade: 'B',
    min_percentage: 60.0,
    max_percentage: 69.99,
    gpa_point: 2.75,
    description: 'Good',
  },
  {
    id: '5',
    grade: 'C',
    min_percentage: 50.0,
    max_percentage: 59.99,
    gpa_point: 2.0,
    description: 'Satisfactory / Average',
  },
  {
    id: '6',
    grade: 'D',
    min_percentage: 40.0,
    max_percentage: 49.99,
    gpa_point: 1.0,
    description: 'Pass',
  },
  {
    id: '7',
    grade: 'F',
    min_percentage: 0.0,
    max_percentage: 39.99,
    gpa_point: 0.0,
    description: 'Fail',
  },
];

export function calculatePercentage(obtained: number, max: number): number {
  if (max <= 0) return 0;
  if (obtained < 0) return 0;
  const percentage = (obtained / max) * 100;
  return Math.min(100, Math.round(percentage * 100) / 100);
}

export function isValidMark(obtained: number, max: number): { valid: boolean; message?: string } {
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

export function calculateGrade(
  percentage: number,
  customRules?: GradingRule[]
): { grade: string; gpaPoint: number; description: string } {
  const rules = customRules && customRules.length > 0 ? customRules : DEFAULT_GRADING_RULES;

  // Sort descending by min_percentage
  const sorted = [...rules].sort((a, b) => b.min_percentage - a.min_percentage);

  for (const rule of sorted) {
    if (percentage >= rule.min_percentage && percentage <= (rule.max_percentage + 0.01)) {
      return {
        grade: rule.grade,
        gpaPoint: rule.gpa_point,
        description: rule.description || '',
      };
    }
  }

  // Fallback to lowest or F
  const lowest = sorted[sorted.length - 1];
  return {
    grade: lowest?.grade || 'F',
    gpaPoint: lowest?.gpa_point || 0,
    description: lowest?.description || 'Fail',
  };
}

export function calculateOverallPerformance(
  marks: { marks_obtained: number; max_marks: number }[],
  customRules?: GradingRule[]
): {
  totalObtained: number;
  totalMax: number;
  averagePercentage: number;
  grade: string;
  gpaPoint: number;
  isPassing: boolean;
} {
  if (!marks || marks.length === 0) {
    return {
      totalObtained: 0,
      totalMax: 0,
      averagePercentage: 0,
      grade: 'N/A',
      gpaPoint: 0,
      isPassing: false,
    };
  }

  const totalObtained = marks.reduce((sum, m) => sum + Number(m.marks_obtained || 0), 0);
  const totalMax = marks.reduce((sum, m) => sum + Number(m.max_marks || 100), 0);
  const averagePercentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
  const roundedPercentage = Math.round(averagePercentage * 100) / 100;
  const gradeInfo = calculateGrade(roundedPercentage, customRules);

  return {
    totalObtained: Math.round(totalObtained * 100) / 100,
    totalMax: Math.round(totalMax * 100) / 100,
    averagePercentage: roundedPercentage,
    grade: gradeInfo.grade,
    gpaPoint: gradeInfo.gpaPoint,
    isPassing: roundedPercentage >= 40,
  };
}
