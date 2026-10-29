'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  BookOpen,
  CalendarCheck,
  FileSpreadsheet,
  Award,
  BarChart3,
  UserCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  School,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  userRole?: 'admin' | 'teacher';
}

export function Sidebar({ isCollapsed, onToggleCollapse, userRole = 'admin' }: SidebarProps) {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Students', href: '/students', icon: Users },
    { name: 'Classes & Sections', href: '/classes', icon: School },
    { name: 'Subjects', href: '/subjects', icon: BookOpen },
    { name: 'Attendance', href: '/attendance', icon: CalendarCheck },
    { name: 'Examinations', href: '/examinations', icon: Award },
    { name: 'Marks & Grades', href: '/marks', icon: FileSpreadsheet },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    ...(userRole === 'admin'
      ? [{ name: 'User Management', href: '/users', icon: UserCheck, badge: 'Admin' }]
      : []),
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={cn(
        'relative bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 ease-in-out border-r border-slate-800 shrink-0 z-30 select-none',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-slate-800 justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20 font-bold">
            <GraduationCap className="w-6 h-6" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="font-bold text-white tracking-wide text-sm leading-tight">APEX SIMS</span>
              <span className="text-[11px] text-blue-400 font-medium">College Portal</span>
            </div>
          )}
        </Link>
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Role Pill */}
      {!isCollapsed && (
        <div className="px-4 py-3 border-b border-slate-800/60 bg-slate-950/40">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Signed in Role:</span>
            <span className="inline-flex items-center gap-1 font-semibold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded-md border border-blue-800/50 uppercase tracking-wider text-[10px]">
              <ShieldCheck className="w-3 h-3" />
              {userRole}
            </span>
          </div>
        </div>
      )}

      {/* Nav Menu */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-none">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative',
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className={cn('w-5 h-5 shrink-0 transition-transform group-hover:scale-105', isActive ? 'text-white' : 'text-slate-400')} />
              {!isCollapsed && <span className="truncate flex-1">{item.name}</span>}
              {!isCollapsed && item.badge && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/60">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer System Info */}
      {!isCollapsed && (
        <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
          <div className="flex items-center justify-between">
            <span>Academic Year</span>
            <span className="text-slate-300 font-medium">2024-2025</span>
          </div>
          <div className="text-[10px] text-slate-600 mt-1">SIMS v1.0 • Next.js & Supabase</div>
        </div>
      )}
    </aside>
  );
}
