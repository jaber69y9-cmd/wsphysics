import { safeJson } from '../utils/api';
import { showAlert } from '../utils/alert';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Book, Clock, Users, CheckCircle, Loader, X, Send, CheckCircle2 } from 'lucide-react';

const Courses = () => {
  const [programs, setPrograms] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    current_class: '',
    school_name: '',
    college_name: '',
    profile_pic: ''
  });

  useEffect(() => {
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500000) { // 500KB limit
        showAlert('Image size should be less than 500KB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profile_pic: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const fetchProgramsAndSettings = async () => {
      try {
        const [progRes, setRes] = await Promise.all([
          fetch('/api/programs'),
          fetch('/api/settings')
        ]);
        if (progRes.ok) {
          const data = await progRes.json();
          setPrograms(Array.isArray(data) ? data : []);
        }
        if (setRes.ok) {
          const data = await setRes.json();
          setSettings(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgramsAndSettings();
  }, []);

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
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-12 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="section-title">Our Programs</h1>
          <p className="section-subtitle">
            Comprehensive physics programs designed for every stage of your academic journey.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader className="h-10 w-10 text-orange-600 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {programs.length === 0 ? (
              <div className="col-span-3 text-center py-20 text-slate-500">
                <Book className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p>No programs available at the moment.</p>
              </div>
            ) : (
              programs.map((prog, index) => (
                <motion.div 
                  key={prog.id}
                  whileHover={{ y: -10 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-3xl overflow-hidden shadow-lg border border-slate-100 flex flex-col group"
                >
                  <div className="h-48 bg-slate-100 relative overflow-hidden">
                    {prog.image_url ? (
                      <img src={prog.image_url} alt={prog.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-50">
                        <Book className="h-12 w-12 text-orange-200" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                      {prog.target_audience}
                    </div>
                  </div>
                  <div className="p-8 space-y-6 flex-1 flex flex-col">
                    <h3 className="text-2xl font-bold text-slate-900">{prog.title}</h3>
                    <p className="text-slate-600 mb-4">{prog.description}</p>
                    <div className="flex justify-between items-center bg-orange-50 p-4 rounded-xl border border-orange-100">
                      <div>
                        <span className="text-xs text-slate-500 block uppercase tracking-wider font-bold">Admission Fee</span>
                        <span className="text-xl font-black text-orange-600">৳{prog.admission_fee || 0}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-500 block uppercase tracking-wider font-bold">Monthly Fee</span>
                        <span className="text-xl font-black text-orange-600">৳{prog.monthly_fee || 0}</span>
                      </div>
                    </div>
                    <ul className="space-y-3 flex-1">
                      {prog.features && prog.features.split(',').map((feature: string, i: number) => (
                        <li key={i} className="flex items-center gap-3 text-slate-700">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" /> 
                          <span>{feature.trim()}</span>
                        </li>
                      ))}
                    </ul>
                    <button 
                      onClick={() => setSelectedProgram(prog)}
                      className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl hover:bg-orange-700 transition-colors mt-auto shadow-lg shadow-orange-600/20"
                    >
                      Enroll Now
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Enrollment Modal */}
      <AnimatePresence>
        {selectedProgram && (
          <div 
            className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-24 bg-black/60 backdrop-blur-sm overflow-y-auto scrollbar-hide"
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
                <div className="p-12 text-center space-y-4">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-12 w-12" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Enrollment Successful!</h2>
                  <p className="text-slate-600">We will contact you shortly for further details.</p>
                </div>
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
                    <div className="flex flex-col items-center mb-6">
                      <div className="w-24 h-24 bg-slate-100 rounded-full overflow-hidden mb-2 border-2 border-orange-500">
                        {formData.profile_pic ? (
                          <img src={formData.profile_pic} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <Users className="h-10 w-10" />
                          </div>
                        )}
                      </div>
                      <label className="text-xs font-bold text-orange-600 cursor-pointer hover:text-orange-700">
                        Upload Profile Picture
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                        <input 
                          type="email" 
                          required
                          placeholder="your@email.com"
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-orange-500"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Login Password</label>
                        <input 
                          type="password" 
                          required
                          placeholder="Create a password"
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-orange-500"
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                      </div>
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

export default Courses;
