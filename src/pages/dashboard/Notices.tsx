import { safeJson } from '../../utils/api';
import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { Bell, Calendar, Trash2, Download } from 'lucide-react';
import { showConfirm } from '../../utils/alert';

const Notices = () => {
  const { token, user } = useAuth();
  const [notices, setNotices] = useState<any[]>([]);

  useEffect(() => {
    fetchNotices();
  }, [token]);

  const fetchNotices = async () => {
    const res = await fetch('/api/notices', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await safeJson(res);
    if (Array.isArray(data)) {
      if (user?.role === 'student') {
        setNotices(data.filter((n: any) => n.target_audience === 'all' || !n.target_audience || n.target_audience === user.student_type));
      } else {
        setNotices(data);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (await showConfirm('Are you sure you want to delete this notice?')) {
      const res = await fetch(`/api/notices/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchNotices();
      }
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-xl">
              <Bell className="h-6 w-6 text-orange-600" />
            </div>
            Notices
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">Stay updated with the latest announcements and news.</p>
        </div>
        <div className="bg-orange-50 px-5 py-2.5 rounded-2xl text-orange-600 font-black text-[10px] uppercase tracking-widest border border-orange-100 shadow-lg shadow-orange-100/20">
          {notices.length} Active Notices
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {notices.length === 0 ? (
          <div className="col-span-full glass p-16 rounded-[2.5rem] border border-white/60 shadow-xl bg-white/40 text-center">
            <div className="max-w-xs mx-auto">
              <div className="p-6 bg-slate-50 rounded-full inline-block mb-4 shadow-inner">
                <Bell className="h-12 w-12 text-slate-200" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">No Notices Found</h3>
              <p className="text-slate-500 font-medium">We'll notify you when there's something new to share.</p>
            </div>
          </div>
        ) : (
          notices.map((notice) => (
            <motion.div 
              key={notice.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-8 rounded-[2.5rem] border border-white/60 shadow-xl bg-white/40 hover:bg-white/60 transition-all duration-500 flex flex-col h-full group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-orange-500/10 transition-colors"></div>

              <div className="flex items-center justify-between mb-6 relative z-10">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(notice.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-orange-50 text-orange-600 border border-orange-100 flex items-center gap-1.5">
                    <Bell className="h-3 w-3" />
                    Notice
                  </span>
                  {notice.target_audience && notice.target_audience !== 'all' && (
                    <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100">
                      {notice.target_audience === 'offline' ? 'Academic' : notice.target_audience}
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-3 line-clamp-2 tracking-tight group-hover:text-orange-600 transition-colors relative z-10">
                {notice.title}
              </h3>
              
              <p className="text-sm text-slate-600 mb-8 flex-grow line-clamp-4 font-medium leading-relaxed relative z-10">
                {notice.content}
              </p>

              <div className="mt-auto pt-6 border-t border-white/60 flex items-center justify-between relative z-10">
                {notice.admin_name && (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500">
                      {notice.admin_name.charAt(0)}
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      {notice.admin_name}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 ml-auto">
                  {notice.attachment_url && (
                    <a 
                      href={notice.attachment_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-orange-600 text-white p-2.5 rounded-xl transition-all shadow-lg shadow-orange-100 hover:scale-110 active:scale-95"
                      title="Download Attachment"
                      download
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  )}
                  {user?.role === 'admin' && (
                    <button 
                      onClick={() => handleDelete(notice.id)}
                      className="bg-red-500 text-white p-2.5 rounded-xl transition-all shadow-lg shadow-red-100 hover:scale-110 active:scale-95"
                      title="Delete Notice"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notices;
