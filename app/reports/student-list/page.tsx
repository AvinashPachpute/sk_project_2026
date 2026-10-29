'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fetchStudents, fetchClasses, fetchCollegeSettings } from '@/lib/data-provider';
import { StudentItem, ClassItem, CollegeSettings } from '@/types/database';
import { formatDate } from '@/lib/utils';
import { convertToCSV, downloadCSV } from '@/lib/csv-export';
import { ArrowLeft, Printer, Download, GraduationCap } from 'lucide-react';

export default function StudentListReportPage() {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [settings, setSettings] = useState<CollegeSettings | null>(null);
  const [selectedClassId, setSelectedClassId] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [generatedDate, setGeneratedDate] = useState('');

  useEffect(() => {
    setGeneratedDate(
      new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    );
  }, []);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const [stus, clsList, stg] = await Promise.all([
          fetchStudents({
            classId: selectedClassId,
            department: selectedDepartment,
          }),
          fetchClasses(),
          fetchCollegeSettings(),
        ]);
        setStudents(stus);
        setClasses(clsList);
        setSettings(stg);
      } catch (err) {
        console.error('Failed to load student list report:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [selectedClassId, selectedDepartment]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const exportData = students.map((s) => ({
      roll_number: s.roll_number,
      student_id: s.student_id,
      first_name: s.first_name,
      last_name: s.last_name,
      email: s.email || '',
      phone: s.phone || '',
      class: s.class ? `${s.class.name} (${s.class.section})` : '',
      department: s.department,
      enrollment_date: s.enrollment_date,
      status: s.status,
      guardian_name: s.guardian_name || '',
      guardian_phone: s.guardian_phone || '',
    }));

    const headers = [
      { key: 'roll_number', label: 'Roll Number' },
      { key: 'student_id', label: 'Student ID' },
      { key: 'first_name', label: 'First Name' },
      { key: 'last_name', label: 'Last Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'class', label: 'Class & Section' },
      { key: 'department', label: 'Department' },
      { key: 'enrollment_date', label: 'Enrollment Date' },
      { key: 'status', label: 'Status' },
      { key: 'guardian_name', label: 'Guardian Name' },
      { key: 'guardian_phone', label: 'Guardian Phone' },
    ];

    const csv = convertToCSV(exportData, headers);
    downloadCSV(`student_roster_report_${new Date().toISOString().split('T')[0]}.csv`, csv);
  };

  return (
    <DashboardLayout>
      {/* Top action toolbar */}
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

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 no-print">
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

        <div className="w-full sm:w-64">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full text-xs rounded-lg border border-slate-300 bg-white py-2 px-3 text-slate-800"
          >
            <option value="all">All Departments</option>
            <option value="Computer Science & Engineering">Computer Science & Engineering</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
            <option value="Civil Engineering">Civil Engineering</option>
          </select>
        </div>
      </div>

      {/* Printable Report Document */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
        {/* Institutional Letterhead Header */}
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
                Code: {settings?.college_code} • {settings?.email} • {settings?.phone}
              </p>
            </div>
          </div>
          <div className="text-right">
            <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider">
              Student Directory Report
            </h3>
            <p className="text-xs text-slate-500">
              Generated: {generatedDate || '—'}
            </p>
          </div>
        </div>

        {/* Report Content Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead className="bg-slate-100 border-b border-slate-300 font-semibold text-slate-900 uppercase">
              <tr>
                <th className="py-2.5 px-3">Roll No</th>
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Class / Section</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Contact</th>
                <th className="py-2.5 px-3">Guardian</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {students.map((stu) => (
                <tr key={stu.id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-mono font-medium">{stu.roll_number}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    {stu.first_name} {stu.last_name}
                  </td>
                  <td className="py-2.5 px-3">
                    {stu.class ? `${stu.class.name} (${stu.class.section})` : 'Unassigned'}
                  </td>
                  <td className="py-2.5 px-3">{stu.department}</td>
                  <td className="py-2.5 px-3">{stu.phone || stu.email || '—'}</td>
                  <td className="py-2.5 px-3">
                    {stu.guardian_name ? `${stu.guardian_name} (${stu.guardian_phone || '—'})` : '—'}
                  </td>
                  <td className="py-2.5 px-3 text-center capitalize">{stu.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
          <span>Total Records: {students.length} Student(s)</span>
          <span className="italic">Authorized System-Generated Official Educational Record</span>
        </div>
      </div>
    </DashboardLayout>
  );
}
