'use client';

import React, { useState, useEffect } from 'react';
import {
  StudentItem,
  ClassItem,
  SubjectItem,
  ExaminationItem,
  MarkItem,
  GradingRule,
} from '@/types/database';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { calculatePercentage, calculateGrade, isValidMark } from '@/lib/grading';
import { convertToCSV, downloadCSV } from '@/lib/csv-export';
import { Save, Download, Award, Check } from 'lucide-react';

interface MarksEntrySheetProps {
  classes: ClassItem[];
  subjects: SubjectItem[];
  examinations: ExaminationItem[];
  students: StudentItem[];
  existingMarks: MarkItem[];
  gradingRules: GradingRule[];
  onSaveMarks: (marks: Partial<MarkItem>[]) => Promise<void>;
  selectedClassId: string;
  onSelectClassId: (id: string) => void;
  selectedSubjectId: string;
  onSelectSubjectId: (id: string) => void;
  selectedExamId: string;
  onSelectExamId: (id: string) => void;
}

export function MarksEntrySheet({
  classes,
  subjects,
  examinations,
  students,
  existingMarks,
  gradingRules,
  onSaveMarks,
  selectedClassId,
  onSelectClassId,
  selectedSubjectId,
  onSelectSubjectId,
  selectedExamId,
  onSelectExamId,
}: MarksEntrySheetProps) {
  const [maxMarks, setMaxMarks] = useState<number>(100);
  const [marksMap, setMarksMap] = useState<
    Record<string, { obtained: number | ''; remarks: string; error?: string }>
  >({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Filter students belonging to selected class
  const classStudents = students.filter((s) => s.class_id === selectedClassId);

  useEffect(() => {
    const initialMap: Record<string, { obtained: number | ''; remarks: string; error?: string }> = {};
    for (const stu of classStudents) {
      const existing = existingMarks.find(
        (m) =>
          m.student_id === stu.id &&
          m.examination_id === selectedExamId &&
          m.subject_id === selectedSubjectId
      );
      if (existing) {
        initialMap[stu.id] = {
          obtained: existing.marks_obtained,
          remarks: existing.remarks || '',
        };
        if (existing.max_marks) {
          setMaxMarks(existing.max_marks);
        }
      } else {
        initialMap[stu.id] = {
          obtained: '',
          remarks: '',
        };
      }
    }
    setMarksMap(initialMap);
    setSaveSuccess(false);
  }, [selectedClassId, selectedSubjectId, selectedExamId, existingMarks, students]);

  const handleMarkChange = (studentId: string, valStr: string) => {
    if (valStr === '') {
      setMarksMap((prev) => ({
        ...prev,
        [studentId]: {
          ...(prev[studentId] || { remarks: '' }),
          obtained: '',
          error: undefined,
        },
      }));
      return;
    }

    const num = parseFloat(valStr);
    const validation = isValidMark(num, maxMarks);

    setMarksMap((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { remarks: '' }),
        obtained: isNaN(num) ? '' : num,
        error: validation.valid ? undefined : validation.message,
      },
    }));
    setSaveSuccess(false);
  };

  const handleRemarkChange = (studentId: string, remarks: string) => {
    setMarksMap((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { obtained: '' }),
        remarks,
      },
    }));
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    // Check if any errors
    const hasErrors = Object.values(marksMap).some((v) => Boolean(v.error));
    if (hasErrors) {
      alert('Please correct the highlighted validation errors before saving.');
      return;
    }

    try {
      setIsSaving(true);
      const recordsToSave: Partial<MarkItem>[] = classStudents
        .filter((stu) => marksMap[stu.id]?.obtained !== '')
        .map((stu) => ({
          student_id: stu.id,
          examination_id: selectedExamId,
          subject_id: selectedSubjectId,
          marks_obtained: Number(marksMap[stu.id]?.obtained || 0),
          max_marks: maxMarks,
          remarks: marksMap[stu.id]?.remarks || '',
        }));

      await onSaveMarks(recordsToSave);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Save marks error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportCSV = () => {
    const exam = examinations.find((e) => e.id === selectedExamId);
    const sub = subjects.find((s) => s.id === selectedSubjectId);
    const cls = classes.find((c) => c.id === selectedClassId);

    const exportData = classStudents.map((stu) => {
      const entry = marksMap[stu.id];
      const obt = typeof entry?.obtained === 'number' ? entry.obtained : 0;
      const pct = calculatePercentage(obt, maxMarks);
      const grade = calculateGrade(pct, gradingRules);

      return {
        exam: exam?.name || '',
        class: cls ? `${cls.name} (${cls.section})` : '',
        subject: sub ? `${sub.code} - ${sub.name}` : '',
        roll_number: stu.roll_number,
        student_name: `${stu.first_name} ${stu.last_name}`,
        marks_obtained: entry?.obtained !== '' ? obt : 'N/A',
        max_marks: maxMarks,
        percentage: `${pct}%`,
        grade: grade.grade,
        remarks: entry?.remarks || 'None',
      };
    });

    const headers = [
      { key: 'exam', label: 'Examination' },
      { key: 'class', label: 'Class' },
      { key: 'subject', label: 'Subject' },
      { key: 'roll_number', label: 'Roll Number' },
      { key: 'student_name', label: 'Student Name' },
      { key: 'marks_obtained', label: 'Marks Obtained' },
      { key: 'max_marks', label: 'Maximum Marks' },
      { key: 'percentage', label: 'Percentage' },
      { key: 'grade', label: 'Letter Grade' },
      { key: 'remarks', label: 'Remarks' },
    ];

    const csv = convertToCSV(exportData, headers);
    downloadCSV(`marks_${selectedExamId}_${selectedSubjectId}.csv`, csv);
  };

  const total = classStudents.length;

  return (
    <div className="space-y-6">
      {/* Selector & Actions Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 flex-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Examination</label>
            <select
              value={selectedExamId}
              onChange={(e) => onSelectExamId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {examinations.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Class / Section</label>
            <select
              value={selectedClassId}
              onChange={(e) => onSelectClassId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.section})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Subject</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => onSelectSubjectId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code} - {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Max Marks</label>
            <input
              type="number"
              min="1"
              value={maxMarks}
              onChange={(e) => setMaxMarks(parseFloat(e.target.value) || 100)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={total === 0}>
            <Download className="w-4 h-4" />
            <span>CSV</span>
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave} isLoading={isSaving} disabled={total === 0}>
            <Save className="w-4 h-4" />
            <span>Save Marks</span>
          </Button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Marks successfully committed and recalculated in the database.</span>
        </div>
      )}

      {/* Marks Table */}
      {total === 0 ? (
        <EmptyState
          icon={<Award className="w-6 h-6" />}
          title="No Students to Grade"
          description="There are currently no students registered in this class. Enroll students first to grade examinations."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Roll No.</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4 w-36">Marks (Max: {maxMarks})</th>
                  <th className="py-3 px-4 text-center">Percentage</th>
                  <th className="py-3 px-4 text-center">Grade</th>
                  <th className="py-3 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classStudents.map((stu) => {
                  const entry = marksMap[stu.id] || { obtained: '', remarks: '' };
                  const isEntered = entry.obtained !== '';
                  const obtNum = isEntered ? Number(entry.obtained) : 0;
                  const pct = isEntered ? calculatePercentage(obtNum, maxMarks) : null;
                  const grade = pct !== null ? calculateGrade(pct, gradingRules) : null;

                  return (
                    <tr key={stu.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-800 text-xs">
                        {stu.roll_number}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        {stu.first_name} {stu.last_name}
                      </td>
                      <td className="py-3.5 px-4">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max={maxMarks}
                          placeholder="0.0"
                          value={entry.obtained}
                          onChange={(e) => handleMarkChange(stu.id, e.target.value)}
                          className={`w-full text-xs rounded-lg border bg-white px-2.5 py-1.5 text-slate-800 focus:outline-none ${
                            entry.error
                              ? 'border-red-400 focus:border-red-500 text-red-700'
                              : 'border-slate-300 focus:border-blue-500'
                          }`}
                        />
                        {entry.error && <p className="text-[10px] text-red-600 mt-0.5">{entry.error}</p>}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-medium text-xs">
                        {pct !== null ? `${pct}%` : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {grade ? (
                          <Badge
                            variant={
                              grade.grade.startsWith('A')
                                ? 'success'
                                : grade.grade.startsWith('B')
                                ? 'info'
                                : grade.grade.startsWith('C')
                                ? 'warning'
                                : 'danger'
                            }
                            size="sm"
                          >
                            {grade.grade}
                          </Badge>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <input
                          type="text"
                          placeholder="Optional feedback..."
                          value={entry.remarks}
                          onChange={(e) => handleRemarkChange(stu.id, e.target.value)}
                          className="w-full text-xs rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
