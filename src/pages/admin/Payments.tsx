import React from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { CreditCard } from 'lucide-react';

export function Payments() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Payments</h1>
        <p className="text-slate-500 mt-2">Track student payments and revenue.</p>
      </div>
      <GlassCard className="p-12 text-center text-slate-500 flex flex-col items-center justify-center">
        <CreditCard className="w-12 h-12 mb-4 text-slate-300" />
        <p>Payment tracking coming soon.</p>
      </GlassCard>
    </div>
  );
}
