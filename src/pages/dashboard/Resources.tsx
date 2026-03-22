import { safeJson } from '../../utils/api';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Video, FileText, ExternalLink, Download, X, Calendar, Users, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { showConfirm } from '../../utils/alert';

const Resources = ({ type }: { type: 'video' | 'pdf' }) => {
  const { token, user } = useAuth();
  const [resources, setResources] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-orange-600 tracking-tight">
          {type === 'video' ? 'Recorded Classes' : 'Study Materials'}
        </h1>
        <div className="bg-orange-50 px-4 py-2 rounded-full text-orange-600 font-bold text-sm border border-orange-100">
          {resources.length} {type === 'video' ? 'Videos' : 'Files'} Available
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource) => {
          const videoId = resource.type === 'video' ? getYoutubeId(resource.url) : null;
          const isDownloadable = resource.type !== 'video' && resource.url.startsWith('http'); // Simple heuristic
          
          return (
            <motion.div 
              key={resource.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative group flex flex-col ${!isDownloadable ? 'border-l-4 border-l-orange-500' : ''}`}
            >
              {videoId && (
                <img 
                  src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`} 
                  alt={resource.title} 
                  className="w-full h-40 object-cover rounded-lg mb-4"
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-lg text-slate-800 line-clamp-2">{resource.title}</h4>
              </div>
              <p className="text-slate-600 text-sm line-clamp-3 mb-4 flex-grow">{resource.description || 'No description provided.'}</p>
              
              <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-100">
                <span className="text-xs text-slate-500 font-medium">{new Date(resource.created_at).toLocaleDateString()}</span>
                {resource.type === 'video' ? (
                  <button 
                    onClick={() => setSelectedVideo(resource.url)}
                    className="text-orange-600 hover:text-orange-800 font-bold text-sm"
                  >
                    Watch
                  </button>
                ) : isDownloadable ? (
                  <a 
                    href={resource.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-orange-600 hover:text-orange-800 font-bold text-sm"
                    download
                  >
                    Download
                  </a>
                ) : (
                  <a 
                    href={resource.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-orange-600 hover:text-orange-800 font-bold text-sm"
                  >
                    View Details
                  </a>
                )}
              </div>
            </motion.div>
          );
        })}
        
        {resources.length === 0 && (
          <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-slate-200 shadow-inner">
            <FileText className="h-20 w-20 text-slate-200 mx-auto mb-6" />
            <p className="text-slate-400 text-2xl font-medium">No {type === 'video' ? 'recorded classes' : 'study materials'} available yet.</p>
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

export default Resources;
