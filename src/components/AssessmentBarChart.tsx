import React, { useState } from 'react';
import { ChevronDown, BarChart2, Filter } from 'lucide-react';

export interface AssessmentItem {
  id: string;
  name: string;
  shortLabel: string;
  type: 'Assignment' | 'Quiz' | 'Lab' | 'Test' | 'Project' | 'Exam';
  percentage: number; // 0 - 100
  submissionsCount: number;
  totalStudents: number;
  averageScore: number;
  highlighted?: boolean;
}

const DEFAULT_ASSESSMENTS: AssessmentItem[] = [
  {
    id: 'a1',
    name: 'Assignment 1: Foundations',
    shortLabel: 'Assignment 1',
    type: 'Assignment',
    percentage: 78,
    submissionsCount: 132,
    totalStudents: 142,
    averageScore: 74,
  },
  {
    id: 'q1',
    name: 'Quiz 1: Algorithmic Complexity',
    shortLabel: 'Quiz 1',
    type: 'Quiz',
    percentage: 85,
    submissionsCount: 138,
    totalStudents: 142,
    averageScore: 82,
  },
  {
    id: 'l1',
    name: 'Lab Practical: AVL Trees',
    shortLabel: 'Lab Practical',
    type: 'Lab',
    percentage: 92,
    submissionsCount: 140,
    totalStudents: 142,
    averageScore: 88,
  },
  {
    id: 'a2',
    name: 'Assignment 2: Graph Algorithms',
    shortLabel: 'Assignment 2',
    type: 'Assignment',
    percentage: 68,
    submissionsCount: 114,
    totalStudents: 142,
    averageScore: 66,
    highlighted: true, // Prominent highlighted bar matching the design
  },
  {
    id: 't1',
    name: 'Midterm Test: Data Structures',
    shortLabel: 'Midterm Test',
    type: 'Test',
    percentage: 82,
    submissionsCount: 135,
    totalStudents: 142,
    averageScore: 79,
  },
  {
    id: 'p1',
    name: 'Final Project: Scalable B-Tree',
    shortLabel: 'Final Project',
    type: 'Project',
    percentage: 74,
    submissionsCount: 122,
    totalStudents: 142,
    averageScore: 73,
  },
];

interface AssessmentBarChartProps {
  onSelectAssessment?: (assessment: AssessmentItem) => void;
}

