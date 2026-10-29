'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { StudentFormModal } from '@/components/students/student-form-modal';
import {
  fetchStudents,
  fetchClasses,
  saveStudent,
  deleteStudent,
} from '@/lib/data-provider';
import { StudentItem, ClassItem } from '@/types/database';
import { convertToCSV, downloadCSV } from '@/lib/csv-export';
import {
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  Edit2,
  Eye,
  Users,
  AlertTriangle,
} from 'lucide-react';

export default function StudentsPage() {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentItem | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<StudentItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [allClasses, allStudents] = await Promise.all([
        fetchClasses(),
        fetchStudents({
          search: search.trim() || undefined,
          classId: selectedClassId,
          department: selectedDepartment,
          status: selectedStatus,
        }),
      ]);
      setClasses(allClasses);
      setStudents(allStudents);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, selectedClassId, selectedDepartment, selectedStatus]);

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (stu: StudentItem) => {
    setEditingStudent(stu);
    setIsFormOpen(true);
  };

  const handleSaveStudent = async (data: Partial<StudentItem>) => {
    // Validate roll number duplication within same class
    const duplicate = students.find(
      (s) =>
        s.roll_number.toLowerCase() === data.roll_number?.toLowerCase() &&
        s.class_id === data.class_id &&
        s.id !== data.id
    );
    if (duplicate) {
      throw new Error(`Roll number "${data.roll_number}" is already assigned to ${duplicate.first_name} ${duplicate.last_name} in this class.`);
    }

    await saveStudent(data);
    await loadData();
  };

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;
    try {
      setIsDeleting(true);
      await deleteStudent(studentToDelete.id);
      setStudentToDelete(null);
      await loadData();
    } catch (err) {
      console.error('Failed to delete student:', err);
    } finally {
      setIsDeleting(false);
    }
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
      academic_year: s.academic_year,
      status: s.status.toUpperCase(),
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
      { key: 'academic_year', label: 'Academic Year' },
      { key: 'status', label: 'Status' },
      { key: 'guardian_name', label: 'Guardian Name' },
      { key: 'guardian_phone', label: 'Guardian Phone' },
    ];

    const csv = convertToCSV(exportData, headers);
    downloadCSV(`student_roster_${new Date().toISOString().split('T')[0]}.csv`, csv);
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse, register, inspect academic transcripts, and manage institutional student records.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={students.length === 0}>
            <Download className="w-4 h-4 mr-1.5" />
            <span>Export CSV</span>
          </Button>
          <Button variant="primary" size="sm" onClick={handleOpenAdd}>
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Register Student</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, roll no, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          />
        </div>

        {/* Class Filter */}
        <div className="w-full md:w-56">
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full py-2 px-3 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Classes & Sections</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.section})
              </option>
            ))}
          </select>
        </div>

        {/* Department Filter */}
        <div className="w-full md:w-56">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full py-2 px-3 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Departments</option>
            <option value="Computer Science & Engineering">Computer Science & Eng.</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
            <option value="Civil Engineering">Civil Engineering</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-40">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full py-2 px-3 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="graduated">Graduated</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Main Student Table */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
          Loading student records from database...
        </div>
      ) : students.length === 0 ? (
        <EmptyState
          icon={<Users className="w-6 h-6" />}
          title="No Students Found"
          description={
            search || selectedClassId !== 'all' || selectedDepartment !== 'all'
              ? 'No student matches your current filter criteria. Try resetting filters.'
              : 'There are currently no students registered in the system. Click below to add the first record.'
          }
          actionLabel="Register Student"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Roll Number</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Enrolled Class</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((stu) => (
                  <tr key={stu.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-xs text-slate-900">
                      {stu.roll_number}
                      <span className="block text-[11px] text-slate-400 font-normal">{stu.student_id}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/students/${stu.id}`}
                        className="font-medium text-slate-900 hover:text-blue-600 transition-colors"
                      >
                        {stu.first_name} {stu.last_name}
                      </Link>
                      <span className="block text-xs text-slate-400">{stu.email || 'No email registered'}</span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-800">
                      {stu.class ? (
                        <span className="font-medium">
                          {stu.class.name} <span className="text-slate-500">({stu.class.section})</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">{stu.department}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">{stu.phone || '—'}</td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge
                        variant={
                          stu.status === 'active'
                            ? 'success'
                            : stu.status === 'graduated'
                            ? 'info'
                            : 'danger'
                        }
                        size="sm"
                      >
                        {stu.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/students/${stu.id}`}>
                          <button
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Profile & Transcript"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleOpenEdit(stu)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Student"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setStudentToDelete(stu)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>Showing {students.length} student record(s)</span>
            <span>Academic Year 2024–2025</span>
          </div>
        </div>
      )}

      {/* Add / Edit Form Modal */}
      <StudentFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveStudent}
        student={editingStudent}
        classes={classes}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(studentToDelete)}
        onClose={() => setStudentToDelete(null)}
        title="Confirm Student Deletion"
        description="This action will permanently delete the student and their associated academic and attendance records."
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-800">
              Are you sure you want to remove{' '}
              <strong className="font-semibold text-rose-950">
                {studentToDelete?.first_name} {studentToDelete?.last_name}
              </strong>{' '}
              ({studentToDelete?.roll_number})? This action cannot be reversed.
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setStudentToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleDeleteStudent}
              isLoading={isDeleting}
            >
              Confirm Deletion
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
