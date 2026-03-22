import React from 'react';
import { motion } from 'motion/react';
import { Award, GraduationCap, Star, Book, Users, Rocket, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

const About = () => {
  const { settings, loading } = useSettings();

  return (
    <div className="min-h-screen pt-12 pb-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="section-title">
            About Us
          </h1>
          <p className="section-subtitle">
            Learn more about our mission and the team behind your success.
          </p>
        </motion.div>

        {/* Intro Section */}
        <div className="max-w-5xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden border border-orange-100/50 relative group"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50 group-hover:opacity-80 transition-opacity"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-50 rounded-full blur-3xl -ml-32 -mb-32 opacity-50 group-hover:opacity-80 transition-opacity"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 items-stretch relative z-10">
              <div className="md:col-span-2 relative h-[350px] md:h-auto overflow-hidden">
                {!loading && (
                  <img 
                    src={settings.about_image || "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=400&h=500&auto=format&fit=crop"}
                    alt="Physics Teacher" 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent md:hidden"></div>
              </div>
              
              <div className="md:col-span-3 p-6 md:p-12 flex flex-col justify-center text-center md:text-left">
                <div className="flex justify-center md:justify-start mb-6">
                  <span className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-2 rounded-full text-xs md:text-sm font-black uppercase tracking-[0.2em] shadow-lg shadow-orange-200 animate-pulse">
                    Mentor & Instructor
                  </span>
                </div>
                
                <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight tracking-tight">
                  <span className="bg-gradient-to-r from-orange-600 via-red-500 to-orange-600 bg-clip-text text-transparent drop-shadow-md filter saturate-150">
                    Engineer Mozammel Haque "W-Sir"
                  </span>
                </h2>
                
                <p className="text-slate-600 text-base md:text-lg leading-relaxed mb-8 whitespace-pre-wrap font-medium">
                  {settings.about_text || "With a strong academic background and years of teaching experience, I am dedicated to helping students master complex concepts. My teaching philosophy revolves around visualizing concepts rather than rote memorization."}
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="bg-orange-100 p-2.5 rounded-xl">
                      <GraduationCap className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">B.Sc in CEP</div>
                      <div className="text-xs text-slate-500 font-medium">SUST</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="bg-red-100 p-2.5 rounded-xl">
                      <Award className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">M.Sc in CEP</div>
                      <div className="text-xs text-slate-500 font-medium">BUET</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Achievements Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-slate-200 mb-20"
        >
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-800">Why Choose W'S Physics?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4 relative">
              <div className="bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto border border-orange-100 relative z-10">
                <Star className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Master Concepts</h3>
              <p className="text-slate-500">We break down complex theories into simple, digestible parts using real-life examples.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto border border-red-100">
                <Book className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Exam Focused</h3>
              <p className="text-slate-500">Special emphasis on problem-solving techniques for board and admission exams.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="bg-amber-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto border border-amber-100">
                <Users className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Personal Care</h3>
              <p className="text-slate-500">One-on-one doubt solving sessions and regular progress tracking for every student.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
