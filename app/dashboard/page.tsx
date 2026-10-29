'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { AttendanceTrendChart } from '@/components/charts/attendance-trend-chart';
import { SubjectBarChart } from '@/components/charts/subject-bar-chart';
import {
  fetchDashboardMetrics,
  fetchStudents,
  fetchAttendance,
  fetchClasses,
  fetchSubjects,
} from '@/lib/data-provider';
import { DashboardMetrics, StudentItem, AttendanceRecord } from '@/types/database';
import { formatDate } from '@/lib/utils';
import {
  Users,
  UserCheck,
  CalendarCheck,
  Award,
  ArrowRight,
  PlusCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentStudents, setRecentStudents] = useState<StudentItem[]>([]);
  const [recentAttendance, setRecentAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [dashMetrics, studentsList, attendanceList] = await Promise.all([
          fetchDashboardMetrics(),
          fetchStudents(),
          fetchAttendance(),
        ]);
        setMetrics(dashMetrics);
        setRecentStudents(studentsList.slice(0, 5));
        setRecentAttendance(attendanceList.slice(0, 5));
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <DashboardLayout>
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-blue-600/10 -skew-x-12 pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-400/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Academic Session 2024–2025</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Institutional Administration Overview
          </h1>
          <p className="text-slate-300 text-sm mt-1.5 leading-relaxed">
            Welcome to the Apex SIMS command center. Monitor real-time student enrollment, daily
            classroom attendance, examination marks, and institutional metrics.
          </p>

          <div className="flex items-center gap-3 mt-5 flex-wrap">
            <Link href="/students">
              <Button variant="primary" size="sm">
                <PlusCircle className="w-4 h-4 mr-1.5" />
                <span>Manage Students</span>
              </Button>
            </Link>
            <Link href="/attendance">
              <Button variant="outline" size="sm" className="bg-slate-800/80 text-white border-slate-700 hover:bg-slate-700 hover:text-white">
                <CalendarCheck className="w-4 h-4 mr-1.5" />
                <span>Mark Today&apos;s Attendance</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={isLoading ? '...' : metrics?.totalStudents ?? 0}
          subtitle={isLoading ? '' : `${metrics?.activeStudents ?? 0} actively enrolled`}
          icon={<Users className="w-5 h-5" />}
          accentColor="blue"
          trend={{ value: `${metrics?.totalClasses ?? 0} Classes`, isNeutral: true }}
        />
        <StatCard
          title="Active Students"
          value={isLoading ? '...' : metrics?.activeStudents ?? 0}
          subtitle="Good academic standing"
          icon={<UserCheck className="w-5 h-5" />}
          accentColor="emerald"
          trend={{ value: 'Active Roster', isPositive: true }}
        />
        <StatCard
          title="Today's Attendance"
          value={isLoading ? '...' : `${metrics?.todayAttendancePercent ?? 0}%`}
          subtitle={
            isLoading
              ? ''
              : `${metrics?.todayPresentCount ?? 0} present, ${metrics?.todayAbsentCount ?? 0} absent`
          }
          icon={<CalendarCheck className="w-5 h-5" />}
          accentColor="navy"
          trend={{
            value: (metrics?.todayAttendancePercent ?? 0) >= 75 ? 'Healthy rate' : 'Needs attention',
            isPositive: (metrics?.todayAttendancePercent ?? 0) >= 75,
          }}
        />
        <StatCard
          title="Academic Performance"
          value={isLoading ? '...' : `${metrics?.averageAcademicScore ?? 0}%`}
          subtitle="Institution-wide average"
          icon={<Award className="w-5 h-5" />}
          accentColor="purple"
          trend={{ value: 'Grade B+', isPositive: true }}
        />
      </div>

      {/* Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Trends</CardTitle>
            <CardDescription>Daily student presence rate across past sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics?.totalStudents === 0 ? (
              <EmptyState
                title="No Attendance Data Yet"
                description="Mark student attendance to generate analytical trend graphs."
              />
            ) : (
              <AttendanceTrendChart />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subject Performance</CardTitle>
            <CardDescription>Average examination score distribution by department course</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics?.totalSubjects === 0 ? (
              <EmptyState
                title="No Subjects Configured"
                description="Register curriculum subjects to visualize academic performance."
              />
            ) : (
              <SubjectBarChart />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Records Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Student Registrations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Student Registrations</CardTitle>
              <CardDescription>Latest enrollments in the database</CardDescription>
            </div>
            <Link href="/students" className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {recentStudents.length === 0 ? (
              <EmptyState
                title="No Students Registered"
                description="Begin by registering the first student into the institution."
                className="m-6"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4">Student</th>
                      <th className="py-2.5 px-4">Roll No</th>
                      <th className="py-2.5 px-4">Class</th>
                      <th className="py-2.5 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentStudents.map((stu) => (
                      <tr key={stu.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4">
                          <Link href={`/students/${stu.id}`} className="font-medium text-slate-900 hover:text-blue-600">
                            {stu.first_name} {stu.last_name}
                          </Link>
                          <span className="block text-[11px] text-slate-400">{stu.department}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs">{stu.roll_number}</td>
                        <td className="py-3 px-4 text-xs text-slate-700">
                          {stu.class ? `${stu.class.name} (${stu.class.section})` : 'Unassigned'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant={stu.status === 'active' ? 'success' : 'default'} size="sm">
                            {stu.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Attendance Feed */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Attendance Entries</CardTitle>
              <CardDescription>Daily roll call activity recorded by faculty</CardDescription>
            </div>
            <Link href="/attendance/history" className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1">
              <span>Full History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {recentAttendance.length === 0 ? (
              <EmptyState
                title="No Attendance Logs"
                description="Attendance records will appear here as teachers log daily presence."
                className="m-6"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4">Student</th>
                      <th className="py-2.5 px-4">Date</th>
                      <th className="py-2.5 px-4 text-center">Status</th>
                      <th className="py-2.5 px-4">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentAttendance.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4 font-medium text-slate-900">
                          {rec.student ? `${rec.student.first_name} ${rec.student.last_name}` : 'Student'}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600">{formatDate(rec.date)}</td>
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
                            {rec.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500 max-w-xs truncate">
                          {rec.remarks || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
