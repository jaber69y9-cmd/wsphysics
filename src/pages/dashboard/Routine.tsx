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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-orange-600 tracking-tight">Class Routine</h1>
        <div className="bg-orange-50 px-4 py-2 rounded-full text-orange-600 font-bold text-sm border border-orange-100">
          {routines.length} Routine{routines.length !== 1 ? 's' : ''} Published
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {routines.map((routine) => (
          <motion.div 
            key={routine.id} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden group hover:shadow-2xl transition-all duration-500"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <img 
                src={routine.image_url} 
                alt="Class Routine" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                <button 
                  onClick={() => setSelectedRoutine(routine.image_url)}
                  className="bg-white/90 backdrop-blur text-slate-900 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:bg-white transition-colors"
                >
                  <Maximize2 className="h-5 w-5" /> View Full Size
                </button>
              </div>
            </div>
            
            <div className="p-8">
              <div className="flex justify-between items-center mb-4">
                <span className="bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                  {routine.batch_id === 'all' ? 'All Batches' : 'Your Batch'}
                </span>
                <span className="text-slate-400 text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(routine.created_at).toLocaleDateString()}
                </span>
              </div>
              {routine.content && (
                <p className="text-slate-600 leading-relaxed font-medium">{routine.content}</p>
              )}
              <div className="mt-6 pt-6 border-t border-slate-50">
                <a 
                  href={routine.image_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-orange-600 transition-all duration-300 shadow-lg shadow-slate-200"
                  download
                >
                  <Download className="h-5 w-5" /> Download Routine
                </a>
              </div>
            </div>
          </motion.div>
        ))}
        
        {routines.length === 0 && (
          <div className="col-span-full text-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200 shadow-inner">
            <Calendar className="h-24 w-24 text-slate-200 mx-auto mb-8" />
            <p className="text-slate-400 text-3xl font-black tracking-tight">No routines published yet.</p>
            <p className="text-slate-400 mt-2 font-medium">Check back later for updates.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedRoutine && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md"
            onClick={() => setSelectedRoutine(null)}
          >
            <button 
              onClick={() => setSelectedRoutine(null)}
              className="absolute top-8 right-8 text-white hover:rotate-90 transition-transform duration-300"
            >
              <X className="h-10 w-10" />
            </button>
            <motion.img 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              src={selectedRoutine} 
              alt="Routine Full Size" 
              className="max-w-full max-h-full rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              referrerPolicy="no-referrer"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Routine;
