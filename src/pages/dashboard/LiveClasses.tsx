import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Video, ExternalLink, PlayCircle, Clock, Shield, Lock, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { safeJson } from '../../utils/api';

const LiveClasses = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleJoinClass = async (lc: any, method: 'app' | 'web' = 'app') => {
    try {
      await fetch('/api/attendance/mark-present', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          batch_id: lc.batch_id,
          date: new Date().toLocaleDateString('en-CA'),
          type: 'class'
        })
      });
    } catch (e) {
      console.error('Error marking attendance:', e);
    }
    
    if (method === 'web') {
      navigate(`/dashboard/zoom/${lc.id}`);
    } else {
      window.open(lc.zoom_link, '_blank');
    }
  };

  const fetchData = async () => {
    try {
      const [liveRes, enrollRes, profileRes, coursesRes] = await Promise.all([
        fetch('/api/live-classes', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/my-enrollments', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/my-profile', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/courses', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      let userData: any = null;
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        userData = profileData.user;
      }

      if (liveRes.ok && enrollRes.ok && coursesRes.ok) {
        const liveData = await liveRes.json();
        const enrollData = await enrollRes.json();
        const coursesData = await coursesRes.json();
        
        const activeEnrollments = enrollData.filter((e: any) => e.status === 'contacted' || e.status === 'approved');
        const userEnrolledCourseIds = userData?.enrolled_courses?.map((c: any) => c.id) || [];
        
        // Filter live classes based on enrollment
        const filtered = liveData.filter((lc: any) => {
          // If admin selected a specific course
          if (lc.course_id) {
            const isEnrolledInCourse = activeEnrollments.some((e: any) => e.course_id === lc.course_id) || 
                                     userEnrolledCourseIds.includes(lc.course_id);
            return isEnrolledInCourse;
          }
          // If no course_id, it might be for everyone or specific batch
          if (lc.batch_id) {
            return userData?.batch_id === lc.batch_id || userData?.batch_id_2 === lc.batch_id;
          }
          return true;
        }).map((lc: any) => ({
          ...lc,
          course_name: coursesData.find((c: any) => c.id === lc.course_id)?.title || 'General Class'
        }));

        setLiveClasses(filtered);
      }
    } catch (error) {
      console.error('Error fetching live classes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Poll every 10 seconds for "automatic start"
    return () => clearInterval(interval);
  }, [token]);

  if (loading && liveClasses.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-xl">
              <Video className="h-6 w-6 text-orange-600" />
            </div>
            Live Zoom Classes
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">Join your ongoing live sessions directly via the Zoom app.</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 shadow-lg shadow-emerald-100/20">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          System Online
        </div>
      </div>

      <AnimatePresence mode="wait">
        {liveClasses.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {liveClasses.map((lc) => (
              <motion.div 
                key={lc.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-8 rounded-[2.5rem] border border-white/60 shadow-xl bg-white/40 hover:bg-white/60 transition-all duration-500 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-orange-500/10 transition-colors" />
                
                <div className="flex flex-col h-full relative z-10">
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-5">
                      <div className="bg-orange-600 p-4 rounded-2xl shadow-xl shadow-orange-200 group-hover:scale-110 transition-transform duration-500">
                        <Video className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-orange-600 transition-colors">{lc.title}</h3>
                        <p className="text-[10px] text-orange-500 font-black uppercase tracking-widest mt-1">{lc.course_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-red-500 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-100 animate-pulse">
                      Live Now
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                    <div className="bg-white/40 p-5 rounded-2xl border border-white/60 shadow-inner">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Meeting ID</p>
                      <p className="font-mono text-base font-black text-slate-800 tracking-tight">{lc.zoom_id || 'N/A'}</p>
                    </div>
                    <div className="bg-white/40 p-5 rounded-2xl border border-white/60 shadow-inner">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Passcode</p>
                      <p className="font-mono text-base font-black text-slate-800 tracking-tight">{lc.zoom_password || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <button 
                      onClick={() => navigate(`/dashboard/zoom/${lc.id}`)}
                      className="w-full bg-orange-600 text-white px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-orange-700 transition-all shadow-xl shadow-orange-200 active:scale-95"
                    >
                      <Video className="h-5 w-5" />
                      Join Live Class
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-16 rounded-[3rem] border border-white/60 shadow-xl bg-white/40 text-center max-w-2xl mx-auto"
          >
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Video className="h-12 w-12 text-slate-200" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">No Active Sessions</h2>
            <p className="text-slate-500 text-lg mb-10 font-medium leading-relaxed">
              There are no live classes currently active for your enrolled courses. 
              Once an instructor starts a session, it will automatically appear here.
            </p>
            <div className="flex flex-col items-center gap-6">
              <div className="flex items-center gap-3 text-xs font-black text-orange-600 bg-orange-50 px-8 py-4 rounded-2xl border border-orange-100 shadow-lg shadow-orange-100/20">
                <Clock className="h-4 w-4 animate-spin-slow" />
                Waiting for Instructor...
              </div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">The portal polls for new sessions every 10 seconds.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
        <div className="glass p-8 rounded-[2.5rem] border border-white/60 shadow-xl bg-white/40 hover:bg-white/60 transition-all">
          <div className="p-4 bg-emerald-100 rounded-2xl text-emerald-600 w-fit mb-6 shadow-lg shadow-emerald-100">
            <Shield className="h-8 w-8" />
          </div>
          <h4 className="font-black text-slate-900 mb-3 text-lg tracking-tight">Verified Access</h4>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">Only enrolled students can see the Zoom credentials for their specific courses.</p>
        </div>
        <div className="glass p-8 rounded-[2.5rem] border border-white/60 shadow-xl bg-white/40 hover:bg-white/60 transition-all">
          <div className="p-4 bg-orange-100 rounded-2xl text-orange-600 w-fit mb-6 shadow-lg shadow-orange-100">
            <Lock className="h-8 w-8" />
          </div>
          <h4 className="font-black text-slate-900 mb-3 text-lg tracking-tight">Secure Meetings</h4>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">All sessions are protected with unique meeting IDs and passcodes for your safety.</p>
        </div>
        <div className="glass p-8 rounded-[2.5rem] border border-white/60 shadow-xl bg-white/40 hover:bg-white/60 transition-all">
          <div className="p-4 bg-blue-100 rounded-2xl text-blue-600 w-fit mb-6 shadow-lg shadow-blue-100">
            <Video className="h-8 w-8" />
          </div>
          <h4 className="font-black text-slate-900 mb-3 text-lg tracking-tight">Zoom Optimized</h4>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">Using the Zoom app directly ensures the best audio/video quality and lowest lag.</p>
        </div>
      </div>
    </div>
  );
};

export default LiveClasses;
