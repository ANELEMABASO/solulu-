import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { StudentProfile } from '../types';

// Types for Supabase Tables
export interface DbStudent {
  student_number: string;
  name: string;
  email: string;
  qualification: string;
  campus: string;
  risk_status: 'Low Risk' | 'Moderate Risk' | 'At Risk';
  risk_score: number;
  popi_consented: boolean;
  popi_allowed_stakeholders: string[];
  updated_at?: string;
}

export interface DbAttendanceRecord {
  id?: string;
  student_number: string;
  module_code: string;
  session_name: string;
  session_date: string;
  session_time?: string;
  room?: string;
  status: 'Attended' | 'Absent' | 'Excused' | 'Late';
  verified_by?: string;
  created_at?: string;
}

export interface DbPopiConsent {
  id?: string;
  student_number: string;
  consented: boolean;
  allowed_stakeholders: string[];
  consent_type: 'full_consent' | 'custom_consent' | 'declined';
  consented_at?: string;
  notes?: string;
}

export interface DbAcademicAlert {
  id?: string;
  student_number: string;
  lecturer_name: string;
  module_code: string;
  alert_type: 'risk_warning' | 'attendance_alert' | 'due_date' | 'consultation';
  title: string;
  message: string;
  status: 'pending' | 'dispatched' | 'acknowledged';
  channel: 'whatsapp' | 'email' | 'portal';
  created_at?: string;
}

export interface DbAssessment {
  id?: string;
  student_number: string;
  module_code: string;
  title: string;
  assessment_type: 'Quiz' | 'Assignment' | 'Lab Exam' | 'Portfolio';
  score_achieved: number;
  max_score: number;
  weight_percentage: number;
  feedback?: string;
  submitted_at?: string;
}

// Lazy Supabase client singleton
let supabaseInstance: SupabaseClient | null = null;
let hasLoggedInitNotice = false;

/**
 * Normalizes Supabase URL to ensure correct protocol and .supabase.co TLD.
 */
