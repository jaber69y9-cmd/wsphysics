import LoadingSpinner from '../components/LoadingSpinner';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Bell, Calendar, CheckCircle, Award, BookOpen, FileText, PlayCircle, ArrowRight, ExternalLink, Video, Download, GraduationCap, Tag, Phone, User
} from 'lucide-react';

interface DashboardData {
  user: any;
  attendance: any[];
  payments: any[];
  results: any[];
  batch: any;
}

const Dashboard = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [notices, setNotices] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [studyMaterials, setStudyMaterials] = useState<any[]>([]);
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); // Poll every 15 seconds on dashboard
    return () => clearInterval(interval);
  }, [token]);

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
      window.open(lc.url || lc.zoom_link, '_blank');
    }
  };

  const fetchData = async () => {
    try {
      const [profileRes, noticesRes, chaptersRes, examsRes, enrollRes, materialsRes, liveRes] = await Promise.all([
        fetch('/api/my-profile', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/notices', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/chapters', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/exams', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/my-enrollments', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/study-materials/my', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/live-classes', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (profileRes.ok) {
        const userData = await profileRes.json();
        
        // Sort by date descending
        if (userData.attendance) {
          userData.attendance.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }
        
        setData(userData);
      }

      if (noticesRes.ok) {
        const data = await noticesRes.json();
        setNotices(Array.isArray(data) ? data : []);
      }
      if (chaptersRes.ok) {
        const data = await chaptersRes.json();
        setChapters(Array.isArray(data) ? data : []);
      }
      if (examsRes.ok) {
        const data = await examsRes.json();
        setExams(Array.isArray(data) ? data : []);
      }
      if (enrollRes.ok) {
        const data = await enrollRes.json();
        setEnrollments(Array.isArray(data) ? data : []);
      }
      if (materialsRes.ok) {
        const data = await materialsRes.json();
        setStudyMaterials(Array.isArray(data) ? data : []);
      }
      if (liveRes.ok) {
        const data = await liveRes.json();
        setLiveClasses(Array.isArray(data) ? data : []);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Live Classes Section */}
        {liveClasses.filter(lc => {
          if (data.user.student_type !== 'online') return false;
          // If it's an online class, check if student is enrolled in the course
          if (lc.course_id) {
            const inEnrollments = enrollments.some(e => e.course_id === lc.course_id && e.status === 'contacted');
            const inUserCourses = data.user.enrolled_courses?.some((c: any) => c.id === lc.course_id);
            return inEnrollments || inUserCourses;
          }
          return true; // Fallback for general online classes
        }).length > 0 && (
          <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-3xl p-6 text-white shadow-xl shadow-orange-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm animate-pulse">
                  <PlayCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Live Classes Active</h3>
                  <p className="text-orange-100 text-sm">Join your ongoing live session now</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveClasses.filter(lc => {
                if (data.user.student_type !== 'online') return false;
                if (lc.course_id) {
                  const inEnrollments = enrollments.some(e => e.course_id === lc.course_id && e.status === 'contacted');
                  const inUserCourses = data.user.enrolled_courses?.some((c: any) => c.id === lc.course_id);
                  return inEnrollments || inUserCourses;
                }
                return true;
              }).map((lc) => (
                <div key={lc.id} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-lg">{lc.title}</h4>
                      <p className="text-xs text-orange-100 uppercase tracking-wider font-bold">
                        {lc.zoom_link?.includes('meet.jit.si') ? 'Jitsi Live Session' : 'Zoom Live Session'}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => navigate(`/dashboard/zoom/${lc.id}`)}
                        className="bg-orange-600 text-white border border-white/30 px-8 py-3 rounded-2xl font-bold hover:bg-orange-500 transition-colors shadow-lg text-sm flex items-center gap-2"
                      >
                        <Video className="h-5 w-5" />
                        Join Live Class
                      </button>
                    </div>
                  </div>
                  
                  {(lc.zoom_id || lc.zoom_password) && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                      {lc.zoom_id && (
                        <div className="bg-white/5 p-2 rounded-lg">
                          <p className="text-[10px] text-orange-100 uppercase font-bold">Meeting ID</p>
                          <p className="font-mono text-sm">{lc.zoom_id}</p>
                        </div>
                      )}
                      {lc.zoom_password && (
                        <div className="bg-white/5 p-2 rounded-lg">
                          <p className="text-[10px] text-orange-100 uppercase font-bold">Passcode</p>
                          <p className="font-mono text-sm">{lc.zoom_password}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Welcome Banner */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="glass p-10 rounded-[3rem] shadow-2xl border border-white/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative overflow-hidden bg-white/40"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full -mr-48 -mt-48 blur-3xl" />
          
          <div className="relative z-10">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">
              Welcome back, <span className="text-orange-600">{data.user.name.split(' ')[0]}!</span>
            </h1>
            <p className="text-slate-500 text-lg font-medium flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-orange-500" />
              You are currently enrolled in <span className="text-slate-900 font-black tracking-tight">
                {data.user?.student_type === 'online' 
                  ? (data.user.enrolled_courses?.[0]?.title || 'No Course') 
                  : (data.batch?.name || data.user.program_title || 'No Batch')}
              </span>
            </p>
          </div>
          
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
            {data.batch?.live_class_link && (
              <motion.a 
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                href={data.batch.live_class_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-orange-600 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-2xl shadow-orange-600/30 transition-all"
              >
                <PlayCircle className="h-6 w-6" />
                JOIN LIVE CLASS
              </motion.a>
            )}
            <div className="glass px-8 py-5 rounded-[2.5rem] border border-white/60 flex items-center gap-6 shadow-xl bg-white/40">
              <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Today's Status</p>
                {(() => {
                  const today = new Date().toLocaleDateString('en-CA');
                  const todayRecord = (data.attendance || []).find(a => a.date === today && a.type !== 'exam');
                  
                  const isClassDay = () => {
                    if (data.user?.student_type === 'online') return liveClasses.length > 0;
                    if (!data.user || !data.user.batch_days) return false;
                    const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                    const dayMapping: Record<string, string> = {
                      'Saturday': 'Sat', 'Sunday': 'Sun', 'Monday': 'Mon',
                      'Tuesday': 'Tue', 'Wednesday': 'Wed', 'Thursday': 'Thu', 'Friday': 'Fri'
                    };
                    return data.user.batch_days.includes(dayMapping[dayName] || '');
                  };

                  if (todayRecord) {
                    const isPresent = todayRecord.status === 'present';
                    return (
                      <div className="flex items-center gap-3">
                        <div className={`w-3.5 h-3.5 rounded-full ${isPresent ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]'}`} />
                        <span className={`text-2xl font-black tracking-tight ${isPresent ? 'text-green-600' : 'text-red-600'}`}>
                          {todayRecord.status.toUpperCase()}
                        </span>
                      </div>
                    );
                  } else if (isClassDay()) {
                    return (
                      <div className="flex items-center gap-3">
                        <div className="w-3.5 h-3.5 rounded-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-pulse" />
                        <span className="text-2xl font-black text-red-600 uppercase tracking-tight">ABSENT</span>
                      </div>
                    );
                  } else {
                    return (
                      <div className="flex items-center gap-3">
                        <div className="w-3.5 h-3.5 rounded-full bg-slate-300" />
                        <span className="text-2xl font-black text-slate-400 tracking-tight">No Class</span>
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        {data.user?.student_type !== 'online' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { label: 'Attendance', value: `${Math.round(((data.attendance || []).filter(a => a.status === 'present').length / ((data.attendance || []).length || 1)) * 100)}%`, color: 'orange' },
              { label: 'Total Paid', value: `৳${data.user.paid_amount || 0}`, color: 'green' },
              { label: 'Monthly Fee', value: `৳${data.user.monthly_fee || 0}`, color: 'orange' },
              { label: 'Exams', value: exams.length, color: 'orange' },
              { label: 'Chapters', value: chapters.length, color: 'slate' }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                className="glass p-6 rounded-[2rem] border border-white/60 shadow-xl transition-all bg-white/40"
              >
                <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">{stat.label}</div>
                <div className={`text-3xl font-black text-${stat.color}-600 tracking-tight`}>{stat.value}</div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Enrolled Programs & Courses */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-xl p-8"
          >
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-xl text-orange-600">
                <Award className="h-6 w-6" />
              </div>
              My Enrollments
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Academic Enrollment */}
              {data.user.student_type === 'offline' && data.batch && (
                <motion.div 
                  whileHover={{ y: -5, backgroundColor: '#fff' }}
                  className="p-8 bg-orange-50/50 rounded-[2.5rem] border border-orange-100 flex flex-col gap-6 transition-all shadow-xl shadow-orange-600/5"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-5">
                      <div className="bg-orange-600 p-4 rounded-2xl text-white shadow-2xl shadow-orange-600/30">
                        <GraduationCap className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-black text-2xl text-slate-900 tracking-tight">Academic Program</h4>
                        <p className="text-[10px] font-black uppercase tracking-widest text-orange-600 mt-1">
                          Batch: {data.batch.name}
                        </p>
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-green-100 text-green-600 shadow-lg shadow-green-100">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/60 shadow-sm">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Admission Fee</p>
                      <p className="text-xl font-black text-slate-900 tracking-tight">৳{data.user.admission_fee || 0}</p>
                    </div>
                    <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/60 shadow-sm">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Monthly Fee</p>
                      <p className="text-xl font-black text-slate-900 tracking-tight">৳{data.user.monthly_fee || 0}</p>
                    </div>
                    <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/60 shadow-sm">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Batch Days</p>
                      <p className="text-sm font-black text-slate-900 tracking-tight">{data.user.batch_days || 'N/A'}</p>
                    </div>
                    <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/60 shadow-sm">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Batch Time</p>
                      <p className="text-sm font-black text-slate-900 tracking-tight">{data.user.batch_time || 'N/A'}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Online Courses */}
              {data.user.student_type === 'online' && data.user.enrolled_courses && data.user.enrolled_courses.map((course: any, i: number) => (
                <motion.div 
                  key={`course-${i}`} 
                  whileHover={{ y: -5, backgroundColor: '#fff' }}
                  className="p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 flex flex-col gap-6 transition-all shadow-xl"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-5">
                      <div className="bg-orange-600 p-4 rounded-2xl text-white shadow-2xl shadow-orange-600/30">
                        <BookOpen className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-black text-2xl text-slate-900 tracking-tight">{course.title}</h4>
                        <p className="text-[10px] font-black uppercase tracking-widest text-orange-600 mt-1">Online Course</p>
                      </div>
                    </div>
                    <div className={`p-3 rounded-2xl shadow-lg ${course.status !== 'inactive' ? 'bg-green-100 text-green-600 shadow-green-100' : 'bg-slate-100 text-slate-300 shadow-slate-100'}`}>
                      <CheckCircle className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/60 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                    <p className="text-xl font-black text-slate-900 tracking-tight capitalize">{course.status || 'Active'}</p>
                  </div>
                </motion.div>
              ))}
              {/* Other Enrollments */}
              {enrollments.map((enroll, i) => (
                <motion.div 
                  key={`enroll-${i}`} 
                  whileHover={{ y: -5, backgroundColor: '#fff' }}
                  className="p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 flex flex-col gap-6 transition-all shadow-xl"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-5">
                      <div className="bg-slate-800 p-4 rounded-2xl text-white shadow-2xl">
                        <Tag className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-black text-2xl text-slate-900 tracking-tight">{enroll.program_title || enroll.course_title}</h4>
                        <p className="text-[10px] font-black uppercase tracking-widest text-orange-600 mt-1">Pending Enrollment</p>
                      </div>
                    </div>
                    <div className={`p-3 rounded-2xl shadow-lg ${enroll.status === 'contacted' ? 'bg-green-100 text-green-600 shadow-green-100' : 'bg-slate-100 text-slate-300 shadow-slate-100'}`}>
                      <CheckCircle className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/60 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Status</p>
                    <p className="text-xl font-black text-slate-900 tracking-tight capitalize">{enroll.status}</p>
                  </div>
                </motion.div>
              ))}
              {enrollments.length === 0 && (!data.user.enrolled_courses || data.user.enrolled_courses.length === 0) && (
                <div className="text-center py-10">
                  <BookOpen className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold">No enrollments found</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-xl p-8"
          >
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-xl text-orange-600">
                <PlayCircle className="h-6 w-6" />
              </div>
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 h-[calc(100%-4rem)]">
              <Link to="/dashboard/classes" className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center gap-3 hover:bg-orange-50 hover:border-orange-100 transition-all group shadow-sm hover:shadow-md">
                <PlayCircle className="h-8 w-8 text-orange-600 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-slate-700 text-sm">Recorded Classes</span>
              </Link>
              <Link to="/dashboard/materials" className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center gap-3 hover:bg-orange-50 hover:border-orange-100 transition-all group shadow-sm hover:shadow-md">
                <BookOpen className="h-8 w-8 text-orange-600 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-slate-700 text-sm">Study Materials</span>
              </Link>
              <Link to="/dashboard/routines" className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center gap-3 hover:bg-orange-50 hover:border-orange-100 transition-all group shadow-sm hover:shadow-md">
                <Calendar className="h-8 w-8 text-orange-600 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-slate-700 text-sm">Class Routine</span>
              </Link>
              <Link to="/dashboard/notices" className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center gap-3 hover:bg-orange-50 hover:border-orange-100 transition-all group shadow-sm hover:shadow-md">
                <Bell className="h-8 w-8 text-orange-600 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-slate-700 text-sm">Notices</span>
              </Link>
              <Link to="/dashboard/profile" className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center gap-3 hover:bg-orange-50 hover:border-orange-100 transition-all group shadow-sm hover:shadow-md">
                <User className="h-8 w-8 text-orange-600 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-slate-700 text-sm">My Profile</span>
              </Link>
              <Link to="/dashboard/enrollments" className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center gap-3 hover:bg-orange-50 hover:border-orange-100 transition-all group shadow-sm hover:shadow-md">
                <GraduationCap className="h-8 w-8 text-orange-600 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-slate-700 text-sm">Enrollments</span>
              </Link>
            </div>
          </motion.div>
        </div>
          <div className="glass rounded-[2.5rem] border border-white/60 shadow-xl p-8 lg:col-span-2 bg-white/40">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-xl text-orange-600 shadow-lg shadow-orange-100">
                  <Bell className="h-6 w-6" />
                </div>
                Recent Notices
              </h3>
              <Link to="/notices" className="text-xs font-black text-orange-600 hover:underline uppercase tracking-widest bg-orange-50 px-4 py-2 rounded-xl border border-orange-100">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {notices
                .filter((n: any) => n.target_audience === 'all' || !n.target_audience || n.target_audience === data.user.student_type)
                .slice(0, 3)
                .map((notice, i) => (
                <Link 
                  key={i} 
                  to="/notices"
                  className="glass rounded-[2rem] shadow-lg overflow-hidden border border-white/60 group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col bg-white/60"
                >
                  <div className="relative h-32 bg-gradient-to-br from-orange-500 to-orange-600 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:scale-110 transition-transform duration-700">
                      <Bell className="h-20 w-20 text-white" />
                    </div>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                    <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-black rounded-lg shadow-lg border border-white/30 uppercase tracking-widest">
                          Notice
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-white/90 text-[10px] font-black bg-black/20 px-2 py-1 rounded-lg backdrop-blur-sm uppercase tracking-widest">
                        <Calendar className="h-3 w-3" />
                        {new Date(notice.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-lg font-black text-slate-900 leading-tight mb-3 group-hover:text-orange-600 transition-colors line-clamp-2 tracking-tight">
                      {notice.title}
                    </h3>

                    <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed flex-1 font-medium">
                      {notice.content}
                    </p>

                    <div className="pt-5 mt-4 flex items-center justify-between border-t border-white/60">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Read Full</span>
                      <div className="flex items-center gap-1 text-orange-600 font-black text-[10px] uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                        Details <ArrowRight className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              {notices.length === 0 && (
                <div className="col-span-full text-center py-10 bg-white/20 rounded-3xl border border-dashed border-slate-200">
                  <Bell className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-400 font-black text-xs uppercase tracking-widest">No notices yet</p>
                </div>
              )}
            </div>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Recent Attendance */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-xl p-8"
          >
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-xl text-orange-600">
                <CheckCircle className="h-6 w-6" />
              </div>
              Recent Attendance
            </h3>
            <div className="space-y-4">
              {(data.attendance || []).slice(0, 5).map((record: any, i: number) => (
                <motion.div 
                  key={i} 
                  whileHover={{ x: 10, backgroundColor: '#fff' }}
                  className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 flex justify-between items-center transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${record.status === 'present' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]'}`} />
                    <div>
                      <h4 className="font-black text-slate-800">{new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</h4>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' })}</p>
                    </div>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    record.status === 'present' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {record.status}
                  </span>
                </motion.div>
              ))}
              {(data.attendance || []).length === 0 && (
                <div className="text-center py-10">
                  <Calendar className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold">No records found</p>
                </div>
              )}
              <Link to="/dashboard/attendance" className="block text-center text-sm font-black text-orange-600 hover:underline mt-4 uppercase tracking-widest">
                View Full History
              </Link>
            </div>
          </motion.div>

          {/* Recent Results */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-xl p-8"
          >
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-xl text-orange-600">
                <FileText className="h-6 w-6" />
              </div>
              Recent Results
            </h3>
            <div className="space-y-4">
              {data.results.slice(0, 5).map((result, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ x: 10, backgroundColor: '#fff' }}
                  className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 flex justify-between items-center transition-all"
                >
                  <div>
                    <h4 className="font-black text-slate-800">{result.exam_name}</h4>
                    <p className="text-sm font-medium text-slate-500 mt-1">
                      Marks: <span className="font-black text-orange-600">{result.marks}</span> / {result.total_marks}
                    </p>
                  </div>
                  <div className="text-right bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Merit Position</p>
                    <p className="text-xl font-black text-orange-600">#{result.merit_position || 'N/A'}</p>
                  </div>
                </motion.div>
              ))}
              {data.results.length === 0 && (
                <div className="text-center py-10">
                  <Award className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold">No results found</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Study Materials */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-xl p-8"
          >
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-xl text-orange-600">
                <BookOpen className="h-6 w-6" />
              </div>
              Study Materials
            </h3>
            <div className="space-y-4">
              {studyMaterials.slice(0, 6).map((mat, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ x: 10, backgroundColor: '#fff' }}
                  className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 flex justify-between items-center transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                      <FileText className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800">{mat.title}</h4>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">PDF Document</p>
                    </div>
                  </div>
                  <a 
                    href={mat.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-200 hover:bg-orange-700 transition-all hover:scale-110"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </motion.div>
              ))}
              {studyMaterials.length === 0 && (
                <div className="text-center py-10">
                  <BookOpen className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold">No materials found</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Support / Help */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-xl p-8"
          >
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-xl text-orange-600">
                <ExternalLink className="h-6 w-6" />
              </div>
              Need Help?
            </h3>
            <div className="p-6 bg-orange-50 rounded-2xl border border-orange-100 flex flex-col items-center justify-center text-center gap-4 h-[calc(100%-4rem)]">
              <div className="bg-white p-4 rounded-full shadow-md">
                <Phone className="h-8 w-8 text-orange-600" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-lg">Contact Support</h4>
                <p className="text-slate-500 text-sm mt-1">Having trouble? Reach out to our support team for assistance.</p>
              </div>
              <Link to="/contact" className="mt-2 px-6 py-3 bg-orange-600 text-white font-bold rounded-xl shadow-md hover:bg-orange-700 transition-colors">
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>

        {data.user?.student_type !== 'online' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Upcoming Exams */}
          <div className="glass rounded-[2.5rem] border border-white/60 shadow-xl p-8 bg-white/40">
            <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3 tracking-tight">
              <div className="bg-orange-100 p-2 rounded-xl text-orange-600 shadow-lg shadow-orange-100">
                <Calendar className="h-6 w-6" />
              </div>
              Upcoming Exams
            </h3>
            <div className="space-y-4">
              {exams.slice(0, 3).map((exam, i) => (
                <div key={i} className="p-6 bg-white/60 rounded-2xl border border-white/60 flex justify-between items-center shadow-lg hover:bg-white transition-all group">
                  <div className="flex items-center gap-5">
                    <div className="bg-orange-600 p-3 rounded-xl text-white shadow-lg shadow-orange-100 group-hover:scale-110 transition-transform">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 tracking-tight">{exam.exam_name}</h4>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{new Date(exam.exam_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="px-4 py-1.5 bg-orange-50 text-orange-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-orange-100">
                    Exam
                  </div>
                </div>
              ))}
              {exams.length === 0 && (
                <div className="text-center py-10 bg-white/20 rounded-3xl border border-dashed border-slate-200">
                  <Calendar className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-400 font-black text-xs uppercase tracking-widest">No exams scheduled</p>
                </div>
              )}
            </div>
          </div>
        </div>
        )}

        {/* Submit Review Section */}
        <div className="glass rounded-[2.5rem] border border-white/60 shadow-xl p-10 mt-8 bg-white/40">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-xl text-orange-600 shadow-lg shadow-orange-100">
                  <Award className="h-6 w-6" />
                </div>
                Submit a Review
              </h3>
              <p className="text-slate-500 mt-2 font-medium">We value your feedback! Share your learning experience with us.</p>
            </div>
          </div>

          <form 
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const rating = parseInt((form.elements.namedItem('rating') as HTMLSelectElement).value);
              const comment = (form.elements.namedItem('comment') as HTMLTextAreaElement).value;
              
              try {
                const res = await fetch('/api/reviews', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    student_id: data.user.id,
                    student_name: data.user.name,
                    rating,
                    comment,
                    created_at: new Date().toISOString(),
                    status: 'pending'
                  })
                });
                
                if (res.ok) {
                  alert('Review submitted successfully!');
                  form.reset();
                } else {
                  alert('Failed to submit review.');
                }
              } catch (error) {
                console.error('Error submitting review:', error);
                alert('An error occurred.');
              }
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Your Rating</label>
                <div className="relative">
                  <select name="rating" required className="w-full p-5 rounded-2xl bg-white/60 border border-white/60 focus:outline-none focus:ring-4 focus:ring-orange-500/10 transition-all font-black text-slate-900 appearance-none shadow-inner">
                    <option value="5">5 Stars - Excellent</option>
                    <option value="4">4 Stars - Very Good</option>
                    <option value="3">3 Stars - Good</option>
                    <option value="2">2 Stars - Fair</option>
                    <option value="1">1 Star - Poor</option>
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ArrowRight className="h-5 w-5 rotate-90" />
                  </div>
                </div>
              </div>
              <button 
                type="submit" 
                className="w-full bg-orange-600 text-white px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-700 transition-all shadow-xl shadow-orange-200 active:scale-95 flex items-center justify-center gap-3"
              >
                Submit Review
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Your Experience</label>
              <textarea 
                name="comment" 
                required 
                rows={5} 
                className="w-full p-6 rounded-2xl bg-white/60 border border-white/60 focus:outline-none focus:ring-4 focus:ring-orange-500/10 transition-all font-medium text-slate-700 placeholder:text-slate-300 shadow-inner resize-none"
                placeholder="Tell us what you liked or how we can improve..."
              ></textarea>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
