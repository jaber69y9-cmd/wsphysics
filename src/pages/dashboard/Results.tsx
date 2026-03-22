import { safeJson } from '../../utils/api';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FileText, Award } from 'lucide-react';

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

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <Award className="h-6 w-6 text-green-600" /> Exam Results
      </h2>

      <div className="grid grid-cols-1 gap-4">
        {results.map((result) => (
          <div key={result.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="font-bold text-lg text-slate-800">{result.exam_name}</h3>
              <p className="text-slate-500 text-sm">
                {result.batch_name || 'N/A'} - {result.batch_class || 'N/A'}
              </p>
              <p className="text-slate-500 text-sm">Date: {new Date(result.created_at).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-xs text-slate-400 uppercase font-bold">Marks</div>
                <div className="text-2xl font-bold text-green-600">{result.marks} <span className="text-sm text-slate-400">/ {result.total_marks || result.e_total}</span></div>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-400 uppercase font-bold">Highest</div>
                <div className="text-2xl font-bold text-green-600">{result.highest_marks || '-'}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-400 uppercase font-bold">Merit</div>
                <div className="text-2xl font-bold text-slate-800">#{result.merit_position || '-'}</div>
              </div>
            </div>
          </div>
        ))}
        {results.length === 0 && <p className="text-center text-red-500 font-bold py-8">No results found.</p>}
      </div>
    </div>
  );
};

export default Results;
