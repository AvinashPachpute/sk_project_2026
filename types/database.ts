export type UserRole = 'admin' | 'teacher';
export type StudentStatus = 'active' | 'inactive' | 'graduated' | 'suspended';
export type AttendanceStatus = 'present' | 'absent' | 'leave' | 'late';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  department?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClassItem {
  id: string;
  name: string;
  section: string;
  department: string;
  academic_year: string;
  semester?: string | null;
  capacity?: number | null;
  created_at: string;
  updated_at: string;
  student_count?: number;
}

export interface SubjectItem {
  id: string;
  code: string;
  name: string;
  department: string;
  credits: number;
  class_id?: string | null;
  created_at: string;
  updated_at: string;
  class?: ClassItem | null;
}

export interface StudentItem {
  id: string;
  roll_number: string;
  student_id: string;
  first_name: string;
  last_name: string;
  email?: string | null;
  phone?: string | null;
  gender?: 'Male' | 'Female' | 'Other' | null;
  date_of_birth?: string | null;
  class_id?: string | null;
  department: string;
  academic_year: string;
  enrollment_date: string;
  status: StudentStatus;
  address?: string | null;
  guardian_name?: string | null;
  guardian_phone?: string | null;
  guardian_relation?: string | null;
  created_at: string;
  updated_at: string;
  class?: ClassItem | null;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  class_id: string;
  date: string;
  status: AttendanceStatus;
  remarks?: string | null;
  marked_by?: string | null;
  created_at: string;
  updated_at: string;
  student?: StudentItem | null;
  class?: ClassItem | null;
}

export interface ExaminationItem {
  id: string;
  name: string;
  exam_type: string;
  academic_year: string;
  start_date?: string | null;
  end_date?: string | null;
  status: 'upcoming' | 'ongoing' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface MarkItem {
  id: string;
  student_id: string;
  examination_id: string;
  subject_id: string;
  marks_obtained: number;
  max_marks: number;
  remarks?: string | null;
  marked_by?: string | null;
  created_at: string;
  updated_at: string;
  student?: StudentItem | null;
  examination?: ExaminationItem | null;
  subject?: SubjectItem | null;
}

export interface GradingRule {
  id: string;
  grade: string;
  min_percentage: number;
  max_percentage: number;
  gpa_point: number;
  description?: string | null;
}

export interface CollegeSettings {
  id: string;
  college_name: string;
  college_code: string;
  email: string;
  phone: string;
  address: string;
  academic_year: string;
  grading_system: string;
}

export interface DashboardMetrics {
  totalStudents: number;
  activeStudents: number;
  totalTeachers: number;
  todayAttendancePercent: number;
  todayPresentCount: number;
  todayAbsentCount: number;
  averageAcademicScore: number;
  totalClasses: number;
  totalSubjects: number;
}
