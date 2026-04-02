import { safeJson } from '../../utils/api';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, TrendingUp } from 'lucide-react';
import SmallLoadingSpinner from '../../components/SmallLoadingSpinner';

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

  if (loading) return <SmallLoadingSpinner />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-xl">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            Chapters
          </h2>
          <p className="text-slate-500 mt-1 text-sm font-medium">Access your course chapters and learning materials.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {chapters.map((chapter) => (
          <div key={chapter.id} className="glass p-8 rounded-[2.5rem] border border-white/60 shadow-xl bg-white/40 hover:bg-white/60 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-green-500/10 transition-colors"></div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-2xl bg-green-100 text-green-600 shadow-lg shadow-green-100">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="font-black text-xl text-slate-900 tracking-tight line-clamp-1">{chapter.title}</h3>
            </div>

            <p className="text-slate-600 mb-8 line-clamp-3 font-medium leading-relaxed">{chapter.content}</p>
            
            <div className="flex justify-between items-center">
              <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg ${
                chapter.status === 'active' 
                  ? 'bg-green-500 text-white shadow-green-100' 
                  : 'bg-orange-500 text-white shadow-orange-100'
              }`}>
                {chapter.status === 'active' ? 'Completed' : 'Coming Soon'}
              </span>
              
              <button className="text-slate-400 hover:text-green-600 transition-colors">
                <TrendingUp className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
        {chapters.length === 0 && (
          <div className="col-span-full glass p-16 rounded-[2.5rem] border border-white/60 shadow-xl bg-white/40 text-center">
            <div className="max-w-xs mx-auto">
              <div className="p-6 bg-slate-50 rounded-full inline-block mb-4">
                <BookOpen className="h-12 w-12 text-slate-200" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">No Chapters Found</h3>
              <p className="text-slate-500 font-medium">Your course chapters will appear here once they are added.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chapters;
