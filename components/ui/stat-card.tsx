import React from 'react';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  accentColor?: 'blue' | 'navy' | 'emerald' | 'amber' | 'purple';
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  accentColor = 'blue',
}: StatCardProps) {
  const iconColors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    navy: 'bg-slate-100 text-slate-800 border-slate-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
          <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">{value}</div>
        </div>
        <div className={cn('p-2.5 rounded-xl border shrink-0 transition-transform group-hover:scale-105', iconColors[accentColor])}>
          {icon}
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-500 truncate">{subtitle}</span>}
          {trend && (
            <span
              className={cn(
                'font-medium inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[11px]',
                trend.isNeutral
                  ? 'bg-slate-100 text-slate-700'
                  : trend.isPositive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              )}
            >
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
