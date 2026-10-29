'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { StudentItem, ClassItem } from '@/types/database';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Partial<StudentItem>) => Promise<void>;
  student?: StudentItem | null;
  classes: ClassItem[];
}

export function StudentFormModal({
  isOpen,
  onClose,
  onSave,
  student,
  classes,
}: StudentFormModalProps) {
  const isEditing = Boolean(student?.id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<StudentItem>>({
    roll_number: '',
    student_id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    gender: 'Male',
    date_of_birth: '',
    class_id: classes[0]?.id || '',
    department: 'Computer Science & Engineering',
    academic_year: '2024-2025',
    enrollment_date: '',
    status: 'active',
    address: '',
    guardian_name: '',
    guardian_phone: '',
    guardian_relation: 'Parent',
  });

  useEffect(() => {
    if (student) {
      setFormData({
        id: student.id,
        roll_number: student.roll_number,
        student_id: student.student_id,
        first_name: student.first_name,
        last_name: student.last_name,
        email: student.email || '',
        phone: student.phone || '',
        gender: student.gender || 'Male',
        date_of_birth: student.date_of_birth || '',
        class_id: student.class_id || classes[0]?.id || '',
        department: student.department || 'Computer Science & Engineering',
        academic_year: student.academic_year || '2024-2025',
        enrollment_date: student.enrollment_date || new Date().toISOString().split('T')[0],
        status: student.status || 'active',
        address: student.address || '',
        guardian_name: student.guardian_name || '',
        guardian_phone: student.guardian_phone || '',
        guardian_relation: student.guardian_relation || 'Parent',
      });
    } else {
      setFormData({
        roll_number: `RN-${Math.floor(1000 + Math.random() * 9000)}`,
        student_id: `STU-2024-${Math.floor(100 + Math.random() * 900)}`,
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        gender: 'Male',
        date_of_birth: '2004-01-01',
        class_id: classes[0]?.id || '',
        department: 'Computer Science & Engineering',
        academic_year: '2024-2025',
        enrollment_date: new Date().toISOString().split('T')[0],
        status: 'active',
        address: '',
        guardian_name: '',
        guardian_phone: '',
        guardian_relation: 'Parent',
      });
    }
    setErrorMsg(null);
  }, [student, classes, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name?.trim() || !formData.last_name?.trim()) {
      setErrorMsg('First name and last name are required');
      return;
    }
    if (!formData.roll_number?.trim()) {
      setErrorMsg('Roll number is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await onSave(formData);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save student details';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Student Details' : 'Register New Student'}
      description="Fill in all the required academic, personal, and guardian details."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
            {errorMsg}
          </div>
        )}

        {/* Section 1: Academic Identifiers */}
        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 pb-1 border-b border-slate-100">
            Academic Identification
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Roll Number"
              name="roll_number"
              value={formData.roll_number || ''}
              onChange={handleChange}
              required
              placeholder="e.g. 2024CS001"
            />
            <Input
              label="Student ID"
              name="student_id"
              value={formData.student_id || ''}
              onChange={handleChange}
              required
              placeholder="e.g. STU-2024-001"
            />
            <Select
              label="Enrolled Class"
              name="class_id"
              value={formData.class_id || ''}
              onChange={handleChange}
            >
              <option value="">Select a class...</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.section})
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Section 2: Personal Information */}
        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 pb-1 border-b border-slate-100">
            Personal Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="First Name"
              name="first_name"
              value={formData.first_name || ''}
              onChange={handleChange}
              required
              placeholder="e.g. Aarav"
            />
            <Input
              label="Last Name"
              name="last_name"
              value={formData.last_name || ''}
              onChange={handleChange}
              required
              placeholder="e.g. Sharma"
            />
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email || ''}
              onChange={handleChange}
              placeholder="e.g. student@apexcollege.edu"
            />
            <Input
              label="Phone Number"
              name="phone"
              value={formData.phone || ''}
              onChange={handleChange}
              placeholder="e.g. +1 (555) 019-2834"
            />
            <Select
              label="Gender"
              name="gender"
              value={formData.gender || 'Male'}
              onChange={handleChange}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </Select>
            <Input
              label="Date of Birth"
              name="date_of_birth"
              type="date"
              value={formData.date_of_birth || ''}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Section 3: Department & Status */}
        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 pb-1 border-b border-slate-100">
            Program Details & Status
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Department"
              name="department"
              value={formData.department || ''}
              onChange={handleChange}
            >
              <option value="Computer Science & Engineering">Computer Science & Engineering</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Civil Engineering">Civil Engineering</option>
              <option value="Business Administration">Business Administration</option>
            </Select>
            <Select
              label="Academic Year"
              name="academic_year"
              value={formData.academic_year || '2024-2025'}
              onChange={handleChange}
            >
              <option value="2024-2025">2024-2025</option>
              <option value="2023-2024">2023-2024</option>
              <option value="2025-2026">2025-2026</option>
            </Select>
            <Select
              label="Student Status"
              name="status"
              value={formData.status || 'active'}
              onChange={handleChange}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="graduated">Graduated</option>
              <option value="suspended">Suspended</option>
            </Select>
          </div>
        </div>

        {/* Section 4: Guardian & Residence */}
        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 pb-1 border-b border-slate-100">
            Guardian & Residential Details
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Guardian Full Name"
              name="guardian_name"
              value={formData.guardian_name || ''}
              onChange={handleChange}
              placeholder="e.g. Rajesh Sharma"
            />
            <Input
              label="Guardian Phone"
              name="guardian_phone"
              value={formData.guardian_phone || ''}
              onChange={handleChange}
              placeholder="e.g. +1 (555) 998-1122"
            />
            <Input
              label="Relation"
              name="guardian_relation"
              value={formData.guardian_relation || 'Parent'}
              onChange={handleChange}
              placeholder="e.g. Father, Mother, Guardian"
            />
          </div>
          <div className="mt-3">
            <Input
              label="Permanent Residential Address"
              name="address"
              value={formData.address || ''}
              onChange={handleChange}
              placeholder="Street Address, City, State, ZIP"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {isEditing ? 'Save Changes' : 'Register Student'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
