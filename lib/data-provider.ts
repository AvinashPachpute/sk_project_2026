import {
  StudentItem,
  ClassItem,
  SubjectItem,
  AttendanceRecord,
  ExaminationItem,
  MarkItem,
  GradingRule,
  CollegeSettings,
  Profile,
  DashboardMetrics,
} from '@/types/database';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import {
  INITIAL_CLASSES,
  INITIAL_SUBJECTS,
  INITIAL_STUDENTS,
  INITIAL_ATTENDANCE,
  INITIAL_EXAMINATIONS,
  INITIAL_MARKS,
  INITIAL_PROFILES,
  INITIAL_SETTINGS,
} from '@/lib/mock-storage';
import { DEFAULT_GRADING_RULES } from '@/lib/grading';
import { generateUUID } from '@/lib/utils';

// Helper for local storage persistence when Supabase is not yet connected
function getLocalItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(`sims_${key}`);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(`sims_${key}`, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to save ${key} to localStorage:`, err);
  }
}

/* =========================================================================
   DASHBOARD METRICS
   ========================================================================= */
export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const today = new Date().toISOString().split('T')[0];

      const [
        { count: totalStudents },
        { count: activeStudents },
        { count: totalTeachers },
        { count: totalClasses },
        { count: totalSubjects },
        { data: todayAttendance },
        { data: allMarks },
      ] = await Promise.all([
        supabase.from('students').select('*', { count: 'exact', head: true }),
        supabase.from('students').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'teacher'),
        supabase.from('classes').select('*', { count: 'exact', head: true }),
        supabase.from('subjects').select('*', { count: 'exact', head: true }),
        supabase.from('attendance').select('status').eq('date', today),
        supabase.from('marks').select('marks_obtained, max_marks'),
      ]);

      const presentCount = (todayAttendance || []).filter((a) => a.status === 'present').length;
      const absentCount = (todayAttendance || []).filter((a) => a.status === 'absent').length;
      const totalAttended = (todayAttendance || []).length;
      const attPercent = totalAttended > 0 ? Math.round((presentCount / totalAttended) * 100) : 0;

      let avgScore = 0;
      if (allMarks && allMarks.length > 0) {
        const totalPct = allMarks.reduce((acc, m) => {
          const max = Number(m.max_marks) || 100;
          const obt = Number(m.marks_obtained) || 0;
          return acc + (obt / max) * 100;
        }, 0);
        avgScore = Math.round((totalPct / allMarks.length) * 10) / 10;
      }

      return {
        totalStudents: totalStudents || 0,
        activeStudents: activeStudents || 0,
        totalTeachers: totalTeachers || 0,
        todayAttendancePercent: attPercent,
        todayPresentCount: presentCount,
        todayAbsentCount: absentCount,
        averageAcademicScore: avgScore,
        totalClasses: totalClasses || 0,
        totalSubjects: totalSubjects || 0,
      };
    } catch (err) {
      console.warn('Supabase fetchDashboardMetrics failed, falling back to local store:', err);
    }
  }

  // Local/Demo Mode Fallback
  const students = getLocalItem<StudentItem[]>('students', INITIAL_STUDENTS);
  const attendance = getLocalItem<AttendanceRecord[]>('attendance', INITIAL_ATTENDANCE);
  const marks = getLocalItem<MarkItem[]>('marks', INITIAL_MARKS);
  const classes = getLocalItem<ClassItem[]>('classes', INITIAL_CLASSES);
  const subjects = getLocalItem<SubjectItem[]>('subjects', INITIAL_SUBJECTS);
  const profiles = getLocalItem<Profile[]>('profiles', INITIAL_PROFILES);

  const today = new Date().toISOString().split('T')[0];
  const todayRecords = attendance.filter((a) => a.date === today);
  const presentCount = todayRecords.filter((a) => a.status === 'present').length;
  const absentCount = todayRecords.filter((a) => a.status === 'absent').length;
  const attPercent = todayRecords.length > 0 ? Math.round((presentCount / todayRecords.length) * 100) : 0;

  let avgScore = 0;
  if (marks.length > 0) {
    const totalPct = marks.reduce((acc, m) => acc + (m.marks_obtained / m.max_marks) * 100, 0);
    avgScore = Math.round((totalPct / marks.length) * 10) / 10;
  }

  return {
    totalStudents: students.length,
    activeStudents: students.filter((s) => s.status === 'active').length,
    totalTeachers: profiles.filter((p) => p.role === 'teacher').length,
    todayAttendancePercent: attPercent,
    todayPresentCount: presentCount,
    todayAbsentCount: absentCount,
    averageAcademicScore: avgScore,
    totalClasses: classes.length,
    totalSubjects: subjects.length,
  };
}

/* =========================================================================
   STUDENTS CRUD
   ========================================================================= */
export async function fetchStudents(filters?: {
  search?: string;
  classId?: string;
  department?: string;
  status?: string;
}): Promise<StudentItem[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      let query = supabase.from('students').select('*, class:classes(*)').order('created_at', { ascending: false });

      if (filters?.classId && filters.classId !== 'all') {
        query = query.eq('class_id', filters.classId);
      }
      if (filters?.department && filters.department !== 'all') {
        query = query.eq('department', filters.department);
      }
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.search) {
        query = query.or(
          `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,roll_number.ilike.%${filters.search}%,student_id.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as StudentItem[]) || [];
    } catch (err) {
      console.warn('Supabase fetchStudents fallback:', err);
    }
  }

  // Local/Demo Mode
  let list = getLocalItem<StudentItem[]>('students', INITIAL_STUDENTS);
  const classes = getLocalItem<ClassItem[]>('classes', INITIAL_CLASSES);

  // Attach classes
  list = list.map((s) => ({
    ...s,
    class: classes.find((c) => c.id === s.class_id) || null,
  }));

  if (filters?.classId && filters.classId !== 'all') {
    list = list.filter((s) => s.class_id === filters.classId);
  }
  if (filters?.department && filters.department !== 'all') {
    list = list.filter((s) => s.department === filters.department);
  }
  if (filters?.status && filters.status !== 'all') {
    list = list.filter((s) => s.status === filters.status);
  }
  if (filters?.search) {
    const s = filters.search.toLowerCase();
    list = list.filter(
      (item) =>
        item.first_name.toLowerCase().includes(s) ||
        item.last_name.toLowerCase().includes(s) ||
        item.roll_number.toLowerCase().includes(s) ||
        item.student_id.toLowerCase().includes(s)
    );
  }

  return list;
}

