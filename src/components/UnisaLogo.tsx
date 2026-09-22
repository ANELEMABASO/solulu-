import React from 'react';

interface UnisaLogoProps {
  size?: 'sm' | 'md' | 'lg';
  theme?: 'light' | 'dark' | 'burgundy';
  showTagline?: boolean;
}

export const UnisaLogo: React.FC<UnisaLogoProps> = ({
  size = 'md',
  theme = 'light',
  showTagline = true,
}) => {
  const isDark = theme === 'dark';
  const isBurgundy = theme === 'burgundy';

  const myColor = isBurgundy ? 'text-[#FB923C]' : 'text-[#F97316]';
  const unisaColor = isBurgundy ? 'text-white' : isDark ? 'text-white' : 'text-[#DC2626]';
  const taglineColor = isBurgundy ? 'text-[#F5F5F5]/80' : isDark ? 'text-[#CCCCCC]' : 'text-[#666666]';
  const crestBg = isBurgundy ? 'bg-white text-[#DC2626]' : 'bg-[#DC2626] text-white';

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl sm:text-4xl',
  };

  const iconSizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-xl',
  };

  return (
    <div className="flex items-center gap-3 select-none">
      {/* UNISA Crest Symbol */}
      <div
        className={`${iconSizes[size]} ${crestBg} rounded-md flex items-center justify-center font-black shadow-sm border border-[#F97316] shrink-0 relative overflow-hidden`}
        title="University of South Africa"
      >
        <span className="font-sans font-black tracking-tighter">U</span>
        <div className="absolute bottom-0 inset-x-0 h-1 bg-[#F97316]" />
      </div>

      <div className="flex flex-col justify-center">
        <div className={`leading-none flex items-baseline tracking-normal ${sizeClasses[size]}`}>
          {/* Distinctive serif/script "my" alongside geometric sans "UNISA" */}
          <span className={`brand-my ${myColor} pr-0.5`}>my</span>
          <span className={`brand-unisa ${unisaColor}`}>UNISA</span>
        </div>
        {showTagline && (
          <span className={`text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase mt-1 ${taglineColor}`}>
            University of South Africa
          </span>
        )}
      </div>
    </div>
  );
};
