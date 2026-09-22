-- =========================================================================
-- UNISA Learning Portal & Attendance Management System
-- Supabase PostgreSQL Schema & Initial Database Setup
-- Compatible with Supabase SQL Editor and CLI
-- =========================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS public.students (
    student_number VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    qualification VARCHAR(150) NOT NULL,
    campus VARCHAR(50) DEFAULT 'Science Campus (Florida)',
    risk_status VARCHAR(20) DEFAULT 'Low Risk',
    risk_score INT DEFAULT 8,
    overall_attendance NUMERIC(5,2) DEFAULT 92.50,
    popi_consented BOOLEAN DEFAULT false,
    popi_allowed_stakeholders TEXT[] DEFAULT ARRAY['lecturers', 'tutors', 'counselling', 'advisors', 'financial_aid', 'solulu_ai'],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. MODULES TABLE
CREATE TABLE IF NOT EXISTS public.modules (
    code VARCHAR(20) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    semester VARCHAR(20) NOT NULL,
    year INT DEFAULT 2026,
    credits INT DEFAULT 12,
    lecturer_name VARCHAR(100) NOT NULL,
    lecturer_email VARCHAR(100) NOT NULL,
    room VARCHAR(50) DEFAULT 'Room C1.08',
    total_students INT DEFAULT 148,
    average_attendance NUMERIC(5,2) DEFAULT 88.40,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ATTENDANCE RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_number VARCHAR(20) REFERENCES public.students(student_number) ON DELETE CASCADE,
    module_code VARCHAR(20) REFERENCES public.modules(code) ON DELETE CASCADE,
    session_name VARCHAR(150) NOT NULL,
    session_date DATE NOT NULL,
    session_time VARCHAR(20) DEFAULT '16:00',
    room VARCHAR(50) DEFAULT 'Room C1.08',
    status VARCHAR(20) NOT NULL CHECK (status IN ('Attended', 'Absent', 'Excused', 'Late')),
    verified_by VARCHAR(100) DEFAULT 'Dr. Elena Vasquez',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ASSESSMENTS TABLE
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_number VARCHAR(20) REFERENCES public.students(student_number) ON DELETE CASCADE,
    module_code VARCHAR(20) REFERENCES public.modules(code) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    assessment_type VARCHAR(50) NOT NULL,
    score_achieved NUMERIC(5,2) NOT NULL,
    max_score NUMERIC(5,2) NOT NULL,
    weight_percentage NUMERIC(5,2) NOT NULL,
    feedback TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. POPI ACT CONSENT AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.popi_consents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_number VARCHAR(20) REFERENCES public.students(student_number) ON DELETE CASCADE,
    consented BOOLEAN NOT NULL,
    allowed_stakeholders TEXT[] NOT NULL,
    consent_type VARCHAR(50) DEFAULT 'full_consent' CHECK (consent_type IN ('full_consent', 'custom_consent', 'declined')),
    consented_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ACADEMIC ALERTS & SOLULU ELEVATE INTERVENTIONS TABLE
CREATE TABLE IF NOT EXISTS public.academic_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_number VARCHAR(20) REFERENCES public.students(student_number) ON DELETE CASCADE,
    lecturer_name VARCHAR(100) DEFAULT 'Dr. Elena Vasquez',
    module_code VARCHAR(20) REFERENCES public.modules(code) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('risk_warning', 'attendance_alert', 'due_date', 'consultation')),
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'dispatched' CHECK (status IN ('pending', 'dispatched', 'acknowledged', 'resolved')),
    channel VARCHAR(30) DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp', 'email', 'portal')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- INDEXES FOR PERFORMANCE
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_attendance_student ON public.attendance_records(student_number);
CREATE INDEX IF NOT EXISTS idx_attendance_module ON public.attendance_records(module_code);
CREATE INDEX IF NOT EXISTS idx_assessments_student ON public.assessments(student_number);
CREATE INDEX IF NOT EXISTS idx_popi_student ON public.popi_consents(student_number);
CREATE INDEX IF NOT EXISTS idx_alerts_student ON public.academic_alerts(student_number);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES (Idempotent)
-- =========================================================================
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.popi_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_alerts ENABLE ROW LEVEL SECURITY;

-- Allow public read/write access for portal users (Anon Role)
DROP POLICY IF EXISTS "Allow public read students" ON public.students;
CREATE POLICY "Allow public read students" ON public.students FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert/update students" ON public.students;
CREATE POLICY "Allow public insert/update students" ON public.students FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public read modules" ON public.modules;
CREATE POLICY "Allow public read modules" ON public.modules FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert/update modules" ON public.modules;
CREATE POLICY "Allow public insert/update modules" ON public.modules FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public read attendance" ON public.attendance_records;
CREATE POLICY "Allow public read attendance" ON public.attendance_records FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert attendance" ON public.attendance_records;
CREATE POLICY "Allow public insert attendance" ON public.attendance_records FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public read assessments" ON public.assessments;
CREATE POLICY "Allow public read assessments" ON public.assessments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert assessments" ON public.assessments;
CREATE POLICY "Allow public insert assessments" ON public.assessments FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public read popi consents" ON public.popi_consents;
CREATE POLICY "Allow public read popi consents" ON public.popi_consents FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert popi consents" ON public.popi_consents;
CREATE POLICY "Allow public insert popi consents" ON public.popi_consents FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public read alerts" ON public.academic_alerts;
CREATE POLICY "Allow public read alerts" ON public.academic_alerts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert alerts" ON public.academic_alerts;
CREATE POLICY "Allow public insert alerts" ON public.academic_alerts FOR ALL USING (true);

-- =========================================================================
-- SEED INITIAL MOCK DATA
-- =========================================================================
INSERT INTO public.students (student_number, name, email, qualification, campus, risk_status, risk_score, overall_attendance, popi_consented, popi_allowed_stakeholders)
VALUES 
('67204918', 'Mabaso Cele', '67204918@mylife.unisa.ac.za', 'BSc Computer Science & Information Systems', 'Science Campus (Florida)', 'Low Risk', 8, 92.50, true, ARRAY['lecturers', 'tutors', 'counselling', 'advisors', 'financial_aid', 'solulu_ai']),
('67204919', 'Zandile Ndlovu', '67204919@mylife.unisa.ac.za', 'BSc Computer Science', 'Science Campus (Florida)', 'At Risk', 74, 52.00, true, ARRAY['lecturers', 'tutors', 'solulu_ai']),
('67204920', 'Kagiso Mokoena', '67204920@mylife.unisa.ac.za', 'BSc Information Technology', 'Pretoria Main Campus', 'Moderate Risk', 45, 68.00, true, ARRAY['lecturers', 'tutors', 'counselling'])
ON CONFLICT (student_number) DO NOTHING;

INSERT INTO public.modules (code, title, semester, year, credits, lecturer_name, lecturer_email, room, total_students, average_attendance)
VALUES 
('CS204', 'Data Structures & Algorithms', 'Semester 1', 2026, 12, 'Dr. Elena Vasquez', 'evasquez@unisa.ac.za', 'Room C1.08', 148, 88.40),
('CS201', 'Advanced Object-Oriented Java', 'Semester 1', 2026, 12, 'Dr. James Park', 'jpark@unisa.ac.za', 'Room C1.12', 132, 91.00),
('MATH202', 'Linear Algebra & Calculus', 'Semester 1', 2026, 12, 'Dr. Amir Hassan', 'ahassan@unisa.ac.za', 'Room M1.08', 160, 84.50),
('INF201', 'Database Design & Implementation', 'Semester 1', 2026, 12, 'Prof. Sarah Mills', 'smills@unisa.ac.za', 'Room C2.01', 120, 89.20)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.attendance_records (student_number, module_code, session_name, session_date, session_time, room, status, verified_by)
VALUES 
('67204918', 'CS204', 'AVL Trees & Balancing Rotation Lecture', CURRENT_DATE - INTERVAL '2 days', '14:00', 'Room C1.08', 'Attended', 'Dr. Elena Vasquez'),
('67204918', 'CS204', 'Binary Search Tree Practical Lab', CURRENT_DATE - INTERVAL '7 days', '16:00', 'Lab C1.08', 'Attended', 'Dr. Elena Vasquez')
ON CONFLICT DO NOTHING;
