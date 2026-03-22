import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  Bell, Calendar, CheckCircle, Award, BookOpen, FileText, PlayCircle, ArrowRight
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
  const [data, setData] = useState<DashboardData | null>(null);
  const [notices, setNotices] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [studyMaterials, setStudyMaterials] = useState<any[]>([]);
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  
  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/my-profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      let userData;
      if (response.ok) {
        userData = await response.json();
        
        // Generate absent records for past class days (last 7 days for dashboard)
        if (userData.user?.batch_days && userData.user?.student_type !== 'online') {
          const batchDays = userData.user.batch_days;
          const dayMapping: Record<string, string> = {
            'Saturday': 'Sat', 'Sunday': 'Sun', 'Monday': 'Mon',
            'Tuesday': 'Tue', 'Wednesday': 'Wed', 'Thursday': 'Thu', 'Friday': 'Fri'
          };
          
          const today = new Date();
          today.setHours(0,0,0,0);
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - 7);
          
          for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toLocaleDateString('en-CA');
            const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
            const dayShort = dayMapping[dayName];
            
            if (batchDays.includes(dayShort)) {
              const existing = userData.attendance.find((a: any) => a.date === dateStr);
              if (!existing) {
                userData.attendance.push({
                  id: `absent-${dateStr}`,
                  date: dateStr,
                  status: 'absent',
                  type: 'class',
                  time: 'N/A'
                });
              }
            }
          }
          // Sort by date descending
          userData.attendance.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }
        
        setData(userData);
      }

      // Fetch other data needed for stats
      const [noticesRes, chaptersRes, examsRes, enrollRes, materialsRes, liveRes] = await Promise.all([
        fetch('/api/notices', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/chapters', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/exams', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/my-enrollments', { headers: { Authorization: `Bearer ${token}` } }),
        userData ? fetch(`/api/study-materials/student/${userData.user.id}`, { headers: { Authorization: `Bearer ${token}` } }) : Promise.resolve({ ok: false, json: () => [] }),
        fetch('/api/live-classes', { headers: { Authorization: `Bearer ${token}` } })
      ]);

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
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-48 bg-slate-200 rounded-3xl"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-24 bg-slate-100 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-100 rounded-2xl"></div>
          <div className="h-64 bg-slate-100 rounded-2xl"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-100 rounded-2xl"></div>
          <div className="h-64 bg-slate-100 rounded-2xl"></div>
        </div>
      </div>
    );
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
            return enrollments.some(e => e.course_id === lc.course_id && e.status === 'contacted');
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
                  return enrollments.some(e => e.course_id === lc.course_id && e.status === 'contacted');
                }
                return true;
              }).map((lc) => (
                <div key={lc.id} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-lg">{lc.title}</h4>
                      <p className="text-xs text-orange-100 uppercase tracking-wider font-bold">Zoom Live Session</p>
                    </div>
                    <Link 
                      to={`/dashboard/zoom/${lc.id}`}
                      className="bg-white text-orange-600 px-4 py-2 rounded-xl font-bold hover:bg-orange-50 transition-colors shadow-lg text-sm"
                    >
                      Join Now
                    </Link>
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
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-8 rounded-3xl shadow-lg relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold">Welcome back, {data.user.name.split(' ')[0]}!</h1>
            <p className="mt-2 text-orange-100 text-lg">You are currently enrolled in <span className="font-bold text-white">{data.batch?.name || 'No Batch'}</span></p>
          </div>
          
          {/* Today's Attendance Status & Live Class */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4">
            {data.batch?.live_class_link && (
              <a 
                href={data.batch.live_class_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white text-orange-600 px-6 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:bg-orange-50 transition-colors"
              >
                <PlayCircle className="h-6 w-6" />
                Join Live Class
              </a>
            )}
            {data.user?.student_type !== 'online' && (
            <div className="bg-white/20 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/30 flex items-center gap-4">
              <div>
                <p className="text-orange-100 text-sm font-bold uppercase tracking-wider mb-1">Today's Status</p>
              {(() => {
                const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
                const todayRecord = (data.attendance || []).find(a => a.date === today && a.type !== 'exam');
                
                const isClassDay = () => {
                  if (!data.user || !data.user.batch_days) return true;
                  const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                  const dayMapping: Record<string, string> = {
                    'Saturday': 'Sat', 'Sunday': 'Sun', 'Monday': 'Mon',
                    'Tuesday': 'Tue', 'Wednesday': 'Wed', 'Thursday': 'Thu', 'Friday': 'Fri'
                  };
                  return data.user.batch_days.includes(dayMapping[dayName] || '');
                };

                if (todayRecord) {
                  return (
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${todayRecord.status === 'present' ? 'bg-green-400' : 'bg-red-400'} shadow-[0_0_10px_rgba(255,255,255,0.5)]`} />
                      <span className="text-xl font-bold text-white">{todayRecord.status.toUpperCase()}</span>
                    </div>
                  );
                } else if (isClassDay()) {
                  return (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400 shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                      <span className="text-xl font-bold text-white">ABSENT (Auto)</span>
                    </div>
                  );
                } else {
                  return (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-slate-300" />
                      <span className="text-xl font-bold text-white">No Class Today</span>
                    </div>
                  );
                }
              })()}
            </div>
          </div>
          )}
          </div>

          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        </div>

        {/* Quick Stats */}
        {data.user?.student_type !== 'online' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="text-slate-500 text-sm font-bold uppercase mb-1">Attendance</div>
            <div className="text-3xl font-bold text-slate-800">
              {Math.round(((data.attendance || []).filter(a => a.status === 'present').length / ((data.attendance || []).length || 1)) * 100)}%
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="text-slate-500 text-sm font-bold uppercase mb-1">Total Paid</div>
            <div className="text-3xl font-bold text-green-600">৳{data.user.paid_amount || 0}</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="text-slate-500 text-sm font-bold uppercase mb-1">Monthly Fee</div>
            <div className="text-3xl font-bold text-orange-600">৳{data.user.monthly_fee || 0}</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="text-slate-500 text-sm font-bold uppercase mb-1">Exams</div>
            <div className="text-3xl font-bold text-orange-600">{exams.length}</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="text-slate-500 text-sm font-bold uppercase mb-1">Chapters</div>
            <div className="text-3xl font-bold text-slate-800">{chapters.length}</div>
          </div>
        </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Enrolled Programs & Courses */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-orange-600" /> Enrolled Courses
            </h3>
            <div className="space-y-3">
              {data.user.student_type === 'online' && data.user.enrolled_courses && data.user.enrolled_courses.map((course: any, i: number) => (
                <div key={`course-${i}`} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-800">{course.title}</h4>
                    <p className="text-xs text-slate-500">Status: <span className="text-orange-600 font-bold uppercase">{course.status || 'Active'}</span></p>
                  </div>
                  <CheckCircle className={`h-5 w-5 ${course.status !== 'inactive' ? 'text-green-500' : 'text-slate-300'}`} />
                </div>
              ))}
              {enrollments.map((enroll, i) => (
                <div key={`enroll-${i}`} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-800">{enroll.program_title || enroll.course_title}</h4>
                    <p className="text-xs text-slate-500">Status: <span className="text-orange-600 font-bold uppercase">{enroll.status}</span></p>
                  </div>
                  <CheckCircle className={`h-5 w-5 ${enroll.status === 'contacted' ? 'text-green-500' : 'text-slate-300'}`} />
                </div>
              ))}
              {enrollments.length === 0 && (!data.user.enrolled_courses || data.user.enrolled_courses.length === 0) && (
                <p className="text-center text-slate-400 py-4">No enrollments found</p>
              )}
            </div>
          </div>

          {/* Recent Notices */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Bell className="h-5 w-5 text-orange-600" /> Recent Notices
              </h3>
              <Link to="/notices" className="text-sm font-bold text-orange-600 hover:underline">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notices
                .filter((n: any) => n.target_audience === 'all' || !n.target_audience || n.target_audience === data.user.student_type)
                .slice(0, 3)
                .map((notice, i) => (
                <Link 
                  key={i} 
                  to="/notices"
                  className="bg-white rounded-[2rem] shadow-sm overflow-hidden border border-slate-100 group hover:shadow-xl transition-all duration-500 hover:-translate-y-2 flex flex-col"
                >
                  <div className="relative h-32 bg-gradient-to-br from-orange-500 to-orange-600 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:scale-110 transition-transform duration-700">
                      <Bell className="h-20 w-20 text-white" />
                    </div>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                    <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                      <span className="px-2 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold rounded-full shadow-lg border border-white/30">
                        Notice
                      </span>
                      <div className="flex items-center gap-1 text-white/90 text-[10px] font-medium bg-black/20 px-2 py-1 rounded-full backdrop-blur-sm">
                        <Calendar className="h-3 w-3" />
                        {new Date(notice.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-base font-black text-slate-800 leading-tight mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                      {notice.title}
                    </h3>

                    <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed flex-1 whitespace-pre-wrap">
                      {notice.content}
                    </p>

                    <div className="pt-4 mt-3 flex items-center justify-between border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Read Full</span>
                      <div className="flex items-center gap-1 text-orange-600 font-bold text-xs group-hover:translate-x-1 transition-transform">
                        Details <ArrowRight className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              {notices.length === 0 && <p className="col-span-full text-center text-slate-400 py-4">No notices yet</p>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Recent Attendance */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-orange-600" /> Recent Attendance
            </h3>
            <div className="space-y-3">
              {(data.attendance || []).slice(0, 5).map((record: any, i: number) => (
                <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${record.status === 'present' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</h4>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' })}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    record.status === 'present' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {record.status}
                  </span>
                </div>
              ))}
              {(data.attendance || []).length === 0 && <p className="text-center text-slate-400 py-4">No attendance records found</p>}
              <Link to="/dashboard/attendance" className="block text-center text-sm font-bold text-orange-600 hover:underline mt-2">
                View Full History
              </Link>
            </div>
          </div>

          {/* Results */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-600" /> Recent Results
            </h3>
            <div className="space-y-3">
              {data.results.slice(0, 5).map((result, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-800">{result.exam_name}</h4>
                    <p className="text-sm text-slate-500">Marks: <span className="font-bold text-orange-600">{result.marks}</span> / {result.total_marks}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Merit</p>
                    <p className="font-bold text-slate-800">#{result.merit_position || 'N/A'}</p>
                  </div>
                </div>
              ))}
              {data.results.length === 0 && <p className="text-center text-slate-400 py-4">No results found</p>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Study Materials */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-orange-600" /> Study Materials
            </h3>
            <div className="space-y-2">
              {studyMaterials.slice(0, 6).map((mat, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center hover:border-orange-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                      <FileText className="h-4 w-4" />
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{mat.title}</h4>
                  </div>
                  <a 
                    href={mat.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-xs font-bold text-orange-600 hover:underline whitespace-nowrap"
                  >
                    Download
                  </a>
                </div>
              ))}
              {studyMaterials.length === 0 && <p className="text-center text-slate-400 py-4">No study materials available</p>}
            </div>
          </div>
        </div>

        {data.user?.student_type !== 'online' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Upcoming Exams */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-600" /> Upcoming Exams
            </h3>
            <div className="space-y-3">
              {exams.slice(0, 3).map((exam, i) => (
                <div key={i} className="p-4 bg-orange-50 rounded-xl border border-orange-100 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-800">{exam.exam_name}</h4>
                    <p className="text-sm text-slate-500">{exam.exam_date}</p>
                  </div>
                  <div className="text-orange-600 font-bold text-sm">Exam</div>
                </div>
              ))}
              {exams.length === 0 && <p className="text-center text-slate-400 py-4">No exams scheduled</p>}
            </div>
          </div>
        </div>
        )}

        {/* Submit Review Section */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mt-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-orange-600" /> Submit a Review
          </h3>
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
                    status: 'pending' // Or approved, depending on your flow
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
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Rating</label>
              <select name="rating" required className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="5">5 Stars - Excellent</option>
                <option value="4">4 Stars - Very Good</option>
                <option value="3">3 Stars - Good</option>
                <option value="2">2 Stars - Fair</option>
                <option value="1">1 Star - Poor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Your Review</label>
              <textarea 
                name="comment" 
                required 
                rows={4} 
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Share your experience..."
              ></textarea>
            </div>
            <button 
              type="submit" 
              className="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors"
            >
              Submit Review
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
