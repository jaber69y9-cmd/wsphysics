import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { PlayCircle, Video, Clock, Search, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

const PublicVideoLibrary = () => {
  const { settings } = useSettings();
  const [videos, setVideos] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'video_classes'),
        orderBy('created_at', 'desc')
      );
      const snapshot = await getDocs(q);
      const videoData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      setVideos(videoData);
      
      if (videoData.length > 0) {
        setSelectedVideo(videoData[0]);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    try {
      const d = date.toDate ? date.toDate() : new Date(date);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) {
      return 'N/A';
    }
  };

  const filteredVideos = videos.filter(v => {
    const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         v.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (loading && videos.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 pt-32 pb-20">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-pulse">
          <div className="h-20 bg-slate-200 rounded-2xl w-1/3" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="aspect-video bg-slate-200 rounded-3xl" />
              <div className="h-8 bg-slate-200 rounded-xl w-3/4" />
              <div className="h-4 bg-slate-200 rounded-xl w-1/2" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex gap-4">
                  <div className="w-40 aspect-video bg-slate-200 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded-lg w-full" />
                    <div className="h-3 bg-slate-200 rounded-lg w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Video className="h-8 w-8 text-orange-600" />
              {settings.site_name || "W'S PHYSICS"} <span className="bg-orange-600 text-white px-3 py-1 rounded-2xl text-2xl md:text-3xl">Tube</span>
            </h1>
            <p className="text-slate-500 font-medium mt-1">Free high-quality physics class recordings and tutorials</p>
          </div>
          
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search videos..." 
                className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all w-full md:w-80 shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Player Area */}
          <div className="flex-1 space-y-6">
            <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-800 relative group">
              {selectedVideo ? (
                <iframe 
                  src={`https://www.youtube.com/embed/${selectedVideo.youtube_id}?autoplay=0&rel=0&modestbranding=1&showinfo=0`}
                  className="w-full h-full"
                  allowFullScreen
                  title={selectedVideo.title}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-4">
                  <PlayCircle className="h-20 w-20 opacity-20" />
                  <p className="text-xl font-bold">Select a video to play</p>
                </div>
              )}
            </div>

            {selectedVideo && (
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900">{selectedVideo.title}</h2>
                  <Link 
                    to="/login"
                    className="flex-shrink-0 bg-orange-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-orange-700 transition-all text-sm flex items-center gap-2"
                  >
                    Join Course <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                  <span className="flex items-center gap-1 font-bold bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full">
                    <Clock className="h-4 w-4" />
                    {formatDate(selectedVideo.created_at)}
                  </span>
                </div>
                <div className="h-px bg-slate-100 mb-6" />
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-lg">
                  {selectedVideo.description || 'No description provided for this class.'}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar Playlist */}
          <div className="w-full lg:w-[450px] shrink-0">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden sticky top-32">
              <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                <h3 className="font-black text-slate-800 flex items-center gap-2 text-lg">
                  More Videos
                  <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2.5 py-1 rounded-full">
                    {filteredVideos.length}
                  </span>
                </h3>
              </div>
              
              <div className="max-h-[calc(100vh-25rem)] overflow-y-auto p-4 space-y-4 scrollbar-hide">
                <AnimatePresence mode="popLayout">
                  {filteredVideos.map((video) => (
                    <motion.button
                      layout
                      key={video.id}
                      onClick={() => {
                        setSelectedVideo(video);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`w-full text-left flex gap-4 p-3 rounded-2xl transition-all group ${
                        selectedVideo?.id === video.id 
                          ? 'bg-red-50 ring-1 ring-red-200' 
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="relative w-40 aspect-video rounded-xl overflow-hidden shrink-0 bg-slate-100 shadow-sm">
                        <img 
                          src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`} 
                          alt={video.title} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {selectedVideo?.id === video.id && (
                          <div className="absolute inset-0 bg-orange-600/20 flex items-center justify-center">
                            <div className="bg-orange-600 text-white p-2 rounded-full shadow-lg">
                              <PlayCircle className="h-5 w-5" />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 py-1">
                        <h4 className={`font-bold text-base line-clamp-2 leading-tight mb-2 ${
                          selectedVideo?.id === video.id ? 'text-red-700' : 'text-slate-800'
                        }`}>
                          {video.title}
                        </h4>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          {formatDate(video.created_at)}
                        </p>
                      </div>
                    </motion.button>
                  ))}
                </AnimatePresence>

                {filteredVideos.length === 0 && (
                  <div className="text-center py-16">
                    <Video className="h-16 w-16 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold text-lg">No videos found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicVideoLibrary;
