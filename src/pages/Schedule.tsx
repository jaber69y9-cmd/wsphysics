import { safeJson } from '../utils/api';
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, MapPin, Loader } from 'lucide-react';

const Schedule = () => {
  const [batches, setBatches] = useState<any[]>([]);
  const [webSchedules, setWebSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/batches').then(res => res.ok ? safeJson(res) : []),
      fetch('/api/web-class-schedules').then(res => res.ok ? safeJson(res) : [])
    ]).then(([batchesData, webSchedulesData]) => {
      setBatches(Array.isArray(batchesData) ? batchesData : []);
      setWebSchedules(Array.isArray(webSchedulesData) ? webSchedulesData : []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pt-12 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="section-title">Class Schedule</h1>
          <p className="section-subtitle">
            Weekly routine for all batches. Please check your specific batch timing and location.
          </p>
        </motion.div>

        <div className="space-y-24">
          {/* Web Class Schedules (Images) */}
          {webSchedules.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {webSchedules.map((sch) => (
                <motion.div 
                  key={sch.id}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/80 backdrop-blur-sm p-6 rounded-[2.5rem] shadow-xl border border-white overflow-hidden group"
                >
                  <h3 className="text-2xl font-bold text-slate-800 mb-6 px-4">{sch.title}</h3>
                  <div className="relative group">
                    <img 
                      src={sch.image_url} 
                      alt={sch.title} 
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                      className="w-full rounded-2xl shadow-inner" 
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                      <motion.a 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href={sch.image_url} 
                        download={`schedule-${sch.title}.jpg`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white text-orange-600 px-6 py-3 rounded-xl font-bold hover:bg-orange-50 transition-colors flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Download Schedule
                      </motion.a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Group schedules by category (e.g., HSC 26) */}
          {Array.from(new Set(batches.map(b => b.class))).sort().map((category) => (
            <div key={category} className="space-y-8">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-4"
              >
                <div className="w-1.5 h-10 bg-orange-600 rounded-full shadow-lg shadow-orange-900/20" />
                <h2 className="text-3xl font-bold text-orange-600 tracking-tight">{category || 'General Batches'}</h2>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white/80 backdrop-blur-sm rounded-[2.5rem] shadow-2xl overflow-hidden border border-white"
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-orange-600 text-white">
                        <th className="p-8 font-bold text-xl tracking-wide">Batch</th>
                        <th className="p-8 font-bold text-xl tracking-wide">Time</th>
                        <th className="p-8 font-bold text-xl tracking-wide">Location</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {batches.filter(b => b.class === category).map((batch, idx) => (
                        <tr key={batch.id} className="hover:bg-slate-50/80 transition-all duration-300 group">
                          <td className="p-8">
                            <div className="flex items-center gap-4">
                              <div className="w-2.5 h-2.5 rounded-full bg-orange-600/20 group-hover:bg-orange-600 group-hover:scale-125 transition-all duration-300" />
                              <span className="font-bold text-slate-700 text-lg">{batch.days || batch.name}</span>
                            </div>
                          </td>
                          <td className="p-8">
                            <div className="flex items-center gap-4 text-slate-600">
                              <div className="bg-orange-50 p-2.5 rounded-xl group-hover:bg-orange-100 transition-colors">
                                <Clock className="h-6 w-6 text-orange-600" />
                              </div>
                              <span className="text-lg font-medium">{batch.schedule || 'TBD'}</span>
                            </div>
                          </td>
                          <td className="p-8">
                            <div className="flex items-center gap-4 text-slate-600">
                              <div className="bg-orange-50 p-2.5 rounded-xl group-hover:bg-orange-100 transition-colors">
                                <MapPin className="h-6 w-6 text-orange-600" />
                              </div>
                              <span className="text-lg font-medium">{batch.location || 'Main Campus'}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </div>
          ))}

          {batches.length === 0 && webSchedules.length === 0 && (
            <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-slate-200 shadow-inner">
              <Calendar className="h-20 w-20 text-slate-200 mx-auto mb-6" />
              <p className="text-slate-400 text-2xl font-medium">No schedules available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Schedule;
