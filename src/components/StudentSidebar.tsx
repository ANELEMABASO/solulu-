import React from 'react';
import { UnisaLogo } from './UnisaLogo';
import { StudentScreen } from '../types';
import { CURRENT_STUDENT } from '../data/unisaData';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  CalendarDays,
  BarChart3,
  Inbox,
  LogOut,
  Sparkles,
  ShieldCheck,
  Mail,
  X,
} from 'lucide-react';

interface StudentSidebarProps {
  currentScreen: StudentScreen;
  onNavigate: (screen: StudentScreen) => void;
  onLogout: () => void;
  onOpenSalulu: () => void;
  onOpenPopiModal?: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const StudentSidebar: React.FC<StudentSidebarProps> = ({
  currentScreen,
  onNavigate,
  onLogout,
  onOpenSalulu,
  onOpenPopiModal,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const navItems = [
    { id: 'overview' as StudentScreen, label: 'Overview', icon: LayoutDashboard },
    { id: 'modules' as StudentScreen, label: 'My Modules', icon: BookOpen },
    { id: 'calendar' as StudentScreen, label: 'UNISA Calendar', icon: CalendarDays },
    { id: 'schedule' as StudentScreen, label: 'Timetable & Labs', icon: Calendar },
    { id: 'progress' as StudentScreen, label: 'Progress & Graphs', icon: BarChart3 },
    { id: 'messages' as StudentScreen, label: 'Messages & Alerts', icon: Inbox },
    { id: 'gmail' as StudentScreen, label: 'Demo Gmail (MCP)', icon: Mail, badge: 'Live MCP' },
  ];

  const handleItemClick = (screen: StudentScreen) => {
    onNavigate(screen);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#333333] text-white flex flex-col justify-between shrink-0 border-r-4 border-[#DC2626] shadow-xl md:shadow-lg font-sans transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Header with UNISA Wordmark */}
          <div className="p-5 border-b border-[#444444] flex items-center justify-between">
            <UnisaLogo size="sm" theme="dark" showTagline={false} />
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="md:hidden text-[#AAAAAA] hover:text-white p-1 rounded-md"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <div className="px-5 py-2 bg-[#2B2B2B] flex items-center justify-between border-b border-[#3D3D3D]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#F97316]">
              Student Portal
            </span>
            <span className="text-[9px] bg-[#DC2626] text-white px-2 py-0.5 rounded font-extrabold">
              Semester 1, 2026
            </span>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all text-left ${
                    isActive
                      ? 'bg-[#DC2626] text-white shadow-xs'
                      : 'text-[#CCCCCC] hover:bg-[#444444] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded font-extrabold tracking-wide">
                      {item.badge}
                    </span>
                  )}
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
            Module engagement & risk detection active (92%). Next session: Trees Lab at 16:00.
          </p>
          <button
            onClick={onOpenSalulu}
            className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white py-1.5 rounded-md text-[11px] font-bold transition-colors flex items-center justify-center gap-1 shadow-xs"
          >
            <span>Ask Solulu Elevate</span>
            <span className="text-xs">→</span>
          </button>
        </div>

        {/* POPI Act Student Data Protection Quick Trigger */}
        {onOpenPopiModal && (
          <div className="px-3">
            <button
              onClick={onOpenPopiModal}
              className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg bg-[#262626] hover:bg-[#383838] border border-[#444444] hover:border-[#DC2626] text-xs font-semibold text-[#CCCCCC] hover:text-white transition-all shadow-2xs cursor-pointer"
              title="Manage POPI Act Student Data Protection & Stakeholder Access Consent"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#25D366]" />
                <span className="text-[11px]">POPI Act Data Protection</span>
              </div>
              <span className="text-[9px] bg-[#444444] text-[#F97316] font-extrabold px-1.5 py-0.5 rounded">
                Consent
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Student Profile Info Bar */}
      <div className="p-4 border-t border-[#444444] bg-[#2A2A2A] flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-[#DC2626] text-white flex items-center justify-center font-bold text-xs shrink-0 border border-[#F97316]">
            MC
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-white truncate">{CURRENT_STUDENT.name}</p>
            <p className="text-[10px] text-[#F97316] font-mono truncate">
              {CURRENT_STUDENT.studentNumber}
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
    </>
  );
};
