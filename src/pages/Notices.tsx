import { safeJson } from '../utils/api';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, FileText, AlertCircle, Loader, Calendar, CheckCircle2, X, ArrowRight } from 'lucide-react';

const Notices = () => {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'academic' | 'online'>('all');

  const filteredNotices = notices.filter(notice => {
    if (activeTab === 'all') return true;
    const audience = notice.target_audience?.toLowerCase();
    if (activeTab === 'academic') return audience === 'academic' || audience === 'offline';
    return audience === 'online';
  });

  useEffect(() => {
    if (selectedNotice) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    };
  }, [selectedNotice]);

  useEffect(() => {
    fetch('/api/public/notices')
      .then(res => safeJson(res))
      .then(data => {
        if (Array.isArray(data)) {
          setNotices(data);
        } else {
          setNotices([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setNotices([]);
        setLoading(false);
      });
  }, []);

  const formatDate = (dateValue: any, options?: Intl.DateTimeFormatOptions) => {
    const defaultOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    const opts = options || defaultOptions;
    if (!dateValue) return new Date().toLocaleDateString('en-US', opts);
    try {
      if (dateValue.seconds) {
        return new Date(dateValue.seconds * 1000).toLocaleDateString('en-US', opts);
      }
      const d = new Date(dateValue);
      if (isNaN(d.getTime())) return new Date().toLocaleDateString('en-US', opts);
      return d.toLocaleDateString('en-US', opts);
    } catch (e) {
      return new Date().toLocaleDateString('en-US', opts);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-12 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="section-title">Notice Board</h1>
          <p className="section-subtitle">
            Important announcements and updates for students.
          </p>
        </motion.div>

        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('all')}
            className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${
              activeTab === 'all' ? 'bg-orange-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-orange-50'
            }`}
          >
            All Notices
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('academic')}
            className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${
              activeTab === 'academic' ? 'bg-orange-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-orange-50'
            }`}
          >
            Academic Students
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('online')}
            className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${
              activeTab === 'online' ? 'bg-orange-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-orange-50'
            }`}
          >
            Online Students
          </motion.button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            [1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-lg h-64 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
                <div className="h-6 bg-slate-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-2/3"></div>
              </div>
            ))
          ) : filteredNotices.length === 0 ? (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center text-slate-500 py-20"
            >
              No notices found.
            </motion.p>
          ) : (
            filteredNotices.map((notice, index) => (
              <motion.div 
                key={notice.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-white shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full cursor-pointer group"
                onClick={() => setSelectedNotice(notice)}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(notice.date || notice.created_at)}
                  </span>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-50 text-orange-600">
                      Notice
                    </span>
                    {notice.target_audience && notice.target_audience !== 'all' && (
                      <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600">
                        {notice.target_audience.toLowerCase() === 'offline' ? 'Academic' : notice.target_audience}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    {notice.is_verified && (
                      <span className="flex items-center gap-1 text-blue-600 font-bold text-[10px] bg-blue-50 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="h-3 w-3 fill-blue-600 text-white" />
                        Verified
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                    {notice.title}
                  </h3>

                  <p className="text-sm text-slate-600 mb-4 flex-grow line-clamp-3">
                    {notice.content}
                  </p>

                  <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">By {notice.admin_name || 'Admin'}</span>
                    <div className="flex items-center gap-1 text-orange-600 font-bold text-xs group-hover:translate-x-1 transition-transform">
                      Read More <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Notice Modal */}
      <AnimatePresence>
        {selectedNotice && (
          <div 
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedNotice(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white/90 backdrop-blur-xl w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col border border-white/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-orange-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
                    <Bell className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">Notice Details</h2>
                </div>
                <button onClick={() => setSelectedNotice(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="h-6 w-6 text-slate-400" />
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto space-y-6">
                <div className="flex items-center gap-4 text-sm font-bold text-slate-400 uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(selectedNotice.date || selectedNotice.created_at, { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                  {selectedNotice.is_verified && (
                    <div className="flex items-center gap-1 text-blue-600">
                      <CheckCircle2 className="h-4 w-4 fill-blue-600 text-white" />
                      Verified
                    </div>
                  )}
                </div>

                <h3 className="text-3xl font-black text-slate-900 leading-tight">
                  {selectedNotice.title}
                </h3>

                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-wrap">
                    {selectedNotice.content}
                  </p>
                </div>

                {selectedNotice.attachment_url && (
                  <div className="pt-6 border-t border-slate-100">
                    <motion.a 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      href={selectedNotice.attachment_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                    >
                      <FileText className="h-5 w-5" /> View Attachment
                    </motion.a>
                  </div>
                )}
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                    {(selectedNotice.admin_name || 'A')[0]}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{selectedNotice.admin_name || 'Administrator'}</div>
                    <div className="text-xs text-slate-500">Official Announcement</div>
                  </div>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedNotice(null)}
                  className="bg-white border border-slate-200 text-slate-600 px-6 py-2 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notices;
