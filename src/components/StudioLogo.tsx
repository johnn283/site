import React from 'react';

interface StudioLogoProps {
  className?: string;
  compact?: boolean;
}

export const StudioLogo: React.FC<StudioLogoProps> = ({ className = '', compact = false }) => {
  return (
    <span className={`inline-flex items-center gap-2.5 select-none whitespace-nowrap shrink-0 ${className}`}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect
          x="1"
          y="1"
          width="34"
          height="34"
          rx="8"
          fill="#121216"
          stroke="#D4AF37"
          strokeOpacity="0.45"
          strokeWidth="1.2"
        />
        <rect x="14.5" y="7" width="7" height="12" rx="3.5" stroke="#D4AF37" strokeWidth="1.8" />
        <path
          d="M11 16.5C11 20.366 14.134 23.5 18 23.5C21.866 23.5 25 20.366 25 16.5"
          stroke="#F4F4F5"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path d="M18 23.5V28M14 28H22" stroke="#D4AF37" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M6.5 14V19M29.5 14V19" stroke="#DC2626" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <span className="font-display font-bold tracking-tight text-lg text-zinc-100 whitespace-nowrap">
        J.A <span className="text-[#D4AF37]">VOZ</span>
        {!compact && <span className="sr-only"> – Estúdio de Gravações</span>}
      </span>
    </span>
  );
};
