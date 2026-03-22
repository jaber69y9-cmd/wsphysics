import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Video, AlertCircle } from 'lucide-react';
import { safeJson } from '../../utils/api';

const LiveClassViewer = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [liveClass, setLiveClass] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const getWebClientUrl = (url: string) => {
    if (!url) return '';
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      // Extract meeting ID from /j/123456789
      const match = pathname.match(/\/j\/(\d+)/);
      if (match && match[1]) {
        const meetingId = match[1];
        urlObj.pathname = `/wc/join/${meetingId}`;
        return urlObj.toString();
      }
      return url;
    } catch (e) {
      return url;
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading live class...</div>;
  }

  if (error || !liveClass) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Error</h2>
        <p className="text-slate-600 mb-6">{error}</p>
        <button onClick={() => navigate(-1)} className="btn-primary">Go Back</button>
      </div>
    );
  }

  const webUrl = getWebClientUrl(liveClass.url || liveClass.zoom_link);

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
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
              <p className="text-slate-400 text-xs">Live Session • {liveClass.date} {liveClass.time}</p>
            </div>
          </div>
        </div>
        <a 
          href={liveClass.url || liveClass.zoom_link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Open in Zoom App
        </a>
      </div>
      
      <div className="flex-1 relative bg-black">
        <iframe 
          src={webUrl}
          className="w-full h-full border-0"
          allow="camera; microphone; fullscreen; display-capture"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
        ></iframe>
      </div>
    </div>
  );
};

export default LiveClassViewer;
