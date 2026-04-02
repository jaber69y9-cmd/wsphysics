import { safeJson } from '../utils/api';
import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Play, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RecordedClasses = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/web-recorded-classes')
      .then(res => safeJson(res))
      .then(data => setClasses(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error(err);
        setClasses([]);
      });
  }, []);

  const getYoutubeThumbnail = (url: string) => {
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://img.youtube.com/vi/${match[2]}/maxresdefault.jpg`;
    }
    return 'https://picsum.photos/seed/physics/800/450';
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="section-title">Recorded Classes</h1>
          <p className="section-subtitle">Access previous lectures and revision materials.</p>
        </motion.div>

        {!user ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-slate-200">
            <Lock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Login Required</h3>
            <p className="text-slate-600 mb-6">Please login to access recorded classes.</p>
            <a href="/login" className="btn-primary">Login Now</a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {classes.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all group"
              >
                <a href={video.url} target="_blank" rel="noopener noreferrer" className="block relative aspect-video bg-slate-900 overflow-hidden">
                  <img 
                    src={getYoutubeThumbnail(video.url)} 
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center text-white shadow-xl transform group-hover:scale-110 transition-transform">
                      <Play className="h-8 w-8 ml-1" />
                    </div>
                  </div>
                </a>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">{video.title}</h3>
                  <div className="flex items-center justify-between text-sm text-slate-500 mt-4">
                    <span>{new Date(video.created_at).toLocaleDateString()}</span>
                    <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold">
                      Batch {video.batch_id || 'All'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
            {classes.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-slate-500">No recorded classes available.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordedClasses;
