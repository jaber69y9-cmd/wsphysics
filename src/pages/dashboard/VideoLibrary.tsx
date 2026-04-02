import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { PlayCircle, Video, Clock, ChevronRight, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const VideoLibrary = () => {
  const { user: authUser } = useAuth();
  const user = authUser as any;
  const [videos, setVideos] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('all');

  useEffect(() => {
    if (user?.program_id) {
      setSelectedProgram(user.program_id);
    }
    fetchVideos();
  }, [user?.id, user?.program_id]);

  const fetchVideos = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, 'video_classes'),
        orderBy('created_at', 'desc')
      );
      const snapshot = await getDocs(q);
      const videoData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      setVideos(videoData);
      
      // Auto-select first video that matches user's program if possible
      const initialVideo = (user as any)?.program_id 
        ? videoData.find((v: any) => String(v.program_id) === String((user as any).program_id)) || videoData[0]
        : videoData[0];
        
      if (initialVideo) {
        setSelectedVideo(initialVideo);
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
    const matchesProgram = selectedProgram === 'all' || String(v.program_id) === String(selectedProgram);
    return matchesSearch && matchesProgram;
  });

  if (loading && videos.length === 0) {
    return (
      <div className="max-w-[1600px] mx-auto space-y-8 animate-pulse">
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
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Video className="h-8 w-8 text-orange-600" />
            W'S <span className="text-orange-600">Tube</span>
          </h1>
          <p className="text-slate-500 font-medium">Watch your ad-free class recordings anytime</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search videos..." 
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Player Area */}
        <div className="flex-1 space-y-4">
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
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-2xl font-black text-slate-900 mb-2">{selectedVideo.title}</h2>
              <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                <span className="flex items-center gap-1 font-bold bg-orange-50 text-orange-600 px-3 py-1 rounded-full">
                  <Clock className="h-4 w-4" />
                  {formatDate(selectedVideo.created_at)}
                </span>
              </div>
              <div className="h-px bg-slate-100 mb-4" />
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                {selectedVideo.description || 'No description provided for this class.'}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar Playlist */}
        <div className="w-full lg:w-[400px] shrink-0">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden sticky top-6">
            <div className="p-5 border-b border-slate-50 bg-slate-50/50">
              <h3 className="font-black text-slate-800 flex items-center gap-2">
                Up Next
                <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                  {filteredVideos.length}
                </span>
              </h3>
            </div>
            
            <div className="max-h-[calc(100vh-20rem)] overflow-y-auto p-3 space-y-3 scrollbar-hide">
              <AnimatePresence mode="popLayout">
                {filteredVideos.map((video) => (
                  <motion.button
                    layout
                    key={video.id}
                    onClick={() => {
                      setSelectedVideo(video);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-full text-left flex gap-3 p-2 rounded-2xl transition-all group ${
                      selectedVideo?.id === video.id 
                        ? 'bg-orange-50 ring-1 ring-orange-200' 
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="relative w-32 aspect-video rounded-xl overflow-hidden shrink-0 bg-slate-100">
                      <img 
                        src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`} 
                        alt={video.title} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {selectedVideo?.id === video.id && (
                        <div className="absolute inset-0 bg-orange-600/20 flex items-center justify-center">
                          <div className="bg-orange-600 text-white p-1.5 rounded-full shadow-lg">
                            <PlayCircle className="h-4 w-4" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 py-1">
                      <h4 className={`font-bold text-sm line-clamp-2 leading-tight mb-1 ${
                        selectedVideo?.id === video.id ? 'text-orange-700' : 'text-slate-800'
                      }`}>
                        {video.title}
                      </h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {formatDate(video.created_at)}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>

              {filteredVideos.length === 0 && (
                <div className="text-center py-12">
                  <Video className="h-12 w-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-400 font-bold">No videos found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoLibrary;
