import React from 'react';
import { notFound } from 'next/navigation';
import { fetchStudentById, fetchAttendance, fetchMarks, fetchGradingRules } from '@/lib/data-provider';
import { calculateOverallPerformance } from '@/lib/grading';
import { StudentProfileView } from './student-profile-view';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const instant = false;

export default async function StudentProfilePage({ params }: PageProps) {
  const { id } = await params;
  const student = await fetchStudentById(id);

  if (!student) {
    notFound();
  }

  const [attendance, marks, gradingRules] = await Promise.all([
    fetchAttendance({ studentId: id }),
    fetchMarks({ studentId: id }),
    fetchGradingRules(),
  ]);

  const performance = calculateOverallPerformance(marks, gradingRules);

  const totalDays = attendance.length;
  const presentDays = attendance.filter((a) => a.status === 'present').length;
  const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  return (
    <StudentProfileView
      student={student}
      attendance={attendance}
      marks={marks}
      performance={performance}
      attendanceRate={attendanceRate}
      presentDays={presentDays}
      totalDays={totalDays}
    />
  );
}
