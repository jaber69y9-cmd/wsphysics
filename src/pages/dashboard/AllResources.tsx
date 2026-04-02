import { safeJson } from '../../utils/api';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Video, FileText, Download, X, Calendar, Users } from 'lucide-react';
import { motion } from 'motion/react';

const AllResources = () => {
  const { token, user } = useAuth();
  const [resources, setResources] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  useEffect(() => {
    const fetchResources = async () => {
      if (!token) return;
      try {
        const res = await fetch(`/api/study-materials/student/${user?.id}`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        
        if (res.ok) {
          const data = await safeJson(res);
          setResources(Array.isArray(data) ? data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) : []);
        } else {
          setResources([]);
        }
      } catch (error) {
        console.error('Failed to fetch resources:', error);
        setResources([]);
      }
    };
    fetchResources();
  }, [token, user?.id]);

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <FileText className="h-8 w-8 text-orange-600" />
            All Resources
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Access all your study materials and class recordings in one place.</p>
        </div>
        <div className="glass px-6 py-3 rounded-2xl border border-white/60 shadow-xl flex items-center gap-3">
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
          <span className="text-slate-700 font-black text-sm uppercase tracking-widest">
            {resources.length} Items Available
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {resources.map((resource) => (
          <motion.div 
            key={resource.id} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8 }}
            className="glass p-8 rounded-[2.5rem] border border-white/60 shadow-xl relative group flex flex-col hover:shadow-orange-500/10 transition-all duration-500"
          >
            <div className="flex items-center justify-between mb-6">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform ${
                resource.type === 'video' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
              }`}>
                {resource.type === 'video' ? <Video className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
              </div>
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                resource.type === 'video' 
                  ? 'bg-rose-100 text-rose-700 border-rose-200' 
                  : 'bg-blue-100 text-blue-700 border-blue-200'
              }`}>
                {resource.type}
              </span>
            </div>
 
            <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight line-clamp-2 leading-tight">
              {resource.title}
            </h3>
            
            <p className="text-slate-500 text-sm font-medium mb-8 flex-grow line-clamp-3 leading-relaxed">
              {resource.description || 'No description provided for this resource.'}
            </p>
 
            <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400">
                <Calendar className="h-3.5 w-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {new Date(resource.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </div>
 
              {resource.type === 'video' ? (
                <button 
                  onClick={() => setSelectedVideo(resource.url)}
                  className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-slate-900/20 hover:bg-orange-600 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Video className="h-3.5 w-3.5" />
                  Watch
                </button>
              ) : (
                <a 
                  href={resource.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-slate-900/20 hover:bg-orange-600 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                  download
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </a>
              )}
            </div>
          </motion.div>
        ))}
        
        {resources.length === 0 && (
          <div className="col-span-full text-center py-40 glass rounded-[4rem] border border-dashed border-white/60 shadow-inner">
            <div className="bg-slate-50 w-32 h-32 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
              <FileText className="h-16 w-16 text-slate-200" />
            </div>
            <p className="text-slate-400 text-3xl font-black tracking-tight">No resources available yet.</p>
            <p className="text-slate-400 mt-2 font-medium text-lg">Check back later for updates.</p>
          </div>
        )}
      </div>
 
      {selectedVideo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/95 backdrop-blur-xl"
          onClick={() => setSelectedVideo(null)}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="glass rounded-[3rem] w-full max-w-5xl overflow-hidden relative shadow-[0_0_100px_rgba(0,0,0,0.5)] border-4 border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedVideo(null)} 
              className="absolute top-6 right-6 z-10 p-3 bg-white/90 backdrop-blur shadow-xl rounded-2xl hover:rotate-90 transition-all duration-500"
            >
              <X className="h-6 w-6 text-slate-800" />
            </button>
            <div className="aspect-video">
              <iframe 
                src={`https://www.youtube.com/embed/${getYoutubeId(selectedVideo)}?autoplay=1&rel=0&modestbranding=1`}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay"
              />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AllResources;
