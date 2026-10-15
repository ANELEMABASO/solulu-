import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, TrendingUp, Users, Smartphone, ShieldAlert } from 'lucide-react';

interface StudentsAtRiskPieChartProps {
  onFilterAtRisk?: () => void;
  onNudgeAtRisk?: () => void;
}

export const StudentsAtRiskPieChart: React.FC<StudentsAtRiskPieChartProps> = ({
  onFilterAtRisk,
  onNudgeAtRisk,
}) => {
  // Can view either "Students at Risk" or "Module Activity" (both explicitly requested by user)
  const [viewMode, setViewMode] = useState<'risk' | 'activity'>('risk');

  // Metrics:
  // Total students: 142
  // At risk: 26 students (18.3% ~ 18%)
  // On track: 116 students (81.7% ~ 82%)
  const atRiskPct = 18;
  const onTrackPct = 82;

  // Module Activity mode:
  // Active/Engaged: 75%
  // Incomplete/Pending: 25%
  const activityActivePct = 75;
  const activityPendingPct = 25;

  const currentMainPct = viewMode === 'risk' ? atRiskPct : activityActivePct;

  // SVG Circular progress values
  const radius = 62;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate stroke dashoffset for donut
  const offset = circumference - (currentMainPct / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm flex flex-col justify-between h-full">
      {/* Header with Title & Mode Switcher */}
      <div className="flex items-center justify-between gap-2 pb-2">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-800 tracking-tight flex items-center gap-1.5">
            {viewMode === 'risk' ? (
              <>
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span>Students at Risk</span>
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>Module Activity</span>
              </>
            )}
          </h2>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {viewMode === 'risk'
              ? 'Telemetry detection: attendance & missed tasks'
              : 'Real-time engagement across course materials'}
          </p>
        </div>

        {/* Tab Toggle between "Students at Risk" and "Module Activity" */}
        <div className="flex bg-gray-100 rounded-lg p-0.5 text-[11px] font-semibold text-gray-600 shrink-0">
          <button
            onClick={() => setViewMode('risk')}
            className={`px-2 py-1 rounded-md transition-all ${
              viewMode === 'risk'
                ? 'bg-white text-rose-600 shadow-xs font-bold'
                : 'hover:text-gray-900'
            }`}
          >
            At Risk
          </button>
          <button
            onClick={() => setViewMode('activity')}
            className={`px-2 py-1 rounded-md transition-all ${
              viewMode === 'activity'
                ? 'bg-white text-blue-600 shadow-xs font-bold'
                : 'hover:text-gray-900'
            }`}
          >
            Activity
          </button>
        </div>
      </div>

      {/* Donut / Circular Progress Chart */}
      <div className="flex flex-col items-center justify-center my-auto py-2">
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            {/* Background ring */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="#EBF3FF"
              strokeWidth={strokeWidth}
            />

            {/* Active primary slice */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke={viewMode === 'risk' ? '#DC2626' : '#F97316'}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span
              className={`text-3xl font-extrabold tracking-tight ${
                viewMode === 'risk' ? 'text-[#DC2626]' : 'text-[#F97316]'
              }`}
            >
              {currentMainPct}%
            </span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
              {viewMode === 'risk' ? 'Flagged / Risk' : 'Course Active'}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                viewMode === 'risk' ? 'bg-[#DC2626]' : 'bg-[#F97316]'
              }`}
            />
            <span className="text-gray-700 font-medium">
              {viewMode === 'risk' ? 'Students at Risk (18%)' : 'Completed (75%)'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#EBF3FF]" />
            <span className="text-gray-500 font-medium">
              {viewMode === 'risk' ? 'On Track (82%)' : 'In Progress (25%)'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Alert Footer */}
      <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
        <div className="text-[11px] text-gray-500">
          <strong className="text-[#DC2626]">26 Students</strong> require intervention
        </div>
        <div className="flex items-center gap-2">
          {onFilterAtRisk && (
            <button
              onClick={onFilterAtRisk}
              className="text-[11px] font-bold text-[#333333] hover:text-[#DC2626] underline underline-offset-2"
            >
              View List
            </button>
          )}
          {onNudgeAtRisk && (
            <button
              onClick={onNudgeAtRisk}
              className="text-[11px] font-bold bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#DC2626] px-2.5 py-1 rounded-md border border-[#FECACA] flex items-center gap-1 transition-colors shadow-2xs"
            >
              <Smartphone className="w-3 h-3" />
              <span>Nudge All</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
