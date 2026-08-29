import React from 'react';

interface AppLogoProps {
  size?: number | string;
  className?: string;
  withShadow?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 40,
  className = '',
  withShadow = true,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`${className} ${withShadow ? 'drop-shadow-sm' : ''}`}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
      aria-label="臺北騎點 Logo"
    >
      {/* Outer Green Map Pin Marker */}
      <path
        d="M 50 92 C 45 80 18 56 18 38 A 32 32 0 1 1 82 38 C 82 56 55 80 50 92 Z"
        fill="#2ca244"
      />

      {/* Inner White Circular Disk */}
      <circle cx="50" cy="38" r="20" fill="#ffffff" />

      {/* 8 Green Bicycle Wheel Spokes / Radial Petals */}
      {/* 0 deg (Vertical: top & bottom) */}
      <line
        x1="50"
        y1="19"
        x2="50"
        y2="57"
        stroke="#2ca244"
        strokeWidth="3.4"
        strokeLinecap="round"
      />

      {/* 90 deg (Horizontal: left & right) */}
      <line
        x1="31"
        y1="38"
        x2="69"
        y2="38"
        stroke="#2ca244"
        strokeWidth="3.4"
        strokeLinecap="round"
      />

      {/* 45 deg Diagonal */}
      <line
        x1="36.5"
        y1="24.5"
        x2="63.5"
        y2="51.5"
        stroke="#2ca244"
        strokeWidth="3.4"
        strokeLinecap="round"
      />

      {/* 135 deg Diagonal */}
      <line
        x1="63.5"
        y1="24.5"
        x2="36.5"
        y2="51.5"
        stroke="#2ca244"
        strokeWidth="3.4"
        strokeLinecap="round"
      />

      {/* Center Golden/Yellow Hub Circle */}
      <circle cx="50" cy="38" r="5.6" fill="#f5a623" />
    </svg>
  );
};
