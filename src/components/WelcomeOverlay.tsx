import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Rocket } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const WelcomeOverlay = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { settings } = useSettings();

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedWsPhysics');
    if (!hasVisited) {
      setIsVisible(true);
    }
  }, []);

  const handleEnter = () => {
    localStorage.setItem('hasVisitedWsPhysics', 'true');
    setIsVisible(false);
    
    // Play welcome audio using SpeechSynthesis
    const welcomeText = `Welcome to ${settings.site_name || "W's Physics"}. We are glad to have you here.`;
    const utterance = new SpeechSynthesisUtterance(welcomeText);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/90 backdrop-blur-2xl px-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="max-w-md w-full bg-white rounded-[32px] p-10 text-center shadow-2xl border border-white/20"
          >
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-8"
            >
              <Rocket className="h-12 w-12 text-orange-600" />
            </motion.div>
            
            <h2 className="text-3xl font-black text-slate-800 mb-4 leading-tight">
              Welcome to <span className="text-orange-600">{settings.site_name || "W's Physics"}</span>
            </h2>
            
            <p className="text-slate-500 mb-10 text-lg leading-relaxed">
              Experience physics like never before. Ready to start your journey?
            </p>
            
            <button
              onClick={handleEnter}
              className="w-full glass-btn group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-3 text-lg">
                <Play className="h-5 w-5 fill-current" /> ENTER WEBSITE
              </span>
              <motion.div
                className="absolute inset-0 bg-white/20"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.5 }}
              />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeOverlay;
