import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Trash2 } from 'lucide-react';
import { showConfirm } from '../../utils/alert';

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

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  const resultExamIds = new Set(results.map(r => r.exam_id));
  const upcomingExams = exams.filter(e => !resultExamIds.has(e.id));
  const passingExams = exams.filter(e => resultExamIds.has(e.id));

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-6">
          <Calendar className="h-6 w-6 text-orange-600" /> Upcoming Exams
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingExams.map((exam) => (
            <div key={exam.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-orange-500 hover:shadow-md transition-shadow relative group">
              <h3 className="font-bold text-lg text-slate-800 mb-2">{exam.exam_name}</h3>
              <p className="text-slate-600 mb-4 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                {new Date(exam.exam_date).toLocaleDateString()}
              </p>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Total Marks: <span className="font-bold text-slate-800">{exam.highest_marks || '-'}</span></span>
                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-bold text-xs uppercase">Upcoming</span>
              </div>
              {user?.role === 'admin' && (
                <button 
                  onClick={() => handleDelete(exam.id)}
                  className="absolute top-2 right-2 p-2 bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete Exam"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
            </div>
          ))}
          {upcomingExams.length === 0 && (
            <div className="col-span-full bg-slate-50 rounded-2xl p-10 text-center border border-dashed border-slate-200">
              <p className="text-slate-500 font-medium">No upcoming exams scheduled.</p>
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-6">
          <Calendar className="h-6 w-6 text-green-600" /> Passing Exams (History)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {passingExams.map((exam) => {
            const result = results.find(r => r.exam_id === exam.id);
            return (
              <div key={exam.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-green-500 opacity-90 hover:opacity-100 transition-opacity relative group">
                <h3 className="font-bold text-lg text-slate-800 mb-2">{exam.exam_name}</h3>
                <p className="text-slate-600 mb-4 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  {new Date(exam.exam_date).toLocaleDateString()}
                </p>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex flex-col">
                    <span className="text-slate-500">Marks: <span className="font-bold text-green-600">{result?.marks || 0}</span></span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Merit: #{result?.merit_position || '-'}</span>
                  </div>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold text-xs uppercase">Completed</span>
                </div>
                {user?.role === 'admin' && (
                  <button 
                    onClick={() => handleDelete(exam.id)}
                    className="absolute top-2 right-2 p-2 bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Exam"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>
            );
          })}
          {passingExams.length === 0 && (
            <div className="col-span-full bg-slate-50 rounded-2xl p-10 text-center border border-dashed border-slate-200">
              <p className="text-slate-500 font-medium">No exam history found.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Exams;
