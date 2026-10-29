'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  fetchCollegeSettings,
  saveCollegeSettings,
  fetchGradingRules,
  saveGradingRules,
} from '@/lib/data-provider';
import { CollegeSettings, GradingRule } from '@/types/database';
import { Settings, Save, Check, Award, Building, Plus, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState<CollegeSettings>({
    id: '',
    college_name: 'Apex Institute of Technology & Science',
    college_code: 'AITS-2024',
    email: 'admin@apexcollege.edu',
    phone: '+1 (555) 019-2834',
    address: '100 University Boulevard, Tech Campus, CA 94016',
    academic_year: '2024-2025',
    grading_system: 'Standard Letter (A+ to F)',
  });

  const [rules, setRules] = useState<GradingRule[]>([]);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isSavingRules, setIsSavingRules] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [stg, rls] = await Promise.all([fetchCollegeSettings(), fetchGradingRules()]);
      setSettings(stg);
      setRules(rls);
    }
    load();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingSettings(true);
      await saveCollegeSettings(settings);
      setSuccessMsg('Institutional settings successfully updated.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleRuleChange = (index: number, field: keyof GradingRule, val: string | number) => {
    const updated = [...rules];
    updated[index] = {
      ...updated[index],
      [field]: val,
    };
    setRules(updated);
  };

  const handleAddRule = () => {
    setRules([
      ...rules,
      {
        id: `rule-${Date.now()}`,
        grade: 'New Grade',
        min_percentage: 0,
        max_percentage: 100,
        gpa_point: 0.0,
        description: 'Custom threshold',
      },
    ]);
  };

  const handleDeleteRule = (index: number) => {
    const updated = rules.filter((_, i) => i !== index);
    setRules(updated);
  };

  const handleSaveRules = async () => {
    try {
      setIsSavingRules(true);
      await saveGradingRules(rules);
      setSuccessMsg('Configurable grading thresholds saved successfully.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Failed to save rules:', err);
    } finally {
      setIsSavingRules(false);
    }
  };

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings & Grading Rules</h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure institutional identity, academic year parameters, and custom examination grading scales.
        </p>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* College Information Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-600" />
            <CardTitle>Institutional Profile</CardTitle>
          </div>
          <CardDescription>
            These details appear on official reports, transcripts, and header credentials.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Institution Name"
                value={settings.college_name}
                onChange={(e) => setSettings({ ...settings, college_name: e.target.value })}
                required
              />
              <Input
                label="Institution Code"
                value={settings.college_code}
                onChange={(e) => setSettings({ ...settings, college_code: e.target.value })}
                required
              />
              <Input
                label="Official Contact Email"
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                required
              />
              <Input
                label="Official Contact Phone"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                required
              />
              <Input
                label="Active Academic Session"
                value={settings.academic_year}
                onChange={(e) => setSettings({ ...settings, academic_year: e.target.value })}
                required
              />
              <Input
                label="Grading Model Name"
                value={settings.grading_system}
                onChange={(e) => setSettings({ ...settings, grading_system: e.target.value })}
                required
              />
            </div>

            <Input
              label="Campus Address"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              required
            />

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button type="submit" variant="primary" size="sm" isLoading={isSavingSettings}>
                <Save className="w-4 h-4 mr-1.5" />
                <span>Save Institutional Profile</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Configurable Grading Rules */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" />
              <CardTitle>Configurable Grading Rules & Thresholds</CardTitle>
            </div>
            <CardDescription className="mt-1">
              Customize the minimum and maximum percentages and GPA points according to your college policy.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleAddRule}>
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Add Threshold</span>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 uppercase font-semibold text-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Grade Letter</th>
                  <th className="py-2.5 px-3">Min %</th>
                  <th className="py-2.5 px-3">Max %</th>
                  <th className="py-2.5 px-3">GPA Point</th>
                  <th className="py-2.5 px-3">Evaluation Description</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rules.map((rule, idx) => (
                  <tr key={rule.id || idx}>
                    <td className="py-2.5 px-3 w-28">
                      <input
                        type="text"
                        value={rule.grade}
                        onChange={(e) => handleRuleChange(idx, 'grade', e.target.value)}
                        className="w-full font-bold text-slate-900 border border-slate-300 rounded px-2 py-1 text-xs"
                      />
                    </td>
                    <td className="py-2.5 px-3 w-24">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={rule.min_percentage}
                        onChange={(e) =>
                          handleRuleChange(idx, 'min_percentage', parseFloat(e.target.value) || 0)
                        }
                        className="w-full font-mono border border-slate-300 rounded px-2 py-1 text-xs"
                      />
                    </td>
                    <td className="py-2.5 px-3 w-24">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={rule.max_percentage}
                        onChange={(e) =>
                          handleRuleChange(idx, 'max_percentage', parseFloat(e.target.value) || 100)
                        }
                        className="w-full font-mono border border-slate-300 rounded px-2 py-1 text-xs"
                      />
                    </td>
                    <td className="py-2.5 px-3 w-24">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="5"
                        value={rule.gpa_point}
                        onChange={(e) =>
                          handleRuleChange(idx, 'gpa_point', parseFloat(e.target.value) || 0)
                        }
                        className="w-full font-mono border border-slate-300 rounded px-2 py-1 text-xs"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={rule.description || ''}
                        onChange={(e) => handleRuleChange(idx, 'description', e.target.value)}
                        className="w-full border border-slate-300 rounded px-2 py-1 text-xs"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleDeleteRule(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        title="Delete Rule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <Button variant="primary" size="sm" onClick={handleSaveRules} isLoading={isSavingRules}>
              <Save className="w-4 h-4 mr-1.5" />
              <span>Save Grading Rules</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
