import { safeJson } from '../utils/api';
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Clock, Users, Check, X, Send, CheckCircle2 } from 'lucide-react';
import { showAlert } from '../utils/alert';

const Programs = () => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');
  const [programs, setPrograms] = useState<any[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    current_class: '',
    school_name: '',
    college_name: ''
  });

  React.useEffect(() => {
    if (selectedProgram) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    };
  }, [selectedProgram]);

  React.useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const res = await fetch('/api/programs');
      if (res.ok) {
        const data = await safeJson(res);
        setPrograms(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEnrolling(true);
    try {
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          program_id: selectedProgram.id,
          program_title: selectedProgram.title,
          fee: selectedProgram.admission_fee || 0 // Use admission fee as initial fee
        })
      });
      if (res.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setSelectedProgram(null);
          setFormData({ name: '', phone: '', current_class: '', school_name: '', college_name: '' });
        }, 3000);
      } else {
        const err = await res.json();
        showAlert(err.error || 'Failed to submit enrollment. Please try again.');
      }
    } catch (error) {
      console.error(error);
      showAlert('An error occurred. Please try again.');
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDashboard ? 'pt-8' : 'pt-12'} pb-20 px-4 sm:px-6 lg:px-8 bg-slate-50`}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="section-title">
            Our Premium Programs
          </h1>
          <p className="section-subtitle">
            Choose the perfect course to accelerate your physics journey. Designed for excellence.
          </p>
        </motion.div>

        <div className="space-y-20">
          {/* Group programs by target audience (e.g., HSC 26) */}
          {Array.from(new Set(programs.map(p => p.target_audience))).map((category) => (
            <div key={category} className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-10 bg-orange-600 rounded-full" />
                <h2 className="text-3xl font-bold text-orange-600">{category || 'General Programs'}</h2>
              </div>

              <div className="grid grid-cols-1 gap-12">
                {programs.filter(p => p.target_audience === category).map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 transition-all duration-500 hover:translate-y-[-4px]"
                  >
                    {/* Orange Header */}
                    <div className="bg-orange-600 p-8 md:p-10 relative overflow-hidden">
                      <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                      <h3 className="text-3xl font-bold text-white relative z-10">
                        {course.title}
                      </h3>
                    </div>
                    
                    <div className="p-8 md:p-12 space-y-8">
                      <div>
                        <p className="text-slate-500 font-medium mb-2">{course.title} Physics</p>
                        <p className="text-slate-600 leading-relaxed">
                          {course.description}
                        </p>
                      </div>

                      {/* Fee Section - Styled like the image */}
                      <div className="bg-slate-50/50 rounded-3xl p-8 space-y-6 border border-slate-100">
                        <div className="flex items-center gap-4">
                          <div className="bg-orange-600/10 p-3 rounded-xl">
                            <BookOpen className="h-6 w-6 text-orange-600" />
                          </div>
                          <div className="flex-1">
                            <span className="text-slate-500 font-medium">Admission Fee: </span>
                            <span className="text-orange-600 font-bold text-xl">৳{course.admission_fee || 0}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="bg-orange-600/10 p-3 rounded-xl">
                            <Clock className="h-6 w-6 text-orange-600" />
                          </div>
                          <div className="flex-1">
                            <span className="text-slate-500 font-medium">Monthly Fee: </span>
                            <span className="text-orange-600 font-bold text-xl">৳{course.monthly_fee || 0}</span>
                          </div>
                        </div>
                      </div>

                      {/* Footer Section */}
                      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-slate-100">
                        <div className="text-center md:text-left">
                          <span className="text-3xl font-black text-orange-600">৳{course.admission_fee || 0}</span>
                          <span className="text-xs text-slate-400 block font-bold uppercase tracking-widest mt-1">Admission Fee</span>
                        </div>
                        <button 
                          onClick={() => setSelectedProgram(course)}
                          className="w-full md:w-auto bg-gradient-to-r from-orange-600 to-orange-500 text-white py-4 px-12 rounded-2xl font-bold text-lg shadow-xl shadow-orange-900/20 hover:shadow-orange-900/40 transition-all flex items-center justify-center gap-3 group"
                        >
                          <Users className="h-5 w-5 group-hover:scale-110 transition-transform" />
                          Enroll Now
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enrollment Modal */}
      <AnimatePresence>
        {selectedProgram && (
          <div 
            className="fixed inset-0 z-[10000] flex items-start justify-center p-4 pt-24 bg-black/60 backdrop-blur-sm overflow-y-auto scrollbar-hide"
            onClick={() => setSelectedProgram(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {isSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-12 text-center space-y-6"
                >
                  <motion.div 
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                    className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto"
                  >
                    <CheckCircle2 className="h-14 w-14" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">Registration Successful!</h2>
                    <p className="text-slate-600 text-lg">We will contact you shortly for further details.</p>
                  </motion.div>
                </motion.div>
              ) : (
                <>
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800">Enrollment Form</h2>
                    <button onClick={() => setSelectedProgram(null)} className="text-slate-400 hover:text-slate-600">
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  <form onSubmit={handleEnroll} className="p-6 space-y-4 overflow-y-auto max-h-[70vh] scrollbar-hide">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Program</label>
                      <input 
                        type="text" 
                        value={selectedProgram.title} 
                        readOnly 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-600 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Enter your full name"
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-orange-500"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Mobile Number</label>
                      <input 
                        type="tel" 
                        required
                        placeholder="01XXXXXXXXX"
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-orange-500"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Current Class</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. HSC 2025"
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-orange-500"
                        value={formData.current_class}
                        onChange={(e) => setFormData({...formData, current_class: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">School Name</label>
                        <input 
                          type="text" 
                          placeholder="Your school"
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-orange-500"
                          value={formData.school_name}
                          onChange={(e) => setFormData({...formData, school_name: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">College Name</label>
                        <input 
                          type="text" 
                          placeholder="Your college"
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-orange-500"
                          value={formData.college_name}
                          onChange={(e) => setFormData({...formData, college_name: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input type="checkbox" required className="mt-1 rounded text-orange-600 focus:ring-orange-500" />
                        <span className="text-sm text-slate-600">
                          I agree to the <a href="#" className="text-orange-600 hover:underline">Terms and Conditions</a>. After admin approval, I will be able to log in using the provided Gmail address.
                        </span>
                      </label>
                    </div>
                    <div className="pt-4 flex gap-3">
                      <button 
                        type="button"
                        onClick={() => setSelectedProgram(null)}
                        className="flex-1 bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        disabled={isEnrolling}
                        className="flex-1 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                      >
                        {isEnrolling ? 'Submitting...' : <><Send className="h-4 w-4" /> Submit Application</>}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Programs;
