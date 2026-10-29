'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  fetchStudents,
  fetchMarks,
  fetchGradingRules,
  fetchCollegeSettings,
} from '@/lib/data-provider';
import { StudentItem, MarkItem, GradingRule, CollegeSettings } from '@/types/database';
import { calculateOverallPerformance } from '@/lib/grading';
import { convertToCSV, downloadCSV } from '@/lib/csv-export';
import { ArrowLeft, Printer, Download, GraduationCap, Award } from 'lucide-react';

export default function AcademicPerformanceReportPage() {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [marks, setMarks] = useState<MarkItem[]>([]);
  const [gradingRules, setGradingRules] = useState<GradingRule[]>([]);
  const [settings, setSettings] = useState<CollegeSettings | null>(null);

  useEffect(() => {
    async function load() {
      const [stuList, marksList, rules, stg] = await Promise.all([
        fetchStudents(),
        fetchMarks(),
        fetchGradingRules(),
        fetchCollegeSettings(),
      ]);
      setStudents(stuList);
      setMarks(marksList);
      setGradingRules(rules);
      setSettings(stg);
    }
    load();
  }, []);

  const performanceRows = students
    .map((stu) => {
      const stuMarks = marks.filter((m) => m.student_id === stu.id);
      const perf = calculateOverallPerformance(stuMarks, gradingRules);
      return {
        student: stu,
        evaluationsCount: stuMarks.length,
        ...perf,
      };
    })
    .sort((a, b) => b.averagePercentage - a.averagePercentage);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const exportData = performanceRows.map((r, idx) => ({
      rank: idx + 1,
      roll_number: r.student.roll_number,
      student_name: `${r.student.first_name} ${r.student.last_name}`,
      class: r.student.class ? `${r.student.class.name} (${r.student.class.section})` : '',
      department: r.student.department,
      tests_taken: r.evaluationsCount,
      total_obtained: r.totalObtained,
      total_max: r.totalMax,
      percentage: `${r.averagePercentage}%`,
      gpa_point: r.gpaPoint,
      grade: r.grade,
      standing: r.isPassing ? 'Passing' : 'Academic Warning',
    }));

    const headers = [
      { key: 'rank', label: 'Rank' },
      { key: 'roll_number', label: 'Roll Number' },
      { key: 'student_name', label: 'Student Name' },
      { key: 'class', label: 'Class / Section' },
      { key: 'department', label: 'Department' },
      { key: 'tests_taken', label: 'Exams Graded' },
      { key: 'total_obtained', label: 'Marks Obtained' },
      { key: 'total_max', label: 'Maximum Marks' },
      { key: 'percentage', label: 'Percentage' },
      { key: 'gpa_point', label: 'GPA Points' },
      { key: 'grade', label: 'Cumulative Grade' },
      { key: 'standing', label: 'Academic Standing' },
    ];

    const csv = convertToCSV(exportData, headers);
    downloadCSV(`academic_rankings_${new Date().toISOString().split('T')[0]}.csv`, csv);
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between no-print">
        <Link href="/reports" className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-600 font-medium">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Reports</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-1.5" />
            <span>Download CSV</span>
          </Button>
          <Button variant="primary" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-1.5" />
            <span>Print Report</span>
          </Button>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
        <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {settings?.college_name || 'Apex Institute of Technology'}
              </h2>
              <p className="text-xs text-slate-500">
                Cumulative Institutional Academic Performance & Honor Roll
              </p>
            </div>
          </div>
          <div className="text-right">
            <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider">
              Merit & Performance Ranking
            </h3>
            <p className="text-xs text-slate-500">
              Session: {settings?.academic_year || '2024-2025'}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead className="bg-slate-100 border-b border-slate-300 font-semibold text-slate-900 uppercase">
              <tr>
                <th className="py-2.5 px-3 text-center">Rank</th>
                <th className="py-2.5 px-3">Roll No</th>
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Class</th>
                <th className="py-2.5 px-3 text-center">Evaluations</th>
                <th className="py-2.5 px-3 text-center">Total Marks</th>
                <th className="py-2.5 px-3 text-center">Percentage</th>
                <th className="py-2.5 px-3 text-center">GPA</th>
                <th className="py-2.5 px-3 text-center">Grade</th>
                <th className="py-2.5 px-3 text-center">Standing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {performanceRows.map((r, idx) => (
                <tr key={r.student.id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 text-center font-bold font-mono text-slate-800">
                    {idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : idx + 1}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-medium">{r.student.roll_number}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    <Link href={`/students/${r.student.id}`} className="hover:text-blue-600">
                      {r.student.first_name} {r.student.last_name}
                    </Link>
                  </td>
                  <td className="py-2.5 px-3">
                    {r.student.class ? `${r.student.class.name} (${r.student.class.section})` : 'Unassigned'}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono">{r.evaluationsCount}</td>
                  <td className="py-2.5 px-3 text-center font-mono">
                    {r.totalObtained} / {r.totalMax}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-blue-700">
                    {r.averagePercentage}%
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">
                    {r.gpaPoint}
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] ${
                        r.grade.startsWith('A')
                          ? 'bg-emerald-50 text-emerald-800'
                          : r.grade.startsWith('B')
                          ? 'bg-blue-50 text-blue-800'
                          : 'bg-amber-50 text-amber-800'
                      }`}
                    >
                      {r.grade}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <Badge variant={r.isPassing ? 'success' : 'danger'} size="sm">
                      {r.isPassing ? 'Passing' : 'Warning'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
