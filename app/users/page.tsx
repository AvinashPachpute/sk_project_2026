'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { fetchProfiles, updateProfileRole } from '@/lib/data-provider';
import { Profile } from '@/types/database';
import { formatDate, getInitials } from '@/lib/utils';
import { UserCheck, Shield, ShieldCheck, Mail, AlertCircle, Check } from 'lucide-react';

export default function UsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const list = await fetchProfiles();
      setProfiles(list);
    } catch (err) {
      console.error('Failed to load user profiles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'teacher') => {
    try {
      await updateProfileRole(userId, newRole);
      setSuccessMsg(`User role updated to "${newRole}".`);
      setTimeout(() => setSuccessMsg(null), 3000);
      await loadData();
    } catch (err) {
      console.error('Failed to update role:', err);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-[11px] font-bold border border-purple-200/80 uppercase tracking-wider mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administrator Restricted Access</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff & Faculty User Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage system authorization levels, elevate faculty to Administrator, or assign Teacher roles.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Info Notice */}
      <div className="p-4 bg-blue-50 border border-blue-200/80 rounded-xl flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 space-y-1">
          <p className="font-semibold">Role-Based Access Control (RBAC) Policies:</p>
          <ul className="list-disc pl-4 space-y-0.5 text-blue-800">
            <li>
              <strong>Administrators:</strong> Full authority across student registration, database schema
              classes, subject curriculum, examination creation, system settings, and user provisioning.
            </li>
            <li>
              <strong>Teachers:</strong> Authorized to record and audit classroom attendance, enter subject marks,
              and review student academic report cards.
            </li>
          </ul>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
          Loading user profiles...
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Institutional Email</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4 text-center">Assigned Role</th>
                  <th className="py-3 px-4">Member Since</th>
                  <th className="py-3 px-4 text-right">Role Authorization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {profiles.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {getInitials(p.full_name)}
                        </div>
                        <div>
                          <strong className="text-slate-900 font-semibold">{p.full_name}</strong>
                          <span className="block text-[11px] text-slate-400 font-normal">{p.phone || 'No phone'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-700">{p.email}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">{p.department || 'General'}</td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge variant={p.role === 'admin' ? 'purple' : 'info'} size="sm">
                        {p.role.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">{formatDate(p.created_at)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <select
                        value={p.role}
                        onChange={(e) => handleRoleChange(p.id, e.target.value as 'admin' | 'teacher')}
                        className="text-xs font-semibold rounded-lg border border-slate-300 bg-white py-1.5 px-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="admin">Administrator</option>
                        <option value="teacher">Teacher</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
