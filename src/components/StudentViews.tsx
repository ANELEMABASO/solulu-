import React, { useState } from 'react';
import { BarGraphStats } from './BarGraphStats';
import {
  ModuleItem,
  ModuleTab,
  MessageThread,
} from '../types';
import {
  CURRENT_STUDENT,
  STUDENT_MODULES,
  STUDENT_OVERVIEW_BAR_STATS,
  INITIAL_THREADS,
  UNISA_CALENDAR_EVENTS,
} from '../data/unisaData';
import {
  BookOpen,
  Calendar,
  CalendarDays,
  Clock,
  MapPin,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  FileText,
  Video,
  Download,
  Send,
  Sparkles,
  ChevronRight,
  HelpCircle,
  GraduationCap,
} from 'lucide-react';

// ── 1. Student Overview Screen ─────────────────────────────────────────────────
export const StudentOverviewView: React.FC<{
  userProfile?: {
    name: string;
    studentNumber: string;
    email: string;
    degree: string;
    semester: string;
  };
  onSelectModule: (code: string) => void;
  onOpenSchedule: () => void;
  onOpenCalendar: () => void;
  onOpenLesson: () => void;
  onOpenWorksheet: () => void;
}> = ({
  userProfile = CURRENT_STUDENT,
  onSelectModule,
  onOpenSchedule,
  onOpenCalendar,
  onOpenLesson,
  onOpenWorksheet,
}) => {
  return (
    <div className="space-y-6">
      {/* Welcome Banner in Vibrant Red #DC2626 */}
      <div className="bg-[#DC2626] text-white rounded-xl p-6 sm:p-7 shadow-sm border border-[#B91C1C] relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs bg-[#F97316] text-white px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                {userProfile.semester || CURRENT_STUDENT.semester}
              </span>
              <span className="text-xs text-[#F5F5F5]/80 font-mono">
                Student No: {userProfile.studentNumber}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back, {userProfile.name} 👋
            </h2>
            <p className="text-xs sm:text-sm text-[#F5F5F5]/90 mt-1 max-w-xl">
              {userProfile.degree || CURRENT_STUDENT.degree} · College of Science, Engineering & Technology
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenCalendar}
              className="bg-white text-[#DC2626] hover:bg-[#F5F5F5] px-3.5 py-2 rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
            >
              <CalendarDays className="w-3.5 h-3.5 text-[#DC2626]" />
              <span>Full Calendar</span>
            </button>
            <button
              onClick={onOpenSchedule}
              className="bg-[#333333] text-white hover:bg-[#222222] px-3.5 py-2 rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 border border-white/20"
            >
              <Calendar className="w-3.5 h-3.5 text-[#F97316]" />
              <span>Timetable</span>
            </button>
          </div>
        </div>
      </div>

      {/* STUDENT PERFORMANCE IN CRISP BAR GRAPH FORMAT */}
      <BarGraphStats
        id="student-overview-bar-stats"
        title="Student Performance & Engagement Metrics"
        subtitle="Audited continuously via myUnisa submission telemetry & Salulu AI monitoring"
        stats={STUDENT_OVERVIEW_BAR_STATS}
      />

      {/* Today's Practical Lab Urgent Banner */}
      <div className="bg-[#333333] text-white rounded-xl p-5 sm:p-6 border-l-6 border-[#F97316] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-extrabold text-[#F97316] uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Today · 16:00 to 18:00 SAST</span>
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
            Trees Lab Practical & AVL Rotations Prep
          </h3>
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

      {/* Enrolled Modules Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#333333] uppercase tracking-wider">
            Enrolled Academic Modules (Semester 1)
          </h3>
          <span className="text-xs text-[#DC2626] font-bold">4 Active Modules</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {STUDENT_MODULES.map((m) => (
            <div
              key={m.code}
              onClick={() => onSelectModule(m.code)}
              className="bg-white rounded-xl p-5 border border-[#E0E0E0] hover:border-[#DC2626] hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-xs font-extrabold px-2.5 py-0.5 rounded text-white"
                    style={{ backgroundColor: m.themeColor }}
                  >
                    {m.code}
                  </span>
                  <span className="text-[11px] font-bold text-[#666666]">
                    Week {m.currentWeek} of {m.totalWeeks}
                  </span>
                </div>

                <h4 className="text-sm sm:text-base font-bold text-[#333333] group-hover:text-[#DC2626] transition-colors leading-snug">
                  {m.name}
                </h4>
                <p className="text-xs text-[#666666] mt-1">{m.instructor}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#F0F0F0]">
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-[#555555]">Syllabus Progress</span>
                  <span style={{ color: m.themeColor }}>{m.progressPct}%</span>
                </div>
                <div className="h-2 bg-[#F5F5F5] rounded-full overflow-hidden border border-[#EAEAEA]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${m.progressPct}%`, backgroundColor: m.themeColor }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming UNISA Calendar Dates Preview Widget */}
      <div className="bg-white rounded-xl p-6 border border-[#E0E0E0] shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0F0F0]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#DC2626]/10 text-[#DC2626] flex items-center justify-center font-bold">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#333333]">
                Upcoming Academic Calendar & Milestones
              </h3>
              <p className="text-xs text-[#666666]">
                Official submission deadlines, tutorials & laboratory sessions
              </p>
            </div>
          </div>

          <button
            onClick={onOpenCalendar}
            className="text-xs font-bold text-[#DC2626] hover:text-[#B91C1C] flex items-center gap-1 transition-colors"
          >
            <span>Open Interactive Calendar</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {UNISA_CALENDAR_EVENTS.filter((ev) => ev.status !== 'completed').slice(0, 4).map((ev) => (
            <div
              key={ev.id}
              onClick={onOpenCalendar}
              className="p-3.5 rounded-lg border border-[#EBEBEB] hover:border-[#DC2626] hover:shadow-xs transition-all cursor-pointer bg-[#FAFAFA] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#333333] text-white">
                    {ev.moduleCode}
                  </span>
                  <span className="text-[11px] font-bold text-[#F97316]">
                    {ev.date === '2026-09-21' ? 'Today' : ev.date.slice(5)}
                  </span>
                </div>
                <h5 className="text-xs font-bold text-[#333333] line-clamp-2 leading-snug">
                  {ev.title}
                </h5>
              </div>

              <div className="mt-3 pt-2 border-t border-[#EFEFEF] flex items-center justify-between text-[10px] text-[#666666]">
                <span className="truncate">{ev.time || 'All Day'}</span>
                <span className="text-[#DC2626] font-bold uppercase text-[9px]">{ev.type}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── 2. Student Modules Screen ──────────────────────────────────────────────────
export const StudentModulesView: React.FC<{
  onSelectModule: (code: string) => void;
}> = ({ onSelectModule }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 border border-[#E0E0E0] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#333333]">My Enrolled Modules</h2>
          <p className="text-xs text-[#666666] mt-0.5">
            Semester 1, 2026 · Curriculum tracking, lecture recordings & assignment portals
          </p>
        </div>
        <div className="text-xs font-bold text-[#DC2626] bg-[#FEF2F2] px-3 py-1.5 rounded-md border border-[#FECACA]">
          48 Total Credits Enrolled
        </div>
      </div>

      <div className="space-y-4">
        {STUDENT_MODULES.map((mod) => (
          <div
            key={mod.code}
            onClick={() => onSelectModule(mod.code)}
            className="bg-white rounded-xl p-6 border border-[#E0E0E0] hover:border-[#DC2626] hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-extrabold px-2.5 py-0.5 rounded text-white"
                    style={{ backgroundColor: mod.themeColor }}
                  >
                    {mod.code}
                  </span>
                  <span className="text-xs text-[#888888]">
                    12 SAQA Credits · UNISA Science Campus
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#333333] group-hover:text-[#DC2626] transition-colors">
                  {mod.name}
                </h3>
                <p className="text-xs text-[#666666] leading-relaxed max-w-2xl">
                  {mod.description}
                </p>
                <p className="text-xs font-bold text-[#DC2626]">
                  Lecturer: {mod.instructor}
                </p>
              </div>

              <div className="w-full md:w-56 bg-[#F5F5F5] rounded-lg p-3.5 border border-[#EAEAEA] shrink-0 space-y-2.5">
                <div>
                  <div className="flex justify-between text-xs font-bold text-[#333333]">
                    <span>Completion</span>
                    <span style={{ color: mod.themeColor }}>{mod.progressPct}%</span>
                  </div>
                  <div className="h-2 bg-[#E0E0E0] rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${mod.progressPct}%`, backgroundColor: mod.themeColor }}
                    />
                  </div>
                </div>

                <div className="flex justify-between text-xs text-[#555555]">
                  <span>Attendance:</span>
                  <span className="font-bold text-[#DC2626]">{mod.attendancePct}%</span>
                </div>

                <div className="flex justify-between text-xs text-[#555555]">
                  <span>Continuous Grade:</span>
                  <span className="font-bold text-[#F97316]">{mod.gradeAverage}%</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── 3. Student Module Detail Screen ────────────────────────────────────────────
export const StudentModuleDetailView: React.FC<{
  onBack: () => void;
  onOpenLesson: () => void;
  onOpenWorksheet: () => void;
  onOpenAssignment: () => void;
}> = ({ onBack, onOpenLesson, onOpenWorksheet, onOpenAssignment }) => {
  const [tab, setTab] = useState<ModuleTab>('overview');

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl p-6 border border-[#E0E0E0] shadow-sm">
        <button
          onClick={onBack}
          className="text-xs font-bold text-[#DC2626] hover:underline mb-2 flex items-center gap-1"
        >
          <span>← Back to all modules</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#DC2626] text-white text-xs font-bold px-2 py-0.5 rounded">
                CS204
              </span>
              <span className="text-xs text-[#666666]">Department of Computer Science</span>
            </div>
            <h2 className="text-2xl font-bold text-[#333333]">Data Structures & Algorithms</h2>
            <p className="text-xs text-[#666666] mt-0.5">
              Module Coordinator: Dr. Elena Vasquez · Week 7 of 12
            </p>
          </div>

          {/* Module Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {(['overview', 'learning', 'assignments', 'grades', 'resources'] as ModuleTab[]).map(
              (t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-md capitalize transition-colors ${
                    tab === t
                      ? 'bg-[#DC2626] text-white shadow-xs'
                      : 'bg-[#F5F5F5] text-[#333333] hover:bg-[#EAEAEA]'
                  }`}
                >
                  {t}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main 2 Cols */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Week 7 Active Unit */}
            <div className="bg-[#DC2626] text-white rounded-xl p-6 shadow-sm border border-[#B91C1C]">
              <span className="text-[11px] font-bold text-[#F97316] uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
                Week 7 Active Curricular Unit
              </span>
              <h3 className="text-xl font-bold text-white mt-2">
                Balanced Binary Search Trees (AVL Tree Rotations)
              </h3>
              <p className="text-xs text-white/95 mt-1.5 leading-relaxed">
                Study how single (LL, RR) and double (LR, RL) rotations maintain height balance
                at every node to bound search, insert, and delete operations strictly to O(log n).
              </p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                <button
                  onClick={onOpenLesson}
                  className="bg-[#F97316] hover:bg-[#EA580C] text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors"
                >
                  Start Week 7 Lesson Video →
                </button>
                <button
                  onClick={onOpenWorksheet}
                  className="bg-white/10 hover:bg-white/20 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition-colors border border-white/20"
                >
                  Fill Prep Worksheet
                </button>
              </div>
            </div>

            {/* Practical Worksheet Prep Item */}
            <div className="bg-white rounded-xl p-6 border border-[#E0E0E0] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-[#333333] uppercase tracking-wider">
                  Required Practical Worksheets
                </h4>
                <span className="text-[11px] font-bold text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded">
                  Lab Session Today @ 16:00
                </span>
              </div>

              <div className="bg-[#F5F5F5] rounded-lg p-4 border border-[#EAEAEA] flex items-center justify-between gap-4">
                <div>
                  <h5 className="font-bold text-xs sm:text-sm text-[#333333]">
                    Trees Lab Worksheet (Room C1.08 Practical)
                  </h5>
                  <p className="text-xs text-[#666666] mt-0.5">
                    Must be submitted prior to the 16:00 SAST practical. Salulu logs attendance automatically.
                  </p>
                </div>
                <button
                  onClick={onOpenWorksheet}
                  className="bg-[#DC2626] hover:bg-[#B91C1C] text-white px-3.5 py-2 rounded-lg text-xs font-bold shrink-0 transition-colors"
                >
                  Open Worksheet
                </button>
              </div>
            </div>

          </div>

          {/* Right Col */}
          <div className="space-y-6">
            
            {/* Upcoming Assessment Widget */}
            <div className="bg-white rounded-xl p-5 border border-[#E0E0E0] shadow-sm">
              <span className="text-[10px] font-bold text-[#F97316] uppercase tracking-wider">
                Upcoming Assessment
              </span>
              <h4 className="font-bold text-sm text-[#333333] mt-1">
                Algorithm Analysis Coursework
              </h4>
              <p className="text-xs text-[#666666] mt-0.5">
                Weight: 20% · Due: 2 October 2026, 23:59 SAST
              </p>

              <div className="mt-3 pt-3 border-t border-[#F0F0F0]">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-[#555555]">Your Progress</span>
                  <span className="text-[#DC2626]">35%</span>
                </div>
                <div className="h-2 bg-[#E0E0E0] rounded-full overflow-hidden">
                  <div className="h-full bg-[#F97316] rounded-full" style={{ width: '35%' }} />
                </div>
              </div>

              <button
                onClick={onOpenAssignment}
                className="w-full mt-4 bg-[#333333] hover:bg-[#222222] text-white py-2 rounded-lg text-xs font-bold transition-colors"
              >
                View Assessment Details →
              </button>
            </div>

            {/* Module Coordinator Card */}
            <div className="bg-white rounded-xl p-5 border border-[#E0E0E0] shadow-sm">
              <h4 className="font-bold text-xs text-[#333333] uppercase tracking-wider mb-2">
                Module Coordinator
              </h4>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#DC2626] text-white flex items-center justify-center font-bold text-xs border border-[#F97316]">
                  EV
                </div>
                <div>
                  <p className="text-xs font-bold text-[#333333]">Dr. Elena Vasquez</p>
                  <p className="text-[11px] text-[#666666]">evasquez@unisa.ac.za</p>
                  <p className="text-[10px] text-[#F97316] font-semibold">Consultation: Mon 14:00 - 16:00</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {tab !== 'overview' && (
        <div className="bg-white rounded-xl p-8 border border-[#E0E0E0] shadow-sm text-center">
          <BookOpen className="w-8 h-8 text-[#DC2626] mx-auto mb-2" />
          <h3 className="text-base font-bold text-[#333333] capitalize">{tab} Section</h3>
          <p className="text-xs text-[#666666] max-w-md mx-auto mt-1">
            Accessing UNISA myModules {tab} resources for CS204. All materials synchronized with
            the Salulu AI study agent.
          </p>
        </div>
      )}
    </div>
  );
};

// ── 4. Student Timetable Screen ────────────────────────────────────────────────
export const StudentScheduleView: React.FC<{
  onOpenWorksheet: () => void;
  onOpenCalendar?: () => void;
}> = ({ onOpenWorksheet, onOpenCalendar }) => {
  const schedule = [
    {
      day: 'Monday',
      time: '16:00 - 18:00',
      module: 'CS204',
      name: 'Practical Trees Lab (AVL Rotations)',
      venue: 'Room C1.08, Science Campus',
      lecturer: 'Dr. Elena Vasquez',
      isToday: true,
    },
    {
      day: 'Tuesday',
      time: '10:00 - 12:00',
      module: 'MATH202',
      name: 'Discrete Mathematics Live Tutorial',
      venue: 'Virtual Teams Lecture Room A',
      lecturer: 'Dr. Amir Hassan',
      isToday: false,
    },
    {
      day: 'Wednesday',
      time: '14:00 - 16:00',
      module: 'CS201',
      name: 'OOP Java Lab Practical',
      venue: 'Lab Block B, Floor 2',
      lecturer: 'Dr. James Park',
      isToday: false,
    },
    {
      day: 'Thursday',
      time: '11:00 - 13:00',
      module: 'CS210',
      name: 'Computer Architecture Review',
      venue: 'Room C2.14, Science Campus',
      lecturer: 'Prof. Sarah Mills',
      isToday: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 border border-[#E0E0E0] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#333333]">UNISA Academic Timetable</h2>
          <p className="text-xs text-[#666666] mt-0.5">
            Weekly synchronous lectures, laboratory practicals & consultation sessions
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {onOpenCalendar && (
            <button
              onClick={onOpenCalendar}
              className="bg-white hover:bg-[#F5F5F5] text-[#DC2626] border border-[#DC2626] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <CalendarDays className="w-3.5 h-3.5 text-[#DC2626]" />
              <span>Full Semester Calendar</span>
            </button>
          )}
          <span className="text-xs font-bold text-[#16A34A] bg-[#DCFCE7] px-3 py-1.5 rounded-md border border-[#BBF7D0]">
            Salulu WhatsApp Reminders Enabled
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {schedule.map((item, idx) => (
          <div
            key={idx}
            className={`p-5 rounded-xl border transition-all ${
              item.isToday
                ? 'bg-white border-[#DC2626] shadow-md ring-2 ring-[#DC2626]/10'
                : 'bg-white border-[#E0E0E0]'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center font-bold shrink-0 ${
                    item.isToday
                      ? 'bg-[#DC2626] text-white'
                      : 'bg-[#F5F5F5] text-[#333333] border border-[#E0E0E0]'
                  }`}
                >
                  <span className="text-[10px] uppercase">{item.day.slice(0, 3)}</span>
                  <span className="text-xs">{item.module}</span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#333333]">{item.name}</span>
                    {item.isToday && (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.2 rounded-full bg-[#F97316] text-white">
                        Active Today
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#666666] mt-0.5 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-[#DC2626]" />
                    <span>{item.venue}</span>
                    <span>•</span>
                    <span>{item.lecturer}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-[#DC2626] bg-[#FEF2F2] px-2.5 py-1 rounded">
                  {item.time}
                </span>
                {item.isToday && (
                  <button
                    onClick={onOpenWorksheet}
                    className="bg-[#F97316] hover:bg-[#EA580C] text-white px-3 py-1.5 rounded-md text-xs font-bold transition-colors"
                  >
                    Lab Worksheet
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── 5. Student Progress & Bar Graph Screen ────────────────────────────────────
export const StudentProgressView: React.FC = () => {
  const moduleGradeStats = [
    { label: 'CS204 Data Structures & Algorithms', value: 84, display: '84% (Distinction)', color: '#DC2626', benchmark: 'Cohort Avg: 68%' },
    { label: 'CS201 Object-Oriented Programming', value: 78, display: '78% (Merit)', color: '#F97316', benchmark: 'Cohort Avg: 71%' },
    { label: 'MATH202 Discrete Mathematics', value: 82, display: '82% (Distinction)', color: '#333333', benchmark: 'Cohort Avg: 65%' },
    { label: 'CS210 Computer Architecture', value: 71, display: '71% (Pass)', color: '#DC2626', benchmark: 'Cohort Avg: 62%' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 border border-[#E0E0E0] shadow-sm">
        <h2 className="text-xl font-bold text-[#333333]">Academic Progress & Assessment Breakdown</h2>
        <p className="text-xs text-[#666666] mt-0.5">
          Cumulative continuous evaluation marks generated from submitted assignments, tests, and lab participation
        </p>
      </div>

      <BarGraphStats
        id="module-grades-bar-chart"
        title="Module Performance & Examination Eligibility"
        subtitle="Benchmark relative to Department of Computing distinction threshold (75%)"
        stats={moduleGradeStats}
      />
    </div>
  );
};

// ── 6. Student Messages Screen ─────────────────────────────────────────────────
export const StudentMessagesView: React.FC<{
  onOpenSalulu: () => void;
  onOpenGmail?: () => void;
}> = ({ onOpenSalulu, onOpenGmail }) => {
  const [threads] = useState<MessageThread[]>(INITIAL_THREADS);
  const [selectedThreadId, setSelectedThreadId] = useState(INITIAL_THREADS[0].id);

  const activeThread = threads.find((t) => t.id === selectedThreadId) || threads[0];

  return (
    <div className="bg-white rounded-xl border border-[#E0E0E0] shadow-sm overflow-hidden flex flex-col md:flex-row h-[560px]">
      {/* Thread list */}
      <div className="w-full md:w-80 border-r border-[#EAEAEA] bg-[#F5F5F5] flex flex-col">
        <div className="p-3.5 border-b border-[#EAEAEA] font-bold text-xs text-[#333333] uppercase tracking-wider flex items-center justify-between">
          <span>UNISA Communications</span>
          {onOpenGmail && (
            <button
              onClick={onOpenGmail}
              className="text-[10px] text-emerald-800 bg-[#E8F5E9] hover:bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded font-bold transition-colors cursor-pointer"
              title="Open Demo Gmail with Model Context Protocol"
            >
              Gmail MCP →
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-[#EAEAEA]">
          {threads.map((thread) => {
            const isSelected = thread.id === selectedThreadId;
            return (
              <button
                key={thread.id}
                onClick={() => setSelectedThreadId(thread.id)}
                className={`w-full p-4 text-left flex items-start gap-3 transition-colors ${
                  isSelected ? 'bg-white border-l-4 border-[#DC2626]' : 'hover:bg-[#EAEAEA]'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    thread.isSalulu ? 'bg-[#F97316] text-white' : 'bg-[#DC2626] text-white'
                  }`}
                >
                  {thread.avatarText}
                </div>
                <div className="truncate flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-[#333333] truncate">
                      {thread.participantName}
                    </p>
                    <span className="text-[10px] text-[#888888]">{thread.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-[#666666] truncate mt-0.5">{thread.lastMessage}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Thread conversation */}
      <div className="flex-1 flex flex-col bg-white">
        <div className="p-4 border-b border-[#EAEAEA] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                activeThread.isSalulu ? 'bg-[#F97316]' : 'bg-[#DC2626]'
              }`}
            >
              {activeThread.avatarText}
            </div>
            <div>
              <p className="text-xs font-bold text-[#333333]">{activeThread.participantName}</p>
              <p className="text-[10px] text-[#888888]">{activeThread.roleDescription}</p>
            </div>
          </div>

          {activeThread.isSalulu && (
            <button
              onClick={onOpenSalulu}
              className="text-xs font-bold text-[#DC2626] bg-[#FEF2F2] px-3 py-1 rounded-md border border-[#FECACA]"
            >
              Open Full Salulu Assistant →
            </button>
          )}
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAFAFA]">
          {activeThread.messages.map((msg) => {
            const isUser = msg.sender === 'student';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg text-xs leading-relaxed ${
                    isUser
                      ? 'bg-[#DC2626] text-white rounded-tr-none'
                      : 'bg-white border border-[#E0E0E0] text-[#333333] rounded-tl-none shadow-xs'
                  }`}
                >
                  <p>{msg.text}</p>
                  {msg.badge && (
                    <span className="inline-block mt-2 text-[10px] bg-black/10 px-2 py-0.5 rounded font-semibold">
                      {msg.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-[#888888] mt-1">{msg.time}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
