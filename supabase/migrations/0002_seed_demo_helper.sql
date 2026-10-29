-- ====================================================================
-- STUDENT INFORMATION MANAGEMENT SYSTEM (SIMS)
-- Demo Seed Script (Optional - Run in Supabase SQL Editor if desired)
-- Migration: 0002_seed_demo_helper.sql
-- ====================================================================

DO $$
DECLARE
    cls_cs_1 UUID;
    cls_cs_2 UUID;
    cls_ee_1 UUID;
    sub_ds UUID;
    sub_algo UUID;
    sub_dbms UUID;
    sub_os UUID;
    sub_circuits UUID;
    exam_midterm UUID;
    exam_final UUID;
    stu_1 UUID;
    stu_2 UUID;
    stu_3 UUID;
    stu_4 UUID;
    stu_5 UUID;
BEGIN
    -- 1. Insert Sample Classes
    INSERT INTO public.classes (name, section, department, academic_year, semester, capacity)
    VALUES ('B.Tech Computer Science', 'Section A', 'Computer Science & Engineering', '2024-2025', '3rd Semester', 60)
    RETURNING id INTO cls_cs_1;

    INSERT INTO public.classes (name, section, department, academic_year, semester, capacity)
    VALUES ('B.Tech Computer Science', 'Section B', 'Computer Science & Engineering', '2024-2025', '3rd Semester', 60)
    RETURNING id INTO cls_cs_2;

    INSERT INTO public.classes (name, section, department, academic_year, semester, capacity)
    VALUES ('B.Tech Electrical Engineering', 'Section A', 'Electrical Engineering', '2024-2025', '1st Semester', 50)
    RETURNING id INTO cls_ee_1;

    -- 2. Insert Sample Subjects
    INSERT INTO public.subjects (code, name, department, credits, class_id)
    VALUES ('CS201', 'Data Structures & Algorithms', 'Computer Science & Engineering', 4, cls_cs_1)
    RETURNING id INTO sub_ds;

    INSERT INTO public.subjects (code, name, department, credits, class_id)
    VALUES ('CS202', 'Database Management Systems', 'Computer Science & Engineering', 4, cls_cs_1)
    RETURNING id INTO sub_dbms;

    INSERT INTO public.subjects (code, name, department, credits, class_id)
    VALUES ('CS203', 'Operating Systems', 'Computer Science & Engineering', 3, cls_cs_1)
    RETURNING id INTO sub_os;

    INSERT INTO public.subjects (code, name, department, credits, class_id)
    VALUES ('EE101', 'Circuit Theory & Networks', 'Electrical Engineering', 4, cls_ee_1)
    RETURNING id INTO sub_circuits;

    -- 3. Insert Sample Examinations
    INSERT INTO public.examinations (name, exam_type, academic_year, start_date, end_date, status)
    VALUES ('Midterm Examination Fall 2024', 'Midterm', '2024-2025', '2024-10-10', '2024-10-20', 'completed')
    RETURNING id INTO exam_midterm;

    INSERT INTO public.examinations (name, exam_type, academic_year, start_date, end_date, status)
    VALUES ('Final Semester Examination 2024', 'Final', '2024-2025', '2024-12-05', '2024-12-20', 'completed')
    RETURNING id INTO exam_final;

    -- 4. Insert Sample Students
    INSERT INTO public.students (roll_number, student_id, first_name, last_name, email, phone, gender, date_of_birth, class_id, department, academic_year, enrollment_date, status, address, guardian_name, guardian_phone)
    VALUES ('2024CS001', 'STU-2024-001', 'Aarav', 'Sharma', 'aarav.sharma@student.apex.edu', '+1 (555) 101-2001', 'Male', '2004-05-14', cls_cs_1, 'Computer Science & Engineering', '2024-2025', '2024-08-01', 'active', '42 Tech Avenue, Suite 101', 'Rajesh Sharma', '+1 (555) 101-2099')
    RETURNING id INTO stu_1;

    INSERT INTO public.students (roll_number, student_id, first_name, last_name, email, phone, gender, date_of_birth, class_id, department, academic_year, enrollment_date, status, address, guardian_name, guardian_phone)
    VALUES ('2024CS002', 'STU-2024-002', 'Ananya', 'Iyer', 'ananya.iyer@student.apex.edu', '+1 (555) 101-2002', 'Female', '2004-09-22', cls_cs_1, 'Computer Science & Engineering', '2024-2025', '2024-08-01', 'active', '88 Knowledge Park, Block B', 'Suresh Iyer', '+1 (555) 101-2098')
    RETURNING id INTO stu_2;

    INSERT INTO public.students (roll_number, student_id, first_name, last_name, email, phone, gender, date_of_birth, class_id, department, academic_year, enrollment_date, status, address, guardian_name, guardian_phone)
    VALUES ('2024CS003', 'STU-2024-003', 'Rohan', 'Verma', 'rohan.verma@student.apex.edu', '+1 (555) 101-2003', 'Male', '2003-12-10', cls_cs_1, 'Computer Science & Engineering', '2024-2025', '2024-08-01', 'active', '12 Greenfield Way', 'Vikram Verma', '+1 (555) 101-2097')
    RETURNING id INTO stu_3;

    INSERT INTO public.students (roll_number, student_id, first_name, last_name, email, phone, gender, date_of_birth, class_id, department, academic_year, enrollment_date, status, address, guardian_name, guardian_phone)
    VALUES ('2024CS004', 'STU-2024-004', 'Priya', 'Nair', 'priya.nair@student.apex.edu', '+1 (555) 101-2004', 'Female', '2004-03-18', cls_cs_2, 'Computer Science & Engineering', '2024-2025', '2024-08-01', 'active', '19 Silicon Hills', 'Mohan Nair', '+1 (555) 101-2096')
    RETURNING id INTO stu_4;

    INSERT INTO public.students (roll_number, student_id, first_name, last_name, email, phone, gender, date_of_birth, class_id, department, academic_year, enrollment_date, status, address, guardian_name, guardian_phone)
    VALUES ('2024EE001', 'STU-2024-005', 'Kavya', 'Patel', 'kavya.patel@student.apex.edu', '+1 (555) 101-2005', 'Female', '2005-01-30', cls_ee_1, 'Electrical Engineering', '2024-2025', '2024-08-01', 'active', '77 Circuit Lane', 'Dinesh Patel', '+1 (555) 101-2095')
    RETURNING id INTO stu_5;

    -- 5. Insert Sample Attendance Records (for today and previous days)
    INSERT INTO public.attendance (student_id, class_id, date, status, remarks)
    VALUES
        (stu_1, cls_cs_1, CURRENT_DATE, 'present', 'On time'),
        (stu_2, cls_cs_1, CURRENT_DATE, 'present', 'On time'),
        (stu_3, cls_cs_1, CURRENT_DATE, 'absent', 'Medical excuse submitted'),
        (stu_4, cls_cs_2, CURRENT_DATE, 'present', 'On time'),
        (stu_5, cls_ee_1, CURRENT_DATE, 'present', 'On time')
    ON CONFLICT (student_id, date) DO NOTHING;

    -- 6. Insert Sample Marks
    INSERT INTO public.marks (student_id, examination_id, subject_id, marks_obtained, max_marks, remarks)
    VALUES
        (stu_1, exam_midterm, sub_ds, 92.50, 100.00, 'Excellent code efficiency'),
        (stu_1, exam_midterm, sub_dbms, 88.00, 100.00, 'Strong SQL query design'),
        (stu_2, exam_midterm, sub_ds, 85.00, 100.00, 'Good understanding of graphs'),
        (stu_2, exam_midterm, sub_dbms, 91.00, 100.00, 'Top query optimization'),
        (stu_3, exam_midterm, sub_ds, 68.00, 100.00, 'Needs review on trees and heaps'),
        (stu_3, exam_midterm, sub_dbms, 74.50, 100.00, 'Average normalization skills')
    ON CONFLICT (student_id, examination_id, subject_id) DO NOTHING;

END $$;
