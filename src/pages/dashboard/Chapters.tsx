import { safeJson } from '../../utils/api';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BookOpen } from 'lucide-react';

const Chapters = () => {
  const { token } = useAuth();
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const res = await fetch('/api/chapters', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await safeJson(res);
          setChapters(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchChapters();
  }, [token]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <BookOpen className="h-6 w-6 text-green-600" /> Chapters
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {chapters.map((chapter) => (
          <div key={chapter.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-lg text-slate-800 mb-2">{chapter.title}</h3>
            <p className="text-slate-600 mb-4">{chapter.content}</p>
            <div className="flex justify-between items-center">
              <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                chapter.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {chapter.status === 'active' ? 'Completed' : 'Coming Soon'}
              </span>
            </div>
          </div>
        ))}
        {chapters.length === 0 && <p className="text-slate-500">No chapters found.</p>}
      </div>
    </div>
  );
};

export default Chapters;
