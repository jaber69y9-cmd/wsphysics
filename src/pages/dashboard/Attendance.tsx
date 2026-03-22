import { safeJson } from '../../utils/api';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, XCircle, Search, Calendar as CalendarIcon, Clock, TrendingUp } from 'lucide-react';
import { format, parseISO, eachDayOfInterval, isBefore, startOfDay } from 'date-fns';

const Attendance = () => {
  const { token } = useAuth();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [filteredAttendance, setFilteredAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/my-profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await safeJson(res);
          let allAttendance = data.attendance || [];
          
          // Generate absent records for past class days (last 30 days)
          if (data.user?.batch_days && data.user?.student_type !== 'online') {
            const batchDays = data.user.batch_days;
            const dayMapping: Record<string, string> = {
              'Saturday': 'Sat', 'Sunday': 'Sun', 'Monday': 'Mon',
              'Tuesday': 'Tue', 'Wednesday': 'Wed', 'Thursday': 'Thu', 'Friday': 'Fri'
            };
            
            const today = startOfDay(new Date());
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 30); // Show last 30 days of history
            
            const interval = eachDayOfInterval({ start: startDate, end: today });
            
            interval.forEach(date => {
              const dateStr = format(date, 'yyyy-MM-dd');
              const dayName = format(date, 'EEEE');
              const dayShort = dayMapping[dayName];
              
              if (batchDays.includes(dayShort)) {
                const existing = allAttendance.find((a: any) => a.date === dateStr);
                if (!existing) {
                  allAttendance.push({
                    id: `absent-${dateStr}`,
                    date: dateStr,
                    status: 'absent',
                    type: 'class',
                    time: 'N/A'
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

  useEffect(() => {
    let filtered = [...attendance];
    
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
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

  if (loading) return <div className="p-8 text-center">Loading...</div>;

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
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              // The search is already reactive via useEffect, but this satisfies the "search dile" (when searched) request
            }}
            className="relative flex-1 md:w-80 group flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search by date or status..." 
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none text-sm font-medium transition-all bg-white shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              type="submit"
              className="bg-orange-600 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-orange-700 transition-colors shadow-lg shadow-orange-600/20 flex items-center gap-2"
            >
              <Search className="h-4 w-4" /> Search
            </button>
          </form>

          <div className="flex flex-wrap gap-2">
            {['all', 'present', 'absent'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === status 
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30 scale-105' 
                    : 'bg-white text-slate-400 border border-slate-200 hover:border-orange-200 hover:text-orange-600'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          
          <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Attendance Rate</span>
              <span className={`text-xl font-black ${percentage >= 80 ? 'text-green-600' : percentage >= 60 ? 'text-orange-600' : 'text-red-600'}`}>
                {percentage}%
              </span>
            </div>
            <div className="h-8 w-[1px] bg-slate-100"></div>
            <div className="flex flex-col">
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Present</span>
              <span className="text-xl font-black text-slate-800">{presentCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-2xl">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Present</p>
              <p className="text-2xl font-black text-slate-900">{presentCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-50 rounded-2xl">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Absent</p>
              <p className="text-2xl font-black text-slate-900">{attendance.filter(a => a.status === 'absent').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-2xl">
              <CalendarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Classes</p>
              <p className="text-2xl font-black text-slate-900">{attendance.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-50 rounded-2xl">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
              <p className="text-lg font-black text-slate-900">{percentage >= 75 ? 'Excellent' : 'Needs Improvement'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date & Day</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Time</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Type</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAttendance.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-xl transition-colors ${record.status === 'present' ? 'bg-green-50 text-green-600 group-hover:bg-green-100' : 'bg-red-50 text-red-600 group-hover:bg-red-100'}`}>
                        <CalendarIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-slate-900 font-bold text-sm">{format(parseISO(record.date), 'MMMM dd, yyyy')}</p>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{format(parseISO(record.date), 'EEEE')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-slate-600 font-mono text-xs bg-slate-100/50 px-3 py-1.5 rounded-lg w-fit">
                      <Clock className="h-3 w-3 text-slate-400" />
                      {record.time || 'N/A'}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-slate-500 text-xs font-bold capitalize bg-slate-100 px-3 py-1 rounded-full">
                      {record.type || 'Class'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] shadow-sm ${
                        record.status === 'present' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-red-500 text-white'
                      }`}>
                        {record.status === 'present' ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {record.status}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAttendance.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 max-w-xs mx-auto">
                      <div className="p-6 bg-slate-50 rounded-full">
                        <Search className="h-10 w-10 text-slate-200" />
                      </div>
                      <div>
                        <p className="text-slate-900 font-bold">No results found</p>
                        <p className="text-slate-500 text-sm mt-1">We couldn't find any attendance records matching your search criteria.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
