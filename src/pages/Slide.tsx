import React from 'react';
import { motion } from 'motion/react';
import { useSettings } from '../context/SettingsContext';
import { BookOpen, PlayCircle, Award, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const Slide = () => {
  const { settings, loading } = useSettings();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-8 lg:p-12 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative w-full h-full max-w-7xl max-h-[85vh] bg-white rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden border-[12px] border-white flex flex-col lg:flex-row items-center"
      >
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-orange-50/50 to-transparent"></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
        </div>

        <div className="flex-1 p-8 lg:p-16 relative z-10 space-y-8 text-center lg:text-left">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-2 rounded-full font-black text-[10px] tracking-[0.3em] uppercase shadow-lg shadow-orange-200"
          >
            <Award className="h-4 w-4" /> Excellence in Physics
          </motion.div>
          
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-7xl font-black text-slate-900 leading-[0.9] tracking-tighter">
              Master the <br />
              <span className="text-orange-600">Concepts</span>
            </h1>
            <p className="text-lg lg:text-xl text-slate-500 max-w-xl leading-relaxed font-medium">
              Unlock your potential with expert guidance. We turn complex physics into intuitive solutions.
            </p>
          </div>

          <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
            <Link to="/courses" className="group bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-base hover:bg-orange-600 transition-all duration-500 shadow-2xl flex items-center gap-3">
              <BookOpen className="h-5 w-5 group-hover:rotate-12 transition-transform" /> Explore Programs
            </Link>
            <Link to="/online-courses" className="group bg-white text-slate-900 border-2 border-slate-100 px-8 py-4 rounded-2xl font-bold text-base hover:border-orange-200 hover:text-orange-600 transition-all duration-500 shadow-xl flex items-center gap-3">
              <PlayCircle className="h-5 w-5 group-hover:scale-110 transition-transform" /> Online Classes
            </Link>
          </div>
        </div>

        <div className="flex-1 h-full relative p-8 lg:p-12 hidden lg:block">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.3, ease: "backOut" }}
            className="w-full h-full relative"
          >
            <div className="absolute inset-0 bg-orange-600 rounded-[3rem] rotate-3 opacity-5 scale-105"></div>
            <img 
              src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              alt="Physics Education" 
              className="w-full h-full object-contain relative z-10 drop-shadow-[0_35px_35px_rgba(0,0,0,0.15)]"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Slide;
