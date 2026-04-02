import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { motion } from 'framer-motion';
import { Users, Video, FileText, CreditCard, TrendingUp } from 'lucide-react';

export function Dashboard() {
  const [stats, setStats] = useState({
    students: 0,
    classes: 0,
    exams: 0,
    payments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [studentsSnap, classesSnap, examsSnap, paymentsSnap] = await Promise.all([
          getDocs(collection(db, 'students')),
          getDocs(collection(db, 'liveClasses')),
          getDocs(collection(db, 'exams')),
          getDocs(collection(db, 'payments'))
        ]);

        setStats({
          students: studentsSnap.size,
          classes: classesSnap.size,
          exams: examsSnap.size,
          payments: paymentsSnap.docs.reduce((acc, doc) => acc + (doc.data().amount || 0), 0)
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Students', value: stats.students, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Live Classes', value: stats.classes, icon: Video, color: 'text-orange-600', bg: 'bg-orange-100' },
    { title: 'Exams Conducted', value: stats.exams, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-100' },
    { title: 'Total Revenue', value: `৳${stats.payments.toLocaleString()}`, icon: CreditCard, color: 'text-green-600', bg: 'bg-green-100' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500 mt-2">Welcome back! Here's what's happening today.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <GlassCard key={i} className="h-32 animate-pulse bg-slate-200/50" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <GlassCard className="flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
                  <stat.icon className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">{stat.title}</p>
                  <p className="text-2xl font-extrabold text-slate-900">{stat.value}</p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <GlassCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <TrendingUp className="w-12 h-12 mb-4 text-slate-300" />
            <p>Activity chart will appear here</p>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Upcoming Classes</h2>
          </div>
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <Video className="w-12 h-12 mb-4 text-slate-300" />
            <p>No upcoming classes today</p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
