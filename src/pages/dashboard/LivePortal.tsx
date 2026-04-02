import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Send, 
  Users, 
  Video, 
  Maximize2, 
  Minimize2, 
  X, 
  ExternalLink,
  Shield,
  Lock,
  User,
  Clock,
  Mic,
  MicOff,
  VideoOff,
  Settings,
  MoreVertical,
  Hand,
  Monitor
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { safeJson } from '../../utils/api';
import { showAlert } from '../../utils/alert';

const LivePortal = () => {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [liveClass, setLiveClass] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const [passwordInput, setPasswordInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchClass = async () => {
      try {
        const [res, enrollRes, profileRes] = await Promise.all([
          fetch(`/api/live-classes/${id}`),
          fetch('/api/my-enrollments', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/my-profile', { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (res.ok) {
          const data = await safeJson(res);
          
          // Access Control Check: Only allow if enrolled in the specific course
          if (data.course_id) {
            const enrollData = await enrollRes.json();
            const profileData = await profileRes.json();
            const userData = profileData.user;
            
            const activeEnrollments = enrollData.filter((e: any) => e.status === 'contacted');
            const userEnrolledCourseIds = userData?.enrolled_courses?.map((c: any) => c.id) || [];
            
            const isEnrolled = activeEnrollments.some((e: any) => e.course_id === data.course_id) || 
                             userEnrolledCourseIds.includes(data.course_id);
            
            if (!isEnrolled) {
              showAlert('Access Denied: You are not enrolled in the course associated with this live class.');
              navigate('/dashboard/live-classes');
              return;
            }
          }

          setLiveClass(data);
          // If no portal password, unlock by default
          if (!data.portal_password) {
            setIsUnlocked(true);
          }
        } else {
          showAlert('Live class not found');
          navigate('/dashboard/live-classes');
        }
      } catch (error) {
        console.error('Failed to fetch live class', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClass();
  }, [id, navigate, token]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === liveClass.portal_password) {
      setIsUnlocked(true);
    } else {
      showAlert('Incorrect Portal Password');
    }
  };

  useEffect(() => {
    if (!liveClass) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/live-chat-messages?class_id=${id}`);
        if (res.ok) {
          const data = await safeJson(res);
          setMessages(data);
        }
      } catch (error) {
        console.error('Failed to fetch messages', error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [id, liveClass]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageContent = newMessage.trim();
    const tempId = Date.now().toString();
    const optimisticMessage = {
      id: tempId,
      class_id: id,
      user_id: user?.uid,
      user_name: user?.name || 'Student',
      content: messageContent,
      role: user?.role,
      created_at: new Date().toISOString()
    };

    // Optimistic update
    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');

    try {
      const res = await fetch('/api/live-chat-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          class_id: id,
          user_id: user?.uid,
          user_name: user?.name,
          content: messageContent,
          role: user?.role
        }),
      });

      if (!res.ok) {
        // Revert
        setMessages(prev => prev.filter(m => m.id !== tempId));
        setNewMessage(messageContent);
        throw new Error('Failed to send message');
      }
      
      const data = await safeJson(res);
      setMessages(prev => prev.map(m => m.id === tempId ? data : m));
    } catch (error) {
      console.error('Failed to send message', error);
      showAlert('Failed to send message');
    }
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      videoContainerRef.current?.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!liveClass) return null;

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-slate-900 border border-white/10 p-8 rounded-3xl shadow-2xl"
        >
          <div className="w-16 h-16 bg-orange-600/20 rounded-2xl flex items-center justify-center mb-6">
            <Lock className="h-8 w-8 text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Protected Session</h2>
          <p className="text-slate-400 mb-8 text-sm">
            Please enter the Portal Password provided by your instructor to join the live session.
          </p>
          
          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Portal Password</label>
              <input 
                type="password" 
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password" 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                autoFocus
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-orange-900/20"
            >
              Unlock & Join
            </button>
            <button 
              type="button"
              onClick={() => navigate('/dashboard')}
              className="w-full text-slate-500 hover:text-white text-sm font-medium transition-colors"
            >
              Go Back
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="bg-orange-600 p-2 rounded-lg">
            <Video className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm md:text-base truncate max-w-[150px] md:max-w-md">
              {liveClass.title}
            </h1>
            <div className="flex items-center gap-2 text-[10px] md:text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                LIVE
              </span>
              <span>•</span>
              <span>{messages.length} messages</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Video Section */}
        <div 
          ref={videoContainerRef}
          className={`flex-1 bg-black relative group flex flex-col ${isFullScreen ? 'h-screen w-screen' : ''}`}
        >
          {/* Video Placeholder / Embed */}
          <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
            <div className="w-24 h-24 bg-orange-600/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <Video className="h-12 w-12 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Live Session in Progress</h2>
            <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase mb-4 border border-emerald-500/20">
              <Shield className="h-3 w-3" />
              4K Ultra HD Stream Optimized
            </div>
            <p className="text-slate-400 max-w-md mb-8">
              For the best experience (4K Quality & Low Latency), please join via the Zoom application.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
              <a 
                href={liveClass.zoom_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-900/20"
              >
                <ExternalLink className="h-5 w-5" />
                Join via Zoom App
              </a>
              {liveClass.zoom_id && (
                <div className="flex-1 bg-white/5 border border-white/10 p-4 rounded-2xl text-left">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-wider">Meeting Details</p>
                  <div className="space-y-1">
                    <p className="text-sm font-mono flex justify-between">
                      <span className="text-slate-400">ID:</span>
                      <span>{liveClass.zoom_id}</span>
                    </p>
                    {liveClass.zoom_password && (
                      <p className="text-sm font-mono flex justify-between">
                        <span className="text-slate-400">Pass:</span>
                        <span>{liveClass.zoom_password}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Video Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
                  <MicOff className="h-5 w-5 text-red-500" />
                </button>
                <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
                  <VideoOff className="h-5 w-5 text-red-500" />
                </button>
                <div className="h-6 w-[1px] bg-white/20 mx-2" />
                <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
                  <Hand className="h-5 w-5" />
                </button>
                <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
                  <Monitor className="h-5 w-5" />
                </button>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={toggleFullScreen}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  {isFullScreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                </button>
                <button 
                  onClick={() => setShowChat(!showChat)}
                  className={`p-2 rounded-full transition-colors md:hidden ${showChat ? 'bg-orange-600 text-white' : 'hover:bg-white/20'}`}
                >
                  <MessageSquare className="h-5 w-5" />
                </button>
                <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
                  <Settings className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Section */}
        <AnimatePresence>
          {showChat && (
            <motion.div 
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="w-full md:w-80 lg:w-96 bg-slate-900 border-l border-white/10 flex flex-col h-[400px] md:h-full relative md:relative z-30 right-0"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-orange-500" />
                  <h3 className="font-bold">Live Chat</h3>
                </div>
                <button 
                  onClick={() => setShowChat(false)}
                  className="p-1 hover:bg-white/10 rounded-md md:hidden"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 p-8">
                    <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
                    <p className="text-sm italic">No messages yet. Be the first to say hello!</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div key={msg.id || idx} className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          msg.role === 'admin' ? 'bg-red-500/20 text-red-500' : 'bg-orange-500/20 text-orange-500'
                        }`}>
                          {msg.role || 'Student'}
                        </span>
                        <span className="text-xs font-bold text-slate-300">{msg.user_name}</span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/5">
                        {msg.content}
                      </p>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-slate-950/50 border-t border-white/10">
                <form onSubmit={handleSendMessage} className="relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-orange-500 hover:text-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </form>
                <p className="text-[10px] text-slate-500 mt-3 text-center">
                  Please keep the conversation respectful and related to the class.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Chat Toggle (Mobile) */}
        {!showChat && (
          <button 
            onClick={() => setShowChat(true)}
            className="fixed bottom-6 right-6 p-4 bg-orange-600 text-white rounded-full shadow-2xl z-40 md:hidden"
          >
            <MessageSquare className="h-6 w-6" />
          </button>
        )}
      </main>

      {/* Footer / Status Bar */}
      <footer className="bg-slate-900/80 border-t border-white/10 px-4 py-2 flex items-center justify-between text-[10px] md:text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Users className="h-3 w-3" />
            {participants.length + 1} Online
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            Started 15m ago
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-green-500">
            <Shield className="h-3 w-3" />
            Secure Connection
          </span>
        </div>
      </footer>
    </div>
  );
};

export default LivePortal;
