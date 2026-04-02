import React from 'react';
import { motion } from 'motion/react';
import { Video } from 'lucide-react';
import { Link } from 'react-router-dom';

const LiveClassButton = ({ className = "" }: { className?: string }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={className}
    >
      <Link
        to="/dashboard/live-classes"
        className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-lg shadow-orange-600/20"
      >
        <Video className="h-4 w-4 animate-pulse" />
        Live Class
      </Link>
    </motion.div>
  );
};

export default LiveClassButton;
