-- ====================================================================
-- STUDENT INFORMATION MANAGEMENT SYSTEM (SIMS)
-- Supabase PostgreSQL Schema & Row Level Security (RLS) Policies
-- Migration: 0001_initial_schema.sql
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS & CUSTOM TYPES
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'teacher');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE student_status AS ENUM ('active', 'inactive', 'graduated', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'leave', 'late');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'teacher',
    department TEXT DEFAULT 'General',
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. CLASSES TABLE
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,                  -- e.g. "B.Tech Computer Science"
    section TEXT NOT NULL,               -- e.g. "Section A"
    department TEXT NOT NULL,           -- e.g. "Computer Science & Engineering"
    academic_year TEXT NOT NULL,        -- e.g. "2024-2025"
    semester TEXT DEFAULT '1st Semester',
    capacity INT DEFAULT 60,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_class_section_year UNIQUE (name, section, academic_year)
);

-- 5. SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,          -- e.g. "CS101"
    name TEXT NOT NULL,                  -- e.g. "Data Structures & Algorithms"
    department TEXT NOT NULL,
    credits INT NOT NULL DEFAULT 3,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roll_number TEXT NOT NULL,          -- e.g. "2024CS001"
    student_id TEXT NOT NULL UNIQUE,    -- e.g. "STU-2024-001"
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
    date_of_birth DATE,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    department TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status student_status NOT NULL DEFAULT 'active',
    address TEXT,
    guardian_name TEXT,
    guardian_phone TEXT,
    guardian_relation TEXT DEFAULT 'Parent',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_roll_per_class_year UNIQUE (roll_number, class_id, academic_year)
);

-- 7. ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status attendance_status NOT NULL DEFAULT 'present',
    remarks TEXT,
    marked_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_student_daily_attendance UNIQUE (student_id, date)
);