export async function fetchStudentById(id: string): Promise<StudentItem | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from('students').select('*, class:classes(*)').eq('id', id).single();
      if (!error && data) return data as StudentItem;
    } catch (err) {
      console.warn('Supabase fetchStudentById fallback:', err);
    }
  }

  const list = getLocalItem<StudentItem[]>('students', INITIAL_STUDENTS);
  const classes = getLocalItem<ClassItem[]>('classes', INITIAL_CLASSES);
  const student = list.find((s) => s.id === id);
  if (!student) return null;
  return {
    ...student,
    class: classes.find((c) => c.id === student.class_id) || null,
  };
}

export async function saveStudent(studentData: Partial<StudentItem>): Promise<StudentItem> {
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (studentData.id) {
      const { data, error } = await supabase
        .from('students')
        .update({
          ...studentData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', studentData.id)
        .select('*, class:classes(*)')
        .single();
      if (error) throw error;
      return data as StudentItem;
    } else {
      const { data, error } = await supabase
        .from('students')
        .insert({
          ...studentData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('*, class:classes(*)')
        .single();
      if (error) throw error;
      return data as StudentItem;
    }
  }

  // Local/Demo Mode
  const list = getLocalItem<StudentItem[]>('students', INITIAL_STUDENTS);
  const classes = getLocalItem<ClassItem[]>('classes', INITIAL_CLASSES);

  if (studentData.id) {
    const idx = list.findIndex((s) => s.id === studentData.id);
    if (idx !== -1) {
      const updated: StudentItem = {
        ...list[idx],
        ...studentData,
        updated_at: new Date().toISOString(),
      } as StudentItem;
      list[idx] = updated;
      setLocalItem('students', list);
      return { ...updated, class: classes.find((c) => c.id === updated.class_id) || null };
    }
  }

  const newStudent: StudentItem = {
    id: generateUUID(),
    roll_number: studentData.roll_number || `RN-${Math.floor(1000 + Math.random() * 9000)}`,
    student_id: studentData.student_id || `STU-${Date.now().toString().slice(-4)}`,
    first_name: studentData.first_name || '',
    last_name: studentData.last_name || '',
    email: studentData.email || '',
    phone: studentData.phone || '',
    gender: studentData.gender || 'Other',
    date_of_birth: studentData.date_of_birth || '',
    class_id: studentData.class_id || '',
    department: studentData.department || 'General',
    academic_year: studentData.academic_year || '2024-2025',
    enrollment_date: studentData.enrollment_date || new Date().toISOString().split('T')[0],
    status: studentData.status || 'active',
    address: studentData.address || '',
    guardian_name: studentData.guardian_name || '',
    guardian_phone: studentData.guardian_phone || '',
    guardian_relation: studentData.guardian_relation || 'Parent',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  list.unshift(newStudent);
  setLocalItem('students', list);
  return { ...newStudent, class: classes.find((c) => c.id === newStudent.class_id) || null };
}

export async function deleteStudent(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  let list = getLocalItem<StudentItem[]>('students', INITIAL_STUDENTS);
  list = list.filter((s) => s.id !== id);
  setLocalItem('students', list);
  return true;
}

/* =========================================================================
   CLASSES CRUD
   ========================================================================= */
export async function fetchClasses(): Promise<ClassItem[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from('classes').select('*').order('name', { ascending: true });
      if (error) throw error;
      return (data as ClassItem[]) || [];
    } catch (err) {
      console.warn('Supabase fetchClasses fallback:', err);
    }
  }
  return getLocalItem<ClassItem[]>('classes', INITIAL_CLASSES);
}

export async function saveClass(classData: Partial<ClassItem>): Promise<ClassItem> {
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (classData.id) {
      const { data, error } = await supabase
        .from('classes')
        .update({ ...classData, updated_at: new Date().toISOString() })
        .eq('id', classData.id)
        .select()
        .single();
      if (error) throw error;
      return data as ClassItem;
    } else {
      const { data, error } = await supabase
        .from('classes')
        .insert({ ...classData, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .select()
        .single();
      if (error) throw error;
      return data as ClassItem;
    }
  }

  const list = getLocalItem<ClassItem[]>('classes', INITIAL_CLASSES);
  if (classData.id) {
    const idx = list.findIndex((c) => c.id === classData.id);
    if (idx !== -1) {
      const updated = { ...list[idx], ...classData, updated_at: new Date().toISOString() };
      list[idx] = updated;
      setLocalItem('classes', list);
      return updated;
    }
  }
  const newClass: ClassItem = {
    id: generateUUID(),
    name: classData.name || '',
    section: classData.section || 'A',
    department: classData.department || 'General',
    academic_year: classData.academic_year || '2024-2025',
    semester: classData.semester || '1st Semester',
    capacity: classData.capacity || 60,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  list.push(newClass);
  setLocalItem('classes', list);
  return newClass;
}

export async function deleteClass(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    const { error } = await supabase.from('classes').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
  let list = getLocalItem<ClassItem[]>('classes', INITIAL_CLASSES);
  list = list.filter((c) => c.id !== id);
  setLocalItem('classes', list);
  return true;
}

/* =========================================================================
   SUBJECTS CRUD
   ========================================================================= */
export async function fetchSubjects(): Promise<SubjectItem[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from('subjects').select('*, class:classes(*)').order('code');
      if (error) throw error;
      return (data as SubjectItem[]) || [];
    } catch (err) {
      console.warn('Supabase fetchSubjects fallback:', err);
    }
  }
  const subjects = getLocalItem<SubjectItem[]>('subjects', INITIAL_SUBJECTS);
  const classes = getLocalItem<ClassItem[]>('classes', INITIAL_CLASSES);
  return subjects.map((sub) => ({
    ...sub,
    class: classes.find((c) => c.id === sub.class_id) || null,
  }));
}

export async function saveSubject(subjectData: Partial<SubjectItem>): Promise<SubjectItem> {
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (subjectData.id) {
      const { data, error } = await supabase
        .from('subjects')
        .update({ ...subjectData, updated_at: new Date().toISOString() })
        .eq('id', subjectData.id)
        .select('*, class:classes(*)')
        .single();
      if (error) throw error;
      return data as SubjectItem;
    } else {
      const { data, error } = await supabase
        .from('subjects')
        .insert({ ...subjectData, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .select('*, class:classes(*)')
        .single();
      if (error) throw error;
      return data as SubjectItem;
    }
  }

  const list = getLocalItem<SubjectItem[]>('subjects', INITIAL_SUBJECTS);
  const classes = getLocalItem<ClassItem[]>('classes', INITIAL_CLASSES);

  if (subjectData.id) {
    const idx = list.findIndex((s) => s.id === subjectData.id);
    if (idx !== -1) {
      const updated = { ...list[idx], ...subjectData, updated_at: new Date().toISOString() };
      list[idx] = updated;
      setLocalItem('subjects', list);
      return { ...updated, class: classes.find((c) => c.id === updated.class_id) || null };
    }
  }
  const newSubject: SubjectItem = {
    id: generateUUID(),
    code: subjectData.code || 'CS000',
    name: subjectData.name || '',
    department: subjectData.department || 'General',
    credits: subjectData.credits || 3,
    class_id: subjectData.class_id || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  list.push(newSubject);
  setLocalItem('subjects', list);
  return { ...newSubject, class: classes.find((c) => c.id === newSubject.class_id) || null };
}

export async function deleteSubject(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    const { error } = await supabase.from('subjects').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
  let list = getLocalItem<SubjectItem[]>('subjects', INITIAL_SUBJECTS);
  list = list.filter((s) => s.id !== id);
  setLocalItem('subjects', list);
  return true;
}

/* =========================================================================
   ATTENDANCE
   ========================================================================= */
export async function fetchAttendance(filters?: {
  date?: string;
  classId?: string;
  studentId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<AttendanceRecord[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      let query = supabase.from('attendance').select('*, student:students(*), class:classes(*)').order('date', { ascending: false });

      if (filters?.date) query = query.eq('date', filters.date);
      if (filters?.classId && filters.classId !== 'all') query = query.eq('class_id', filters.classId);
      if (filters?.studentId) query = query.eq('student_id', filters.studentId);
      if (filters?.startDate) query = query.gte('date', filters.startDate);
      if (filters?.endDate) query = query.lte('date', filters.endDate);

      const { data, error } = await query;
      if (error) throw error;
      return (data as AttendanceRecord[]) || [];
    } catch (err) {
      console.warn('Supabase fetchAttendance fallback:', err);
    }
  }

  let list = getLocalItem<AttendanceRecord[]>('attendance', INITIAL_ATTENDANCE);
  const students = getLocalItem<StudentItem[]>('students', INITIAL_STUDENTS);
  const classes = getLocalItem<ClassItem[]>('classes', INITIAL_CLASSES);

  list = list.map((a) => ({
    ...a,
    student: students.find((s) => s.id === a.student_id) || null,
    class: classes.find((c) => c.id === a.class_id) || null,
  }));

  if (filters?.date) list = list.filter((a) => a.date === filters.date);
  if (filters?.classId && filters.classId !== 'all') list = list.filter((a) => a.class_id === filters.classId);
  if (filters?.studentId) list = list.filter((a) => a.student_id === filters.studentId);
  if (filters?.startDate) list = list.filter((a) => a.date >= filters.startDate!);
  if (filters?.endDate) list = list.filter((a) => a.date <= filters.endDate!);

  return list;
}

export async function saveAttendanceBatch(records: Partial<AttendanceRecord>[]): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    const rows = records.map((r) => ({
      student_id: r.student_id,
      class_id: r.class_id,
      date: r.date,
      status: r.status || 'present',
      remarks: r.remarks || '',
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('attendance').upsert(rows, {
      onConflict: 'student_id,date',
    });
    if (error) throw error;
    return true;
  }

  const list = getLocalItem<AttendanceRecord[]>('attendance', INITIAL_ATTENDANCE);
  for (const r of records) {
    if (!r.student_id || !r.date) continue;
    const existingIdx = list.findIndex((a) => a.student_id === r.student_id && a.date === r.date);
    if (existingIdx !== -1) {
      list[existingIdx] = {
        ...list[existingIdx],
        status: r.status || list[existingIdx].status,
        remarks: r.remarks !== undefined ? r.remarks : list[existingIdx].remarks,
        updated_at: new Date().toISOString(),
      };
    } else {
      list.push({
        id: generateUUID(),
        student_id: r.student_id,
        class_id: r.class_id || '',
        date: r.date,
        status: r.status || 'present',
        remarks: r.remarks || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }
  setLocalItem('attendance', list);
  return true;
}

/* =========================================================================
   EXAMINATIONS
   ========================================================================= */
export async function fetchExaminations(): Promise<ExaminationItem[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from('examinations').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data as ExaminationItem[]) || [];
    } catch (err) {
      console.warn('Supabase fetchExaminations fallback:', err);
    }
  }
  return getLocalItem<ExaminationItem[]>('examinations', INITIAL_EXAMINATIONS);
}

export async function saveExamination(examData: Partial<ExaminationItem>): Promise<ExaminationItem> {
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (examData.id) {
      const { data, error } = await supabase
        .from('examinations')
        .update({ ...examData, updated_at: new Date().toISOString() })
        .eq('id', examData.id)
        .select()
        .single();
      if (error) throw error;
      return data as ExaminationItem;
    } else {
      const { data, error } = await supabase
        .from('examinations')
        .insert({ ...examData, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .select()
        .single();
      if (error) throw error;
      return data as ExaminationItem;
    }
  }

  const list = getLocalItem<ExaminationItem[]>('examinations', INITIAL_EXAMINATIONS);
  if (examData.id) {
    const idx = list.findIndex((e) => e.id === examData.id);
    if (idx !== -1) {
      const updated = { ...list[idx], ...examData, updated_at: new Date().toISOString() };
      list[idx] = updated;
      setLocalItem('examinations', list);
      return updated;
    }
  }

  const newExam: ExaminationItem = {
    id: generateUUID(),
    name: examData.name || 'New Examination',
    exam_type: examData.exam_type || 'Midterm',
    academic_year: examData.academic_year || '2024-2025',
    start_date: examData.start_date || null,
    end_date: examData.end_date || null,
    status: examData.status || 'upcoming',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  list.unshift(newExam);
  setLocalItem('examinations', list);
  return newExam;
}

export async function deleteExamination(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    const { error } = await supabase.from('examinations').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
  let list = getLocalItem<ExaminationItem[]>('examinations', INITIAL_EXAMINATIONS);
  list = list.filter((e) => e.id !== id);
  setLocalItem('examinations', list);
  return true;
}

/* =========================================================================
   MARKS & ACADEMIC RECORDS
   ========================================================================= */
export async function fetchMarks(filters?: {
  examId?: string;
  subjectId?: string;
  studentId?: string;
}): Promise<MarkItem[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      let query = supabase.from('marks').select('*, student:students(*), examination:examinations(*), subject:subjects(*)');

      if (filters?.examId && filters.examId !== 'all') query = query.eq('examination_id', filters.examId);
      if (filters?.subjectId && filters.subjectId !== 'all') query = query.eq('subject_id', filters.subjectId);
      if (filters?.studentId) query = query.eq('student_id', filters.studentId);

      const { data, error } = await query;
      if (error) throw error;
      return (data as MarkItem[]) || [];
    } catch (err) {
      console.warn('Supabase fetchMarks fallback:', err);
    }
  }

  let list = getLocalItem<MarkItem[]>('marks', INITIAL_MARKS);
  const students = getLocalItem<StudentItem[]>('students', INITIAL_STUDENTS);
  const exams = getLocalItem<ExaminationItem[]>('examinations', INITIAL_EXAMINATIONS);
  const subjects = getLocalItem<SubjectItem[]>('subjects', INITIAL_SUBJECTS);

  list = list.map((m) => ({
    ...m,
    student: students.find((s) => s.id === m.student_id) || null,
    examination: exams.find((e) => e.id === m.examination_id) || null,
    subject: subjects.find((sub) => sub.id === m.subject_id) || null,
  }));

  if (filters?.examId && filters.examId !== 'all') list = list.filter((m) => m.examination_id === filters.examId);
  if (filters?.subjectId && filters.subjectId !== 'all') list = list.filter((m) => m.subject_id === filters.subjectId);
  if (filters?.studentId) list = list.filter((m) => m.student_id === filters.studentId);

  return list;
}

export async function saveMarksBatch(records: Partial<MarkItem>[]): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    const rows = records.map((r) => ({
      student_id: r.student_id,
      examination_id: r.examination_id,
      subject_id: r.subject_id,
      marks_obtained: r.marks_obtained,
      max_marks: r.max_marks || 100,
      remarks: r.remarks || '',
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('marks').upsert(rows, {
      onConflict: 'student_id,examination_id,subject_id',
    });
    if (error) throw error;
    return true;
  }

  const list = getLocalItem<MarkItem[]>('marks', INITIAL_MARKS);
  for (const r of records) {
    if (!r.student_id || !r.examination_id || !r.subject_id) continue;
    const existingIdx = list.findIndex(
      (m) => m.student_id === r.student_id && m.examination_id === r.examination_id && m.subject_id === r.subject_id
    );
    if (existingIdx !== -1) {
      list[existingIdx] = {
        ...list[existingIdx],
        marks_obtained: Number(r.marks_obtained),
        max_marks: Number(r.max_marks || 100),
        remarks: r.remarks !== undefined ? r.remarks : list[existingIdx].remarks,
        updated_at: new Date().toISOString(),
      };
    } else {
      list.push({
        id: generateUUID(),
        student_id: r.student_id,
        examination_id: r.examination_id,
        subject_id: r.subject_id,
        marks_obtained: Number(r.marks_obtained),
        max_marks: Number(r.max_marks || 100),
        remarks: r.remarks || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }
  setLocalItem('marks', list);
  return true;
}

/* =========================================================================
   SETTINGS & GRADING RULES
   ========================================================================= */
export async function fetchGradingRules(): Promise<GradingRule[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from('grading_rules').select('*').order('min_percentage', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) return data as GradingRule[];
    } catch (err) {
      console.warn('Supabase fetchGradingRules fallback:', err);
    }
  }
  return getLocalItem<GradingRule[]>('grading_rules', DEFAULT_GRADING_RULES);
}

export async function saveGradingRules(rules: GradingRule[]): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    const { error } = await supabase.from('grading_rules').upsert(rules);
    if (error) throw error;
    return true;
  }
  setLocalItem('grading_rules', rules);
  return true;
}

export async function fetchCollegeSettings(): Promise<CollegeSettings> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from('college_settings').select('*').limit(1).single();
      if (!error && data) return data as CollegeSettings;
    } catch (err) {
      console.warn('Supabase fetchCollegeSettings fallback:', err);
    }
  }
  return getLocalItem<CollegeSettings>('college_settings', INITIAL_SETTINGS);
}

export async function saveCollegeSettings(settings: CollegeSettings): Promise<CollegeSettings> {
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    const { data, error } = await supabase.from('college_settings').upsert({
      ...settings,
      updated_at: new Date().toISOString(),
    }).select().single();
    if (error) throw error;
    return data as CollegeSettings;
  }
  setLocalItem('college_settings', settings);
  return settings;
}

/* =========================================================================
   PROFILES / USERS
   ========================================================================= */
export async function fetchProfiles(): Promise<Profile[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from('profiles').select('*').order('full_name');
      if (error) throw error;
      return (data as Profile[]) || [];
    } catch (err) {
      console.warn('Supabase fetchProfiles fallback:', err);
    }
  }
  return getLocalItem<Profile[]>('profiles', INITIAL_PROFILES);
}

export async function updateProfileRole(userId: string, role: 'admin' | 'teacher'): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    const { error } = await supabase.from('profiles').update({ role, updated_at: new Date().toISOString() }).eq('id', userId);
    if (error) throw error;
    return true;
  }
  const list = getLocalItem<Profile[]>('profiles', INITIAL_PROFILES);
  const idx = list.findIndex((p) => p.id === userId);
  if (idx !== -1) {
    list[idx].role = role;
    setLocalItem('profiles', list);
  }
  return true;
}
