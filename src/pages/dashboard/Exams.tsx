import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Trash2 } from 'lucide-react';
import { showConfirm } from '../../utils/alert';
import SmallLoadingSpinner from '../../components/SmallLoadingSpinner';

const Exams = () => {
  const { token, user } = useAuth();
  const [exams, setExams] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, [token]);

  const fetchExams = async () => {
    try {
      const [examsRes, profileRes] = await Promise.all([
        fetch('/api/exams', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/my-profile', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (examsRes.ok) {
        const data = await examsRes.json();
        setExams(Array.isArray(data) ? data : []);
      }
      if (profileRes.ok) {
        const data = await profileRes.json();
        setResults(data.results || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (await showConfirm('Are you sure you want to delete this exam?')) {
      const res = await fetch(`/api/exams/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchExams();
      }
    }
  };

  if (loading) return <SmallLoadingSpinner />;

  const resultExamIds = new Set(results.map(r => r.exam_id));
  const upcomingExams = exams.filter(e => !resultExamIds.has(e.id));
  const passingExams = exams.filter(e => resultExamIds.has(e.id));

  return (
    <div className="space-y-12">
      <section>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-xl">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              Upcoming Exams
            </h2>
            <p className="text-slate-500 mt-1 text-sm font-medium">Prepare for your scheduled assessments.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingExams.map((exam) => (
            <div key={exam.id} className="glass p-8 rounded-[2.5rem] border border-white/60 shadow-xl bg-white/40 hover:bg-white/60 transition-all relative group overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-orange-500/10 transition-colors"></div>
              
              <h3 className="font-black text-xl text-slate-900 tracking-tight mb-4">{exam.exam_name}</h3>
              
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
                  <Calendar className="h-4 w-4" />
                </div>
                <p className="text-slate-600 font-bold text-sm">
                  {new Date(exam.exam_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Marks</span>
                  <span className="text-xl font-black text-slate-900 tracking-tighter">{exam.highest_marks || '-'}</span>
                </div>
                <span className="bg-orange-500 text-white px-5 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-orange-100">Upcoming</span>
              </div>

              {user?.role === 'admin' && (
                <button 
                  onClick={() => handleDelete(exam.id)}
                  className="absolute top-4 right-4 p-2 bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                  title="Delete Exam"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
            </div>
          ))}
          {upcomingExams.length === 0 && (
            <div className="col-span-full glass p-16 rounded-[2.5rem] border border-white/60 shadow-xl bg-white/40 text-center">
              <div className="max-w-xs mx-auto">
                <div className="p-6 bg-slate-50 rounded-full inline-block mb-4">
                  <Calendar className="h-12 w-12 text-slate-200" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">No Upcoming Exams</h3>
                <p className="text-slate-500 font-medium">You're all caught up! No exams are currently scheduled.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-xl">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              Exam History
            </h2>
            <p className="text-slate-500 mt-1 text-sm font-medium">Review your past performances and results.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {passingExams.map((exam) => {
            const result = results.find(r => r.exam_id === exam.id);
            return (
              <div key={exam.id} className="glass p-8 rounded-[2.5rem] border border-white/60 shadow-xl bg-white/40 hover:bg-white/60 transition-all relative group overflow-hidden opacity-90 hover:opacity-100">
                <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-green-500/10 transition-colors"></div>
                
                <h3 className="font-black text-xl text-slate-900 tracking-tight mb-4">{exam.exam_name}</h3>
                
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 rounded-xl bg-green-50 text-green-600">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <p className="text-slate-600 font-bold text-sm">
                    {new Date(exam.exam_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Your Score</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-green-600 tracking-tighter">{result?.marks || 0}</span>
                      <span className="text-xs text-slate-300 font-black">/ {exam.highest_marks || '-'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest block mb-1">Merit</span>
                    <span className="text-lg font-black text-slate-800 tracking-tighter">#{result?.merit_position || '-'}</span>
                  </div>
                </div>

                {user?.role === 'admin' && (
                  <button 
                    onClick={() => handleDelete(exam.id)}
                    className="absolute top-4 right-4 p-2 bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                    title="Delete Exam"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>
            );
          })}
          {passingExams.length === 0 && (
            <div className="col-span-full glass p-16 rounded-[2.5rem] border border-white/60 shadow-xl bg-white/40 text-center">
              <div className="max-w-xs mx-auto">
                <div className="p-6 bg-slate-50 rounded-full inline-block mb-4">
                  <Calendar className="h-12 w-12 text-slate-200" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">No History</h3>
                <p className="text-slate-500 font-medium">Your completed exams will appear here.</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Exams;
