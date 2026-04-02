import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Video, AlertCircle, Loader2, ExternalLink, MonitorPlay, X, MessageSquare } from 'lucide-react';
import { safeJson } from '../../utils/api';

const LiveClassViewer = () => {
  const { id } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [liveClass, setLiveClass] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isWideMode, setIsWideMode] = useState(false);
  const [showChat, setShowChat] = useState(true);

  useEffect(() => {
    const fetchClass = async () => {
      try {
        const res = await fetch('/api/live-classes', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await safeJson(res);
          const found = data.find((c: any) => c.id === id);
          if (found) {
            setLiveClass(found);
          } else {
            setError('Live class not found');
          }
        }
      } catch (err) {
        setError('Failed to load class details');
      } finally {
        setLoading(false);
      }
    };
    fetchClass();
  }, [id, token]);

  const getWebClientUrl = (lc: any) => {
    if (!lc) return '';
    
    // Check if it's a Jitsi link
    if (lc.zoom_link && lc.zoom_link.includes('meet.jit.si')) {
      const userName = user?.name || 'Student';
      // Append userInfo to Jitsi URL
      const separator = lc.zoom_link.includes('?') ? '&' : '?';
      return `${lc.zoom_link}${separator}userInfo.displayName="${encodeURIComponent(userName)}"`;
    }
    
    // Default Zoom logic
    const meetingId = lc.zoom_id?.replace(/\s/g, '');
    const passcode = lc.zoom_password;
    // role=0 for attendee, un=User Name
    const userName = user?.name || 'Student';
    return `https://zoom.us/wc/${meetingId}/join?pwd=${passcode}&role=0&un=${encodeURIComponent(userName)}`;
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-100px)] flex flex-col items-center justify-center bg-slate-900 rounded-3xl">
        <Loader2 className="h-12 w-12 text-orange-600 animate-spin mb-4" />
        <p className="text-slate-400">Connecting to Zoom Web Client...</p>
      </div>
    );
  }

  if (error || !liveClass) {
    return (
      <div className="p-8 text-center bg-slate-900 rounded-3xl h-[calc(100vh-100px)] flex flex-col items-center justify-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
        <p className="text-slate-400 mb-6">{error}</p>
        <button onClick={() => navigate(-1)} className="bg-orange-600 text-white px-8 py-3 rounded-2xl font-bold">Go Back</button>
      </div>
    );
  }

  const webUrl = getWebClientUrl(liveClass);

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-slate-900 overflow-hidden shadow-2xl">
      <div className="bg-slate-950 p-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-orange-600/20 p-2 rounded-lg">
              <Video className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <h1 className="text-white font-bold">{liveClass.title}</h1>
              <p className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">
                {liveClass.zoom_link?.includes('meet.jit.si') ? 'Jitsi Embedded Viewer' : 'Zoom Embedded Viewer'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsWideMode(!isWideMode)}
            className={`p-2 rounded-xl transition-all ${isWideMode ? 'bg-orange-600 text-white' : 'bg-white/10 text-slate-400 hover:bg-white/20'}`}
            title="Full Screen Mode"
          >
            <MonitorPlay className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        <div className={`flex-1 flex flex-col relative overflow-hidden bg-slate-950 ${isWideMode ? 'fixed inset-0 z-50' : ''}`}>
          {isWideMode && (
            <div className="absolute top-4 left-4 z-50 flex gap-2">
              <button 
                onClick={() => setIsWideMode(false)}
                className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-xl backdrop-blur-md transition-all flex items-center gap-2 text-xs font-bold"
              >
                <X className="h-4 w-4" /> Exit Full Screen
              </button>
            </div>
          )}
          
          {/* Fallback info for iframe issues */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-0">
            <Video className="h-16 w-16 text-slate-800 mb-4" />
            <p className="text-slate-500 max-w-md">
              If the meeting doesn't load below, your browser may be blocking the connection. 
              Try using the "Open in App" button above.
            </p>
          </div>
          
          <iframe 
            src={webUrl}
            className="w-full h-full border-0 relative z-10"
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads"
            title="Live Meeting"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default LiveClassViewer;
