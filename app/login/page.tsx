'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isSupabaseConfigured, createClient } from '@/lib/supabase/client';
import { GraduationCap, Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isConnected = isSupabaseConfigured();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (isConnected) {
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials. Please verify your email and password.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const fillQuickDemo = (role: 'admin' | 'teacher') => {
    if (role === 'admin') {
      setEmail('admin@apexcollege.edu');
      setPassword('Admin@Apex2024');
    } else {
      setEmail('sarah.miller@apexcollege.edu');
      setPassword('Teacher@Apex2024');
    }
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Subtle decorative background gradient */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden relative z-10">
        {/* College Crest & Title */}
        <div className="bg-slate-950 px-8 py-8 text-center border-b border-slate-800 text-white">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white mb-3 shadow-lg shadow-blue-500/30">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Apex Institute of Technology</h2>
          <p className="text-xs text-blue-400 mt-1 uppercase tracking-widest font-semibold">
            Student Information Management System
          </p>
        </div>

        <div className="p-8">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900">Portal Authentication</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your authorized staff or administration credentials.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Institutional Email"
              type="email"
              required
              placeholder="e.g. yourname@apexcollege.edu"
              icon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Password"
              type="password"
              required
              placeholder="••••••••••••"
              icon={<Lock className="w-4 h-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                <span>Remember session</span>
              </label>
              <Link href="/reset-password" className="text-blue-600 hover:text-blue-800 font-medium">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isLoading}>
              <span>Sign In to Dashboard</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
              Quick Fill Demo Accounts
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillQuickDemo('admin')}
                className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-slate-200 text-xs text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Admin Login</span>
              </button>
              <button
                type="button"
                onClick={() => fillQuickDemo('teacher')}
                className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-slate-200 text-xs text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Teacher Login</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-6 text-xs text-slate-500">
        &copy; 2026 Apex Institute of Technology & Science. All rights reserved.
      </div>
    </div>
  );
}
