// Re-export of supabase/schema.sql for workspace reference
// Refer to /supabase/schema.sql for the complete SQL migration.
export const SUPABASE_TABLES = [
  'students',
  'modules',
  'attendance_records',
  'assessments',
  'popi_consents',
  'academic_alerts',
] as const;
