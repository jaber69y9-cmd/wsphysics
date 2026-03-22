import { safeJson } from '../utils/api';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, CheckCircle2, X, Send, Copy, Clock, PlayCircle } from 'lucide-react';
import { showAlert } from '../utils/alert';

const OnlineCourses = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [recordedClasses, setRecordedClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    gmail: '',
    password: '',
    transaction_id: '',
    payment_number: '',
    payment_method: '',
    admission_month: '',
    extra_payment: '0',
    profile_pic: ''
  });

  useEffect(() => {
    if (selectedCourse) {
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
  }, [selectedCourse]);

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

  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    const fetchCoursesAndSettings = async () => {
      try {
        const [coursesRes, settingsRes, recordedRes] = await Promise.all([
          fetch('/api/courses'),
          fetch('/api/public/settings'),
          fetch('/api/web-recorded-classes')
        ]);
        
        if (coursesRes.ok) {
          const data = await safeJson(coursesRes);
          setCourses(Array.isArray(data) ? data : []);
        }
        if (settingsRes.ok) {
          const data = await safeJson(settingsRes);
          setSettings(data);
        }
        if (recordedRes.ok) {
          const data = await safeJson(recordedRes);
          setRecordedClasses(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCoursesAndSettings();
  }, []);

  const getCourseClassCount = (courseId: string) => {
    return recordedClasses.filter(c => c.course_id === courseId).length;
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
          course_id: selectedCourse.id,
          course_title: selectedCourse.title,
          status: 'pending'
        })
      });
      if (res.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setSelectedCourse(null);
          setFormData({ 
            name: '', 
            phone: '', 
            gmail: '', 
            password: '', 
            transaction_id: '', 
            payment_number: '', 
            payment_method: '',
            admission_month: '', 
            extra_payment: '0', 
            profile_pic: '' 
          });
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-12 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="section-title">Online Courses</h1>
          <p className="section-subtitle">
            Learn from anywhere with our premium recorded and live courses.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, index) => (
            <motion.div 
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-100"
            >
              <div className="h-48 bg-slate-200 relative">
                <img 
                  src={course.image_url || `https://picsum.photos/seed/course${course.id}/800/600`} 
                  alt={course.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-black h-8 w-8 flex items-center justify-center rounded-full shadow-lg border border-slate-200">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <div className="absolute top-4 right-4 bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  PREMIUM
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{course.title}</h3>
                <div className="text-slate-600 text-sm mb-4 whitespace-pre-wrap">
                  {course.description}
                </div>
                
                <div className="flex items-center gap-4 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-600 flex-1">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">{course.duration || 'N/A'}</div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Duration</div>
                    </div>
                  </div>
                  <div className="w-px h-8 bg-slate-200"></div>
                  <div className="flex items-center gap-2 text-slate-600 flex-1">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                      <PlayCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">{course.lecture_count || getCourseClassCount(course.id)}</div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Lectures</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <div className="flex flex-col">
                    <div className="text-green-600 font-black text-2xl">
                      {course.price && Number(course.price) > 0 ? `৳${course.price}` : 'Free'}
                    </div>
                    <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                      Course Fee
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedCourse(course)}
                  className="w-full bg-orange-100 text-orange-700 font-bold py-3 rounded-xl hover:bg-orange-200 transition-colors"
                >
                  Enroll Now
                </button>
              </div>
            </motion.div>
          ))}
          
          {courses.length === 0 && (
            <div className="col-span-full text-center py-20 text-slate-500">
              <BookOpen className="h-16 w-16 mx-auto text-slate-300 mb-4" />
              <p className="text-xl">New courses are coming soon.</p>
            </div>
          )}
        </div>
      </div>

      {/* Enrollment Modal */}
      <AnimatePresence>
        {selectedCourse && (
          <div 
            className="fixed inset-0 z-[10000] flex items-start justify-center p-4 pt-24 bg-black/60 backdrop-blur-sm overflow-y-auto scrollbar-hide"
            onClick={() => setSelectedCourse(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {isSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-12 text-center space-y-6 overflow-y-auto"
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
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-slate-800">Enrollment Form</h2>
                    <button onClick={() => { console.log('Selected Course:', selectedCourse); setSelectedCourse(null); }} className="text-slate-400 hover:text-slate-600">
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  <form onSubmit={handleEnroll} className="p-6 space-y-4 overflow-y-auto scrollbar-hide">
                    <div className="flex flex-col items-center mb-6">
                      <div className="w-24 h-24 bg-slate-100 rounded-full overflow-hidden mb-2 border-2 border-orange-500">
                        {formData.profile_pic ? (
                          <img src={formData.profile_pic} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <BookOpen className="h-10 w-10" />
                          </div>
                        )}
                      </div>
                      <label className="text-xs font-bold text-orange-600 cursor-pointer hover:text-orange-700">
                        Upload Profile Picture
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Course</label>
                      <input 
                        type="text" 
                        value={selectedCourse.title} 
                        readOnly 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-600 outline-none"
                      />
                    </div>
                    <div className="space-y-6">
                      <div className="border-b border-slate-100 pb-2">
                        <h3 className="text-lg font-bold text-slate-800">Personal Information</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                          <input 
                            type="text" 
                            required
                            placeholder="Enter your full name"
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
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
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1">Gmail</label>
                          <input 
                            type="email" 
                            required
                            placeholder="Enter your Gmail address"
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                            value={formData.gmail}
                            onChange={(e) => setFormData({...formData, gmail: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1">Login Password</label>
                          <input 
                            type="password" 
                            required
                            placeholder="Create a password"
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="border-b border-slate-100 pb-2">
                        <h3 className="text-lg font-bold text-slate-800">Payment Details</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1">Payment Method</label>
                          <select 
                            required
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                            value={formData.payment_method}
                            onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                          >
                            <option value="">Select Method</option>
                            <option value="Bkash">Bkash</option>
                            <option value="Nagad">Nagad</option>
                            <option value="Rocket">Rocket</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1">Payment Number</label>
                          <input 
                            type="tel" 
                            required
                            placeholder="Number you paid from"
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                            value={formData.payment_number}
                            onChange={(e) => setFormData({...formData, payment_number: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1">Transaction ID</label>
                          <input 
                            type="text" 
                            required
                            placeholder="Enter transaction ID"
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                            value={formData.transaction_id}
                            onChange={(e) => setFormData({...formData, transaction_id: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1">Admission Month</label>
                          <select 
                            required
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                            value={formData.admission_month}
                            onChange={(e) => setFormData({...formData, admission_month: e.target.value})}
                          >
                            <option value="">Select Month</option>
                            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                        </div>
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
                        onClick={() => setSelectedCourse(null)}
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

export default OnlineCourses;
