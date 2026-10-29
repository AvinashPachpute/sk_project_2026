'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { EmptyState } from '@/components/ui/empty-state';
import { fetchExaminations, saveExamination, deleteExamination } from '@/lib/data-provider';
import { ExaminationItem } from '@/types/database';
import { formatDate } from '@/lib/utils';
import { Plus, Award, Calendar, Edit2, Trash2, ArrowRight } from 'lucide-react';

export default function ExaminationsPage() {
  const [examinations, setExaminations] = useState<ExaminationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<ExaminationItem | null>(null);
  const [formData, setFormData] = useState<Partial<ExaminationItem>>({
    name: '',
    exam_type: 'Midterm',
    academic_year: '2024-2025',
    start_date: '',
    end_date: '',
    status: 'upcoming',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const list = await fetchExaminations();
      setExaminations(list);
    } catch (err) {
      console.error('Failed to load examinations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingExam(null);
    setFormData({
      name: '',
      exam_type: 'Midterm',
      academic_year: '2024-2025',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
      status: 'upcoming',
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exam: ExaminationItem) => {
    setEditingExam(exam);
    setFormData({
      id: exam.id,
      name: exam.name,
      exam_type: exam.exam_type,
      academic_year: exam.academic_year,
      start_date: exam.start_date || '',
      end_date: exam.end_date || '',
      status: exam.status,
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setErrorMsg('Examination title is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await saveExamination(formData);
      setIsModalOpen(false);
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save examination';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete examination "${name}"?`)) return;
    try {
      await deleteExamination(id);
      await loadData();
    } catch (err) {
      console.error('Delete exam failed:', err);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Examinations Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Schedule midterms, end-semester evaluations, unit tests, and maintain grading timelines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/marks">
            <Button variant="outline" size="sm">
              <span>Enter / Grade Marks</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
          <Button variant="primary" size="sm" onClick={handleOpenAdd}>
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Create Examination</span>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
          Loading examinations...
        </div>
      ) : examinations.length === 0 ? (
        <EmptyState
          icon={<Award className="w-6 h-6" />}
          title="No Examinations Scheduled"
          description="Create your first academic examination term to start recording marks."
          actionLabel="Create Examination"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {examinations.map((exam) => (
            <div
              key={exam.id}
              className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge
                    variant={
                      exam.status === 'completed'
                        ? 'success'
                        : exam.status === 'ongoing'
                        ? 'warning'
                        : 'info'
                    }
                    size="sm"
                  >
                    {exam.status.toUpperCase()}
                  </Badge>
                  <span className="text-[11px] font-semibold text-slate-500">{exam.exam_type}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-1">{exam.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Session: {exam.academic_year}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {formatDate(exam.start_date)} — {formatDate(exam.end_date)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href="/marks"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <span>Grade Marks</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(exam)}
                    className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Edit Examination"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(exam.id, exam.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Examination"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Examination Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExam ? 'Edit Examination' : 'Schedule New Examination'}
        description="Set evaluation title, type, target session, and evaluation period."
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
              {errorMsg}
            </div>
          )}

          <Input
            label="Examination Name"
            placeholder="e.g. Midterm Examination Fall 2024"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Evaluation Type"
              value={formData.exam_type || 'Midterm'}
              onChange={(e) => setFormData({ ...formData, exam_type: e.target.value })}
            >
              <option value="Midterm">Midterm Examination</option>
              <option value="Final">Final Semester</option>
              <option value="Unit Test">Unit Test / Quiz</option>
              <option value="Practical">Lab / Practical Exam</option>
            </Select>

            <Select
              label="Academic Year"
              value={formData.academic_year || '2024-2025'}
              onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
            >
              <option value="2024-2025">2024-2025</option>
              <option value="2023-2024">2023-2024</option>
              <option value="2025-2026">2025-2026</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              value={formData.start_date || ''}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            />
            <Input
              label="End Date"
              type="date"
              value={formData.end_date || ''}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            />
          </div>

          <Select
            label="Examination Status"
            value={formData.status || 'upcoming'}
            onChange={(e) =>
              setFormData({
                ...formData,
                status: e.target.value as 'upcoming' | 'ongoing' | 'completed',
              })
            }
          >
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </Select>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              {editingExam ? 'Save Changes' : 'Schedule Examination'}
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
