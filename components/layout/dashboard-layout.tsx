'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { isSupabaseConfigured, createClient } from '@/lib/supabase/client';
import { Info, X, ExternalLink } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showDemoBanner, setShowDemoBanner] = useState(true);
  const [userRole, setUserRole] = useState<'admin' | 'teacher'>('admin');
  const [userName, setUserName] = useState('Dr. Arthur Campbell');
  const [userEmail, setUserEmail] = useState('admin@apexcollege.edu');

  useEffect(() => {
    // Check logged in user in Supabase if configured
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          setUserEmail(user.email || '');
          supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
            .then(({ data: profile }) => {
              if (profile) {
                setUserName(profile.full_name || user.email?.split('@')[0] || 'User');
                setUserRole(profile.role || 'teacher');
              }
            });
        }
      });
    }
  }, []);

  const isConnected = isSupabaseConfigured();

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex shrink-0 h-full">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          userRole={userRole}
        />
      </div>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-64 max-w-[80%] h-full bg-slate-900 z-10 shadow-2xl animate-in slide-in-from-left">
            <Sidebar
              isCollapsed={false}
              onToggleCollapse={() => setIsMobileOpen(false)}
              userRole={userRole}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Topbar
          onMobileMenuToggle={() => setIsMobileOpen(true)}
          userName={userName}
          userEmail={userEmail}
          userRole={userRole}
        />

        {/* Supabase Notice Banner when running in Local Demo Mode */}
        {!isConnected && showDemoBanner && (
          <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white px-4 py-2.5 text-xs flex items-center justify-between shadow-xs shrink-0 border-b border-blue-800">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-400 shrink-0" />
              <span>
                <strong>Demo Mode Active:</strong> Add your Supabase URL & Key in{' '}
                <code className="bg-slate-800/80 px-1.5 py-0.5 rounded text-blue-300 font-mono text-[11px]">
                  .env.local
                </code>{' '}
                to connect live PostgreSQL and Auth.
              </span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center gap-1 text-blue-300 hover:text-white underline font-medium"
              >
                <span>Supabase Dashboard</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                onClick={() => setShowDemoBanner(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
