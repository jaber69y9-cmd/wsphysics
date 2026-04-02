import { safeJson } from '../../utils/api';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FileText, Award, Calendar } from 'lucide-react';
import SmallLoadingSpinner from '../../components/SmallLoadingSpinner';

const Results = () => {
  const { token } = useAuth();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/my-profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await safeJson(res);
          setResults(data.results || []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  if (loading) return <SmallLoadingSpinner />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-xl">
              <Award className="h-6 w-6 text-orange-600" />
            </div>
            Exam Results
          </h2>
          <p className="text-slate-500 mt-1 text-sm font-medium">View your performance across different exams.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {results.map((result) => (
          <div key={result.id} className="glass p-8 rounded-[2.5rem] border border-white/60 shadow-xl bg-white/40 flex flex-col lg:flex-row justify-between items-center gap-8 hover:bg-white/60 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            
            <div className="flex items-center gap-6 w-full lg:w-auto">
              <div className="p-5 rounded-2xl bg-orange-600 text-white shadow-lg shadow-orange-200">
                <FileText className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-black text-2xl text-slate-900 tracking-tight">{result.exam_name}</h3>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <span className="text-orange-600 text-[10px] font-black uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-lg border border-orange-100">
                    {result.batch_name || 'N/A'} • {result.batch_class || 'N/A'}
                  </span>
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    {new Date(result.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-end gap-10 w-full lg:w-auto">
              <div className="text-center">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Obtained Marks</p>
                <div className="text-4xl font-black text-green-600 tracking-tighter">
                  {result.marks} 
                  <span className="text-lg text-slate-300 ml-1">/ {result.total_marks || result.e_total}</span>
                </div>
              </div>
              <div className="h-12 w-[1px] bg-slate-100 hidden sm:block"></div>
              <div className="text-center">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Highest</p>
                <div className="text-3xl font-black text-slate-800 tracking-tighter">{result.highest_marks || '-'}</div>
              </div>
              <div className="h-12 w-[1px] bg-slate-100 hidden sm:block"></div>
              <div className="text-center">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Merit Position</p>
                <div className="text-4xl font-black text-orange-600 tracking-tighter">#{result.merit_position || '-'}</div>
              </div>
            </div>
          </div>
        ))}
        {results.length === 0 && (
          <div className="glass p-16 rounded-[2.5rem] border border-white/60 shadow-xl bg-white/40 text-center">
            <div className="max-w-xs mx-auto">
              <div className="p-6 bg-slate-50 rounded-full inline-block mb-4">
                <Award className="h-12 w-12 text-slate-200" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">No Results Yet</h3>
              <p className="text-slate-500 font-medium">Your exam results will appear here once they are published.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;
