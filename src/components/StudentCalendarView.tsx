import React, { useState } from 'react';
import { AcademicCalendarEvent, CalendarEventType } from '../types';
import { UNISA_CALENDAR_EVENTS, STUDENT_MODULES } from '../data/unisaData';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Sparkles,
  BookOpen,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileText,
  CalendarCheck,
  Tag,
  Info,
} from 'lucide-react';

interface StudentCalendarViewProps {
  onOpenWorksheet?: () => void;
  onOpenLesson?: () => void;
  onOpenAssignment?: () => void;
}

export const StudentCalendarView: React.FC<StudentCalendarViewProps> = ({
  onOpenWorksheet,
  onOpenLesson,
  onOpenAssignment,
}) => {
  // Calendar view modes: 'month' or 'agenda'
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');

  // Year and Month state (Current: Sept 2026)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(8); // 8 = September (0-indexed)

  // Filters
  const [selectedModuleFilter, setSelectedModuleFilter] = useState<string>('ALL');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');

  // Selected date for day drilldown
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-21');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleToday = () => {
    setCurrentYear(2026);
    setCurrentMonth(8);
    setSelectedDate('2026-09-21');
  };

  // Helper: days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  // Helper: pad 2 digits
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  // Filtered events
  const filteredEvents = UNISA_CALENDAR_EVENTS.filter((ev) => {
    const matchModule = selectedModuleFilter === 'ALL' || ev.moduleCode === selectedModuleFilter || ev.moduleCode === 'ALL';
    const matchType = selectedTypeFilter === 'ALL' || ev.type === selectedTypeFilter;
    return matchModule && matchType;
  });

  // Events on selected day
  const selectedDayEvents = filteredEvents.filter((ev) => ev.date === selectedDate);

  // Helper badge color with vibrant red (#DC2626) and lighter orange (#F97316)
  const getBadgeStyle = (type: CalendarEventType) => {
    switch (type) {
      case 'lab':
        return { bg: 'bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/30', dot: 'bg-[#DC2626]', label: 'Practical Lab' };
      case 'assignment':
        return { bg: 'bg-[#F97316]/10 text-[#F97316] border-[#F97316]/30', dot: 'bg-[#F97316]', label: 'Assignment Due' };
      case 'exam':
        return { bg: 'bg-[#EF4444]/15 text-[#DC2626] border-[#EF4444]/30', dot: 'bg-[#DC2626]', label: 'Assessment / Exam' };
      case 'tutorial':
        return { bg: 'bg-[#0284C7]/10 text-[#0284C7] border-[#0284C7]/30', dot: 'bg-[#0284C7]', label: 'Online Tutorial' };
      case 'holiday':
        return { bg: 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/30', dot: 'bg-[#16A34A]', label: 'University Holiday' };
      case 'lecture':
      default:
        return { bg: 'bg-[#4B5563]/10 text-[#374151] border-[#9CA3AF]/30', dot: 'bg-[#4B5563]', label: 'Lecture' };
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header Banner ── */}
      <div className="bg-white rounded-xl p-6 border border-[#E0E0E0] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-[#DC2626] text-white">
              myUNISA Calendar
            </span>
            <span className="text-xs text-[#666666]">Official Academic Year 2026</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#333333] mt-1">
            Academic Schedule, Deadlines & Practical Sessions
          </h2>
          <p className="text-xs text-[#666666] mt-0.5">
            Synchronized in real-time with myModules LMS, The Invigilator exam services, and Salulu attendance agents.
          </p>
        </div>

        {/* View Switcher & Quick Navigation */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleToday}
            className="px-3 py-2 rounded-lg text-xs font-bold border border-[#E0E0E0] bg-white text-[#333333] hover:bg-[#F5F5F5] transition-colors"
          >
            Today (21 Sep)
          </button>

          <div className="bg-[#F5F5F5] p-1 rounded-lg border border-[#E0E0E0] flex items-center">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                viewMode === 'month'
                  ? 'bg-[#DC2626] text-white shadow-xs'
                  : 'text-[#666666] hover:text-[#333333]'
              }`}
            >
              Month View
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                viewMode === 'agenda'
                  ? 'bg-[#DC2626] text-white shadow-xs'
                  : 'text-[#666666] hover:text-[#333333]'
              }`}
            >
              Agenda List
            </button>
          </div>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="bg-white rounded-xl p-4 border border-[#E0E0E0] shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-[#333333]">
            <Filter className="w-3.5 h-3.5 text-[#DC2626]" />
            <span>Filter Module:</span>
          </div>

          <select
            value={selectedModuleFilter}
            onChange={(e) => setSelectedModuleFilter(e.target.value)}
            className="border border-[#D0D0D0] rounded-lg px-2.5 py-1.5 bg-[#FAFAFA] text-[#333333] font-semibold focus:outline-none focus:border-[#DC2626]"
          >
            <option value="ALL">All Enrolled Modules</option>
            {STUDENT_MODULES.map((m) => (
              <option key={m.code} value={m.code}>
                {m.code} - {m.name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1.5 font-bold text-[#333333] ml-2">
            <Tag className="w-3.5 h-3.5 text-[#F97316]" />
            <span>Event Type:</span>
          </div>

          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="border border-[#D0D0D0] rounded-lg px-2.5 py-1.5 bg-[#FAFAFA] text-[#333333] font-semibold focus:outline-none focus:border-[#DC2626]"
          >
            <option value="ALL">All Event Types</option>
            <option value="lab">Practical Labs</option>
            <option value="assignment">Assignments & Milestones</option>
            <option value="exam">Tests & Examinations</option>
            <option value="lecture">Lectures & Reviews</option>
            <option value="tutorial">Tutorials</option>
            <option value="holiday">Public Holidays</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[#666666]">
          <span className="w-2 h-2 rounded-full bg-[#25D366] agent-pulse" />
          <span>Salulu SMS & WhatsApp reminders active for upcoming events</span>
        </div>
      </div>

      {/* ── Main Layout: Calendar Grid & Day Details ── */}
      {viewMode === 'month' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Month Interactive Grid (2 columns on lg) */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-[#E0E0E0] shadow-sm">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-[#333333]">
                  {monthNames[currentMonth]} {currentYear}
                </h3>
                <span className="text-[11px] font-bold text-[#DC2626] bg-[#FEF2F2] px-2.5 py-0.5 rounded-full border border-[#FECACA]">
                  Semester 1
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevMonth}
                  aria-label="Previous Month"
                  className="p-1.5 rounded-lg border border-[#E0E0E0] hover:bg-[#F5F5F5] text-[#333333] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextMonth}
                  aria-label="Next Month"
                  className="p-1.5 rounded-lg border border-[#E0E0E0] hover:bg-[#F5F5F5] text-[#333333] transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-[#666666] mb-2 py-1.5 border-b border-[#F0F0F0]">
              {daysOfWeek.map((day) => (
                <div key={day} className="uppercase tracking-wider text-[11px]">
                  {day}
                </div>
              ))}
            </div>

            {/* Grid of Days */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty leading days */}
              {Array.from({ length: firstDayIndex }).map((_, idx) => (
                <div key={`empty-${idx}`} className="h-20 sm:h-24 p-1.5 bg-[#FAFAFA] rounded-lg opacity-40" />
              ))}

              {/* Month Days */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const dateStr = `${currentYear}-${pad(currentMonth + 1)}-${pad(dayNum)}`;
                const isToday = dateStr === '2026-09-21';
                const isSelected = dateStr === selectedDate;
                const dayEvents = filteredEvents.filter((ev) => ev.date === dateStr);

                return (
                  <div
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`h-20 sm:h-24 p-1.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between group ${
                      isSelected
                        ? 'border-[#DC2626] bg-[#FEF2F2] ring-2 ring-[#DC2626]/20 shadow-xs'
                        : isToday
                        ? 'border-[#F97316] bg-[#FFF7ED]'
                        : 'border-[#EFEFEF] bg-white hover:border-[#D0D0D0] hover:bg-[#FAFAFA]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                          isToday
                            ? 'bg-[#F97316] text-white'
                            : isSelected
                            ? 'bg-[#DC2626] text-white'
                            : 'text-[#333333]'
                        }`}
                      >
                        {dayNum}
                      </span>

                      {dayEvents.length > 0 && (
                        <span className="text-[10px] font-bold text-[#DC2626] bg-[#DC2626]/10 px-1 rounded">
                          {dayEvents.length}
                        </span>
                      )}
                    </div>

                    {/* Small Event Pills inside Day Cell */}
                    <div className="space-y-1 overflow-hidden mt-1">
                      {dayEvents.slice(0, 2).map((ev) => {
                        const style = getBadgeStyle(ev.type);
                        return (
                          <div
                            key={ev.id}
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded truncate border ${style.bg}`}
                            title={`${ev.moduleCode}: ${ev.title}`}
                          >
                            <span className="font-extrabold mr-1">{ev.moduleCode}</span>
                            <span>{ev.title}</span>
                          </div>
                        );
                      })}
                      {dayEvents.length > 2 && (
                        <div className="text-[9px] text-[#666666] font-semibold text-center">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-5 pt-4 border-t border-[#F0F0F0] flex flex-wrap items-center gap-4 text-xs text-[#555555]">
              <span className="font-bold text-[#333333]">Event Types:</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" />
                <span>Practical Lab</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" />
                <span>Assignment Due</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                <span>Assessment / Exam</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7]" />
                <span>Tutorial</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
                <span>University Holiday</span>
              </div>
            </div>
          </div>

          {/* Right Column: Selected Date Drilldown & Actions */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-5 border border-[#E0E0E0] shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0F0F0]">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#DC2626]">
                    Selected Day
                  </span>
                  <h4 className="text-base font-bold text-[#333333]">
                    {selectedDate === '2026-09-21' ? 'Today, 21 September 2026' : selectedDate}
                  </h4>
                </div>
                <span className="text-xs font-bold bg-[#F5F5F5] text-[#555555] px-2.5 py-1 rounded-md">
                  {selectedDayEvents.length} {selectedDayEvents.length === 1 ? 'Event' : 'Events'}
                </span>
              </div>

              {selectedDayEvents.length === 0 ? (
                <div className="py-8 text-center text-[#888888] space-y-2">
                  <CalendarCheck className="w-8 h-8 text-[#CCCCCC] mx-auto" />
                  <p className="text-xs font-medium">No scheduled academic sessions or due dates for this day.</p>
                  <p className="text-[11px] text-[#AAAAAA]">
                    Use this time for self-study and Salulu AI interactive drills.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#F0F0F0] mt-3">
                  {selectedDayEvents.map((ev) => {
                    const badge = getBadgeStyle(ev.type);
                    return (
                      <div key={ev.id} className="py-4 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${badge.bg}`}>
                            {badge.label}
                          </span>
                          <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-[#333333] text-white">
                            {ev.moduleCode}
                          </span>
                        </div>

                        <div>
                          <h5 className="text-sm font-bold text-[#333333] leading-snug">
                            {ev.title}
                          </h5>
                          {ev.description && (
                            <p className="text-xs text-[#666666] mt-1 leading-relaxed">
                              {ev.description}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1 text-xs text-[#555555]">
                          {ev.time && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-[#F97316]" />
                              <span className="font-semibold">{ev.time}</span>
                            </div>
                          )}
                          {ev.venue && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-[#DC2626]" />
                              <span>{ev.venue}</span>
                            </div>
                          )}
                          {ev.lecturer && (
                            <div className="flex items-center gap-2 text-[11px] text-[#777777]">
                              <span>Lecturer: {ev.lecturer}</span>
                            </div>
                          )}
                        </div>

                        {/* Contextual Action Buttons */}
                        {ev.type === 'lab' && onOpenWorksheet && (
                          <button
                            onClick={onOpenWorksheet}
                            className="w-full mt-2 bg-[#F97316] hover:bg-[#EA580C] text-white py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Prepare Trees Lab Worksheet</span>
                          </button>
                        )}

                        {ev.type === 'assignment' && onOpenAssignment && (
                          <button
                            onClick={onOpenAssignment}
                            className="w-full mt-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <span>Open Assessment Brief</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Solulu Elevate Sync Advisory Card */}
            <div className="bg-[#2D2D2D] text-white rounded-xl p-4 border border-[#DC2626]/50 shadow-sm space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-base">🤖</span>
                <span className="text-xs font-bold text-[#F97316]">Solulu Elevate Timetable Sync</span>
              </div>
              <p className="text-[11px] text-[#CCCCCC] leading-relaxed">
                Solulu Elevate automatically cross-references your enrolled modules (CS204, CS201, CS210, MATH202) against UNISA's central semester calendar and sends advance SMS reminders 2 hours before every practical lab.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* ── Agenda List View ── */
        <div className="bg-white rounded-xl p-6 border border-[#E0E0E0] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0F0F0]">
            <div>
              <h3 className="text-lg font-bold text-[#333333]">All Upcoming Academic Deadlines & Events</h3>
              <p className="text-xs text-[#666666]">
                Chronological semester timeline for Semester 1, 2026
              </p>
            </div>
            <span className="text-xs font-bold text-[#DC2626] bg-[#FEF2F2] px-3 py-1 rounded-full border border-[#FECACA]">
              {filteredEvents.length} Events Total
            </span>
          </div>

          <div className="space-y-3">
            {filteredEvents.map((ev) => {
              const badge = getBadgeStyle(ev.type);
              const isToday = ev.date === '2026-09-21';
              return (
                <div
                  key={ev.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isToday
                      ? 'border-[#DC2626] bg-[#FEF2F2] shadow-xs ring-1 ring-[#DC2626]/20'
                      : 'border-[#E0E0E0] bg-white hover:border-[#CCCCCC]'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <div className="w-14 h-14 rounded-lg bg-[#333333] text-white flex flex-col items-center justify-center font-bold shrink-0">
                        <span className="text-[10px] uppercase text-[#F97316]">
                          {new Date(ev.date).toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-base leading-none">
                          {ev.date.split('-')[2]}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-[#333333]">{ev.title}</span>
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${badge.bg}`}>
                            {badge.label}
                          </span>
                          {isToday && (
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#F97316] text-white">
                              Today
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-[#666666] leading-relaxed max-w-2xl">
                          {ev.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-[#555555] pt-1">
                          <span className="font-bold text-[#DC2626]">{ev.moduleCode}</span>
                          {ev.time && <span>• {ev.time}</span>}
                          {ev.venue && <span>• {ev.venue}</span>}
                          {ev.lecturer && <span>• {ev.lecturer}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {ev.type === 'lab' && onOpenWorksheet && (
                        <button
                          onClick={onOpenWorksheet}
                          className="bg-[#F97316] hover:bg-[#EA580C] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-xs"
                        >
                          Worksheet
                        </button>
                      )}
                      {ev.type === 'assignment' && onOpenAssignment && (
                        <button
                          onClick={onOpenAssignment}
                          className="bg-[#DC2626] hover:bg-[#B91C1C] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-xs"
                        >
                          Assessment Brief
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
