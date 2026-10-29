'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  fetchAttendance,
  fetchClasses,
  fetchStudents,
  fetchCollegeSettings,
} from '@/lib/data-provider';
import { AttendanceRecord, ClassItem, StudentItem, CollegeSettings } from '@/types/database';
import { formatDate } from '@/lib/utils';
import { convertToCSV, downloadCSV } from '@/lib/csv-export';
import { ArrowLeft, Printer, Download, GraduationCap } from 'lucide-react';

export default function DailyAttendanceReportPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [settings, setSettings] = useState<CollegeSettings | null>(null);
  const [selectedClassId, setSelectedClassId] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!selectedDate) {
      setSelectedDate(new Date().toISOString().split('T')[0]);
      return;
    }
    async function load() {
      try {
        setIsLoading(true);
        const [clsList, attList, stg] = await Promise.all([
          fetchClasses(),
          fetchAttendance({
            classId: selectedClassId,
            date: selectedDate,
          }),
          fetchCollegeSettings(),
        ]);
        setClasses(clsList);
        setAttendance(attList);
        setSettings(stg);
      } catch (err) {
        console.error('Failed to load daily attendance report:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [selectedClassId, selectedDate]);

  const handlePrint = () => {
    window.print();
  };

  const presentCount = attendance.filter((a) => a.status === 'present').length;
  const absentCount = attendance.filter((a) => a.status === 'absent').length;
  const leaveCount = attendance.filter((a) => a.status === 'leave').length;
  const total = attendance.length;
  const rate = total > 0 ? Math.round((presentCount / total) * 100) : 0;

  const handleExportCSV = () => {
    const exportData = attendance.map((a) => ({
      date: a.date,
      roll_number: a.student?.roll_number || '',
      student_name: a.student ? `${a.student.first_name} ${a.student.last_name}` : '',
      class: a.class ? `${a.class.name} (${a.class.section})` : '',
      status: a.status.toUpperCase(),
      remarks: a.remarks || 'None',
    }));

    const headers = [
      { key: 'date', label: 'Date' },
      { key: 'roll_number', label: 'Roll Number' },
      { key: 'student_name', label: 'Student Name' },
      { key: 'class', label: 'Class / Section' },
      { key: 'status', label: 'Status' },
      { key: 'remarks', label: 'Remarks' },
    ];

    const csv = convertToCSV(exportData, headers);
    downloadCSV(`daily_attendance_${selectedDate}.csv`, csv);
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between no-print">
        <Link href="/reports" className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-600 font-medium">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Reports</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={attendance.length === 0}>
            <Download className="w-4 h-4 mr-1.5" />
            <span>Download CSV</span>
          </Button>
          <Button variant="primary" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-1.5" />
            <span>Print Report</span>
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 no-print">
        <div className="w-full sm:w-64">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Target Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full text-xs rounded-lg border border-slate-300 bg-white py-2 px-3 text-slate-800"
          />
        </div>

        <div className="w-full sm:w-64">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Class Filter</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full text-xs rounded-lg border border-slate-300 bg-white py-2 px-3 text-slate-800"
          >
            <option value="all">All Classes & Sections</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.section})
              </option>
            ))}
          </select>
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
              <p className="text-xs text-slate-500">Official Daily Classroom Roll Call Audit</p>
            </div>
          </div>
          <div className="text-right">
            <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider">
              Daily Attendance Sheet
            </h3>
            <p className="text-xs text-slate-500">Date: {formatDate(selectedDate)}</p>
          </div>
        </div>

        {/* Aggregate KPI */}
        <div className="grid grid-cols-4 gap-3 text-center py-2 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase">Total Roster</span>
            <div className="text-lg font-bold text-slate-900">{total}</div>
          </div>
          <div>
            <span className="text-[10px] text-emerald-600 font-bold uppercase">Present</span>
            <div className="text-lg font-bold text-emerald-700">{presentCount}</div>
          </div>
          <div>
            <span className="text-[10px] text-rose-600 font-bold uppercase">Absent</span>
            <div className="text-lg font-bold text-rose-700">{absentCount}</div>
          </div>
          <div>
            <span className="text-[10px] text-blue-600 font-bold uppercase">Attendance %</span>
            <div className="text-lg font-bold text-blue-700">{rate}%</div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead className="bg-slate-100 border-b border-slate-300 font-semibold text-slate-900 uppercase">
              <tr>
                <th className="py-2.5 px-3">Roll No</th>
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Class / Section</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3">Faculty Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {attendance.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">
                    No attendance records logged for {formatDate(selectedDate)}.
                  </td>
                </tr>
              ) : (
                attendance.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-mono font-medium">{a.student?.roll_number}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {a.student ? `${a.student.first_name} ${a.student.last_name}` : 'Student'}
                    </td>
                    <td className="py-2.5 px-3">
                      {a.class ? `${a.class.name} (${a.class.section})` : 'Class'}
                    </td>
                    <td className="py-2.5 px-3 text-center uppercase font-bold">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] ${
                          a.status === 'present'
                            ? 'bg-emerald-50 text-emerald-700'
                            : a.status === 'absent'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{a.remarks || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
