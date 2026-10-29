'use client';

import React, { useState } from 'react';

export interface SubjectScorePoint {
  code: string;
  name: string;
  averageScore: number;
}

export interface SubjectBarChartProps {
  data?: SubjectScorePoint[];
}

export function SubjectBarChart({ data }: SubjectBarChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const defaultData: SubjectScorePoint[] = [
    { code: 'CS201', name: 'Data Structures', averageScore: 82.5 },
    { code: 'CS202', name: 'DBMS', averageScore: 86.4 },
    { code: 'CS203', name: 'Operating Systems', averageScore: 74.8 },
    { code: 'EE101', name: 'Circuit Theory', averageScore: 79.0 },
    { code: 'MA102', name: 'Linear Algebra', averageScore: 88.2 },
  ];

  const chartData = data && data.length > 0 ? data : defaultData;

  const width = 600;
  const height = 220;
  const paddingX = 40;
  const paddingY = 30;
  const barGap = 20;

  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingY * 2;
  const barWidth = Math.min(50, (innerWidth - barGap * (chartData.length - 1)) / chartData.length);

  return (
    <div className="w-full">
      <div className="relative overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
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

          {/* Bars */}
          {chartData.map((d, i) => {
            const totalBarsWidth = chartData.length * barWidth + (chartData.length - 1) * barGap;
            const startX = paddingX + (innerWidth - totalBarsWidth) / 2;
            const x = startX + i * (barWidth + barGap);
            const barHeight = (d.averageScore / 100) * innerHeight;
            const y = paddingY + innerHeight - barHeight;
            const isHovered = hoveredIdx === i;

            return (
              <g
                key={i}
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="4"
                  fill={isHovered ? '#1d4ed8' : '#3b82f6'}
                  className="transition-colors duration-150"
                />
                <text x={x + barWidth / 2} y={height - 8} fill="#64748b" fontSize="11" textAnchor="middle" fontWeight="500">
                  {d.code}
                </text>
              </g>
            );
          })}
        </svg>

        {hoveredIdx !== null && (
          <div
            className="absolute top-2 right-2 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg pointer-events-none transition-all flex items-center gap-2"
          >
            <span className="font-semibold text-blue-300">{chartData[hoveredIdx].name}:</span>
            <span>{chartData[hoveredIdx].averageScore}% Avg Marks</span>
          </div>
        )}
      </div>
    </div>
  );
}
