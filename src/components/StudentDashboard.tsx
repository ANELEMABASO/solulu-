import React, { useState } from 'react';
import { StudentProfile, StudentScreen } from '../types';
import { CURRENT_STUDENT, STUDENT_MODULES, UNISA_CALENDAR_EVENTS } from '../data/unisaData';
import {
  Award,
  Bell,
  BookOpen,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  GraduationCap,
  LogOut,
  Mail,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';

interface StudentDashboardProps {
  userProfile?: StudentProfile;
  onNavigate: (screen: StudentScreen) => void;
  onSelectModule: (code: string) => void;
  onOpenSalulu: () => void;
  onOpenPopiModal: () => void;
  onOpenLesson: () => void;
  onOpenWorksheet: () => void;
  onLogout: () => void;
  onShowToast: (msg: string) => void;
  onToggleMobileMenu: () => void;
}

interface MyAssessment {
  id: string;
  name: string;
  shortLabel: string;
  moduleCode: string;
  type: 'Assignment' | 'Quiz' | 'Lab' | 'Test';
  myScore: number | null; // null = not yet marked
  classAverage: number;
  date: string;
  highlighted?: boolean;
}

const MY_ASSESSMENTS: MyAssessment[] = [
  { id: 'a1', name: 'Assignment 1: Foundations', shortLabel: 'Assignment 1', moduleCode: 'CS204', type: 'Assignment', myScore: 82, classAverage: 74, date: '12/09/26 - 10:15 PM' },
  { id: 'q1', name: 'Quiz 1: Algorithmic Complexity', shortLabel: 'Quiz 1', moduleCode: 'CS204', type: 'Quiz', myScore: 88, classAverage: 82, date: '14/09/26 - 08:30 PM' },
  { id: 'l1', name: 'Lab Practical: AVL Trees', shortLabel: 'Lab Practical', moduleCode: 'CS204', type: 'Lab', myScore: 90, classAverage: 88, date: '18/09/26 - 04:00 PM' },
  { id: 'a2', name: 'Assignment 2: Graph Algorithms', shortLabel: 'Assignment 2', moduleCode: 'CS204', type: 'Assignment', myScore: 68, classAverage: 66, date: 'Due 02/10/26 - 11:59 PM', highlighted: true },
  { id: 't1', name: 'Midterm Test: Data Structures', shortLabel: 'Midterm Test', moduleCode: 'CS204', type: 'Test', myScore: 79, classAverage: 79, date: '19/09/26 - 09:40 AM' },
  { id: 'j1', name: 'Java OOP Assignment 1', shortLabel: 'OOP Assign. 1', moduleCode: 'CS201', type: 'Assignment', myScore: 88, classAverage: 76, date: '12/09/26 - 11:59 PM' },
];

const gradeFor = (score: number) =>
  score >= 80 ? 'Excellent' : score >= 70 ? 'Good' : score >= 50 ? 'Average' : 'Poor';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const TODAY = '2026-09-22';

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  userProfile = CURRENT_STUDENT,
  onNavigate,
  onSelectModule,
  onOpenSalulu,
  onOpenPopiModal,
  onOpenLesson,
  onOpenWorksheet,
  onLogout,
  onShowToast,
  onToggleMobileMenu,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [metricMode, setMetricMode] = useState<'mine' | 'class'>('mine');
  const [chartFilter, setChartFilter] = useState<'All' | 'Assignments' | 'Quizzes' | 'Labs'>('All');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [donutMode, setDonutMode] = useState<'progress' | 'attendance'>('progress');
  const [tableTab, setTableTab] = useState<'all' | 'marked' | 'pending'>('all');
  const [calYear, setCalYear] = useState(2026);
  const [calMonth, setCalMonth] = useState(8);
  const [selectedCalDate, setSelectedCalDate] = useState(TODAY);

  const initials =
    userProfile.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'ST';

  const attendanceAvg = Math.round(
    STUDENT_MODULES.reduce((sum, m) => sum + (m.attendancePct ?? 0), 0) / STUDENT_MODULES.length,
  );
  const markedScores = MY_ASSESSMENTS.filter((a) => a.myScore !== null).map((a) => a.myScore as number);
  const assessmentAvg = Math.round(markedScores.reduce((s, v) => s + v, 0) / markedScores.length);
  const progressAvg = Math.round(STUDENT_MODULES.reduce((s, m) => s + m.progressPct, 0) / STUDENT_MODULES.length);

  const chartData = MY_ASSESSMENTS.filter((a) => {
    if (chartFilter === 'Assignments') return a.type === 'Assignment';
    if (chartFilter === 'Quizzes') return a.type === 'Quiz' || a.type === 'Test';
    if (chartFilter === 'Labs') return a.type === 'Lab';
    return true;
  });
  const yTicks = [100, 80, 60, 40, 20, 0];

  const tableRows = MY_ASSESSMENTS.filter((a) =>
    tableTab === 'all' ? true : tableTab === 'marked' ? a.date.indexOf('Due') !== 0 : a.date.indexOf('Due') === 0,
  ).filter(
    (a) =>
      !searchQuery.trim() ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.moduleCode.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const donutValue = donutMode === 'progress' ? progressAvg : attendanceAvg;
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const donutOffset = circumference - (donutValue / 100) * circumference;

  const daysInCalMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayCalIndex = new Date(calYear, calMonth, 1).getDay();
  const padTwo = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  const prevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear(calYear - 1);
    } else setCalMonth(calMonth - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear(calYear + 1);
    } else setCalMonth(calMonth + 1);
  };
  const jumpToToday = () => {
    setCalYear(2026);
    setCalMonth(8);
    setSelectedCalDate(TODAY);
  };

  const runSearch = () => onShowToast(`Searching myUNISA portal for "${searchQuery}"...`);

  const metricCards = [
    { label: 'Enrolled Modules', value: String(STUDENT_MODULES.length), icon: BookOpen, bg: 'bg-[#EEF2FF] border-indigo-100', chip: 'bg-indigo-600 shadow-indigo-200' },
    { label: 'Class Attendance', value: `${attendanceAvg}%`, icon: Users, bg: 'bg-[#FFF1F2] border-rose-100', chip: 'bg-[#E11D48] shadow-rose-200' },
    { label: 'Assessment Average', value: `${assessmentAvg}%`, icon: Award, bg: 'bg-[#F0F9FF] border-sky-100', chip: 'bg-[#0284C7] shadow-sky-200' },
    { label: 'Credits Earned', value: `${userProfile.creditsEarned}/${userProfile.totalCredits}`, icon: GraduationCap, bg: 'bg-[#FEF9C3] border-amber-100', chip: 'bg-[#D97706] shadow-amber-200' },
  ];

  const notices = [
    { title: 'Notice: October/November Final Examination Timetable Published', by: 'By - myAdmin Examinations' },
    { title: 'CS204 Assignment 2 Submission Deadline: 2 October 2026', by: 'By - Dr. Elena Vasquez' },
    { title: 'Heritage Day: Campuses Closed 24 September, LMS Remains Open', by: 'By - UNISA Registrar' },
  ];

  return (
    <div className="flex-1 flex min-w-0 overflow-hidden bg-[#F5F5F5] font-sans antialiased text-[#333333]">
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 space-y-6 pb-24">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <button
              onClick={onToggleMobileMenu}
              className="md:hidden p-1.5 mt-0.5 rounded-lg text-[#333333] hover:bg-[#F0F0F0] border border-[#E0E0E0]"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#333333] tracking-tight">Dashboard</h1>
              <p className="text-xs text-[#666666] mt-0.5">
                {userProfile.degree || CURRENT_STUDENT.degree} · {userProfile.semester || CURRENT_STUDENT.semester}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={onOpenSalulu}
              className="bg-[#F97316] hover:bg-[#EA580C] text-white px-3.5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs hover:shadow-md cursor-pointer"
              title="Open Solulu Elevate AI Assistant"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Solulu Elevate AI</span>
            </button>

            <button
              onClick={onOpenPopiModal}
              className="bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA] px-3.5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Review or update POPI Act data access consent"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">POPI Consent</span>
            </button>

            <button
              onClick={() => onNavigate('gmail')}
              className="bg-[#DC2626] hover:bg-[#B91C1C] text-white px-3.5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs hover:shadow-md cursor-pointer"
              title="Open student demo Gmail"
            >
              <Mail className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Demo Gmail</span>
            </button>

            <button
              onClick={onLogout}
              className="bg-[#333333] hover:bg-[#222222] text-white px-3.5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs hover:shadow-md cursor-pointer"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>

            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search modules, assessments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && runSearch()}
                className="w-44 sm:w-56 pl-3.5 pr-10 py-1.5 bg-white rounded-full border border-[#CCCCCC] text-xs text-gray-800 placeholder-gray-400 shadow-2xs focus:outline-none focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626]"
              />
              <button
                onClick={runSearch}
                className="w-7 h-7 rounded-full bg-[#DC2626] hover:bg-[#B91C1C] text-white flex items-center justify-center absolute right-1 transition-colors shadow-xs"
                aria-label="Search"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className={`${card.bg} rounded-2xl p-5 border flex flex-col items-center text-center shadow-xs transition-transform hover:-translate-y-0.5`}
              >
                <div className={`w-12 h-12 rounded-2xl ${card.chip} flex items-center justify-center text-white shadow-md mb-3 rotate-45 transform`}>
                  <Icon className="w-6 h-6 -rotate-45" />
                </div>
                <span className="text-xs font-semibold text-gray-600 mt-1">{card.label}</span>
                <span className="text-2xl font-black text-gray-900 mt-1 tracking-tight">{card.value}</span>
              </div>
            );
          })}
        </div>

        {/* Statistics bar chart + progress donut */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          <div className="lg:col-span-7 h-full">
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm flex flex-col justify-between h-full">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-2">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-800 tracking-tight">My Statistics</h2>
                  <p className="text-[11px] text-gray-400 mt-0.5">Your marks compared with the class by assessment</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex bg-gray-100 rounded-lg p-0.5 text-[11px] font-semibold text-gray-600">
                    {(['mine', 'class'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setMetricMode(mode)}
                        className={`px-2 py-1 rounded-md transition-all ${
                          metricMode === mode ? 'bg-white text-gray-900 shadow-xs font-bold' : 'hover:text-gray-900'
                        }`}
                      >
                        {mode === 'mine' ? 'My Score %' : 'Class Avg %'}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <select
                      value={chartFilter}
                      onChange={(e) => setChartFilter(e.target.value as typeof chartFilter)}
                      className="appearance-none bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2] text-xs font-bold px-3 py-1.5 pr-7 rounded-lg border border-[#FECACA] cursor-pointer focus:outline-none transition-colors"
                    >
                      <option value="All">All Types</option>
                      <option value="Assignments">Assignments</option>
                      <option value="Quizzes">Quizzes & Tests</option>
                      <option value="Labs">Lab Practicals</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#DC2626] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="relative flex-1 min-h-[220px] flex pt-2 pb-1">
                <div className="flex flex-col justify-between text-right pr-3 shrink-0 text-[11px] font-medium text-gray-400 select-none pb-8 h-[200px]">
                  {yTicks.map((tick) => (
                    <div key={tick} className="leading-none flex items-center justify-end h-4">
                      <span>{tick}%</span>
                    </div>
                  ))}
                </div>

                <div className="relative flex-1 flex flex-col justify-between">
                  <div className="absolute inset-x-0 top-0 h-[200px] flex flex-col justify-between pointer-events-none z-0">
                    {yTicks.map((tick) => (
                      <div
                        key={tick}
                        className={`w-full border-b ${tick === 0 ? 'border-gray-200' : 'border-dashed border-gray-100'}`}
                      />
                    ))}
                  </div>

                  <div className="relative z-10 h-[200px] flex items-end justify-around px-2 sm:px-4">
                    {chartData.map((item) => {
                      const val = metricMode === 'mine' ? item.myScore ?? 0 : item.classAverage;
                      const isHovered = hoveredId === item.id;
                      return (
                        <div
                          key={item.id}
                          className="flex-1 flex flex-col items-center justify-end h-full group px-1 sm:px-2 cursor-pointer"
                          onMouseEnter={() => setHoveredId(item.id)}
                          onMouseLeave={() => setHoveredId(null)}
                          onClick={() =>
                            onShowToast(`${item.name}: you ${item.myScore ?? '–'}% · class ${item.classAverage}%`)
                          }
                        >
                          {isHovered && (
                            <div className="absolute top-2 z-30 bg-gray-900 text-white text-[11px] rounded-lg px-2.5 py-1.5 shadow-xl pointer-events-none flex flex-col items-center">
                              <span className="font-bold">{item.name}</span>
                              <span className="text-gray-300">
                                You: <strong className="text-amber-400">{item.myScore ?? '–'}%</strong> · Class:{' '}
                                <strong className="text-amber-400">{item.classAverage}%</strong>
                              </span>
                              <div className="w-2 h-2 bg-gray-900 rotate-45 -mb-1 mt-0.5" />
                            </div>
                          )}
                          <span
                            className={`text-[10px] font-bold mb-1.5 transition-all ${
                              item.highlighted
                                ? 'text-[#DC2626] font-extrabold scale-105'
                                : isHovered
                                ? 'text-gray-800'
                                : 'text-gray-400'
                            }`}
                          >
                            {val}%
                          </span>
                          <div className="w-8 sm:w-10 md:w-12 max-w-[48px] bg-gray-100 rounded-t-lg relative overflow-hidden transition-all duration-300 h-full flex items-end">
                            <div
                              className={`w-full rounded-t-lg transition-all duration-700 ease-out ${
                                item.highlighted
                                  ? 'bg-gradient-to-t from-[#DC2626] to-[#F97316] shadow-md shadow-red-200'
                                  : isHovered
                                  ? 'bg-blue-300'
                                  : 'bg-blue-100'
                              }`}
                              style={{ height: `${val}%` }}
                            >
                              <div className="h-1.5 w-full bg-white/30 rounded-t-lg" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-around px-2 sm:px-4 pt-3 border-t border-gray-200 text-center">
                    {chartData.map((item) => (
                      <div key={item.id} className="flex-1 px-0.5 text-center">
                        <span
                          className={`block text-[11px] sm:text-xs font-semibold truncate ${
                            item.highlighted ? 'text-[#DC2626] font-bold' : 'text-gray-500'
                          }`}
                          title={item.name}
                        >
                          {item.shortLabel}
                        </span>
                        <span className="hidden sm:block text-[9px] uppercase tracking-wider text-gray-400">
                          {item.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-gradient-to-r from-[#DC2626] to-[#F97316]" />
                    <strong className="text-gray-600 font-medium">Needs attention</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-blue-100" />
                    <span className="text-gray-500">Other assessments</span>
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 italic hidden sm:inline">
                  Y-Axis: Percentage (%) · X-Axis: Assessment
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 h-full">
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm flex flex-col justify-between h-full">
              <div className="flex items-center justify-between gap-2 pb-2">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-800 tracking-tight flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-[#DC2626]" />
                    <span>{donutMode === 'progress' ? 'Semester Progress' : 'My Attendance'}</span>
                  </h2>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {donutMode === 'progress'
                      ? 'Average syllabus completed across your modules'
                      : 'Average class attendance across your modules'}
                  </p>
                </div>
                <div className="flex bg-gray-100 rounded-lg p-0.5 text-[11px] font-semibold text-gray-600 shrink-0">
                  {(['progress', 'attendance'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setDonutMode(mode)}
                      className={`px-2 py-1 rounded-md transition-all ${
                        donutMode === mode ? 'bg-white text-[#DC2626] shadow-xs font-bold' : 'hover:text-gray-900'
                      }`}
                    >
                      {mode === 'progress' ? 'Progress' : 'Attendance'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center justify-center my-auto py-2">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r={radius} fill="transparent" stroke="#EBF3FF" strokeWidth={20} />
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      fill="transparent"
                      stroke={donutMode === 'progress' ? '#DC2626' : '#F97316'}
                      strokeWidth={20}
                      strokeDasharray={circumference}
                      strokeDashoffset={donutOffset}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span
                      className={`text-3xl font-extrabold tracking-tight ${
                        donutMode === 'progress' ? 'text-[#DC2626]' : 'text-[#F97316]'
                      }`}
                    >
                      {donutValue}%
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                      {donutMode === 'progress' ? 'Completed' : 'Present'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-6 mt-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${donutMode === 'progress' ? 'bg-[#DC2626]' : 'bg-[#F97316]'}`} />
                    <span className="text-gray-700 font-medium">
                      {donutMode === 'progress' ? `Completed (${donutValue}%)` : `Present (${donutValue}%)`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#EBF3FF]" />
                    <span className="text-gray-500 font-medium">
                      {donutMode === 'progress' ? `Remaining (${100 - donutValue}%)` : `Absent (${100 - donutValue}%)`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <div className="text-[11px] text-gray-500">
                  <strong className="text-emerald-600">On track</strong> · UNISA target 80% attendance
                </div>
                <button
                  onClick={() => onNavigate('progress')}
                  className="text-[11px] font-bold text-[#333333] hover:text-[#DC2626] underline underline-offset-2"
                >
                  View Progress
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Today's lab banner */}
        <div className="bg-[#333333] text-white rounded-2xl p-5 sm:p-6 border-l-4 border-[#F97316] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-extrabold text-[#F97316] uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Today · 16:00 to 18:00 SAST</span>
            </span>
            <h3 className="text-lg font-bold text-white mt-1">Trees Lab Practical & AVL Rotations Prep</h3>
            <p className="text-xs text-[#CCCCCC] mt-0.5">
              CS204: Data Structures · Room C1.08 (Science Campus) · Dr. Elena Vasquez
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenWorksheet}
              className="bg-[#F97316] hover:bg-[#EA580C] text-white px-4 py-2.5 rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Trees Lab Worksheet</span>
            </button>
            <button
              onClick={onOpenLesson}
              className="bg-white/10 hover:bg-white/20 text-white px-3.5 py-2.5 rounded-lg text-xs font-bold transition-colors border border-white/20"
            >
              Review Lesson
            </button>
          </div>
        </div>

        {/* My modules */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">My Modules</h2>
              <p className="text-xs text-gray-400">Semester 1 enrolment, progress and current averages</p>
            </div>
            <button
              onClick={() => onNavigate('modules')}
              className="text-xs font-bold text-[#DC2626] hover:underline flex items-center gap-0.5"
            >
              <span>View all</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {STUDENT_MODULES.map((m) => (
              <div
                key={m.code}
                onClick={() => onSelectModule(m.code)}
                className="p-5 rounded-xl border border-gray-100 hover:border-[#DC2626]/30 transition-all bg-gray-50/50 hover:bg-white hover:shadow-md cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-xs font-black px-2 py-0.5 rounded text-white"
                    style={{ backgroundColor: m.themeColor }}
                  >
                    {m.code}
                  </span>
                  <span className="text-[11px] font-bold text-gray-500">
                    Week {m.currentWeek} of {m.totalWeeks}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-gray-900 leading-snug">{m.name}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{m.instructor}</p>
                <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-gray-500">
                  <span>Syllabus progress</span>
                  <span style={{ color: m.themeColor }}>{m.progressPct}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                  <div className="h-full rounded-full" style={{ width: `${m.progressPct}%`, backgroundColor: m.themeColor }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assessments table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-2 border-b border-gray-100">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">My Assessments</h2>
              <p className="text-xs text-gray-400">Continuous assessment marks, submissions and deadlines</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              {([
                ['all', 'All'],
                ['marked', 'Marked'],
                ['pending', 'Pending'],
              ] as const).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setTableTab(id)}
                  className={`transition-colors pb-1 ${
                    tableTab === id
                      ? 'text-[#DC2626] font-bold border-b-2 border-[#DC2626]'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead>
                <tr className="text-gray-400 font-semibold border-b border-gray-100">
                  <th className="pb-3 font-semibold">Assessment</th>
                  <th className="pb-3 font-semibold">Module</th>
                  <th className="pb-3 font-semibold">Score</th>
                  <th className="pb-3 font-semibold">Submitted / Due</th>
                  <th className="pb-3 font-semibold">Grade</th>
                  <th className="pb-3 font-semibold text-center">Pass/Fail</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tableRows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-gray-400">
                      No assessments match your filters.
                    </td>
                  </tr>
                )}
                {tableRows.map((item) => {
                  const pending = item.date.indexOf('Due') === 0;
                  const score = item.myScore ?? 0;
                  const grade = gradeFor(score);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 font-bold text-gray-800">{item.name}</td>
                      <td className="py-3 font-mono text-gray-500">{item.moduleCode}</td>
                      <td className="py-3 font-semibold text-gray-600">{pending ? '–' : `${score}/100`}</td>
                      <td className="py-3 text-gray-500 font-medium">{item.date}</td>
                      <td className="py-3">
                        {pending ? (
                          <span className="text-gray-400">–</span>
                        ) : (
                          <span
                            className={`font-semibold ${
                              grade === 'Excellent'
                                ? 'text-green-600'
                                : grade === 'Good' || grade === 'Average'
                                ? 'text-blue-600'
                                : 'text-amber-600'
                            }`}
                          >
                            {grade}
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            pending
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : score >= 50
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {pending ? 'Pending' : score >= 50 ? 'Pass' : 'Fail'}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => onSelectModule(item.moduleCode)}
                          className="text-[#DC2626] hover:text-[#B91C1C] font-bold text-[11px] p-1"
                        >
                          Open
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Right panel */}
      <aside className="w-72 lg:w-80 bg-white border-l border-gray-100 p-5 overflow-y-auto space-y-6 hidden xl:block shrink-0 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#DC2626] text-white flex items-center justify-center font-bold text-xs shrink-0 border-2 border-[#F97316]">
              {initials}
            </div>
            <div className="truncate">
              <span className="text-xs font-bold text-gray-800 block truncate leading-tight">{userProfile.name}</span>
              <span className="text-[10px] text-[#DC2626] font-semibold block truncate">
                Student · {userProfile.studentNumber}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onShowToast('Trees Lab starts at 16:00 SAST today in Room C1.08. WhatsApp reminder sent.')}
              className="w-7 h-7 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 flex items-center justify-center relative transition-colors"
              title="Notifications"
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

        <div className="bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <button onClick={prevMonth} className="text-gray-400 hover:text-gray-700 p-1 rounded-md hover:bg-white transition-colors" title="Previous Month">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-center">
              <span className="text-xs font-bold text-gray-800">
                {MONTH_NAMES[calMonth]} {calYear}
              </span>
              {calYear === 2026 && calMonth === 8 && (
                <span className="ml-1.5 text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 rounded-full">
                  Live
                </span>
              )}
            </div>
            <button onClick={nextMonth} className="text-gray-400 hover:text-gray-700 p-1 rounded-md hover:bg-white transition-colors" title="Next Month">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 text-center text-[10px] font-semibold text-gray-400 mb-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 text-center text-xs gap-y-1 font-medium text-gray-700">
            {Array.from({ length: firstDayCalIndex }).map((_, idx) => (
              <span key={`empty-${idx}`} className="text-gray-200 text-[10px]">·</span>
            ))}
            {Array.from({ length: daysInCalMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateString = `${calYear}-${padTwo(calMonth + 1)}-${padTwo(dayNum)}`;
              const isToday = dateString === TODAY;
              const isSelected = selectedCalDate === dateString;
              const hasEvents = UNISA_CALENDAR_EVENTS.some((ev) => ev.date === dateString);
              return (
                <button
                  key={dateString}
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
                  {hasEvents && !isToday && <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-[#F97316]" />}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200/60 text-[11px]">
            <button onClick={jumpToToday} className="text-gray-500 hover:text-gray-800 font-semibold cursor-pointer">
              Today (22 Sep)
            </button>
            <button
              onClick={() => onNavigate('calendar')}
              className="text-[#DC2626] hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
            >
              <span>Full Calendar</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="p-2 rounded-xl bg-amber-50/60 border border-amber-100 text-center">
              <span className="text-base">🧪</span>
              <p className="text-[11px] font-bold text-gray-800 mt-0.5 truncate">CS204 Trees Lab</p>
              <p className="text-[9px] text-gray-500">16:00 - 18:00</p>
            </div>
            <div className="p-2 rounded-xl bg-blue-50/60 border border-blue-100 text-center">
              <span className="text-base">📐</span>
              <p className="text-[11px] font-bold text-gray-800 mt-0.5 truncate">MATH202 Tutorial</p>
              <p className="text-[9px] text-gray-500">10:00 - 12:00</p>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3 flex items-center justify-between">
            <span>Notice Board</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#F97316]" />
          </h3>
          <div className="space-y-3">
            {notices.map((n) => (
              <div
                key={n.title}
                onClick={() => onShowToast(n.title)}
                className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100/80 transition-colors cursor-pointer border border-gray-100"
              >
                <p className="text-xs font-bold text-gray-800 leading-snug">{n.title}</p>
                <p className="text-[10px] text-gray-400 mt-1">{n.by}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
};
