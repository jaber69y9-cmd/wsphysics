import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Video, AlertCircle, Loader2, Maximize } from 'lucide-react';
import { safeJson } from '../../utils/api';

const WebClassViewer = () => {
  const { id } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [liveClass, setLiveClass] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      wrapperRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  };

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

  useEffect(() => {
    let api: any = null;
    
    if (liveClass && jitsiContainerRef.current) {
      const initJitsi = () => {
        const domain = 'meet.jit.si';
        const options = {
          roomName: liveClass.zoom_id || `PioneerAcademy_${liveClass.id}`,
          width: '100%',
          height: '100%',
          parentNode: jitsiContainerRef.current,
          userInfo: {
            displayName: user?.name || 'Student'
          },
          configOverwrite: {
            startWithAudioMuted: true,
            startWithVideoMuted: true,
            disableDeepLinking: true,
            prejoinPageEnabled: false
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
              'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
              'fodeviceselection', 'hangup', 'profile', 'chat', 'raisehand',
              'videoquality', 'filmstrip', 'shortcuts', 'tileview', 'help'
            ],
          }
        };
        // @ts-ignore
        api = new window.JitsiMeetExternalAPI(domain, options);
      };

      // @ts-ignore
      if (window.JitsiMeetExternalAPI) {
        initJitsi();
      } else {
        const script = document.createElement('script');
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        script.onload = initJitsi;
        document.body.appendChild(script);
      }
      
      return () => {
        if (api) {
          api.dispose();
        }
      };
    }
  }, [liveClass, user]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
        <Loader2 className="h-12 w-12 text-orange-600 animate-spin mb-4" />
        <p className="text-slate-400 font-medium">Connecting to Web Studio...</p>
      </div>
    );
  }

  if (error || !liveClass) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-8 text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mb-6" />
        <h2 className="text-3xl font-bold mb-2">Connection Error</h2>
        <p className="text-slate-400 mb-8 max-w-md">{error || 'Could not establish connection to the live studio.'}</p>
        <button 
          onClick={() => navigate(-1)} 
          className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-2xl font-bold transition-all"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-950 overflow-hidden">
      <div className="bg-slate-900 h-16 flex items-center justify-between px-6 border-b border-white/5">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-orange-600/20 p-2 rounded-lg">
              <Video className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <h1 className="text-white font-bold text-sm md:text-base">{liveClass.title}</h1>
              <p className="text-slate-500 text-[10px] uppercase tracking-wider font-bold">Native Web Studio</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Live</span>
        </div>
      </div>
      
      <div ref={wrapperRef} className="flex-1 relative bg-black">
        <div ref={jitsiContainerRef} className="w-full h-full" />
        <button 
          onClick={toggleFullScreen}
          className="absolute top-4 right-4 z-50 p-3 bg-black/50 hover:bg-black/80 text-white rounded-xl backdrop-blur-sm transition-all shadow-lg border border-white/10"
          title="Toggle Fullscreen"
        >
          <Maximize className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default WebClassViewer;
