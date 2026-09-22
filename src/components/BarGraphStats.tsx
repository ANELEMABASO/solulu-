import React from 'react';
import { BarStatItem } from '../types';

interface BarGraphStatsProps {
  title: string;
  subtitle?: string;
  stats: BarStatItem[];
  id?: string;
}

export const BarGraphStats: React.FC<BarGraphStatsProps> = ({
  title,
  subtitle,
  stats,
  id,
}) => {
  const max = Math.max(...stats.map((s) => s.value), 100);

  return (
    <div id={id} className="bg-white rounded-xl p-6 border border-[#E0E0E0] shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-5 border-b border-[#EAEAEA] gap-2">
        <div>
          <h3 className="text-[#333333] font-bold text-base sm:text-lg flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" />
            {title}
          </h3>
          {subtitle && <p className="text-xs text-[#666666] mt-0.5">{subtitle}</p>}
        </div>
        <span className="text-[11px] font-bold text-[#DC2626] uppercase tracking-wider bg-[#FEF2F2] px-2.5 py-1 rounded border border-[#FECACA] self-start sm:self-auto">
          UNISA Analytics Graph
        </span>
      </div>

      <div className="space-y-4">
        {stats.map((stat, idx) => {
          const pct = Math.min(100, Math.round((stat.value / max) * 100));
          return (
            <div key={stat.label} className="space-y-1.5">
              <div className="flex items-baseline justify-between text-xs sm:text-sm">
                <span className="font-semibold text-[#333333] flex items-center gap-2">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-xs"
                    style={{ backgroundColor: stat.color }}
                  />
                  {stat.label}
                </span>
                <div className="flex items-center gap-2">
                  {stat.benchmark && (
                    <span className="text-[11px] text-[#777777] hidden md:inline">
                      ({stat.benchmark})
                    </span>
                  )}
                  <span
                    className="font-bold text-sm sm:text-base tracking-tight"
                    style={{ color: stat.color }}
                  >
                    {stat.display}
                  </span>
                </div>
              </div>

              {/* Bar track and animated fill */}
              <div className="h-4 bg-[#F5F5F5] rounded-md overflow-hidden border border-[#E0E0E0] p-0.5">
                <div
                  className="h-full rounded-xs stat-bar-fill transition-all duration-700 relative"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: stat.color,
                    animationDelay: `${idx * 0.12}s`,
                  }}
                >
                  <div className="absolute inset-0 bg-white/10" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
