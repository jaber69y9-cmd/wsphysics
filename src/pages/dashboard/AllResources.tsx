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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">
          All Resources
        </h1>
        <div className="bg-orange-50 px-3 py-1 rounded-full text-orange-600 font-bold text-xs border border-orange-100">
          {resources.length} Items Available
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource) => (
          <motion.div 
            key={resource.id} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(resource.created_at).toLocaleDateString()}
              </span>
              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                resource.type === 'video' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
              }`}>
                {resource.type}
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2">
              {resource.title}
            </h3>
            
            <p className="text-sm text-slate-600 mb-4 flex-grow line-clamp-3">
              {resource.description || 'No description provided.'}
            </p>

            <div className="mt-auto pt-4 border-t border-slate-100">
              {resource.type === 'video' ? (
                <button 
                  onClick={() => setSelectedVideo(resource.url)}
                  className="w-full bg-orange-50 hover:bg-orange-100 text-orange-600 py-2 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Video className="h-4 w-4" />
                  Watch Video
                </button>
              ) : (
                <a 
                  href={resource.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full bg-orange-50 hover:bg-orange-100 text-orange-600 py-2 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                  download
                >
                  <Download className="h-4 w-4" />
                  Download
                </a>
              )}
            </div>
          </motion.div>
        ))}
        
        {resources.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500">
            No resources available yet.
          </div>
        )}
      </div>

      {selectedVideo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedVideo(null)}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2rem] w-full max-w-5xl overflow-hidden relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setSelectedVideo(null)} className="absolute top-6 right-6 z-10 p-3 bg-white/90 backdrop-blur shadow-lg rounded-full hover:bg-white transition-all">
              <X className="h-6 w-6 text-slate-800" />
            </button>
            <div className="aspect-video">
              <iframe 
                src={`https://www.youtube.com/embed/${getYoutubeId(selectedVideo)}?autoplay=1`}
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