-- 8. EXAMINATIONS TABLE
CREATE TABLE IF NOT EXISTS public.examinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,                 -- e.g. "Midterm Examination 2024"
    exam_type TEXT NOT NULL DEFAULT 'Midterm', -- e.g. Midterm, Final, Unit Test
    academic_year TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('upcoming', 'ongoing', 'completed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. MARKS TABLE
CREATE TABLE IF NOT EXISTS public.marks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    examination_id UUID NOT NULL REFERENCES public.examinations(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    marks_obtained NUMERIC(5, 2) NOT NULL,
    max_marks NUMERIC(5, 2) NOT NULL DEFAULT 100.00,
    remarks TEXT,
    marked_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT marks_cannot_exceed_max CHECK (marks_obtained <= max_marks AND marks_obtained >= 0),
    CONSTRAINT max_marks_positive CHECK (max_marks > 0),
    CONSTRAINT unique_student_exam_subject UNIQUE (student_id, examination_id, subject_id)
);

-- 10. GRADING RULES TABLE (Configurable grading scales)
CREATE TABLE IF NOT EXISTS public.grading_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grade TEXT NOT NULL UNIQUE,         -- e.g. "A+", "A", "B+", "B", "C", "D", "F"
    min_percentage NUMERIC(5, 2) NOT NULL,
    max_percentage NUMERIC(5, 2) NOT NULL,
    gpa_point NUMERIC(3, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_percentage_range CHECK (min_percentage >= 0 AND max_percentage <= 100 AND min_percentage <= max_percentage)
);

-- 11. COLLEGE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.college_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    college_name TEXT NOT NULL DEFAULT 'Apex Institute of Technology & Science',
    college_code TEXT DEFAULT 'AITS-2024',
    email TEXT DEFAULT 'admin@apexcollege.edu',
    phone TEXT DEFAULT '+1 (555) 019-2834',
    address TEXT DEFAULT '100 University Boulevard, Tech Campus',
    academic_year TEXT DEFAULT '2024-2025',
    grading_system TEXT DEFAULT 'Standard Letter (A+ to F)',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. DEFAULT GRADING RULES INSERTION
INSERT INTO public.grading_rules (grade, min_percentage, max_percentage, gpa_point, description)
VALUES
    ('A+', 90.00, 100.00, 4.00, 'Outstanding Performance'),
    ('A',  80.00, 89.99,  3.75, 'Excellent'),
    ('B+', 70.00, 79.99,  3.25, 'Very Good'),
    ('B',  60.00, 69.99,  2.75, 'Good'),
    ('C',  50.00, 59.99,  2.00, 'Average / Satisfactory'),
    ('D',  40.00, 49.99,  1.00, 'Pass'),
    ('F',  0.00,  39.99,  0.00, 'Fail')
ON CONFLICT (grade) DO NOTHING;

-- 13. DEFAULT COLLEGE SETTINGS INSERTION
INSERT INTO public.college_settings (college_name, college_code, email, phone, address, academic_year)
VALUES ('Apex Institute of Technology & Science', 'AITS-2024', 'admin@apexcollege.edu', '+1 (555) 019-2834', '100 University Boulevard, Tech Campus', '2024-2025')
ON CONFLICT DO NOTHING;

-- 14. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_students_class_id ON public.students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_roll_number ON public.students(roll_number);
CREATE INDEX IF NOT EXISTS idx_students_status ON public.students(status);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON public.attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_class_date ON public.attendance(class_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(date);
CREATE INDEX IF NOT EXISTS idx_marks_student_id ON public.marks(student_id);
CREATE INDEX IF NOT EXISTS idx_marks_exam_subject ON public.marks(examination_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_subjects_class_id ON public.subjects(class_id);

-- 15. AUTOMATIC PROFILE TRIGGER ON AUTH SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, department)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        COALESCE((new.raw_user_meta_data->>'role')::user_role, 'teacher'::user_role),
        COALESCE(new.raw_user_meta_data->>'department', 'Computer Science')
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = EXCLUDED.full_name;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 16. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.examinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grading_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.college_settings ENABLE ROW LEVEL SECURITY;

-- Helper function: Is current user an administrator?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles read" ON public.profiles;
CREATE POLICY "Public profiles read" ON public.profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;
CREATE POLICY "Admins have full access to profiles" ON public.profiles FOR ALL TO authenticated USING (public.is_admin());

-- Classes Policies (Admins can manage, teachers can view)
DROP POLICY IF EXISTS "Authenticated users view classes" ON public.classes;
CREATE POLICY "Authenticated users view classes" ON public.classes FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins manage classes" ON public.classes;
CREATE POLICY "Admins manage classes" ON public.classes FOR ALL TO authenticated USING (public.is_admin());

-- Subjects Policies (Admins can manage, teachers can view)
DROP POLICY IF EXISTS "Authenticated users view subjects" ON public.subjects;
CREATE POLICY "Authenticated users view subjects" ON public.subjects FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins manage subjects" ON public.subjects;
CREATE POLICY "Admins manage subjects" ON public.subjects FOR ALL TO authenticated USING (public.is_admin());

-- Students Policies (Admins can manage, teachers can view & update)
DROP POLICY IF EXISTS "Authenticated users view students" ON public.students;
CREATE POLICY "Authenticated users view students" ON public.students FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Teachers and admins manage students" ON public.students;
CREATE POLICY "Teachers and admins manage students" ON public.students FOR ALL TO authenticated USING (true);

-- Attendance Policies (Teachers and admins can view and record attendance)
DROP POLICY IF EXISTS "Authenticated users view attendance" ON public.attendance;
CREATE POLICY "Authenticated users view attendance" ON public.attendance FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users manage attendance" ON public.attendance;
CREATE POLICY "Authenticated users manage attendance" ON public.attendance FOR ALL TO authenticated USING (true);

-- Examinations Policies
DROP POLICY IF EXISTS "Authenticated users view examinations" ON public.examinations;
CREATE POLICY "Authenticated users view examinations" ON public.examinations FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins manage examinations" ON public.examinations;
CREATE POLICY "Admins manage examinations" ON public.examinations FOR ALL TO authenticated USING (public.is_admin());

-- Marks Policies (Teachers and admins can view and record marks)
DROP POLICY IF EXISTS "Authenticated users view marks" ON public.marks;
CREATE POLICY "Authenticated users view marks" ON public.marks FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Teachers and admins manage marks" ON public.marks;
CREATE POLICY "Teachers and admins manage marks" ON public.marks FOR ALL TO authenticated USING (true);

-- Grading Rules & Settings Policies
DROP POLICY IF EXISTS "Authenticated users view grading rules" ON public.grading_rules;
CREATE POLICY "Authenticated users view grading rules" ON public.grading_rules FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins manage grading rules" ON public.grading_rules;
CREATE POLICY "Admins manage grading rules" ON public.grading_rules FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Authenticated users view settings" ON public.college_settings;
CREATE POLICY "Authenticated users view settings" ON public.college_settings FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins manage settings" ON public.college_settings;
CREATE POLICY "Admins manage settings" ON public.college_settings FOR ALL TO authenticated USING (public.is_admin());
