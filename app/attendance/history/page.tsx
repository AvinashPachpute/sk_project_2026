'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { fetchAttendance, fetchClasses, fetchStudents } from '@/lib/data-provider';
import { AttendanceRecord, ClassItem, StudentItem } from '@/types/database';
import { formatDate } from '@/lib/utils';
import { convertToCSV, downloadCSV } from '@/lib/csv-export';
import { ArrowLeft, Download, History, Calendar } from 'lucide-react';

export default function AttendanceHistoryPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [clsList, stuList, attList] = await Promise.all([
        fetchClasses(),
        fetchStudents(),
        fetchAttendance({
          classId: selectedClassId,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }),
      ]);
      setClasses(clsList);
      setStudents(stuList);
      setAttendance(attList);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedClassId, startDate, endDate]);

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
    downloadCSV(`attendance_history_${new Date().toISOString().split('T')[0]}.csv`, csv);
  };

  // Student summary calculations
  const studentStats = students
    .filter((s) => selectedClassId === 'all' || s.class_id === selectedClassId)
    .map((stu) => {
      const stuRecords = attendance.filter((a) => a.student_id === stu.id);
      const total = stuRecords.length;
      const present = stuRecords.filter((a) => a.status === 'present').length;
      const pct = total > 0 ? Math.round((present / total) * 100) : 0;
      return {
        student: stu,
        total,
        present,
        pct,
      };
    });

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/attendance" className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Attendance Sheet</span>
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Attendance History & Analytics</h1>
          <p className="text-xs text-slate-500 mt-1">
            Historical audit logs, date range filtration, and student-wise attendance percentage summaries.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={attendance.length === 0}>
          <Download className="w-4 h-4 mr-1.5" />
          <span>Export History CSV</span>
        </Button>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Class Filter</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full text-xs rounded-lg border border-slate-300 bg-white py-2 px-3 text-slate-800 focus:outline-none"
          >
            <option value="all">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.section})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full text-xs rounded-lg border border-slate-300 bg-white py-2 px-3 text-slate-800 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full text-xs rounded-lg border border-slate-300 bg-white py-2 px-3 text-slate-800 focus:outline-none"
          />
        </div>
      </div>

      {/* Student Aggregate Summary Cards */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Student Attendance Summary in Period</h3>
          <span className="text-xs text-slate-500">{studentStats.length} enrolled students</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-700 uppercase">
              <tr>
                <th className="py-2.5 px-4">Roll No.</th>
                <th className="py-2.5 px-4">Student Name</th>
                <th className="py-2.5 px-4">Class</th>
                <th className="py-2.5 px-4 text-center">Sessions Logged</th>
                <th className="py-2.5 px-4 text-center">Days Present</th>
                <th className="py-2.5 px-4 text-center">Attendance %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {studentStats.map((item) => (
                <tr key={item.student.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-mono text-xs">{item.student.roll_number}</td>
                  <td className="py-3 px-4 font-medium text-slate-900">
                    <Link href={`/students/${item.student.id}`} className="hover:text-blue-600">
                      {item.student.first_name} {item.student.last_name}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-700">
                    {item.student.class ? `${item.student.class.name} (${item.student.class.section})` : 'Unassigned'}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-xs text-slate-700">{item.total}</td>
                  <td className="py-3 px-4 text-center font-mono text-xs font-bold text-emerald-700">
                    {item.present}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                        item.pct >= 75
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {item.pct}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Log Entries */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Historical Attendance Entries Log</h3>
          <span className="text-xs text-slate-500">Showing {attendance.length} record(s)</span>
        </div>
        {attendance.length === 0 ? (
          <EmptyState
            title="No Attendance Logs Found"
            description="There are no records matching your date or class filters."
            className="m-6"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-700 uppercase">
                <tr>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Student</th>
                  <th className="py-2.5 px-4">Class</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                  <th className="py-2.5 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendance.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 text-xs font-medium text-slate-900">{formatDate(rec.date)}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {rec.student ? `${rec.student.first_name} ${rec.student.last_name}` : 'Student'}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-700">
                      {rec.class ? `${rec.class.name} (${rec.class.section})` : 'Class'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant={
                          rec.status === 'present'
                            ? 'success'
                            : rec.status === 'absent'
                            ? 'danger'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {rec.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">{rec.remarks || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