export function normalizeSupabaseUrl(rawUrl?: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim().replace(/['"]/g, '');
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  // Auto-correct common typo .supabase.com -> .supabase.co
  if (url.includes('.supabase.com')) {
    url = url.replace('.supabase.com', '.supabase.co');
  } else if (!url.includes('.supabase.co') && !url.includes('localhost') && !url.includes('127.0.0.1')) {
    // If just the project ID was passed (e.g. wjjsljkwgknsrxkrajvm)
    url = url.replace(/https?:\/\//, '');
    url = `https://${url}.supabase.co`;
  }
  return url;
}

/**
 * Returns true if Supabase environment variables are provided.
 */
export function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return Boolean(url && key && url.trim().length > 0 && key.trim().length > 0);
}

/**
 * Lazy-initializes and returns the Supabase client.
 * Returns null if environment variables are not yet provided.
 */
export function getSupabase(): SupabaseClient | null {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const rawUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()?.replace(/['"]/g, '');

  if (!rawUrl || !supabaseAnonKey) {
    if (!hasLoggedInitNotice) {
      console.info(
        'ℹ️ Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are not set. Utilizing integrated client-side persistence with offline-ready local sync.'
      );
      hasLoggedInitNotice = true;
    }
    return null;
  }

  const supabaseUrl = normalizeSupabaseUrl(rawUrl);

  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    console.info('✅ Supabase client successfully initialized:', supabaseUrl);
    return supabaseInstance;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    return null;
  }
}

/**
 * Persists or updates student POPI Act consent in Supabase.
 * Automatically falls back to localStorage if Supabase is offline/unconfigured.
 */
export async function savePopiConsentToSupabase(
  consent: DbPopiConsent
): Promise<{ success: boolean; source: 'supabase' | 'local'; error?: any }> {
  const client = getSupabase();

  if (!client) {
    // Local persistence fallback
    try {
      localStorage.setItem('unisa_popi_consent_v1', JSON.stringify(consent));
      return { success: true, source: 'local' };
    } catch (err) {
      return { success: false, source: 'local', error: err };
    }
  }

  try {
    // 1. Insert into popi_consents log table
    const { error: logError } = await client.from('popi_consents').insert([
      {
        student_number: consent.student_number,
        consented: consent.consented,
        allowed_stakeholders: consent.allowed_stakeholders,
        consent_type: consent.consent_type,
        consented_at: consent.consented_at || new Date().toISOString(),
        notes: consent.notes || 'Consented via myUNISA Student Portal modal',
      },
    ]);

    if (logError) {
      console.warn('Supabase popi_consents insert error:', logError.message);
    }

    // 2. Upsert student summary table
    await client.from('students').upsert(
      {
        student_number: consent.student_number,
        popi_consented: consent.consented,
        popi_allowed_stakeholders: consent.allowed_stakeholders,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'student_number' }
    );

    return { success: true, source: 'supabase' };
  } catch (err) {
    console.error('Error saving POPI consent to Supabase:', err);
    return { success: false, source: 'local', error: err };
  }
}

/**
 * Records an attendance event into Supabase.
 */
export async function recordAttendanceToSupabase(
  record: DbAttendanceRecord
): Promise<{ success: boolean; source: 'supabase' | 'local'; error?: any }> {
  const client = getSupabase();

  if (!client) {
    // Store in local storage history
    try {
      const existing = JSON.parse(localStorage.getItem('unisa_attendance_log') || '[]');
      existing.push({ ...record, created_at: new Date().toISOString() });
      localStorage.setItem('unisa_attendance_log', JSON.stringify(existing));
      return { success: true, source: 'local' };
    } catch (err) {
      return { success: false, source: 'local', error: err };
    }
  }

  try {
    const { error } = await client.from('attendance_records').insert([
      {
        student_number: record.student_number,
        module_code: record.module_code,
        session_name: record.session_name,
        session_date: record.session_date,
        session_time: record.session_time || '16:00',
        room: record.room || 'Room C1.08',
        status: record.status,
        verified_by: record.verified_by || 'Dr. Elena Vasquez',
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.warn('Supabase attendance_records error:', error.message);
      return { success: false, source: 'supabase', error };
    }

    return { success: true, source: 'supabase' };
  } catch (err) {
    console.error('Error recording attendance to Supabase:', err);
    return { success: false, source: 'local', error: err };
  }
}

/**
 * Dispatches and logs an academic performance alert to Supabase.
 */
export async function dispatchAcademicAlertToSupabase(
  alert: DbAcademicAlert
): Promise<{ success: boolean; source: 'supabase' | 'local'; error?: any }> {
  const client = getSupabase();

  if (!client) {
    try {
      const existing = JSON.parse(localStorage.getItem('unisa_alerts_log') || '[]');
      existing.push({ ...alert, created_at: new Date().toISOString() });
      localStorage.setItem('unisa_alerts_log', JSON.stringify(existing));
      return { success: true, source: 'local' };
    } catch (err) {
      return { success: false, source: 'local', error: err };
    }
  }

  try {
    const { error } = await client.from('academic_alerts').insert([
      {
        student_number: alert.student_number,
        lecturer_name: alert.lecturer_name,
        module_code: alert.module_code,
        alert_type: alert.alert_type,
        title: alert.title,
        message: alert.message,
        status: alert.status,
        channel: alert.channel,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.warn('Supabase academic_alerts error:', error.message);
      return { success: false, source: 'supabase', error };
    }

    return { success: true, source: 'supabase' };
  } catch (err) {
    console.error('Error logging alert to Supabase:', err);
    return { success: false, source: 'local', error: err };
  }
}

/**
 * Fetches attendance history from Supabase for a student and module.
 */
export async function fetchStudentAttendanceFromSupabase(
  studentNumber: string,
  moduleCode?: string
): Promise<DbAttendanceRecord[]> {
  const client = getSupabase();
  if (!client) return [];

  try {
    let query = client
      .from('attendance_records')
      .select('*')
      .eq('student_number', studentNumber)
      .order('created_at', { ascending: false });

    if (moduleCode) {
      query = query.eq('module_code', moduleCode);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Error fetching attendance:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('Failed to query Supabase attendance:', err);
    return [];
  }
}

/**
 * Calls the PostgreSQL stored RPC function to get full student analytics.
 */
export async function fetchStudentAnalyticsFromSupabase(studentNumber: string) {
  const client = getSupabase();
  if (!client) return null;

  try {
    const { data, error } = await client.rpc('get_student_analytics', {
      p_student_number: studentNumber,
    });

    if (error) {
      console.warn('RPC get_student_analytics error:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Failed to call get_student_analytics RPC:', err);
    return null;
  }
}

/**
 * Registers a new student account, saving their details to Supabase and local storage.
 */
export async function registerStudentWithSupabase(data: {
  studentNumber: string;
  name: string;
  email: string;
  qualification?: string;
  campus?: string;
  password?: string;
}): Promise<{ success: boolean; student: StudentProfile; message: string }> {
  const client = getSupabase();
  const normalizedNum = data.studentNumber.trim();
  const studentEmail = data.email.trim() || `${normalizedNum}@mylife.unisa.ac.za`;

  const newProfile: StudentProfile = {
    name: data.name.trim(),
    studentNumber: normalizedNum,
    email: studentEmail,
    demoGmail: `${normalizedNum}@gmail.com`,
    degree: data.qualification || 'Bachelor of Science in Computing & Informatics',
    semester: 'Semester 1, 2026',
    creditsEarned: 120,
    totalCredits: 360,
  };

  // Always persist to local registered students database
  try {
    const raw = localStorage.getItem('unisa_registered_students_v1');
    const registered: any[] = raw ? JSON.parse(raw) : [];
    const existingIndex = registered.findIndex(
      (s) => s.studentNumber === normalizedNum || s.email.toLowerCase() === studentEmail.toLowerCase()
    );
    if (existingIndex >= 0) {
      registered[existingIndex] = { ...registered[existingIndex], ...newProfile, password: data.password };
    } else {
      registered.push({ ...newProfile, password: data.password });
    }
    localStorage.setItem('unisa_registered_students_v1', JSON.stringify(registered));
  } catch (e) {
    console.warn('Local storage write error:', e);
  }

  // If Supabase is available, sync to students table
  if (client) {
    try {
      await client.from('students').upsert(
        {
          student_number: normalizedNum,
          name: newProfile.name,
          email: studentEmail,
          qualification: newProfile.degree,
          campus: data.campus || 'Muckleneuk Campus (Pretoria)',
          risk_status: 'Low Risk',
          risk_score: 15,
          popi_consented: true,
          popi_allowed_stakeholders: ['Lecturers', 'Academic Advisors', 'Department Head'],
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'student_number' }
      );
    } catch (err) {
      console.warn('Supabase students upsert warning:', err);
    }
  }

  return {
    success: true,
    student: newProfile,
    message: `Account created successfully for ${newProfile.name} (${normalizedNum})!`,
  };
}

/**
 * Validates login credentials against Supabase / Registered local students / Demo accounts.
 */
export async function authenticateUserWithSupabase(
  identifier: string,
  secret: string,
  role: 'student' | 'staff'
): Promise<{ success: boolean; role: 'student' | 'lecturer'; studentProfile?: StudentProfile; error?: string }> {
  const cleanId = identifier.trim();
  const cleanPass = secret.trim();

  if (role === 'staff') {
    // Check staff credentials
    if (cleanId.toLowerCase() === 'evasquez@unisa.ac.za' || cleanId.toLowerCase() === 'lecturer' || cleanId === 'UNISA-STAFF-4821') {
      return { success: true, role: 'lecturer' };
    }
    // Allow any academic staff domain
    if (cleanId.includes('@unisa.ac.za') && cleanPass.length >= 4) {
      return { success: true, role: 'lecturer' };
    }
    return {
      success: false,
      role: 'lecturer',
      error: 'Invalid staff credentials. Use evasquez@unisa.ac.za or register an account.',
    };
  }

  // 1. Check Default Demo Student (Maya Chen)
  if (cleanId === '67283910' || cleanId.toLowerCase() === '67283910@mylife.unisa.ac.za') {
    return {
      success: true,
      role: 'student',
      studentProfile: {
        name: 'Maya Chen',
        studentNumber: '67283910',
        email: '67283910@mylife.unisa.ac.za',
        demoGmail: 'maya.sithole.2024@gmail.com',
        degree: 'Bachelor of Science in Computing & Informatics',
        semester: 'Semester 1, 2026',
        creditsEarned: 180,
        totalCredits: 360,
      },
    };
  }

  // 2. Check local registered students
  try {
    const raw = localStorage.getItem('unisa_registered_students_v1');
    if (raw) {
      const registered: any[] = JSON.parse(raw);
      const matched = registered.find(
        (s) =>
          s.studentNumber === cleanId ||
          s.email?.toLowerCase() === cleanId.toLowerCase()
      );
      if (matched) {
        return {
          success: true,
          role: 'student',
          studentProfile: matched,
        };
      }
    }
  } catch (e) {
    console.warn('Error reading registered accounts:', e);
  }

  // 3. Check Supabase students table
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client
        .from('students')
        .select('*')
        .or(`student_number.eq.${cleanId},email.eq.${cleanId}`)
        .limit(1);

      if (!error && data && data.length > 0) {
        const row = data[0];
        const studentProfile: StudentProfile = {
          name: row.name || 'Enrolled Student',
          studentNumber: row.student_number,
          email: row.email || `${row.student_number}@mylife.unisa.ac.za`,
          demoGmail: `${row.student_number}@gmail.com`,
          degree: row.qualification || 'Bachelor of Science in Computing & Informatics',
          semester: 'Semester 1, 2026',
          creditsEarned: 150,
          totalCredits: 360,
        };
        return { success: true, role: 'student', studentProfile };
      }
    } catch (err) {
      console.warn('Supabase student lookup error:', err);
    }
  }

  // 4. If credentials don't match any existing records
  return {
    success: false,
    role: 'student',
    error: 'No account found matching these details. Please register/sign up to obtain access.',
  };
}


