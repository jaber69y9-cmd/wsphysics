import React from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { FileText } from 'lucide-react';

export function Exams() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Exams & Results</h1>
        <p className="text-slate-500 mt-2">Manage exams and publish results.</p>
      </div>
      <GlassCard className="p-12 text-center text-slate-500 flex flex-col items-center justify-center">
        <FileText className="w-12 h-12 mb-4 text-slate-300" />
        <p>Exam management coming soon.</p>
      </GlassCard>
    </div>
  );
}
