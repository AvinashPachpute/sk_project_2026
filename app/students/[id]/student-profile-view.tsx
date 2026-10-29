'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/empty-state';
import { StudentItem, AttendanceRecord, MarkItem } from '@/types/database';
import { formatDate, getInitials } from '@/lib/utils';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Building,
  Printer,
  Award,
  CheckCircle2,
  BookOpen,
  MapPin,
  UserCheck,
} from 'lucide-react';

interface StudentProfileViewProps {
  student: StudentItem;
  attendance: AttendanceRecord[];
  marks: MarkItem[];
  performance: {
    totalObtained: number;
    totalMax: number;
    averagePercentage: number;
    grade: string;
    gpaPoint: number;
    isPassing: boolean;
  };
  attendanceRate: number;
  presentDays: number;
  totalDays: number;
}

export function StudentProfileView({
  student,
  attendance,
  marks,
  performance,
  attendanceRate,
  presentDays,
  totalDays,
}: StudentProfileViewProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Student Profile & Details' },
    { id: 'attendance', label: 'Attendance Records', badge: attendance.length },
    { id: 'marks', label: 'Academic Transcript & Marks', badge: marks.length },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      {/* Top back bar */}
      <div className="flex items-center justify-between no-print">
        <Link href="/students" className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-600 font-medium">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Students Roster</span>
        </Link>
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-1.5" />
          <span>Print Transcript</span>
        </Button>
      </div>

      {/* Student Banner Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-900 to-blue-800 text-white font-bold text-xl flex items-center justify-center shrink-0 shadow-md shadow-blue-900/20">
            {getInitials(`${student.first_name} ${student.last_name}`)}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                {student.first_name} {student.last_name}
              </h1>
              <Badge variant={student.status === 'active' ? 'success' : 'default'} size="sm">
                {student.status.toUpperCase()}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap font-mono">
              <span>Roll: <strong className="text-slate-800">{student.roll_number}</strong></span>
              <span>•</span>
              <span>ID: <strong className="text-slate-800">{student.student_id}</strong></span>
              <span>•</span>
              <span className="font-sans font-medium text-blue-600">
                {student.class ? `${student.class.name} (${student.class.section})` : 'Unassigned Class'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick summary stats */}
        <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
          <div className="text-center">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">Attendance</span>
            <span className={`text-xl font-bold ${attendanceRate >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {attendanceRate}%
            </span>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="text-center">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">Avg Score</span>
            <span className="text-xl font-bold text-blue-600">
              {performance.averagePercentage}%
            </span>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="text-center">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">Grade</span>
            <span className="text-xl font-bold text-slate-900">
              {performance.grade}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="no-print">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* Tab 1: Overview */}
      {(activeTab === 'overview' || typeof window === 'undefined') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Academic Enrollment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Department</span>
                <span className="font-semibold text-slate-800">{student.department}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Class & Section</span>
                <span className="font-semibold text-slate-800">
                  {student.class ? `${student.class.name} - ${student.class.section}` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Academic Year</span>
                <span className="font-semibold text-slate-800">{student.academic_year}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Enrollment Date</span>
                <span className="font-semibold text-slate-800">{formatDate(student.enrollment_date)}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Academic Standing</span>
                <Badge variant={performance.isPassing ? 'success' : 'danger'} size="sm">
                  {performance.isPassing ? 'Passing in Good Standing' : 'Academic Warning'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Personal & Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Email Address</span>
                <span className="font-semibold text-slate-800">{student.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Phone Number</span>
                <span className="font-semibold text-slate-800">{student.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Gender</span>
                <span className="font-semibold text-slate-800">{student.gender || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Date of Birth</span>
                <span className="font-semibold text-slate-800">{formatDate(student.date_of_birth)}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Permanent Address</span>
                <span className="font-semibold text-slate-800 text-right max-w-xs">{student.address || 'N/A'}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Guardian & Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block mb-1">Guardian Name</span>
                <strong className="text-slate-900 text-sm">{student.guardian_name || 'Not provided'}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block mb-1">Contact Phone</span>
                <strong className="text-slate-900 text-sm">{student.guardian_phone || 'Not provided'}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block mb-1">Relationship</span>
                <strong className="text-slate-900 text-sm">{student.guardian_relation || 'Parent'}</strong>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 2: Attendance History */}
      {activeTab === 'attendance' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Attendance History Log</CardTitle>
              <p className="text-xs text-slate-500">
                Present {presentDays} of {totalDays} recorded session(s) ({attendanceRate}%)
              </p>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {attendance.length === 0 ? (
              <EmptyState
                title="No Attendance Recorded"
                description="This student has no attendance records logged in the database yet."
                className="m-6"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-700 uppercase">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Class</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attendance.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 text-xs font-medium text-slate-900">{formatDate(rec.date)}</td>
                        <td className="py-3 px-4 text-xs text-slate-700">
                          {rec.class ? `${rec.class.name} (${rec.class.section})` : 'Assigned Class'}
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
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Marks & Academic Transcript */}
      {activeTab === 'marks' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Official Academic Transcript</CardTitle>
              <p className="text-xs text-slate-500">
                Cumulative Grade: <strong className="text-slate-900">{performance.grade}</strong> (
                {performance.averagePercentage}%) • GPA Points: {performance.gpaPoint}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handlePrint} className="no-print">
              <Printer className="w-4 h-4 mr-1.5" />
              <span>Print Grade Sheet</span>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {marks.length === 0 ? (
              <EmptyState
                icon={<Award className="w-6 h-6" />}
                title="No Examination Marks Recorded"
                description="Examination scores will appear here once faculty records grades."
                className="m-6"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-700 uppercase">
                    <tr>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Examination</th>
                      <th className="py-3 px-4 text-center">Marks Obtained</th>
                      <th className="py-3 px-4 text-center">Max Marks</th>
                      <th className="py-3 px-4 text-center">Percentage</th>
                      <th className="py-3 px-4">Faculty Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {marks.map((m) => {
                      const pct = m.max_marks > 0 ? Math.round((m.marks_obtained / m.max_marks) * 100) : 0;
                      return (
                        <tr key={m.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-medium text-slate-900">
                            {m.subject ? `${m.subject.code} — ${m.subject.name}` : 'Course Subject'}
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-600">
                            {m.examination ? m.examination.name : 'Exam'}
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">
                            {m.marks_obtained}
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-xs text-slate-500">
                            {m.max_marks}
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-xs font-semibold text-blue-600">
                            {pct}%
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-500">{m.remarks || '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
