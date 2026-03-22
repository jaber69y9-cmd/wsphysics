import { safeJson } from '../utils/api';
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { PlayCircle, FileText, Lock, Loader, ArrowRight } from 'lucide-react';

const Resources = () => {
  const [resources, setResources] = useState<any[]>([]);
  const [webClasses, setWebClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/resources').then(res => safeJson(res)),
      fetch('/api/web-recorded-classes').then(res => safeJson(res))
    ]).then(([resourcesData, webClassesData]) => {
      setResources(Array.isArray(resourcesData) ? resourcesData : []);
      setWebClasses(Array.isArray(webClassesData) ? webClassesData : []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const getYoutubeThumbnail = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11)
      ? `https://img.youtube.com/vi/${match[2]}/mqdefault.jpg`
      : `https://picsum.photos/seed/${url}/400/225`;
  };

  return (
    <div className="min-h-screen pt-12 pb-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="section-title">Recorded Classes</h1>
          <p className="section-subtitle">
            Access our library of high-quality recorded lectures.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader className="h-10 w-10 text-orange-600 animate-spin" />
          </div>
        ) : (
          <div className="space-y-12">
            {/* Free/Web Classes */}
            {webClasses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {webClasses.map((cls, index) => (
                  <motion.a
                    key={cls.id}
                    href={cls.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100 group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                  >
                    <div className="relative aspect-video bg-slate-100 overflow-hidden">
                      <img 
                        src={getYoutubeThumbnail(cls.url)} 
                        alt={cls.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                        <div className="bg-white/95 p-4 rounded-full shadow-2xl group-hover:scale-110 transition-transform duration-500">
                          <PlayCircle className="h-10 w-10 text-orange-600 fill-orange-600/10" />
                        </div>
                      </div>
                      <div className="absolute bottom-4 right-4 bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                        Free Class
                      </div>
                    </div>
                    <div className="p-8 space-y-4">
                      <h3 className="text-xl font-black text-slate-800 leading-tight group-hover:text-orange-600 transition-colors line-clamp-2">
                        {cls.title}
                      </h3>
                      <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
                        {cls.description || 'Watch this recorded lecture to master physics concepts with ease.'}
                      </p>
                      <div className="pt-4 flex items-center justify-between border-t border-slate-50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recorded Lecture</span>
                        <div className="flex items-center gap-1 text-orange-600 font-bold text-sm group-hover:translate-x-1 transition-transform">
                          Watch Now <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200 shadow-inner">
                <PlayCircle className="h-20 w-20 text-slate-200 mx-auto mb-6" />
                <p className="text-slate-400 text-2xl font-medium">No recorded classes available yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Resources;