export const AssessmentBarChart: React.FC<AssessmentBarChartProps> = ({
  onSelectAssessment,
}) => {
  const [filter, setFilter] = useState<'All' | 'Assignments' | 'Quizzes' | 'Labs'>('All');
  const [metricMode, setMetricMode] = useState<'submission' | 'score'>('submission');
  const [hoveredItem, setHoveredItem] = useState<AssessmentItem | null>(null);

  const filteredData = DEFAULT_ASSESSMENTS.filter((item) => {
    if (filter === 'Assignments') return item.type === 'Assignment' || item.type === 'Project';
    if (filter === 'Quizzes') return item.type === 'Quiz' || item.type === 'Test';
    if (filter === 'Labs') return item.type === 'Lab';
    return true;
  });

  // Y-axis percentage milestones: 100%, 80%, 60%, 40%, 20%, 0%
  const yTicks = [100, 80, 60, 40, 20, 0];

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm flex flex-col justify-between h-full">
      {/* Chart Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-2">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-800 tracking-tight flex items-center gap-2">
            <span>Statistics</span>
          </h2>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Performance & completion rate by assessment type
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Metric toggle */}
          <div className="flex bg-gray-100 rounded-lg p-0.5 text-[11px] font-semibold text-gray-600">
            <button
              onClick={() => setMetricMode('submission')}
              className={`px-2 py-1 rounded-md transition-all ${
                metricMode === 'submission'
                  ? 'bg-white text-gray-900 shadow-xs font-bold'
                  : 'hover:text-gray-900'
              }`}
            >
              Submission %
            </button>
            <button
              onClick={() => setMetricMode('score')}
              className={`px-2 py-1 rounded-md transition-all ${
                metricMode === 'score'
                  ? 'bg-white text-gray-900 shadow-xs font-bold'
                  : 'hover:text-gray-900'
              }`}
            >
              Avg Score %
            </button>
          </div>

          {/* Sort / Filter Dropdown */}
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
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

      {/* Main Bar Graph Stage */}
      <div className="relative flex-1 min-h-[220px] flex pt-2 pb-1">
        {/* Y-AXIS (Percentage: 100%, 80%, 60%, 40%, 20%, 0%) */}
        <div className="flex flex-col justify-between text-right pr-3 shrink-0 text-[11px] font-medium text-gray-400 select-none pb-8 h-[200px]">
          {yTicks.map((tick) => (
            <div key={tick} className="leading-none flex items-center justify-end h-4">
              <span>{tick}%</span>
            </div>
          ))}
        </div>

        {/* Graph Canvas & Grid Lines */}
        <div className="relative flex-1 flex flex-col justify-between">
          {/* Horizontal Background Grid Lines */}
          <div className="absolute inset-x-0 top-0 h-[200px] flex flex-col justify-between pointer-events-none z-0">
            {yTicks.map((tick) => (
              <div
                key={tick}
                className={`w-full border-b ${
                  tick === 0 ? 'border-gray-200' : 'border-dashed border-gray-100'
                }`}
              />
            ))}
          </div>

          {/* Bars Container */}
          <div className="relative z-10 h-[200px] flex items-end justify-around px-2 sm:px-4">
            {filteredData.map((item) => {
              const val = metricMode === 'submission' ? item.percentage : item.averageScore;
              const isHovered = hoveredItem?.id === item.id;
              const isProminent = item.highlighted;

              return (
                <div
                  key={item.id}
                  className="flex-1 flex flex-col items-center justify-end h-full group px-1 sm:px-2 cursor-pointer"
                  onMouseEnter={() => setHoveredItem(item)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={() => onSelectAssessment && onSelectAssessment(item)}
                >
                  {/* Tooltip on Hover */}
                  {isHovered && (
                    <div className="absolute top-2 z-30 bg-gray-900 text-white text-[11px] rounded-lg px-2.5 py-1.5 shadow-xl pointer-events-none flex flex-col items-center animate-in fade-in">
                      <span className="font-bold">{item.name}</span>
                      <span className="text-gray-300">
                        {metricMode === 'submission' ? 'Submission Rate' : 'Average Score'}:{' '}
                        <strong className="text-amber-400">{val}%</strong> ({item.submissionsCount}/{item.totalStudents})
                      </span>
                      <div className="w-2 h-2 bg-gray-900 rotate-45 -mb-1 mt-0.5" />
                    </div>
                  )}

                  {/* Value label above bar */}
                  <span
                    className={`text-[10px] font-bold mb-1.5 transition-all ${
                      isProminent
                        ? 'text-[#DC2626] font-extrabold scale-105'
                        : isHovered
                        ? 'text-gray-800'
                        : 'text-gray-400'
                    }`}
                  >
                    {val}%
                  </span>

                  {/* Bar Element */}
                  <div className="w-8 sm:w-10 md:w-12 max-w-[48px] bg-gray-100 rounded-t-lg relative overflow-hidden transition-all duration-300 h-full flex items-end">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-700 ease-out ${
                        isProminent
                          ? 'bg-gradient-to-t from-[#DC2626] to-[#F97316] shadow-md shadow-red-200'
                          : isHovered
                          ? 'bg-blue-300'
                          : 'bg-blue-100'
                      }`}
                      style={{ height: `${val}%` }}
                    >
                      {/* Top highlight shine */}
                      <div className="h-1.5 w-full bg-white/30 rounded-t-lg" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* X-AXIS: Assessment Types */}
          <div className="flex justify-around px-2 sm:px-4 pt-3 border-t border-gray-200 text-center">
            {filteredData.map((item) => (
              <div
                key={item.id}
                className="flex-1 px-0.5 text-center cursor-pointer"
                onClick={() => onSelectAssessment && onSelectAssessment(item)}
              >
                <span
                  className={`block text-[11px] sm:text-xs font-semibold truncate transition-colors ${
                    item.highlighted
                      ? 'text-[#DC2626] font-bold'
                      : hoveredItem?.id === item.id
                      ? 'text-gray-900'
                      : 'text-gray-500'
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

      {/* Axis Information Legend */}
      <div className="mt-4 pt-2 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-gradient-to-r from-[#DC2626] to-[#F97316]" />
            <strong className="text-gray-600 font-medium">Critical Assessment</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-blue-100" />
            <span className="text-gray-500">Standard Assessments</span>
          </span>
        </div>
        <span className="text-[10px] text-gray-400 italic hidden sm:inline">
          Y-Axis: Percentage (%) · X-Axis: Assessment Type
        </span>
      </div>
    </div>
  );
};
