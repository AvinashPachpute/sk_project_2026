'use client';

import React from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  Users,
  School,
  CalendarCheck,
  FileSpreadsheet,
  Award,
  BarChart3,
  ArrowRight,
  Download,
  Printer,
} from 'lucide-react';

export default function ReportsHubPage() {
  const reports = [
    {
      title: 'Student Directory Report',
      description: 'Comprehensive roster of all students, contact details, status, and guardians.',
      href: '/reports/student-list',
      icon: Users,
      badge: 'Core Roster',
    },
    {
      title: 'Class-wise Enrollment Report',
      description: 'Breakdown of department sections, student counts, and capacity utilization.',
      href: '/reports/class-enrollment',
      icon: School,
      badge: 'Enrollment',
    },
    {
      title: 'Daily Attendance Audit',
      description: 'Detailed daily roll-call log with present/absent ratios and faculty remarks.',
      href: '/reports/daily-attendance',
      icon: CalendarCheck,
      badge: 'Attendance',
    },
    {
      title: 'Examination Marks Summary',
      description: 'Subject-wise marks obtained, maximum limits, percentages, and letter grades.',
      href: '/reports/exam-marks',
      icon: FileSpreadsheet,
      badge: 'Examinations',
    },
    {
      title: 'Student Academic Performance & GPA',
      description: 'Cumulative student ranking, overall GPA points, and passing status analysis.',
      href: '/reports/academic-performance',
      icon: Award,
      badge: 'Performance',
    },
    {
      title: 'Historical Attendance Log',
      description: 'Longitudinal attendance percentage by student with date range filters.',
      href: '/attendance/history',
      icon: BarChart3,
      badge: 'Analytics',
    },
  ];

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institutional Reports & Analytics</h1>
        <p className="text-xs text-slate-500 mt-1">
          Access printable audit reports, generate statutory educational summaries, and export datasets to CSV.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {reports.map((rep) => {
          const Icon = rep.icon;
          return (
            <Link key={rep.href} href={rep.href} className="group">
              <Card className="h-full flex flex-col justify-between hover:border-blue-300 hover:shadow-md transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase tracking-wider">
                      {rep.badge}
                    </span>
                  </div>
                  <CardTitle className="text-base group-hover:text-blue-600 transition-colors">
                    {rep.title}
                  </CardTitle>
                  <CardDescription className="text-xs leading-relaxed mt-1">
                    {rep.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 border-t border-slate-50 mt-auto">
                  <div className="flex items-center justify-between text-xs font-semibold text-blue-600 group-hover:text-blue-700 pt-3">
                    <span className="flex items-center gap-1.5">
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print & CSV</span>
                    </span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
