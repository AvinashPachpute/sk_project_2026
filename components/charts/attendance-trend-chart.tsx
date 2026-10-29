'use client';

import React, { useState } from 'react';

export interface TrendDataPoint {
  date: string;
  label: string;
  percentage: number;
  present: number;
  absent: number;
}

export interface AttendanceTrendChartProps {
  data?: TrendDataPoint[];
}

export function AttendanceTrendChart({ data }: AttendanceTrendChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // If no data provided, create a default realistic trend series
  const defaultData: TrendDataPoint[] = [
    { date: '2024-10-18', label: 'Mon', percentage: 92, present: 46, absent: 4 },
    { date: '2024-10-19', label: 'Tue', percentage: 88, present: 44, absent: 6 },
    { date: '2024-10-20', label: 'Wed', percentage: 94, present: 47, absent: 3 },
    { date: '2024-10-21', label: 'Thu', percentage: 86, present: 43, absent: 7 },
    { date: '2024-10-22', label: 'Fri', percentage: 90, present: 45, absent: 5 },
    { date: '2024-10-23', label: 'Sat', percentage: 84, present: 42, absent: 8 },
    { date: '2024-10-24', label: 'Today', percentage: 95, present: 48, absent: 2 },
  ];

  const chartData = data && data.length > 0 ? data : defaultData;

  const width = 600;
  const height = 220;
  const paddingX = 40;
  const paddingY = 30;

  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingY * 2;

  // Calculate points
  const points = chartData.map((d, i) => {
    const x = paddingX + (i / (chartData.length - 1)) * innerWidth;
    const y = paddingY + innerHeight - (d.percentage / 100) * innerHeight;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="w-full">
      <div className="relative overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          <defs>
            <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[25, 50, 75, 100].map((level) => {
            const y = paddingY + innerHeight - (level / 100) * innerHeight;
            return (
              <g key={level}>
                <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#f1f5f9" strokeDasharray="3 3" />
                <text x={paddingX - 10} y={y + 3} fill="#94a3b8" fontSize="10" textAnchor="end">
                  {level}%
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path d={areaD} fill="url(#attendanceGradient)" />

          {/* Line stroke */}
          <path d={pathD} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Points & Interactive Tooltip triggers */}
          {points.map((p, idx) => (
            <g
              key={idx}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIdx === idx ? 6 : 4}
                fill="#ffffff"
                stroke="#2563eb"
                strokeWidth={hoveredIdx === idx ? 3 : 2}
                className="transition-all"
              />
              <text x={p.x} y={height - 8} fill="#64748b" fontSize="11" textAnchor="middle" fontWeight="500">
                {p.label}
              </text>
            </g>
          ))}
        </svg>

        {/* Hover info badge */}
        {hoveredIdx !== null && (
          <div
            className="absolute top-2 right-2 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg pointer-events-none transition-all flex items-center gap-2"
          >
            <span className="font-semibold text-blue-300">{chartData[hoveredIdx].label}:</span>
            <span>{chartData[hoveredIdx].percentage}% Attendance</span>
            <span className="text-slate-400">
              ({chartData[hoveredIdx].present} Present, {chartData[hoveredIdx].absent} Absent)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
