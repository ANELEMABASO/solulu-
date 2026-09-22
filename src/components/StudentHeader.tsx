import React from 'react';
import { Search, Bell, Sparkles } from 'lucide-react';

interface StudentHeaderProps {
  title?: string;
  subtitle?: string;
  onOpenSalulu: () => void;
  onShowToast?: (msg: string) => void;
  onNavigate?: (screen: any) => void;
  currentScreen?: any;
}

export const StudentHeader: React.FC<StudentHeaderProps> = ({
  title = 'myUNISA Student Portal',
  subtitle,
  onOpenSalulu,
  onShowToast = () => {},
}) => {
  return (
    <header className="h-16 bg-white border-b border-[#E0E0E0] px-6 sm:px-8 flex items-center justify-between shrink-0 shadow-xs font-sans">
      <div>
        <h1 className="text-base sm:text-lg font-bold text-[#333333] flex items-center gap-2">
          <span>{title}</span>
          <span className="hidden sm:inline text-xs text-[#DC2626] font-bold bg-[#FEF2F2] px-2 py-0.5 rounded border border-[#FECACA]">
            myUNISA 2026
          </span>
        </h1>
        {subtitle && <p className="text-xs text-[#666666]">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Search bar */}
        <div className="relative hidden md:block">
          <Search className="w-3.5 h-3.5 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search modules, study materials..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onShowToast(`Searching myUNISA portal for "${e.currentTarget.value}"...`);
              }
            }}
            className="pl-8.5 pr-3 py-1.5 rounded-full border border-[#CCCCCC] text-xs text-[#333333] w-52 focus:w-64 transition-all focus:outline-none focus:border-[#DC2626] bg-[#F5F5F5]"
          />
        </div>

        {/* Notifications */}
        <button
          onClick={() =>
            onShowToast(
              'Solulu Elevate Alert: Trees Lab starts at 16:00 SAST today in Room C1.08. WhatsApp reminder sent.'
            )
          }
          className="relative w-8 h-8 rounded-full bg-[#F5F5F5] hover:bg-[#EAEAEA] border border-[#CCCCCC] flex items-center justify-center text-[#333333] transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4 text-[#DC2626]" />
          <span className="w-2 h-2 rounded-full bg-[#F97316] absolute top-1 right-1" />
        </button>

        {/* Quick Solulu Elevate Trigger */}
        <button
          onClick={onOpenSalulu}
          className="bg-[#F97316] hover:bg-[#EA580C] text-white px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Solulu Elevate AI</span>
          <span className="sm:hidden">Solulu</span>
        </button>
      </div>
    </header>
  );
};
