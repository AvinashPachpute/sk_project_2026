'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { EmptyState } from '@/components/ui/empty-state';
import { fetchClasses, saveClass, deleteClass, fetchStudents } from '@/lib/data-provider';
import { ClassItem, StudentItem } from '@/types/database';
import { Plus, School, Users, Edit2, Trash2, BookOpen } from 'lucide-react';

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [formData, setFormData] = useState<Partial<ClassItem>>({
    name: '',
    section: 'Section A',
    department: 'Computer Science & Engineering',
    academic_year: '2024-2025',
    semester: '1st Semester',
    capacity: 60,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [classList, studentList] = await Promise.all([fetchClasses(), fetchStudents()]);
      setClasses(classList);
      setStudents(studentList);
    } catch (err) {
      console.error('Failed to load classes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingClass(null);
    setFormData({
      name: '',
      section: 'Section A',
      department: 'Computer Science & Engineering',
      academic_year: '2024-2025',
      semester: '1st Semester',
      capacity: 60,
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cls: ClassItem) => {
    setEditingClass(cls);
    setFormData({
      id: cls.id,
      name: cls.name,
      section: cls.section,
      department: cls.department,
      academic_year: cls.academic_year,
      semester: cls.semester || '1st Semester',
      capacity: cls.capacity || 60,
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setErrorMsg('Class name is required (e.g. B.Tech Computer Science)');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await saveClass(formData);
      setIsModalOpen(false);
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save class';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete class "${name}"?`)) return;
    try {
      await deleteClass(id);
      await loadData();
    } catch (err) {
      console.error('Delete class failed:', err);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Classes & Academic Sections</h1>
          <p className="text-xs text-slate-500 mt-1">
            Organize institutional departments, cohorts, semester sections, and maximum student capacities.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={handleOpenAdd}>
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Create New Class</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
          Loading classes...
        </div>
      ) : classes.length === 0 ? (
        <EmptyState
          icon={<School className="w-6 h-6" />}
          title="No Classes Configured"
          description="Create your first academic class or batch to begin enrolling students."
          actionLabel="Create Class"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {classes.map((cls) => {
            const enrolledCount = students.filter((s) => s.class_id === cls.id).length;
            const cap = cls.capacity || 60;
            const percentFilled = Math.min(100, Math.round((enrolledCount / cap) * 100));

            return (
              <Card key={cls.id} className="flex flex-col justify-between">
                <CardHeader className="flex flex-row items-start justify-between pb-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {cls.section}
                    </span>
                    <CardTitle className="text-base mt-2">{cls.name}</CardTitle>
                    <p className="text-xs text-slate-500">{cls.department}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(cls)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit Class"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cls.id, cls.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Class"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Semester</span>
                      <strong className="text-slate-800">{cls.semester || '1st Semester'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Academic Year</span>
                      <strong className="text-slate-800">{cls.academic_year}</strong>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-500 font-medium flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>Enrolled Students</span>
                      </span>
                      <span className="font-bold text-slate-800">
                        {enrolledCount} / {cap}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${percentFilled}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Class Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClass ? 'Edit Class Details' : 'Create Academic Class'}
        description="Configure class name, section, department, and student capacity."
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
              {errorMsg}
            </div>
          )}

          <Input
            label="Class / Degree Program"
            placeholder="e.g. B.Tech Computer Science"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Section"
              placeholder="e.g. Section A"
              value={formData.section || ''}
              onChange={(e) => setFormData({ ...formData, section: e.target.value })}
              required
            />
            <Input
              label="Semester"
              placeholder="e.g. 3rd Semester"
              value={formData.semester || ''}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
            />
          </div>

          <Select
            label="Department"
            value={formData.department || ''}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          >
            <option value="Computer Science & Engineering">Computer Science & Engineering</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
            <option value="Civil Engineering">Civil Engineering</option>
            <option value="Business Administration">Business Administration</option>
          </Select>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Academic Year"
              value={formData.academic_year || '2024-2025'}
              onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
            >
              <option value="2024-2025">2024-2025</option>
              <option value="2023-2024">2023-2024</option>
              <option value="2025-2026">2025-2026</option>
            </Select>

            <Input
              label="Max Capacity"
              type="number"
              min="1"
              value={formData.capacity || 60}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 60 })}
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              {editingClass ? 'Save Changes' : 'Create Class'}
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
