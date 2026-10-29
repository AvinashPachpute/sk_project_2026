'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  fetchExaminations,
  fetchClasses,
  fetchSubjects,
  fetchMarks,
  fetchGradingRules,
  fetchCollegeSettings,
} from '@/lib/data-provider';
import {
  ExaminationItem,
  ClassItem,
  SubjectItem,
  MarkItem,
  GradingRule,
  CollegeSettings,
} from '@/types/database';
import { calculatePercentage, calculateGrade } from '@/lib/grading';
import { convertToCSV, downloadCSV } from '@/lib/csv-export';
import { ArrowLeft, Printer, Download, GraduationCap, Award } from 'lucide-react';

export default function ExamMarksReportPage() {
  const [examinations, setExaminations] = useState<ExaminationItem[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [marks, setMarks] = useState<MarkItem[]>([]);
  const [gradingRules, setGradingRules] = useState<GradingRule[]>([]);
  const [settings, setSettings] = useState<CollegeSettings | null>(null);

  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('all');

  useEffect(() => {
    async function load() {
      const [exams, clsList, subs, allMarks, rules, stg] = await Promise.all([
        fetchExaminations(),
        fetchClasses(),
        fetchSubjects(),
        fetchMarks(),
        fetchGradingRules(),
        fetchCollegeSettings(),
      ]);
      setExaminations(exams);
      setClasses(clsList);
      setSubjects(subs);
      setMarks(allMarks);
      setGradingRules(rules);
      setSettings(stg);
      if (exams.length > 0 && !selectedExamId) {
        setSelectedExamId(exams[0].id);
      }
    }
    load();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const filteredMarks = marks.filter((m) => {
    if (selectedExamId && m.examination_id !== selectedExamId) return false;
    if (selectedSubjectId !== 'all' && m.subject_id !== selectedSubjectId) return false;
    return true;
  });

  const scores = filteredMarks.map((m) => calculatePercentage(m.marks_obtained, m.max_marks));
  const avg = scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0;
  const highest = scores.length > 0 ? Math.max(...scores) : 0;
  const lowest = scores.length > 0 ? Math.min(...scores) : 0;
  const passCount = scores.filter((s) => s >= 40).length;
  const passRate = scores.length > 0 ? Math.round((passCount / scores.length) * 100) : 0;

  const handleExportCSV = () => {
    const exportData = filteredMarks.map((m) => {
      const pct = calculatePercentage(m.marks_obtained, m.max_marks);
      const grade = calculateGrade(pct, gradingRules);
      return {
        roll_number: m.student?.roll_number || '',
        student_name: m.student ? `${m.student.first_name} ${m.student.last_name}` : '',
        exam: m.examination?.name || '',
        subject: m.subject ? `${m.subject.code} - ${m.subject.name}` : '',
        marks_obtained: m.marks_obtained,
        max_marks: m.max_marks,
        percentage: `${pct}%`,
        grade: grade.grade,
        remarks: m.remarks || 'None',
      };
    });

    const headers = [
      { key: 'roll_number', label: 'Roll Number' },
      { key: 'student_name', label: 'Student Name' },
      { key: 'exam', label: 'Examination' },
      { key: 'subject', label: 'Subject' },
      { key: 'marks_obtained', label: 'Marks Obtained' },
      { key: 'max_marks', label: 'Max Marks' },
      { key: 'percentage', label: 'Percentage' },
      { key: 'grade', label: 'Letter Grade' },
      { key: 'remarks', label: 'Remarks' },
    ];

    const csv = convertToCSV(exportData, headers);
    downloadCSV(`exam_marks_report_${new Date().toISOString().split('T')[0]}.csv`, csv);
  };

  const currentExam = examinations.find((e) => e.id === selectedExamId);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between no-print">
        <Link href="/reports" className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-600 font-medium">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Reports</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={filteredMarks.length === 0}>
            <Download className="w-4 h-4 mr-1.5" />
            <span>Download CSV</span>
          </Button>
          <Button variant="primary" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-1.5" />
            <span>Print Report</span>
          </Button>
        </div>
      </div>

      {/* Filter controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 no-print">
        <div className="w-full sm:w-72">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Select Examination</label>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="w-full text-xs rounded-lg border border-slate-300 bg-white py-2 px-3 text-slate-800"
          >
            {examinations.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-72">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Select Subject</label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full text-xs rounded-lg border border-slate-300 bg-white py-2 px-3 text-slate-800"
          >
            <option value="all">All Subjects</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.code} - {sub.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 no-print">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Class Average</span>
          <div className="text-lg font-bold text-blue-700 mt-0.5">{avg}%</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-emerald-600 font-medium">Highest Score</span>
          <div className="text-lg font-bold text-emerald-700 mt-0.5">{highest}%</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-rose-600 font-medium">Lowest Score</span>
          <div className="text-lg font-bold text-rose-700 mt-0.5">{lowest}%</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Pass Percentage</span>
          <div className="text-lg font-bold text-slate-900 mt-0.5">{passRate}%</div>
        </div>
      </div>

      {/* Printable Sheet */}
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
                Official Examination Scoresheet & Grade Audit
              </p>
            </div>
          </div>
          <div className="text-right">
            <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider">
              {currentExam?.name || 'Examination Marks Report'}
            </h3>
            <p className="text-xs text-slate-500">
              Session: {currentExam?.academic_year || '2024-2025'}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead className="bg-slate-100 border-b border-slate-300 font-semibold text-slate-900 uppercase">
              <tr>
                <th className="py-2.5 px-3">Roll No</th>
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Subject</th>
                <th className="py-2.5 px-3 text-center">Marks Obtained</th>
                <th className="py-2.5 px-3 text-center">Max Marks</th>
                <th className="py-2.5 px-3 text-center">Percentage</th>
                <th className="py-2.5 px-3 text-center">Grade</th>
                <th className="py-2.5 px-3">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredMarks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-400">
                    No graded marks found for the selected examination criteria.
                  </td>
                </tr>
              ) : (
                filteredMarks.map((m) => {
                  const pct = calculatePercentage(m.marks_obtained, m.max_marks);
                  const grade = calculateGrade(pct, gradingRules);
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-mono font-medium">{m.student?.roll_number}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {m.student ? `${m.student.first_name} ${m.student.last_name}` : 'Student'}
                      </td>
                      <td className="py-2.5 px-3">
                        {m.subject ? `${m.subject.code} — ${m.subject.name}` : 'Subject'}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold">{m.marks_obtained}</td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-500">{m.max_marks}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-blue-700">{pct}%</td>
                      <td className="py-2.5 px-3 text-center font-bold">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] ${
                            grade.grade.startsWith('A')
                              ? 'bg-emerald-50 text-emerald-800'
                              : grade.grade.startsWith('B')
                              ? 'bg-blue-50 text-blue-800'
                              : 'bg-amber-50 text-amber-800'
                          }`}
                        >
                          {grade.grade}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">{m.remarks || '—'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
