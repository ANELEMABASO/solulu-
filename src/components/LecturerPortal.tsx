import React, { useState } from 'react';
import { UnisaLogo } from './UnisaLogo';
import { AssessmentBarChart, AssessmentItem } from './AssessmentBarChart';
import { StudentsAtRiskPieChart } from './StudentsAtRiskPieChart';
import {
  LecturerScreen,
  StudentAttendanceRecord,
} from '../types';
import {
  INITIAL_ATTENDANCE_RECORDS,
  CURRENT_LECTURER,
  STUDENT_MODULES,
  UNISA_CALENDAR_EVENTS,
} from '../data/unisaData';
import {
  LayoutDashboard,
  Eye,
  BookOpen,
  GraduationCap,
  Users,
  FileText,
  BarChart2,
  LogOut,
  Smartphone,
  Mail,
  Search,
  Download,
  RefreshCw,
  Bell,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar as CalendarIcon,
  ChevronDown,
  Sparkles,
  Award,
  Filter,
  Database,
} from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

interface LecturerPortalProps {
  onLogout: () => void;
  onOpenSalulu: () => void;
  onShowToast: (msg: string) => void;
}

// Student submission records for Database table matching image
interface DatabaseRecord {
  id: string;
  name: string;
  avatar: string;
  score: string;
  submitted: string;
  grade: 'Excellent' | 'Average' | 'Good' | 'Poor';
  status: 'Pass' | 'Fail';
  category: 'student' | 'teacher' | 'staff';
}

const DATABASE_STUDENTS: DatabaseRecord[] = [
  {
    id: 'db-1',
    name: 'Glenn Maxwell',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face',
    score: '80/100',
    submitted: '12/10/26 - 10:15 PM',
    grade: 'Excellent',
    status: 'Pass',
    category: 'student',
  },
  {
    id: 'db-2',
    name: 'Maya Chen',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
    score: '92/100',
    submitted: '12/10/26 - 08:30 PM',
    grade: 'Excellent',
    status: 'Pass',
    category: 'student',
  },
  {
    id: 'db-3',
    name: 'Sipho Zulu',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    score: '45/100',
    submitted: '11/10/26 - 11:58 PM',
    grade: 'Poor',
    status: 'Fail',
    category: 'student',
  },
  {
    id: 'db-4',
    name: 'Anika Patel',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face',
    score: '88/100',
    submitted: '12/10/26 - 06:12 PM',
    grade: 'Excellent',
    status: 'Pass',
    category: 'student',
  },
  {
    id: 'db-5',
    name: 'Thabo Mokoena',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face',
    score: '74/100',
    submitted: '12/10/26 - 09:40 PM',
    grade: 'Average',
    status: 'Pass',
    category: 'student',
  },
  {
    id: 'db-6',
    name: 'Kabelo Molefe',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
    score: '52/100',
    submitted: '10/10/26 - 07:15 PM',
    grade: 'Poor',
    status: 'Fail',
    category: 'student',
  },
];

