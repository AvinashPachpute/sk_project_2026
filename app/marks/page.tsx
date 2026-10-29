'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { MarksEntrySheet } from '@/components/marks/marks-entry-sheet';
import { Button } from '@/components/ui/button';
import {
  fetchClasses,
  fetchSubjects,
  fetchExaminations,
  fetchStudents,
  fetchMarks,
  fetchGradingRules,
  saveMarksBatch,
} from '@/lib/data-provider';
import {
  ClassItem,
  SubjectItem,
  ExaminationItem,
  StudentItem,
  MarkItem,
  GradingRule,
} from '@/types/database';
import { Award, FileText, Settings, BarChart2 } from 'lucide-react';

export default function MarksPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [examinations, setExaminations] = useState<ExaminationItem[]>([]);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [marks, setMarks] = useState<MarkItem[]>([]);
  const [gradingRules, setGradingRules] = useState<GradingRule[]>([]);

  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedExamId, setSelectedExamId] = useState('');

  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [clsList, subList, examList, stuList, marksList, rulesList] = await Promise.all([
        fetchClasses(),
        fetchSubjects(),
        fetchExaminations(),
        fetchStudents(),
        fetchMarks(),
        fetchGradingRules(),
      ]);

      setClasses(clsList);
      setSubjects(subList);
      setExaminations(examList);
      setStudents(stuList);
      setMarks(marksList);
      setGradingRules(rulesList);

      const activeClass = selectedClassId || clsList[0]?.id || '';
      const activeSubject = selectedSubjectId || subList[0]?.id || '';
      const activeExam = selectedExamId || examList[0]?.id || '';

      setSelectedClassId(activeClass);
      setSelectedSubjectId(activeSubject);
      setSelectedExamId(activeExam);
    } catch (err) {
      console.error('Failed to load marks data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveMarks = async (records: Partial<MarkItem>[]) => {
    await saveMarksBatch(records);
    const updated = await fetchMarks({
      examId: selectedExamId,
      subjectId: selectedSubjectId,
    });
    setMarks(updated);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Examination Marks & Grades</h1>
          <p className="text-xs text-slate-500 mt-1">
            Record student test scores, validate against maximum limits, and automatically calculate percentage and letter grades.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/reports/exam-marks">
            <Button variant="outline" size="sm">
              <BarChart2 className="w-4 h-4 mr-1.5" />
              <span>Marks Analytics Report</span>
            </Button>
          </Link>
          <Link href="/settings">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-1.5" />
              <span>Grading Rules</span>
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
          Loading marks management sheet...
        </div>
      ) : (
        <MarksEntrySheet
          classes={classes}
          subjects={subjects}
          examinations={examinations}
          students={students}
          existingMarks={marks}
          gradingRules={gradingRules}
          selectedClassId={selectedClassId}
          onSelectClassId={setSelectedClassId}
          selectedSubjectId={selectedSubjectId}
          onSelectSubjectId={setSelectedSubjectId}
          selectedExamId={selectedExamId}
          onSelectExamId={setSelectedExamId}
          onSaveMarks={handleSaveMarks}
        />
      )}
    </DashboardLayout>
  );
}
