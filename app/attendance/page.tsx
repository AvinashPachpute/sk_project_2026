'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { AttendanceSheet } from '@/components/attendance/attendance-sheet';
import { Button } from '@/components/ui/button';
import {
  fetchClasses,
  fetchStudents,
  fetchAttendance,
  saveAttendanceBatch,
} from '@/lib/data-provider';
import { ClassItem, StudentItem, AttendanceRecord } from '@/types/database';
import { History, CalendarCheck } from 'lucide-react';

export default function AttendancePage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async (dateParam?: string) => {
    try {
      setIsLoading(true);
      const [classList, studentList] = await Promise.all([fetchClasses(), fetchStudents()]);
      setClasses(classList);
      setStudents(studentList);

      const activeClass = selectedClassId || classList[0]?.id || '';
      setSelectedClassId(activeClass);

      const curDate = dateParam || selectedDate || new Date().toISOString().split('T')[0];
      if (activeClass) {
        const attRecords = await fetchAttendance({
          classId: activeClass,
          date: curDate,
        });
        setAttendance(attRecords);
      }
    } catch (err) {
      console.error('Failed to load attendance:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    loadData(today);
  }, []);

  const handleClassChange = async (classId: string) => {
    setSelectedClassId(classId);
    try {
      const records = await fetchAttendance({ classId, date: selectedDate });
      setAttendance(records);
    } catch (err) {
      console.error('Error changing class:', err);
    }
  };

  const handleDateChange = async (date: string) => {
    setSelectedDate(date);
    try {
      const records = await fetchAttendance({ classId: selectedClassId, date });
      setAttendance(records);
    } catch (err) {
      console.error('Error changing date:', err);
    }
  };

  const handleSaveAttendance = async (records: Partial<AttendanceRecord>[]) => {
    await saveAttendanceBatch(records);
    const updated = await fetchAttendance({ classId: selectedClassId, date: selectedDate });
    setAttendance(updated);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Attendance Recording</h1>
          <p className="text-xs text-slate-500 mt-1">
            Conduct daily roll call, mark attendance status (Present, Absent, Leave), and save records.
          </p>
        </div>

        <Link href="/attendance/history">
          <Button variant="outline" size="sm">
            <History className="w-4 h-4 mr-1.5" />
            <span>Attendance History & Logs</span>
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
          Loading classroom attendance sheet...
        </div>
      ) : (
        <AttendanceSheet
          classes={classes}
          students={students}
          existingAttendance={attendance}
          selectedClassId={selectedClassId}
          onSelectClassId={handleClassChange}
          selectedDate={selectedDate}
          onSelectDate={handleDateChange}
          onSaveAttendance={handleSaveAttendance}
        />
      )}
    </DashboardLayout>
  );
}
