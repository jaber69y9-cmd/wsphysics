import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Video, ExternalLink, Calendar, Clock, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { safeJson } from '../../utils/api';

const ZoomClasses = () => {
  const { token, user } = useAuth();
  const [liveClasses, setLiveClasses] = useState<any[]>([]);

  useEffect(() => {
    fetchLiveClasses();
  }, [token]);

  const fetchLiveClasses = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/live-classes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await safeJson(res);
        if (Array.isArray(data)) {
          // Filter by active status and student's enrolled courses if online student
          const activeClasses = data.filter((lc: any) => lc.status === 'active');
          
          if (user?.student_type === 'online') {
            const enrolledCourseIds = user?.enrolled_courses ? user.enrolled_courses.map((c: any) => c.id) : [];
            const filtered = activeClasses.filter((lc: any) => 
              !lc.course_id || enrolledCourseIds.includes(lc.course_id)
            );
            setLiveClasses(filtered);
          } else {
            setLiveClasses(activeClasses);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch live classes:', error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-orange-600 tracking-tight">
          Zoom Live Classes
        </h1>
        {user?.student_type === 'online' && (
          <div className="bg-orange-50 px-4 py-2 rounded-full text-orange-600 font-bold text-sm border border-orange-100">
            {liveClasses.length} Active Classes
          </div>
        )}
      </div>

      {user?.student_type !== 'online' ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
          <Video className="h-16 w-16 text-slate-200 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Online Students Only</h2>
          <p className="text-slate-500 text-lg font-medium max-w-md mx-auto">
            Zoom live classes are exclusively available for students enrolled in our online programs.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {liveClasses.map((lc) => (
            <motion.div 
              key={lc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500 opacity-50"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <Video className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">{lc.title}</h3>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">{lc.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">{lc.time}</span>
                  </div>
                  {lc.zoom_id && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Lock className="h-4 w-4" />
                      <span className="text-sm font-medium">Meeting ID: <span className="text-slate-900 font-bold">{lc.zoom_id}</span></span>
                    </div>
                  )}
                  {lc.zoom_password && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Lock className="h-4 w-4" />
                      <span className="text-sm font-medium">Passcode: <span className="text-slate-900 font-bold">{lc.zoom_password}</span></span>
                    </div>
                  )}
                </div>

                <a 
                  href={lc.url || lc.zoom_link || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-200"
                >
                  Join Class Now <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </motion.div>
          ))}

          {liveClasses.length === 0 && (
            <div className="md:col-span-2 text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
              <Video className="h-16 w-16 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 text-xl font-medium">No live classes scheduled at the moment.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ZoomClasses;
