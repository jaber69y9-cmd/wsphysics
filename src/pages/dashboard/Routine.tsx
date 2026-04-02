import { safeJson } from '../../utils/api';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Download, X, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Routine = () => {
  const { token, user } = useAuth();
  const [routines, setRoutines] = useState<any[]>([]);
  const [selectedRoutine, setSelectedRoutine] = useState<string | null>(null);

  useEffect(() => {
    fetchRoutines();
  }, [token, user?.batch_id]);

  const fetchRoutines = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/routines', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await safeJson(res);
        if (Array.isArray(data)) {
          // Filter for student's batch or 'all'
          const filtered = data.filter((r: any) => r.batch_id === 'all' || r.batch_id == user?.batch_id);
          setRoutines(filtered);
        }
      }
    } catch (error) {
      console.error('Failed to fetch routines:', error);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Calendar className="h-8 w-8 text-orange-600" />
            Class Routine
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Stay updated with your class schedules and timing.</p>
        </div>
        <div className="glass px-6 py-3 rounded-2xl border border-white/60 shadow-xl flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <span className="text-slate-700 font-black text-sm uppercase tracking-widest">
            {routines.length} Routine{routines.length !== 1 ? 's' : ''} Active
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {routines.map((routine) => (
          <motion.div 
            key={routine.id} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-[3rem] shadow-2xl border border-white/60 overflow-hidden group hover:shadow-orange-500/10 transition-all duration-500"
          >
            <div className="relative aspect-[16/10] overflow-hidden m-4 rounded-[2.5rem] shadow-xl">
              <img 
                src={routine.image_url} 
                alt="Class Routine" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center p-8">
                <button 
                  onClick={() => setSelectedRoutine(routine.image_url)}
                  className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-2xl hover:scale-105 active:scale-95 transition-all"
                >
                  <Maximize2 className="h-5 w-5" /> View Full Size
                </button>
              </div>
            </div>
            
            <div className="p-10 pt-4">
              <div className="flex justify-between items-center mb-6">
                <span className="bg-orange-100 text-orange-700 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm border border-orange-200">
                  {routine.batch_id === 'all' ? 'All Batches' : 'Your Batch'}
                </span>
                <span className="text-slate-400 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(routine.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              
              {routine.content && (
                <p className="text-slate-600 leading-relaxed font-medium text-lg mb-8">{routine.content}</p>
              )}
              
              <div className="pt-8 border-t border-slate-100">
                <a 
                  href={routine.image_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-orange-600 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl shadow-slate-900/20"
                  download
                >
                  <Download className="h-5 w-5" /> Download Routine
                </a>
              </div>
            </div>
          </motion.div>
        ))}
        
        {routines.length === 0 && (
          <div className="col-span-full text-center py-40 glass rounded-[4rem] border border-dashed border-white/60 shadow-inner">
            <div className="bg-slate-50 w-32 h-32 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Calendar className="h-16 w-16 text-slate-200" />
            </div>
            <p className="text-slate-400 text-3xl font-black tracking-tight">No routines published yet.</p>
            <p className="text-slate-400 mt-2 font-medium text-lg">Check back later for updates.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedRoutine && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/95 backdrop-blur-xl"
            onClick={() => setSelectedRoutine(null)}
          >
            <button 
              onClick={() => setSelectedRoutine(null)}
              className="absolute top-10 right-10 text-white hover:rotate-90 transition-transform duration-500 bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/20"
            >
              <X className="h-8 w-8" />
            </button>
            <motion.div
              initial={{ scale: 0.9, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 40 }}
              className="relative max-w-5xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={selectedRoutine} 
                alt="Routine Full Size" 
                className="w-full h-auto rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] border-4 border-white/20"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Routine;
