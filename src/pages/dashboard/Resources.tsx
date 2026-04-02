import { safeJson } from '../../utils/api';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Video, FileText, ExternalLink, Download, X, Calendar, Users, Trash2, PlayCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { showConfirm } from '../../utils/alert';

const Resources = ({ type }: { type: 'video' | 'pdf' }) => {
  const { token, user } = useAuth();
  const [resources, setResources] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);

  useEffect(() => {
    fetchResources();
  }, [token, type, user?.id]);

  const fetchResources = async () => {
    if (!token) return;
    try {
      const endpoint = `/api/study-materials/student/${user?.id}`;
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await safeJson(res);
        if (Array.isArray(data)) {
          // Filter based on type: videos for 'video', everything else for 'pdf'
          const filtered = type === 'video' 
            ? data.filter((r: any) => r.type === 'video')
            : data.filter((r: any) => r.type !== 'video');
          setResources(filtered);
        } else {
          setResources([]);
        }
      } else {
        setResources([]);
      }
    } catch (error) {
      console.error('Failed to fetch resources:', error);
      setResources([]);
    }
  };

  const handleDelete = async (id: string) => {
    if (await showConfirm('Are you sure you want to delete this resource?')) {
      const res = await fetch(`/api/study-materials/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchResources();
      }
    }
  };

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  if (type === 'video') {
    return (
      <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-10rem)]">
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col glass rounded-[3rem] overflow-hidden shadow-2xl border border-white/60 relative bg-slate-900">
          {selectedVideo ? (
            <div className="w-full h-full relative group">
              <iframe 
                src={`https://www.youtube.com/embed/${getYoutubeId(selectedVideo.url)}?autoplay=1&rel=0&modestbranding=1&showinfo=0`}
                className="w-full h-full absolute inset-0"
                allowFullScreen
                allow="autoplay"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent p-10 pt-32 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <h2 className="text-3xl font-black text-white mb-2 tracking-tight">{selectedVideo.title}</h2>
                <p className="text-slate-300 text-lg font-medium line-clamp-2 max-w-3xl">{selectedVideo.description}</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 flex-col gap-8 p-10 text-center">
              <div className="w-32 h-32 bg-slate-800 rounded-[2.5rem] flex items-center justify-center shadow-inner">
                <PlayCircle className="h-16 w-16 text-slate-600 animate-pulse" />
              </div>
              <div>
                <p className="text-2xl font-black text-white tracking-tight">Ready to Learn?</p>
                <p className="text-slate-500 mt-2 font-medium">Select a class from the playlist to start watching.</p>
              </div>
            </div>
          )}
        </div>

        {/* Playlist Sidebar */}
        <div className="w-full lg:w-[400px] glass rounded-[3rem] shadow-2xl border border-white/60 flex flex-col overflow-hidden">
          <div className="p-8 border-b border-white/20 bg-white/10">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
                <Video className="h-6 w-6 text-orange-600" />
                Class Recordings
              </h3>
              <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                {resources.length} Videos
              </span>
            </div>
            <p className="text-sm text-slate-500 font-medium">Watch and re-watch your recorded classes anytime.</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            {resources.map((resource) => {
              const videoId = getYoutubeId(resource.url);
              const isSelected = selectedVideo?.id === resource.id;
              return (
                <motion.button
                  key={resource.id}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedVideo(resource)}
                  className={`w-full text-left flex gap-4 p-4 rounded-[2rem] transition-all duration-300 border ${
                    isSelected 
                      ? 'bg-orange-600 shadow-xl shadow-orange-600/20 border-orange-500' 
                      : 'bg-white/40 hover:bg-white/60 border-white/60 shadow-sm'
                  }`}
                >
                  <div className="relative w-32 h-20 rounded-2xl overflow-hidden shrink-0 bg-slate-100 shadow-md">
                    {videoId ? (
                      <img 
                        src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`} 
                        alt={resource.title} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="h-6 w-6 text-slate-300" />
                      </div>
                    )}
                    {isSelected && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="bg-white text-orange-600 p-2 rounded-full shadow-xl">
                          <PlayCircle className="h-5 w-5" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 py-1 min-w-0">
                    <h4 className={`font-black text-sm line-clamp-2 leading-tight ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                      {resource.title}
                    </h4>
                    <p className={`text-[10px] font-black uppercase tracking-widest mt-2 ${isSelected ? 'text-orange-100' : 'text-slate-400'}`}>
                      {new Date(resource.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </motion.button>
              );
            })}
            {resources.length === 0 && (
              <div className="text-center py-20 px-6">
                <div className="bg-slate-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <Video className="h-10 w-10 text-slate-200" />
                </div>
                <p className="text-slate-400 font-black tracking-tight">No recorded classes available yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <FileText className="h-8 w-8 text-orange-600" />
            Study Materials
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Download PDFs, notes, and other essential resources.</p>
        </div>
        <div className="glass px-6 py-3 rounded-2xl border border-white/60 shadow-xl flex items-center gap-3">
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
          <span className="text-slate-700 font-black text-sm uppercase tracking-widest">
            {resources.length} Files Available
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {resources.map((resource) => {
          const isDownloadable = resource.url.startsWith('http');
          
          return (
            <motion.div 
              key={resource.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -8 }}
              className="glass p-8 rounded-[2.5rem] border border-white/60 shadow-xl relative group flex flex-col hover:shadow-orange-500/10 transition-all duration-500"
            >
              <div className="bg-orange-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
                <FileText className="h-7 w-7 text-orange-600" />
              </div>
              
              <h4 className="text-xl font-black text-slate-900 tracking-tight mb-3 line-clamp-2 leading-tight">
                {resource.title}
              </h4>
              
              <p className="text-slate-500 text-sm font-medium line-clamp-3 mb-8 flex-grow leading-relaxed">
                {resource.description || 'No description provided for this study material.'}
              </p>
              
              <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {new Date(resource.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                
                {isDownloadable ? (
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
                ) : (
                  <a 
                    href={resource.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-slate-100 text-slate-600 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    View
                  </a>
                )}
              </div>
            </motion.div>
          );
        })}
        
        {resources.length === 0 && (
          <div className="col-span-full text-center py-40 glass rounded-[4rem] border border-dashed border-white/60 shadow-inner">
            <div className="bg-slate-50 w-32 h-32 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
              <FileText className="h-16 w-16 text-slate-200" />
            </div>
            <p className="text-slate-400 text-3xl font-black tracking-tight">No study materials available yet.</p>
            <p className="text-slate-400 mt-2 font-medium text-lg">Check back later for updates.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Resources;
