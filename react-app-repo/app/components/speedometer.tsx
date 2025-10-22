"use client";

import React from "react";

interface SpeedometerProps {
  speed: number; // Mbps
  max?: number; // max Mbps for gauge
  label?: string;
  showValue?: boolean; // draw numeric value inside gauge
}

// Responsive SVG speedometer (tachimetro)
const Speedometer: React.FC<SpeedometerProps> = ({ speed, max = 1000, label = "Mbps", showValue = false }) => {
  const clamped = Math.max(0, Math.min(speed, max));
  // Map to angle: -120deg .. +120deg
  const angle = -120 + (clamped / max) * 240;

  return (
    <div className="w-full max-w-sm aspect-[4/3] select-none">
      <svg viewBox="0 0 200 150" className="w-full h-full text-foreground">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,0.25)" />
          </filter>
        </defs>

        {/* Background arc */}
        <path d="M20 130 A80 80 0 0 1 180 130" fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="16" strokeLinecap="round" />
        {/* Gradient overlay arc */}
        <path d="M20 130 A80 80 0 0 1 180 130" fill="none" stroke="url(#grad)" strokeWidth="8" strokeLinecap="round" opacity="0.9" />
        {/* Foreground arc mask according to speed (drawn by clipping with large arc) - simplified via needle only for perf */}

        {/* Ticks */}
        {Array.from({ length: 13 }).map((_, i) => {
          const t = i / 12;
          const a = (-120 + t * 240) * (Math.PI / 180);
          const r1 = 80, r2 = i % 3 === 0 ? 62 : 66;
          const cx = 100 + Math.cos(a) * r1;
          const cy = 130 + Math.sin(a) * r1;
          const x2 = 100 + Math.cos(a) * r2;
          const y2 = 130 + Math.sin(a) * r2;
          return <line key={i} x1={cx} y1={cy} x2={x2} y2={y2} stroke="currentColor" strokeOpacity={i % 3 === 0 ? 0.4 : 0.25} strokeWidth={i % 3 === 0 ? 2 : 1} />;
        })}

        {/* Needle */}
        <g transform={`rotate(${angle} 100 130)`} style={{ transition: "transform 180ms ease-out" }} filter="url(#shadow)">
          <rect x="98" y="40" width="4" height="92" rx="2" fill="currentColor" />
          <circle cx="100" cy="130" r="7" fill="currentColor" />
        </g>

        {/* Labels */}
        <text x="100" y="145" textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.6">0</text>
        <text x="30" y="120" textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.6">{Math.round(max * 0.25)}</text>
        <text x="100" y="100" textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.6">{Math.round(max * 0.5)}</text>
        <text x="170" y="120" textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.6">{Math.round(max * 0.75)}</text>

        {showValue && (
          <text x="100" y="70" textAnchor="middle" fontSize="18" fontWeight="600" fill="currentColor">
            {speed.toFixed(1)}
            <tspan fontSize="12" dy="6"> {label}</tspan>
          </text>
        )}
      </svg>
    </div>
  );
};

export default Speedometer;
