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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">
          Notices
        </h1>
        <div className="bg-orange-50 px-3 py-1 rounded-full text-orange-600 font-bold text-xs border border-orange-100">
          {notices.length} Notices
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notices.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500">
            No notices found.
          </div>
        ) : (
          notices.map((notice) => (
            <motion.div 
              key={notice.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(notice.date).toLocaleDateString()}
                </span>
                <div className="flex gap-2">
                  <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-50 text-orange-600 flex items-center gap-1">
                    <Bell className="h-3 w-3" />
                    Notice
                  </span>
                  {notice.target_audience && notice.target_audience !== 'all' && (
                    <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600">
                      {notice.target_audience}
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2">
                {notice.title}
              </h3>
              
              <p className="text-sm text-slate-600 mb-4 flex-grow line-clamp-3">
                {notice.content}
              </p>

              <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                {notice.admin_name && (
                  <span className="text-xs font-bold text-slate-500">
                    By: {notice.admin_name}
                  </span>
                )}
                
                <div className="flex items-center gap-2 ml-auto">
                  {notice.attachment_url && (
                    <a 
                      href={notice.attachment_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-orange-50 hover:bg-orange-100 text-orange-600 p-2 rounded-lg transition-colors"
                      title="Download Attachment"
                      download
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  )}
                  {user?.role === 'admin' && (
                    <button 
                      onClick={() => handleDelete(notice.id)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition-colors"
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