export const LecturerPortal: React.FC<LecturerPortalProps> = ({
  onLogout,
  onOpenSalulu,
  onShowToast,
}) => {
  // Sidebar navigation state - defaulted to 'dashboard'
  const [screen, setScreen] = useState<LecturerScreen>('dashboard');
  const [records, setRecords] = useState<StudentAttendanceRecord[]>(INITIAL_ATTENDANCE_RECORDS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'At Risk' | 'Good' | 'Excellent'>('All');
  const [databaseTab, setDatabaseTab] = useState<'teacher' | 'student' | 'staff'>('student');
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentItem | null>(null);

  // Dynamic Calendar State (Initialized to current local date: September 2026, Day 22)
  const [calYear, setCalYear] = useState<number>(2026);
  const [calMonth, setCalMonth] = useState<number>(8); // 8 = September (0-indexed)
  const [selectedCalDate, setSelectedCalDate] = useState<string>('2026-09-22');
  const [calModuleFilter, setCalModuleFilter] = useState<string>('ALL');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevCalMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear(calYear - 1);
    } else {
      setCalMonth(calMonth - 1);
    }
  };

  const handleNextCalMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear(calYear + 1);
    } else {
      setCalMonth(calMonth + 1);
    }
  };

  const handleJumpToToday = () => {
    setCalYear(2026);
    setCalMonth(8);
    setSelectedCalDate('2026-09-22');
  };

  // Helper calculation for dynamic calendar days
  const daysInCalMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayCalIndex = new Date(calYear, calMonth, 1).getDay(); // 0 = Sun
  const padTwo = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  // Filter attendance records
  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.studentNumber.includes(searchQuery);
    const matchesFilter = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const handleSendSingleWhatsApp = (id: string, name: string) => {
    setRecords((prev) =>
      prev.map((rec) =>
        rec.id === id
          ? { ...rec, whatsappRemindersSent: rec.whatsappRemindersSent + 1 }
          : rec
      )
    );
    onShowToast(`Salulu WhatsApp reminder dispatched to ${name} (+27 82 *** 4910).`);
  };

  const handleSendSingleEmail = (id: string, name: string) => {
    setRecords((prev) =>
      prev.map((rec) =>
        rec.id === id ? { ...rec, emailRemindersSent: rec.emailRemindersSent + 1 } : rec
      )
    );
    onShowToast(`myLife academic alert dispatched to ${name}.`);
  };

  const handleBatchAlert = () => {
    setRecords((prev) =>
      prev.map((rec) =>
        rec.status === 'At Risk'
          ? {
              ...rec,
              whatsappRemindersSent: rec.whatsappRemindersSent + 1,
              emailRemindersSent: rec.emailRemindersSent + 1,
            }
          : rec
      )
    );
    onShowToast('Dispatched urgent Salulu WhatsApp & Email alerts to all At-Risk students!');
  };

  // Sidebar navigation items:
  // Dashboard, Overview, Courses, Students, Calendar, Exam, Result
  const navItems = [
    { id: 'dashboard' as LecturerScreen, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'overview' as LecturerScreen, label: 'Overview', icon: Eye },
    { id: 'courses' as LecturerScreen, label: 'Courses', icon: BookOpen },
    { id: 'students' as LecturerScreen, label: 'Students', icon: GraduationCap },
    { id: 'calendar' as LecturerScreen, label: 'Calendar', icon: CalendarIcon },
    { id: 'exam' as LecturerScreen, label: 'Exam', icon: FileText },
    { id: 'result' as LecturerScreen, label: 'Result', icon: BarChart2 },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F5F5F5] font-sans antialiased text-[#333333]">
      {/* ── 1. LEFT SIDEBAR (Matching UNISA Student Portal Charcoal & Red Scheme) ── */}
      <aside className="w-64 bg-[#333333] text-white flex flex-col justify-between shrink-0 border-r-4 border-[#DC2626] shadow-lg z-20 font-sans">
        <div>
          {/* Header with UNISA Wordmark */}
          <div className="p-5 border-b border-[#444444]">
            <UnisaLogo size="sm" theme="dark" showTagline={false} />
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#F97316]">
                Lecturer Portal
              </span>
              <span className="text-[9px] bg-[#DC2626] text-white px-2 py-0.5 rounded font-extrabold">
                Staff Console
              </span>
            </div>
          </div>

          {/* Navigation Links - All Buttons Function Smoothly */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = screen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setScreen(item.id);
                    onShowToast(`Navigated to Lecturer ${item.label} view.`);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all text-left ${
                    isActive
                      ? 'bg-[#DC2626] text-white shadow-xs'
                      : 'text-[#CCCCCC] hover:bg-[#444444] hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Solulu Elevate AI Autonomous Module Monitor Widget */}
          <div className="m-3 p-3.5 bg-[#262626] rounded-xl border border-[#DC2626]/60 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-white font-bold text-[11px]">
                <span className="text-sm">🤖</span>
                <span>Solulu Elevate AI</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-[#25D366] agent-pulse" />
            </div>
            <p className="text-[10px] text-[#AAAAAA] leading-relaxed">
              Predict at-risk students, assessment analysis, email alerts, & class attendance tracking.
            </p>
            <button
              onClick={onOpenSalulu}
              className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white py-1.5 rounded-md text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch Solulu Elevate</span>
              <span className="text-xs">→</span>
            </button>
          </div>
        </div>

        {/* Lecturer Profile Info Bar */}
        <div className="p-4 border-t border-[#444444] bg-[#2A2A2A] flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=face"
              alt={CURRENT_LECTURER.name}
              className="w-8 h-8 rounded-full object-cover border-2 border-[#DC2626] shrink-0"
            />
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">{CURRENT_LECTURER.name}</p>
              <p className="text-[10px] text-[#F97316] font-mono truncate">
                {CURRENT_LECTURER.staffId} · Senior Lecturer
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Sign Out"
            className="text-[#AAAAAA] hover:text-[#FF6B6B] p-1.5 rounded hover:bg-[#333333] transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* ── 2. CENTER & RIGHT WORKSPACE ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Central Main Dashboard Section */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 space-y-6">
            
            {/* Top Bar with Title, Solulu Elevate AI Trigger & Search Input */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-[#333333] tracking-tight capitalize">
                  {screen === 'dashboard' ? 'Dashboard' : `${screen} Overview`}
                </h1>
                <p className="text-xs text-[#666666] mt-0.5">
                  CS204: Data Structures & Algorithms · Academic Monitoring Console
                </p>
              </div>

              {/* Action Buttons & Search input matching UNISA portal palette */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Solulu Elevate AI Button */}
                <button
                  onClick={onOpenSalulu}
                  className="bg-[#F97316] hover:bg-[#EA580C] text-white px-3.5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs hover:shadow-md cursor-pointer"
                  title="Open Solulu Elevate AI Assistant"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Solulu Elevate AI</span>
                </button>

                {/* Batch Nudge At Risk */}
                <button
                  onClick={handleBatchAlert}
                  className="bg-[#DC2626] hover:bg-[#B91C1C] text-white px-3.5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs hover:shadow-md cursor-pointer"
                  title="Send instant nudges to flagged students"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Nudge At-Risk</span>
                </button>

                {/* Search input with red icon button matching UNISA palette */}
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Search students, courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-44 sm:w-56 pl-3.5 pr-10 py-1.5 bg-white rounded-full border border-[#CCCCCC] text-xs text-gray-800 placeholder-gray-400 shadow-2xs focus:outline-none focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626]"
                  />
                  <button
                    onClick={() => onShowToast(`Searching for "${searchQuery}"...`)}
                    className="w-7 h-7 rounded-full bg-[#DC2626] hover:bg-[#B91C1C] text-white flex items-center justify-center absolute right-1 transition-colors shadow-xs"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* ── RENDER DYNAMIC VIEWS ACCORDING TO ACTIVE SIDE OPTION BUTTON ── */}
            {screen === 'dashboard' && (
              <>
                {/* ── 4 SUMMARY METRIC CARDS (Total Students, Module login, Module Engagement, Submission rate) ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Total Students */}
                  <div className="bg-[#EEF2FF] rounded-2xl p-5 border border-indigo-100 flex flex-col items-center text-center shadow-xs transition-transform hover:-translate-y-0.5">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 mb-3 rotate-45 transform">
                      <GraduationCap className="w-6 h-6 -rotate-45" />
                    </div>
                    <span className="text-xs font-semibold text-gray-600 mt-1">Total Students</span>
                    <span className="text-2xl font-black text-gray-900 mt-1 tracking-tight">
                      1220
                    </span>
                  </div>

                  {/* Card 2: Module login (Changed from Total Teacher as requested!) */}
                  <div className="bg-[#FFF1F2] rounded-2xl p-5 border border-rose-100 flex flex-col items-center text-center shadow-xs transition-transform hover:-translate-y-0.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#E11D48] flex items-center justify-center text-white shadow-md shadow-rose-200 mb-3 rotate-45 transform">
                      <Users className="w-6 h-6 -rotate-45" />
                    </div>
                    <span className="text-xs font-semibold text-gray-600 mt-1">Module login</span>
                    <span className="text-2xl font-black text-gray-900 mt-1 tracking-tight">
                      120
                    </span>
                  </div>

                  {/* Card 3: Module Engagement (Changed from Total Courses as requested!) */}
                  <div className="bg-[#F0F9FF] rounded-2xl p-5 border border-sky-100 flex flex-col items-center text-center shadow-xs transition-transform hover:-translate-y-0.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#0284C7] flex items-center justify-center text-white shadow-md shadow-sky-200 mb-3 rotate-45 transform">
                      <BookOpen className="w-6 h-6 -rotate-45" />
                    </div>
                    <span className="text-xs font-semibold text-gray-600 mt-1">Module Engagement</span>
                    <span className="text-2xl font-black text-gray-900 mt-1 tracking-tight">
                      15
                    </span>
                  </div>

                  {/* Card 4: Submission rate (Changed from Faculty Room as requested!) */}
                  <div className="bg-[#FEF9C3] rounded-2xl p-5 border border-amber-100 flex flex-col items-center text-center shadow-xs transition-transform hover:-translate-y-0.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#D97706] flex items-center justify-center text-white shadow-md shadow-amber-200 mb-3 rotate-45 transform">
                      <Award className="w-6 h-6 -rotate-45" />
                    </div>
                    <span className="text-xs font-semibold text-gray-600 mt-1">Submission rate</span>
                    <span className="text-2xl font-black text-gray-900 mt-1 tracking-tight">
                      100
                    </span>
                  </div>
                </div>

                {/* ── MIDDLE ROW: STATISTICS BAR GRAPH & STUDENTS AT RISK PIE/DONUT CHART ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                  {/* Statistics Bar Graph: Y-Axis = Percentage %, X-Axis = Assessment Type */}
                  <div className="lg:col-span-7 h-full">
                    <AssessmentBarChart
                      onSelectAssessment={(item) => {
                        setSelectedAssessment(item);
                        onShowToast(`Selected ${item.name}: ${item.percentage}% completion.`);
                      }}
                    />
                  </div>

                  {/* Students at Risk (and Module Activity) Circular Pie / Donut Chart */}
                  <div className="lg:col-span-5 h-full">
                    <StudentsAtRiskPieChart
                      onFilterAtRisk={() => {
                        setStatusFilter('At Risk');
                        setScreen('students');
                        onShowToast('Filtered to At Risk student roster.');
                      }}
                      onNudgeAtRisk={handleBatchAlert}
                    />
                  </div>
                </div>

                {/* ── BOTTOM ROW: DATABASE TABLE (Matching reference image.png) ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-2 border-b border-gray-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base sm:text-lg font-bold text-gray-900">Database</h2>
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Supabase {isSupabaseConfigured() ? 'Connected' : 'Integration Ready'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        Continuous assessment submissions, attendance sync & POPIA status
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          onShowToast(
                            isSupabaseConfigured()
                              ? 'Synchronized latest student submissions with Supabase PostgreSQL!'
                              : 'Supabase schema verified: tables ready (students, attendance_records, popi_consents).'
                          );
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                        title="Synchronize records with Supabase"
                      >
                        <RefreshCw className="w-3 h-3 text-gray-500" />
                        <span>Sync Supabase</span>
                      </button>

                      {/* Tabs: Teacher, Student (Active), Staff */}
                      <div className="flex items-center gap-4 text-xs font-semibold">
                      <button
                        onClick={() => {
                          setDatabaseTab('teacher');
                          onShowToast('Switched to Teacher submissions view.');
                        }}
                        className={`transition-colors pb-1 ${
                          databaseTab === 'teacher'
                            ? 'text-[#DC2626] font-bold border-b-2 border-[#DC2626]'
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        Teacher
                      </button>
                      <button
                        onClick={() => setDatabaseTab('student')}
                        className={`transition-colors pb-1 ${
                          databaseTab === 'student'
                            ? 'text-[#DC2626] font-bold border-b-2 border-[#DC2626]'
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        Student
                      </button>
                      <button
                        onClick={() => {
                          setDatabaseTab('staff');
                          onShowToast('Switched to Staff submissions view.');
                        }}
                        className={`transition-colors pb-1 ${
                          databaseTab === 'staff'
                            ? 'text-[#DC2626] font-bold border-b-2 border-[#DC2626]'
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        Staff
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submissions Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-700">
                      <thead>
                        <tr className="text-gray-400 font-semibold border-b border-gray-100">
                          <th className="pb-3 font-semibold">Student name</th>
                          <th className="pb-3 font-semibold">Score</th>
                          <th className="pb-3 font-semibold">Submitted</th>
                          <th className="pb-3 font-semibold">Grade</th>
                          <th className="pb-3 font-semibold text-center">Pass/Fail</th>
                          <th className="pb-3 font-semibold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {DATABASE_STUDENTS.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                            <td className="py-3 flex items-center gap-3">
                              <img
                                src={item.avatar}
                                alt={item.name}
                                className="w-7 h-7 rounded-full object-cover border border-gray-200"
                              />
                              <span className="font-bold text-gray-800">{item.name}</span>
                            </td>
                            <td className="py-3 font-semibold text-gray-600">{item.score}</td>
                            <td className="py-3 text-gray-500 font-medium">{item.submitted}</td>
                            <td className="py-3">
                              <span
                                className={`font-semibold ${
                                  item.grade === 'Excellent'
                                    ? 'text-green-600'
                                    : item.grade === 'Average'
                                    ? 'text-blue-600'
                                    : 'text-amber-600'
                                }`}
                              >
                                {item.grade}
                              </span>
                            </td>
                            <td className="py-3 text-center">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  item.status === 'Pass'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}
                              >
                                {item.status}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => handleSendSingleWhatsApp(item.id, item.name)}
                                className="text-[#DC2626] hover:text-[#B91C1C] font-bold text-[11px] p-1"
                                title="Nudge via WhatsApp"
                              >
                                <Smartphone className="w-3.5 h-3.5 inline" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* ── SCREEN 2: OVERVIEW VIEW ── */}
            {screen === 'overview' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h2 className="text-base font-bold text-gray-900 mb-1">
                    CS204 Cohort Academic Overview
                  </h2>
                  <p className="text-xs text-gray-500 mb-6">
                    Real-time aggregated engagement and risk telemetry for Semester 1, 2026.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA]">
                      <span className="text-xs font-semibold text-[#DC2626]">Cohort Average</span>
                      <p className="text-2xl font-black text-[#991B1B] mt-1">78.4%</p>
                      <p className="text-[11px] text-[#DC2626] mt-1">+4.2% from previous term</p>
                    </div>
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                      <span className="text-xs font-semibold text-emerald-700">Module Login Frequency</span>
                      <p className="text-2xl font-black text-emerald-900 mt-1">4.8 days/wk</p>
                      <p className="text-[11px] text-emerald-600 mt-1">94% active student rate</p>
                    </div>
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                      <span className="text-xs font-semibold text-amber-700">Students Flagged at Risk</span>
                      <p className="text-2xl font-black text-amber-900 mt-1">18% (26)</p>
                      <p className="text-[11px] text-amber-600 mt-1">Automated nudges active</p>
                    </div>
                  </div>
                </div>

                <AssessmentBarChart
                  onSelectAssessment={(item) =>
                    onShowToast(`Selected ${item.name} in Cohort Overview.`)
                  }
                />
              </div>
            )}

            {/* ── SCREEN 3: COURSES (MODULES) VIEW ── */}
            {screen === 'courses' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-base font-bold text-gray-900">Assigned Modules</h2>
                      <p className="text-xs text-gray-500">
                        Department of Computing · Primary Teaching Allocation
                      </p>
                    </div>
                    <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                      4 Active Courses
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {STUDENT_MODULES.map((mod) => (
                      <div
                        key={mod.code}
                        className="p-5 rounded-xl border border-gray-100 hover:border-[#DC2626]/30 transition-all bg-gray-50/50 hover:bg-white hover:shadow-md"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black text-[#DC2626] bg-[#FEF2F2] px-2 py-0.5 rounded">
                            {mod.code}
                          </span>
                          <span className="text-[11px] font-bold text-emerald-600">
                            {mod.attendancePct}% Attendance
                          </span>
                        </div>
                        <h3 className="font-bold text-sm text-gray-800">{mod.name}</h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{mod.description}</p>
                        
                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                          <span className="text-gray-500">
                            Week {mod.currentWeek} of {mod.totalWeeks}
                          </span>
                          <button
                            onClick={() => onShowToast(`Accessing course syllabus and materials for ${mod.code}`)}
                            className="font-bold text-[#DC2626] hover:text-[#B91C1C]"
                          >
                            Manage Course →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── SCREEN 4: STUDENTS VIEW ── */}
            {screen === 'students' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-base font-bold text-gray-900">
                        Student Attendance & Roster
                      </h2>
                      <p className="text-xs text-gray-500">
                        Real-time tracking of 142 enrolled students with quick alert triggers
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700 px-3 py-1.5 rounded-lg focus:outline-none focus:border-[#DC2626]"
                      >
                        <option value="All">All Statuses</option>
                        <option value="At Risk">At Risk Only</option>
                        <option value="Good">Good Progress</option>
                        <option value="Excellent">Excellent</option>
                      </select>

                      <button
                        onClick={handleBatchAlert}
                        className="bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Nudge At-Risk</span>
                      </button>
                    </div>
                  </div>

                  {/* Student Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-700">
                      <thead>
                        <tr className="text-gray-400 font-semibold border-b border-gray-100">
                          <th className="pb-3">Student Name</th>
                          <th className="pb-3">Student No.</th>
                          <th className="pb-3">Attendance Rate</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3">Reminders</th>
                          <th className="pb-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredRecords.map((rec) => (
                          <tr key={rec.id} className="hover:bg-gray-50/60 transition-colors">
                            <td className="py-3 font-bold text-gray-800">{rec.name}</td>
                            <td className="py-3 font-mono text-gray-500">{rec.studentNumber}</td>
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <span className="font-bold">{rec.attendancePct}%</span>
                                <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      rec.attendancePct >= 80
                                        ? 'bg-emerald-500'
                                        : rec.attendancePct >= 60
                                        ? 'bg-amber-500'
                                        : 'bg-rose-500'
                                    }`}
                                    style={{ width: `${rec.attendancePct}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="py-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                  rec.status === 'Excellent'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : rec.status === 'Good'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}
                              >
                                {rec.status}
                              </span>
                            </td>
                            <td className="py-3 text-gray-500">
                              <span className="text-emerald-600 font-bold mr-2">
                                📱 {rec.whatsappRemindersSent}
                              </span>
                              <span className="text-blue-600 font-bold">
                                ✉️ {rec.emailRemindersSent}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleSendSingleWhatsApp(rec.id, rec.name)}
                                  className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50 border border-emerald-200"
                                  title="WhatsApp Nudge"
                                >
                                  <Smartphone className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleSendSingleEmail(rec.id, rec.name)}
                                  className="p-1 rounded-md text-blue-600 hover:bg-blue-50 border border-blue-200"
                                  title="Email Reminder"
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── SCREEN 5: TEACHERS VIEW ── */}
            {screen === 'teachers' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h2 className="text-base font-bold text-gray-900 mb-1">
                    Department Faculty & Colleagues
                  </h2>
                  <p className="text-xs text-gray-500 mb-6">
                    School of Computing, College of Science, Engineering and Technology
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { name: 'Dr. Elena Vasquez', role: 'Senior Lecturer & Coordinator', room: 'C1.04', email: 'evasquez@unisa.ac.za' },
                      { name: 'Dr. James Park', role: 'Lecturer (CS201 Java)', room: 'C1.12', email: 'jpark@unisa.ac.za' },
                      { name: 'Prof. Sarah Mills', role: 'Associate Professor (CS210)', room: 'C2.01', email: 'smills@unisa.ac.za' },
                      { name: 'Dr. Amir Hassan', role: 'Senior Lecturer (MATH202)', room: 'M1.08', email: 'ahassan@unisa.ac.za' },
                      { name: 'Nathan Macclam', role: 'Head Teaching Assistant', room: 'Lab C1.08', email: 'nmacclam@unisa.ac.za' },
                      { name: 'Danial Vatory', role: 'Teaching Assistant (Practical)', room: 'Lab C1.08', email: 'dvatory@unisa.ac.za' },
                    ].map((teacher, i) => (
                      <div key={i} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all">
                        <div className="w-10 h-10 rounded-full bg-[#FEF2F2] text-[#DC2626] font-bold flex items-center justify-center text-xs mb-3 border border-[#FECACA]">
                          {teacher.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <h4 className="font-bold text-xs text-gray-800">{teacher.name}</h4>
                        <p className="text-[11px] text-[#DC2626] font-semibold">{teacher.role}</p>
                        <p className="text-[10px] text-gray-400 mt-1">Office: {teacher.room} · {teacher.email}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── SCREEN: ACADEMIC CALENDAR & TIMETABLE VIEW ── */}
            {screen === 'calendar' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base sm:text-lg font-bold text-gray-900">
                          Lecturer Academic Timetable & Calendar
                        </h2>
                        <span className="bg-[#DC2626] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Live SAST
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Teaching sessions, practical labs, tutorials & submission deadlines for Semester 1, 2026.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Filter by Module */}
                      <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-lg border border-gray-200 text-xs">
                        <Filter className="w-3.5 h-3.5 text-gray-500 ml-1.5" />
                        <select
                          value={calModuleFilter}
                          onChange={(e) => setCalModuleFilter(e.target.value)}
                          className="bg-transparent text-xs font-semibold text-gray-700 outline-none pr-2 py-0.5 cursor-pointer"
                        >
                          <option value="ALL">All Modules</option>
                          <option value="CS204">CS204 (Data Structures)</option>
                          <option value="CS201">CS201 (Java OOP)</option>
                          <option value="MATH202">MATH202 (Discrete Math)</option>
                          <option value="CS210">CS210 (Architecture)</option>
                        </select>
                      </div>

                      <button
                        onClick={handleJumpToToday}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        Today
                      </button>
                    </div>
                  </div>

                  {/* Calendar Month Controls & Grid */}
                  <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left 8 cols: Large Month Matrix */}
                    <div className="lg:col-span-8 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-gray-800">
                            {monthNames[calMonth]} {calYear}
                          </h3>
                          {calYear === 2026 && calMonth === 8 && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                              Current Month
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={handlePrevCalMonth}
                            className="p-1.5 rounded-lg bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 transition-colors"
                            title="Previous Month"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleNextCalMonth}
                            className="p-1.5 rounded-lg bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 transition-colors"
                            title="Next Month"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Day Headers */}
                      <div className="grid grid-cols-7 text-center text-xs font-bold text-gray-400 mb-2">
                        <span>Sun</span>
                        <span>Mon</span>
                        <span>Tue</span>
                        <span>Wed</span>
                        <span>Thu</span>
                        <span>Fri</span>
                        <span>Sat</span>
                      </div>

                      {/* Day cells */}
                      <div className="grid grid-cols-7 gap-1.5">
                        {Array.from({ length: firstDayCalIndex }).map((_, idx) => (
                          <div key={`empty-${idx}`} className="h-14 sm:h-16 rounded-lg bg-gray-100/30" />
                        ))}

                        {Array.from({ length: daysInCalMonth }).map((_, idx) => {
                          const dayNum = idx + 1;
                          const dateString = `${calYear}-${padTwo(calMonth + 1)}-${padTwo(dayNum)}`;
                          const isToday = dateString === '2026-09-22';
                          const isSelected = selectedCalDate === dateString;

                          // Find events on this date matching filter
                          const dayEvents = UNISA_CALENDAR_EVENTS.filter(
                            (ev) =>
                              ev.date === dateString &&
                              (calModuleFilter === 'ALL' || ev.moduleCode === calModuleFilter || ev.moduleCode === 'ALL')
                          );

                          return (
                            <button
                              key={dateString}
                              onClick={() => {
                                setSelectedCalDate(dateString);
                                if (dayEvents.length > 0) {
                                  onShowToast(`Selected ${dayEvents.length} event(s) on ${dateString}`);
                                }
                              }}
                              className={`h-14 sm:h-16 p-1 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-[#FEF2F2] border-[#DC2626] shadow-xs ring-2 ring-[#DC2626]/20'
                                  : isToday
                                  ? 'bg-white border-[#DC2626] shadow-xs'
                                  : 'bg-white border-gray-100 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span
                                  className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                                    isToday
                                      ? 'bg-[#DC2626] text-white'
                                      : isSelected
                                      ? 'text-[#DC2626]'
                                      : 'text-gray-700'
                                  }`}
                                >
                                  {dayNum}
                                </span>
                                {dayEvents.length > 0 && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#F97316]" />
                                )}
                              </div>

                              <div className="overflow-hidden space-y-0.5">
                                {dayEvents.slice(0, 1).map((ev) => (
                                  <div
                                    key={ev.id}
                                    className="text-[9px] font-bold truncate px-1 py-0.5 rounded bg-[#DC2626]/10 text-[#DC2626]"
                                  >
                                    {ev.moduleCode}: {ev.title}
                                  </div>
                                ))}
                                {dayEvents.length > 1 && (
                                  <div className="text-[8px] font-semibold text-gray-500 pl-1">
                                    +{dayEvents.length - 1} more
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right 4 cols: Selected Day's Schedule & Agenda */}
                    <div className="lg:col-span-4 flex flex-col justify-between bg-white p-4 rounded-xl border border-gray-200">
                      <div>
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                          <div>
                            <span className="text-[10px] uppercase tracking-wider font-bold text-[#DC2626]">
                              Day Schedule
                            </span>
                            <h4 className="text-sm font-bold text-gray-800">
                              {selectedCalDate === '2026-09-22' ? 'Today · September 22, 2026' : selectedCalDate}
                            </h4>
                          </div>
                          {selectedCalDate === '2026-09-22' && (
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded-full">
                              Current Day
                            </span>
                          )}
                        </div>

                        {/* List of events on selected day */}
                        <div className="mt-3 space-y-3">
                          {UNISA_CALENDAR_EVENTS.filter(
                            (ev) =>
                              ev.date === selectedCalDate &&
                              (calModuleFilter === 'ALL' || ev.moduleCode === calModuleFilter || ev.moduleCode === 'ALL')
                          ).length === 0 ? (
                            <div className="p-5 text-center bg-gray-50 rounded-xl border border-gray-100">
                              <CalendarIcon className="w-8 h-8 text-gray-300 mx-auto mb-1.5" />
                              <p className="text-xs font-semibold text-gray-600">No scheduled sessions</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                Select another date with event dots (e.g. Sept 21, Sept 22, Sept 23, Oct 2, Oct 7)
                              </p>
                            </div>
                          ) : (
                            UNISA_CALENDAR_EVENTS.filter(
                              (ev) =>
                                ev.date === selectedCalDate &&
                                (calModuleFilter === 'ALL' || ev.moduleCode === calModuleFilter || ev.moduleCode === 'ALL')
                            ).map((ev) => (
                              <div
                                key={ev.id}
                                className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/70 hover:bg-white hover:shadow-xs transition-all space-y-1.5"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
                                    {ev.moduleCode} · {ev.type.toUpperCase()}
                                  </span>
                                  {ev.time && (
                                    <span className="text-[10px] font-medium text-gray-500 flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-gray-400" />
                                      {ev.time}
                                    </span>
                                  )}
                                </div>
                                <h5 className="text-xs font-bold text-gray-900 leading-snug">{ev.title}</h5>
                                {ev.venue && (
                                  <p className="text-[11px] text-gray-500 font-medium">📍 {ev.venue}</p>
                                )}
                                {ev.lecturer && (
                                  <p className="text-[10px] text-gray-400">Host: {ev.lecturer}</p>
                                )}
                                <p className="text-[11px] text-gray-600 leading-relaxed pt-1 border-t border-gray-100">
                                  {ev.description}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Quick Academic Calendar Legend */}
                      <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-500 space-y-1">
                        <div className="font-bold text-gray-700 text-[10px] uppercase">Legend</div>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" />
                          <span>Practical Labs & Core Lectures</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" />
                          <span>Assignments, Due Dates & Exams</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── SCREEN 6: EXAM VIEW ── */}
            {screen === 'exam' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-base font-bold text-gray-900">Examination Schedule & Moderation</h2>
                      <p className="text-xs text-gray-500">
                        Semester 1 Final & Continuous Assessment Exams
                      </p>
                    </div>
                    <button
                      onClick={() => onShowToast('Exam paper moderation status exported')}
                      className="bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Export Timetable
                    </button>
                  </div>

                  <div className="space-y-3">
                    {[
                      { code: 'CS204', title: 'Data Structures & Algorithms Final Exam', date: '14 May 2026', venue: 'Pretoria Exam Hall A & Online Proctor', status: 'Moderated' },
                      { code: 'CS201', title: 'Object-Oriented Programming (Java) Written Paper', date: '21 May 2026', venue: 'Main Hall C', status: 'Pending Review' },
                      { code: 'CS210', title: 'Computer Architecture & Systems Practical', date: '28 May 2026', venue: 'Online Proctoring', status: 'Approved' },
                    ].map((exam, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-black uppercase text-[#DC2626] bg-[#FEF2F2] px-2 py-0.5 rounded border border-[#FECACA]">
                            {exam.code}
                          </span>
                          <h4 className="font-bold text-xs text-gray-800 mt-1">{exam.title}</h4>
                          <p className="text-[11px] text-gray-500">Date: {exam.date} · Venue: {exam.venue}</p>
                        </div>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
                          {exam.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── SCREEN 7: RESULT VIEW ── */}
            {screen === 'result' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-base font-bold text-gray-900">Assessment Results & Marks Ledger</h2>
                      <p className="text-xs text-gray-500">
                        Official marks recorded in myUnisa student database
                      </p>
                    </div>
                    <button
                      onClick={() => onShowToast('Marks ledger synchronized with UNISA Registrar')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Publish Results
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-700">
                      <thead>
                        <tr className="text-gray-400 font-semibold border-b border-gray-100">
                          <th className="pb-3">Student Name</th>
                          <th className="pb-3">Assignment 1</th>
                          <th className="pb-3">Quiz 1</th>
                          <th className="pb-3">Lab Practical</th>
                          <th className="pb-3">Assignment 2</th>
                          <th className="pb-3">Weighted Total</th>
                          <th className="pb-3 text-right">Result</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {DATABASE_STUDENTS.map((s, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/50">
                            <td className="py-3 font-bold text-gray-800">{s.name}</td>
                            <td className="py-3">82%</td>
                            <td className="py-3">88%</td>
                            <td className="py-3">90%</td>
                            <td className="py-3">68%</td>
                            <td className="py-3 font-bold text-[#DC2626]">{s.score}</td>
                            <td className="py-3 text-right">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  s.status === 'Pass'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}
                              >
                                {s.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

          </main>

          {/* ── 3. RIGHT PANEL (Calendar, Appointments, Notice Board matching image.png) ── */}
          <aside className="w-72 lg:w-80 bg-white border-l border-gray-100 p-5 overflow-y-auto space-y-6 hidden xl:block shrink-0 shadow-2xs">
            {/* Top User Profile */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=face"
                  alt="Lecturer"
                  className="w-8 h-8 rounded-full object-cover border-2 border-[#DC2626]"
                />
                <div className="truncate">
                  <span className="text-xs font-bold text-gray-800 block truncate leading-tight">
                    Dr. Elena Vasquez
                  </span>
                  <span className="text-[10px] text-[#DC2626] font-semibold block truncate">
                    Senior Lecturer & Coordinator
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onShowToast('You have 2 new academic notifications')}
                  className="w-7 h-7 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 flex items-center justify-center relative transition-colors"
                >
                  <Bell className="w-3.5 h-3.5 text-gray-500" />
                  <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1 right-1" />
                </button>
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="w-7 h-7 rounded-full bg-gray-50 hover:bg-rose-50 text-gray-400 hover:text-rose-600 flex items-center justify-center transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Dynamic Up-to-date Mini Calendar Widget */}
            <div className="bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={handlePrevCalMonth}
                  className="text-gray-400 hover:text-gray-700 p-1 rounded-md hover:bg-white transition-colors cursor-pointer"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="text-center">
                  <span className="text-xs font-bold text-gray-800">
                    {monthNames[calMonth]} {calYear}
                  </span>
                  {calYear === 2026 && calMonth === 8 && (
                    <span className="ml-1.5 text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-full">
                      Live
                    </span>
                  )}
                </div>
                <button
                  onClick={handleNextCalMonth}
                  className="text-gray-400 hover:text-gray-700 p-1 rounded-md hover:bg-white transition-colors cursor-pointer"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Day Labels (Sun -> Sat) */}
              <div className="grid grid-cols-7 text-center text-[10px] font-semibold text-gray-400 mb-1">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              {/* Calendar Days Matrix */}
              <div className="grid grid-cols-7 text-center text-xs gap-y-1 font-medium text-gray-700">
                {/* Empty cells before 1st day */}
                {Array.from({ length: firstDayCalIndex }).map((_, idx) => (
                  <span key={`empty-mini-${idx}`} className="text-gray-200 text-[10px]">
                    ·
                  </span>
                ))}

                {/* Day Numbers */}
                {Array.from({ length: daysInCalMonth }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const dateString = `${calYear}-${padTwo(calMonth + 1)}-${padTwo(dayNum)}`;
                  const isToday = dateString === '2026-09-22';
                  const isSelected = selectedCalDate === dateString;
                  const hasEvents = UNISA_CALENDAR_EVENTS.some((ev) => ev.date === dateString);

                  return (
                    <button
                      key={`mini-${dateString}`}
                      onClick={() => {
                        setSelectedCalDate(dateString);
                        const dayEvents = UNISA_CALENDAR_EVENTS.filter((e) => e.date === dateString);
                        if (dayEvents.length > 0) {
                          onShowToast(`${dayEvents.length} event(s) on ${dateString}: ${dayEvents[0].title}`);
                        }
                      }}
                      className={`relative w-6 h-6 rounded-full flex items-center justify-center mx-auto transition-colors text-[11px] font-medium cursor-pointer ${
                        isToday
                          ? 'bg-[#DC2626] text-white font-bold shadow-xs'
                          : isSelected
                          ? 'bg-red-100 text-[#DC2626] font-bold ring-1 ring-[#DC2626]'
                          : 'hover:bg-gray-200 text-gray-700'
                      }`}
                      title={hasEvents ? `Events scheduled on ${dateString}` : dateString}
                    >
                      {dayNum}
                      {hasEvents && !isToday && (
                        <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-[#F97316]" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Today button & Link to full calendar */}
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200/60 text-[11px]">
                <button
                  onClick={handleJumpToToday}
                  className="text-gray-500 hover:text-gray-800 font-semibold cursor-pointer"
                >
                  Today (22 Sep)
                </button>
                <button
                  onClick={() => setScreen('calendar')}
                  className="text-[#DC2626] hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Full Timetable</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {/* Scheduled Tutors/Consultations below Calendar */}
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="p-2 rounded-xl bg-amber-50/60 border border-amber-100 text-center">
                  <span className="text-base">🧑‍🏫</span>
                  <p className="text-[11px] font-bold text-gray-800 mt-0.5 truncate">
                    Nathan Macclam
                  </p>
                  <p className="text-[9px] text-gray-500">10:00 - 12:00</p>
                </div>
                <div className="p-2 rounded-xl bg-blue-50/60 border border-blue-100 text-center">
                  <span className="text-base">👨‍💻</span>
                  <p className="text-[11px] font-bold text-gray-800 mt-0.5 truncate">
                    Danial Vatory
                  </p>
                  <p className="text-[9px] text-gray-500">14:00 - 16:00</p>
                </div>
              </div>
            </div>

            {/* Notice Board matching image.png */}
            <div className="pt-2">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>Notice Board</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#F97316]" />
              </h3>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100/80 transition-colors cursor-pointer border border-gray-100">
                  <p className="text-xs font-bold text-gray-800 leading-snug">
                    Notice of Special Examinations of Semester Spring 2026
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">By - Justin Langer</p>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100/80 transition-colors cursor-pointer border border-gray-100">
                  <p className="text-xs font-bold text-gray-800 leading-snug">
                    Time Extension Notice of Semester Admission
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">By - Danial Vatory</p>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100/80 transition-colors cursor-pointer border border-gray-100">
                  <p className="text-xs font-bold text-gray-800 leading-snug">
                    COVID-19 & Campus Health Guidelines October 2026
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">By - Health Directorate</p>
                </div>
              </div>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
};
