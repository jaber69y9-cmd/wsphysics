import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { BookOpen, LogOut } from 'lucide-react';

export function StudentDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Dashboard</h1>
          <p className="text-slate-500 mt-2">Welcome back, {user?.displayName}!</p>
        </div>
        <Button variant="outline" onClick={logout} className="gap-2">
          <LogOut className="w-4 h-4" /> Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <GlassCard className="md:col-span-2">
          <h2 className="text-xl font-bold text-slate-900 mb-4">My Courses</h2>
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <BookOpen className="w-12 h-12 mb-4 text-slate-300" />
            <p>You haven't enrolled in any courses yet.</p>
            <Button className="mt-4">Browse Courses</Button>
          </div>
        </GlassCard>

        <div className="space-y-8">
          <GlassCard>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Upcoming Classes</h2>
            <p className="text-slate-500 text-sm">No upcoming classes.</p>
          </GlassCard>
          
          <GlassCard>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Results</h2>
            <p className="text-slate-500 text-sm">No recent results.</p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
