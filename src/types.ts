export type Role = 'student' | 'lecturer';

export type StudentScreen = 'overview' | 'modules' | 'module-detail' | 'schedule' | 'calendar' | 'progress' | 'messages';
export type LecturerScreen =
  | 'dashboard'
  | 'overview'
  | 'courses'
  | 'students'
  | 'teachers'
  | 'exam'
  | 'result'
  | 'modules'
  | 'grades'
  | 'messages';
export type ModuleTab = 'overview' | 'learning' | 'assignments' | 'grades' | 'resources';

export type CalendarEventType = 'lecture' | 'lab' | 'assignment' | 'exam' | 'tutorial' | 'holiday';

export interface AcademicCalendarEvent {
  id: string;
  title: string;
  moduleCode: string;
  type: CalendarEventType;
  date: string; // YYYY-MM-DD
  time?: string;
  venue?: string;
  lecturer?: string;
  description?: string;
  status?: 'upcoming' | 'due' | 'completed';
  saluluAlert?: boolean;
}

export interface StudentProfile {
  name: string;
  studentNumber: string;
  email: string;
  degree: string;
  semester: string;
  creditsEarned: number;
  totalCredits: number;
}

export interface LecturerProfile {
  name: string;
  staffId: string;
  email: string;
  department: string;
  title: string;
}

export interface ModuleItem {
  code: string;
  name: string;
  instructor: string;
  progressPct: number;
  currentWeek: number;
  totalWeeks: number;
  attendancePct: number;
  gradeAverage: number;
  credits: number;
  themeColor: string;
  description: string;
}

export interface StudentAttendanceRecord {
  id: string;
  name: string;
  studentNumber: string;
  module: string;
  attendancePct: number;
  lastActive: string;
  status: 'At Risk' | 'Good' | 'Excellent';
  whatsappRemindersSent: number;
  emailRemindersSent: number;
  notesCompleted: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'student' | 'lecturer' | 'system' | 'salulu' | 'solulu-elevate';
  senderName: string;
  text: string;
  time: string;
  badge?: string;
}

export interface MessageThread {
  id: string;
  participantName: string;
  roleDescription: string;
  avatarText: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isSalulu?: boolean;
  isSoluluElevate?: boolean;
  messages: ChatMessage[];
}

export interface BarStatItem {
  label: string;
  value: number;
  display: string;
  color: string;
  benchmark?: string;
}
