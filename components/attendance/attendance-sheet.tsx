'use client';

import React, { useState, useEffect } from 'react';
import { StudentItem, ClassItem, AttendanceRecord, AttendanceStatus } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Check, X, Clock, Download, Save, Users } from 'lucide-react';
import { convertToCSV, downloadCSV } from '@/lib/csv-export';

interface AttendanceSheetProps {
  classes: ClassItem[];
  students: StudentItem[];
  existingAttendance: AttendanceRecord[];
  onSaveAttendance: (records: Partial<AttendanceRecord>[]) => Promise<void>;
  selectedClassId: string;
  onSelectClassId: (id: string) => void;
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export function AttendanceSheet({
  classes,
  students,
  existingAttendance,
  onSaveAttendance,
  selectedClassId,
  onSelectClassId,
  selectedDate,
  onSelectDate,
}: AttendanceSheetProps) {
  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, { status: AttendanceStatus; remarks: string }>
  >({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Filter students enrolled in current selected class
  const classStudents = students.filter((s) => s.class_id === selectedClassId);

  useEffect(() => {
    // Populate map with existing attendance or default to 'present'
    const initialMap: Record<string, { status: AttendanceStatus; remarks: string }> = {};
    for (const stu of classStudents) {
      const existing = existingAttendance.find((a) => a.student_id === stu.id);
      if (existing) {
        initialMap[stu.id] = {
          status: existing.status,
          remarks: existing.remarks || '',
        };
      } else {
        initialMap[stu.id] = {
          status: 'present',
          remarks: '',
        };
      }
    }
    setAttendanceMap(initialMap);
    setSaveSuccess(false);
  }, [selectedClassId, selectedDate, existingAttendance, students]);

  const setStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { remarks: '' }),
        status,
      },
    }));
    setSaveSuccess(false);
  };

  const setRemarks = (studentId: string, remarks: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { status: 'present' }),
        remarks,
      },
    }));
    setSaveSuccess(false);
  };

  const markAll = (status: AttendanceStatus) => {
    const updated: Record<string, { status: AttendanceStatus; remarks: string }> = {};
    for (const stu of classStudents) {
      updated[stu.id] = {
        status,
        remarks: attendanceMap[stu.id]?.remarks || '',
      };
    }
    setAttendanceMap(updated);
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const recordsToSave: Partial<AttendanceRecord>[] = classStudents.map((stu) => ({
        student_id: stu.id,
        class_id: selectedClassId,
        date: selectedDate,
        status: attendanceMap[stu.id]?.status || 'present',
        remarks: attendanceMap[stu.id]?.remarks || '',
      }));

      await onSaveAttendance(recordsToSave);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Save attendance error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportCSV = () => {
    const currentClass = classes.find((c) => c.id === selectedClassId);
    const exportData = classStudents.map((stu) => {
      const att = attendanceMap[stu.id] || { status: 'present', remarks: '' };
      return {
        date: selectedDate,
        class: currentClass ? `${currentClass.name} - ${currentClass.section}` : '',
        roll_number: stu.roll_number,
        student_name: `${stu.first_name} ${stu.last_name}`,
        status: att.status.toUpperCase(),
        remarks: att.remarks || 'None',
      };
    });

    const headers = [
      { key: 'date', label: 'Date' },
      { key: 'class', label: 'Class / Section' },
      { key: 'roll_number', label: 'Roll Number' },
      { key: 'student_name', label: 'Student Name' },
      { key: 'status', label: 'Attendance Status' },
      { key: 'remarks', label: 'Remarks' },
    ];

    const csv = convertToCSV(exportData, headers);
    downloadCSV(`attendance_${selectedClassId}_${selectedDate}.csv`, csv);
  };

  // Stats
  const total = classStudents.length;
  const presentCount = Object.values(attendanceMap).filter((v) => v.status === 'present').length;
  const absentCount = Object.values(attendanceMap).filter((v) => v.status === 'absent').length;
  const leaveCount = Object.values(attendanceMap).filter((v) => v.status === 'leave').length;
  const percent = total > 0 ? Math.round((presentCount / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Filters & Control Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
          <div className="w-full sm:w-64">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Select Class</label>
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

          <div className="w-full sm:w-48">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Attendance Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onSelectDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => markAll('present')}>
            All Present
          </Button>
          <Button variant="outline" size="sm" onClick={() => markAll('absent')}>
            All Absent
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={total === 0}>
            <Download className="w-4 h-4" />
            <span>CSV</span>
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave} isLoading={isSaving} disabled={total === 0}>
            <Save className="w-4 h-4" />
            <span>Save Attendance</span>
          </Button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Attendance records successfully synchronized and saved to the database.</span>
        </div>
      )}

      {/* Summary Chips */}
      {total > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-xs text-slate-500 font-medium">Total Enrolled</span>
            <div className="text-lg font-bold text-slate-900 mt-0.5">{total}</div>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-xs text-emerald-600 font-medium">Present Today</span>
            <div className="text-lg font-bold text-emerald-700 mt-0.5">{presentCount}</div>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-xs text-rose-600 font-medium">Absent</span>
            <div className="text-lg font-bold text-rose-700 mt-0.5">{absentCount}</div>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-xs text-blue-600 font-medium">Attendance Rate</span>
            <div className="text-lg font-bold text-blue-700 mt-0.5">{percent}%</div>
          </div>
        </div>
      )}

      {/* Student List Table */}
      {total === 0 ? (
        <EmptyState
          icon={<Users className="w-6 h-6" />}
          title="No Students Enrolled in this Class"
          description="There are currently no students registered in this section. Register students or choose another class."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Roll No.</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4 text-center">Status Toggle</th>
                  <th className="py-3 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classStudents.map((stu) => {
                  const state = attendanceMap[stu.id] || { status: 'present', remarks: '' };

                  return (
                    <tr key={stu.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-800 text-xs">
                        {stu.roll_number}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        {stu.first_name} {stu.last_name}
                        <span className="block text-[11px] text-slate-400 font-normal">{stu.student_id}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setStatus(stu.id, 'present')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                              state.status === 'present'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Present</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setStatus(stu.id, 'absent')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                              state.status === 'absent'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Absent</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setStatus(stu.id, 'leave')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                              state.status === 'leave'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Leave</span>
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <input
                          type="text"
                          placeholder="Optional remark..."
                          value={state.remarks}
                          onChange={(e) => setRemarks(stu.id, e.target.value)}
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
