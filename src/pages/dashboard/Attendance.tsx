import { safeJson } from '../../utils/api';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, XCircle, Search, Calendar as CalendarIcon, Clock, TrendingUp } from 'lucide-react';
import { format, parseISO, eachDayOfInterval, isBefore, startOfDay } from 'date-fns';
import SmallLoadingSpinner from '../../components/SmallLoadingSpinner';

const Attendance = () => {
  const { token } = useAuth();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [filteredAttendance, setFilteredAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const [markingId, setMarkingId] = useState<string | null>(null);

  const handleMarkPresent = async (record: any) => {
    setMarkingId(record.id);
    try {
      const res = await fetch('/api/attendance/mark-present', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          date: record.date,
          type: record.type || 'class',
          batch_id: record.batch_id
        })
      });

      if (res.ok) {
        // Refresh data
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to mark present', error);
    } finally {
      setMarkingId(null);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/my-profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await safeJson(res);
          let allAttendance = data.attendance || [];
          const user = data.user;

          if (user && user.batch_days && user.created_at) {
            const startDate = startOfDay(parseISO(user.created_at));
            const today = startOfDay(new Date());
            const dayMapping: Record<string, string> = {
              'Saturday': 'Sat', 'Sunday': 'Sun', 'Monday': 'Mon',
              'Tuesday': 'Tue', 'Wednesday': 'Wed', 'Thursday': 'Thu', 'Friday': 'Fri'
            };

            const intervalDays = eachDayOfInterval({ start: startDate, end: today });
            
            intervalDays.forEach(day => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const dayName = format(day, 'EEEE');
              const dayShort = dayMapping[dayName];

              if (user.batch_days.includes(dayShort)) {
                const existing = allAttendance.find((a: any) => a.date === dateStr && a.type !== 'exam');
                if (!existing) {
                  allAttendance.push({
                    id: `auto-absent-${dateStr}`,
                    date: dateStr,
                    status: 'absent',
                    type: 'class',
                    is_auto: true,
                    batch_id: user.batch_id
                  });
                }
              }
            });
          }
          
          // Sort by date descending
          allAttendance.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
          setAttendance(allAttendance);
          setFilteredAttendance(allAttendance);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  // Optimize search with useMemo or just efficient filtering
  useEffect(() => {
    const q = searchQuery.toLowerCase().trim();
    let filtered = attendance;

    if (q !== '') {
      filtered = filtered.filter(a => {
        const dateObj = parseISO(a.date);
        const dayName = format(dateObj, 'EEEE').toLowerCase();
        const dayNameShort = format(dateObj, 'EEE').toLowerCase();
        
        return a.date.includes(q) || 
               a.status.toLowerCase().includes(q) ||
               dayName.includes(q) ||
               dayNameShort.includes(q);
      });
    }

    if (filter !== 'all') {
      filtered = filtered.filter(a => a.status === filter);
    }

    setFilteredAttendance(filtered);
  }, [searchQuery, attendance, filter]);

  if (loading) return <SmallLoadingSpinner />;

  const presentCount = attendance.filter(a => a.status === 'present').length;
  const percentage = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-xl">
              <CheckCircle className="h-6 w-6 text-orange-600" />
            </div>
            Attendance History
          </h2>
          <p className="text-slate-500 mt-1 text-sm font-medium">Track your presence and consistency in classes.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80 group flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Quick search..." 
                className="glass-input !py-3 !pl-11"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {['all', 'present', 'absent'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                  filter === status 
                    ? 'bg-orange-600 text-white border-orange-500 shadow-lg shadow-orange-600/30 scale-105' 
                    : 'bg-white/40 text-slate-400 border-white/60 hover:border-orange-200 hover:text-orange-600'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          
          <div className="glass px-6 py-3 rounded-2xl shadow-xl border border-white/60 flex items-center gap-4 bg-white/40">
            <div className="flex flex-col">
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Consistency</span>
              <span className={`text-xl font-black ${percentage >= 80 ? 'text-green-600' : percentage >= 60 ? 'text-orange-600' : 'text-red-600'}`}>
                {percentage}%
              </span>
            </div>
            <div className="h-8 w-[1px] bg-white/40"></div>
            <div className="flex flex-col">
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Present</span>
              <span className="text-xl font-black text-slate-800">{presentCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass p-6 rounded-[2rem] border border-white/60 shadow-xl bg-white/40 hover:bg-white/60 transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-2xl text-green-600">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Present</p>
              <p className="text-2xl font-black text-slate-900">{presentCount}</p>
            </div>
          </div>
        </div>
        <div className="glass p-6 rounded-[2rem] border border-white/60 shadow-xl bg-white/40 hover:bg-white/60 transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-2xl text-red-600">
              <XCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Absent</p>
              <p className="text-2xl font-black text-slate-900">{attendance.filter(a => a.status === 'absent').length}</p>
            </div>
          </div>
        </div>
        <div className="glass p-6 rounded-[2rem] border border-white/60 shadow-xl bg-white/40 hover:bg-white/60 transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-2xl text-blue-600">
              <CalendarIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Classes</p>
              <p className="text-2xl font-black text-slate-900">{attendance.length}</p>
            </div>
          </div>
        </div>
        <div className="glass p-6 rounded-[2rem] border border-white/60 shadow-xl bg-white/40 hover:bg-white/60 transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-2xl text-orange-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
              <p className="text-lg font-black text-slate-900">{percentage >= 75 ? 'Excellent' : 'Needs Improvement'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {filteredAttendance.map((record) => (
            <div key={record.id} className="glass p-6 rounded-[2rem] border border-white/60 shadow-xl bg-white/40 flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-white/60 transition-all">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl transition-all shadow-lg ${record.status === 'present' ? 'bg-green-100 text-green-600 shadow-green-100' : 'bg-red-100 text-red-600 shadow-red-100'}`}>
                  <CalendarIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-slate-900 font-black text-lg tracking-tight">{format(parseISO(record.date), 'MMMM dd, yyyy')}</p>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{format(parseISO(record.date), 'EEEE')}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 md:gap-8">
                <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest bg-white/40 px-4 py-1.5 rounded-full border border-white/60">
                  {record.type || 'Class'}
                </span>

                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg ${
                    record.status === 'present' 
                      ? 'bg-green-500 text-white shadow-green-100' 
                      : 'bg-red-500 text-white shadow-red-100'
                  }`}>
                    {record.status === 'present' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    {record.status}
                  </span>

                  {record.status === 'absent' && (
                    <button
                      onClick={() => handleMarkPresent(record)}
                      disabled={markingId === record.id}
                      className="bg-orange-600 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20 active:scale-95 disabled:opacity-50"
                    >
                      {markingId === record.id ? 'Marking...' : 'Mark Present'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filteredAttendance.length === 0 && (
            <div className="glass p-16 rounded-[2.5rem] border border-white/60 shadow-xl bg-white/40 text-center">
              <div className="flex flex-col items-center gap-6 max-w-xs mx-auto">
                <div className="p-6 bg-slate-50 rounded-full shadow-inner">
                  <Search className="h-12 w-12 text-slate-200" />
                </div>
                <div>
                  <p className="text-slate-900 font-black text-xl tracking-tight">No records found</p>
                  <p className="text-slate-500 mt-2 font-medium">We couldn't find any attendance records matching your current filters.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;
