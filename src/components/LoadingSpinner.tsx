import React from 'react';
import { motion } from 'motion/react';
import { useSettings } from '../context/SettingsContext';

export default function LoadingSpinner() {
  const { settings } = useSettings();
  const siteName = settings.site_name || "W'S Physics";
  const parts = siteName.split(' ');
  const firstPart = parts[0];
  const secondPart = parts.slice(1).join(' ');

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-8">
      <div className="relative">
        {/* Pulsing Outer Glow */}
        <motion.div
          className="absolute inset-0 bg-orange-500/20 rounded-2xl blur-2xl"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Main Logo Container */}
        <motion.div
          className="relative w-24 h-24 bg-white rounded-2xl shadow-2xl flex items-center justify-center border-2 border-orange-100 overflow-hidden"
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="text-orange-600 font-black text-3xl tracking-tighter flex flex-col items-center text-center px-2">
            <span>{firstPart}</span>
            {secondPart && <span className="text-sm uppercase tracking-[0.3em] -mt-1">{secondPart}</span>}
          </div>
          
          {/* Scanning Line */}
          <motion.div
            className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent"
            animate={{
              top: ["0%", "100%", "0%"],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </motion.div>
      </div>

      {/* Loading Bars */}
      <div className="flex gap-1.5 h-8 items-end">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 bg-orange-600 rounded-full"
            animate={{
              height: ["20%", "100%", "20%"],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.1,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em]"
      >
        Loading Excellence...
      </motion.p>
    </div>
  );
}
