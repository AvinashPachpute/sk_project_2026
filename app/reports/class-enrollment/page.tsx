'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { fetchClasses, fetchStudents, fetchCollegeSettings } from '@/lib/data-provider';
import { ClassItem, StudentItem, CollegeSettings } from '@/types/database';
import { convertToCSV, downloadCSV } from '@/lib/csv-export';
import { ArrowLeft, Printer, Download, GraduationCap } from 'lucide-react';

export default function ClassEnrollmentReportPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [settings, setSettings] = useState<CollegeSettings | null>(null);

  useEffect(() => {
    async function load() {
      const [clsList, stuList, stg] = await Promise.all([
        fetchClasses(),
        fetchStudents(),
        fetchCollegeSettings(),
      ]);
      setClasses(clsList);
      setStudents(stuList);
      setSettings(stg);
    }
    load();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const rows = classes.map((cls) => {
    const enrolled = students.filter((s) => s.class_id === cls.id).length;
    const capacity = cls.capacity || 60;
    const vacancy = Math.max(0, capacity - enrolled);
    const utilPercent = Math.round((enrolled / capacity) * 100);
    return {
      cls,
      enrolled,
      capacity,
      vacancy,
      utilPercent,
    };
  });

  const totalEnrolled = rows.reduce((sum, r) => sum + r.enrolled, 0);
  const totalCapacity = rows.reduce((sum, r) => sum + r.capacity, 0);
  const totalVacancy = Math.max(0, totalCapacity - totalEnrolled);
  const overallUtil = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;

  const handleExportCSV = () => {
    const exportData = rows.map((r) => ({
      class_name: r.cls.name,
      section: r.cls.section,
      department: r.cls.department,
      semester: r.cls.semester || '1st Semester',
      academic_year: r.cls.academic_year,
      enrolled_count: r.enrolled,
      max_capacity: r.capacity,
      vacancy: r.vacancy,
      utilization: `${r.utilPercent}%`,
    }));

    const headers = [
      { key: 'class_name', label: 'Class / Degree' },
      { key: 'section', label: 'Section' },
      { key: 'department', label: 'Department' },
      { key: 'semester', label: 'Semester' },
      { key: 'academic_year', label: 'Academic Year' },
      { key: 'enrolled_count', label: 'Enrolled' },
      { key: 'max_capacity', label: 'Capacity' },
      { key: 'vacancy', label: 'Available Vacancy' },
      { key: 'utilization', label: 'Utilization %' },
    ];

    const csv = convertToCSV(exportData, headers);
    downloadCSV(`class_enrollment_report_${new Date().toISOString().split('T')[0]}.csv`, csv);
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
                Official Class Enrollment & Cohort Capacity Distribution
              </p>
            </div>
          </div>
          <div className="text-right">
            <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider">
              Enrollment Summary
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
                <th className="py-2.5 px-3">Class / Program</th>
                <th className="py-2.5 px-3">Section</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Semester</th>
                <th className="py-2.5 px-3 text-center">Enrolled</th>
                <th className="py-2.5 px-3 text-center">Capacity</th>
                <th className="py-2.5 px-3 text-center">Vacant</th>
                <th className="py-2.5 px-3 text-center">Utilization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rows.map((r) => (
                <tr key={r.cls.id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{r.cls.name}</td>
                  <td className="py-2.5 px-3 font-mono font-medium">{r.cls.section}</td>
                  <td className="py-2.5 px-3">{r.cls.department}</td>
                  <td className="py-2.5 px-3">{r.cls.semester}</td>
                  <td className="py-2.5 px-3 text-center font-bold font-mono">{r.enrolled}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-500">{r.capacity}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-500">{r.vacancy}</td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-blue-700">
                    {r.utilPercent}%
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-50 font-bold border-t-2 border-slate-300">
                <td colSpan={4} className="py-3 px-3 uppercase text-slate-900">
                  Total Institutional Totals
                </td>
                <td className="py-3 px-3 text-center font-mono text-sm text-blue-900">{totalEnrolled}</td>
                <td className="py-3 px-3 text-center font-mono text-sm text-slate-800">{totalCapacity}</td>
                <td className="py-3 px-3 text-center font-mono text-sm text-slate-800">{totalVacancy}</td>
                <td className="py-3 px-3 text-center font-mono text-sm text-blue-900">{overallUtil}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
