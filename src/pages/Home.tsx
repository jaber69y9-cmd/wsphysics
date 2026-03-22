import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, BookOpen, Users, Award, PlayCircle, Rocket, Info, Phone, LogIn, User, GraduationCap, Atom, Magnet, FlaskConical, Zap, Bell, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { safeJson } from '../utils/api';

const StudentReviewsList = () => {
  const [reviews, setReviews] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch('/api/reviews');
        if (res.ok) {
          const data = await safeJson(res);
          setReviews(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Failed to fetch reviews', error);
      }
    };
    fetchReviews();
  }, []);

  if (reviews.length === 0) return null;

  return (
    <>
      {reviews.map((review, idx) => (
        <motion.div
          key={review.id}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.05, duration: 0.3 }}
          className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 relative"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-orange-100">
              <img 
                src={review.photo || review.student_photo || `https://picsum.photos/seed/student${review.id}/200/200`} 
                alt={review.name || review.student_name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900">{review.name || review.student_name}</h4>
              <p className="text-sm text-slate-500">{review.batch || 'Student'}</p>
            </div>
          </div>
          <div className="flex gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Zap 
                key={i} 
                className={`h-4 w-4 ${i < (review.rating || 5) ? 'text-orange-500 fill-orange-500' : 'text-slate-200'}`} 
              />
            ))}
          </div>
          <p className="text-slate-600 italic leading-relaxed">
            "{review.content || review.comment}"
          </p>
        </motion.div>
      ))}
    </>
  );
};

const Home = () => {
  const { settings, loading } = useSettings();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center bg-gradient-to-br from-orange-50 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6 relative text-center lg:text-left flex flex-col items-center lg:items-start mt-4 lg:mt-0"
            >
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-block bg-orange-100 text-orange-600 px-4 py-2 rounded-full font-bold text-sm tracking-wide uppercase"
              >
                Excellence in Physics Education
              </motion.div>
              <h1 className="text-4xl lg:text-5xl font-black leading-tight relative font-serif flex flex-col items-center lg:items-start">
                <div className="flex items-center gap-4 relative">
                  <span className="text-5xl lg:text-7xl text-orange-600 drop-shadow-sm relative group">
                    W'S Physics
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ delay: 0.8, duration: 0.8 }}
                      className="absolute -bottom-2 left-0 h-1.5 bg-orange-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.5)]"
                    />
                  </span>
                  <motion.div
                    animate={{ 
                      y: [0, -10, 0],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Rocket className="hidden lg:block h-16 w-16 text-orange-500" />
                  </motion.div>
                </div>
                
                <div className="flex flex-col items-center lg:items-start mt-4">
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Rocket className="lg:hidden h-10 w-10 text-orange-500 mb-2" />
                  </motion.div>
                  <span className="text-4xl lg:text-6xl text-slate-900 drop-shadow-sm font-bold">
                    Master the Concepts
                  </span>
                </div>
              </h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xl text-slate-600 max-w-lg leading-relaxed font-medium"
              >
                Unlock your potential with expert guidance. We turn complex physics problems into intuitive solutions for all levels.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="grid grid-cols-2 w-full px-4 gap-2 md:flex md:flex-row md:flex-wrap md:w-auto md:px-0 md:gap-3 mt-8 relative z-30"
              >
                <Link to="/courses" className="bg-orange-600 text-white h-[50px] rounded-xl md:h-auto md:px-6 md:py-3 md:rounded-xl font-bold text-base hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2">
                  <BookOpen className="h-5 w-5" /> Programs
                </Link>
                <Link to="/online-courses" className="bg-orange-600 text-white h-[50px] rounded-xl md:h-auto md:px-6 md:py-3 md:rounded-xl font-bold text-base hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2">
                  <PlayCircle className="h-5 w-5" /> Online Courses
                </Link>
                <Link to="/gallery" className="bg-orange-600 text-white h-[50px] rounded-xl md:h-auto md:px-6 md:py-3 md:rounded-xl font-bold text-base hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2">
                  <Award className="h-5 w-5" /> Gallery
                </Link>
                <Link to="/about" className="bg-orange-600 text-white h-[50px] rounded-xl md:h-auto md:px-6 md:py-3 md:rounded-xl font-bold text-base hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2">
                  <User className="h-5 w-5" /> About Us
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-orange-500 rounded-full blur-3xl opacity-10 pointer-events-none"></div>
              <div className="relative">
                <img 
                  src={settings.hero_image || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                  alt="WS Physics Logo" 
                  referrerPolicy="no-referrer"
                  className="relative z-10 w-full max-w-lg mx-auto rounded-3xl shadow-2xl border-4 border-white transition-all duration-500 hover:scale-105"
                />
              </div>
              
              {/* Stats Section */}
              <div className="relative z-20 mt-8 lg:mt-12 bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/50 flex items-center justify-around lg:justify-between gap-4 max-w-md mx-auto">
                <div className="text-center lg:text-left">
                  <div className="text-2xl lg:text-3xl font-bold text-slate-900">10k+</div>
                  <div className="text-slate-500 text-xs lg:text-sm">Students Mentored</div>
                </div>
                <div className="w-px h-10 bg-slate-200"></div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl lg:text-3xl font-bold text-slate-900">15+</div>
                  <div className="text-slate-500 text-xs lg:text-sm">Years Experience</div>
                </div>
                <div className="w-px h-10 bg-slate-200"></div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl lg:text-3xl font-bold text-slate-900">100%</div>
                  <div className="text-slate-500 text-xs lg:text-sm">Success Rate</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Animated Mouse Scroller */}
      <div className="flex justify-center mt-8 md:-mt-12 mb-12 relative z-30">
        <div className="w-6 h-10 border-2 border-orange-500 rounded-full flex justify-center p-1">
          <div className="w-1 h-2 bg-orange-500 rounded-full bounce-slow" />
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-orange-600 mb-4">Why Choose Us?</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">We provide a complete ecosystem for physics learning, combining traditional teaching with modern technology.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: BookOpen, title: "Structured Curriculum", desc: "Syllabus covered systematically with lecture sheets and notes." },
              { icon: Users, title: "Expert Mentorship", desc: "Direct guidance from experienced instructors." },
              { icon: PlayCircle, title: "Recorded Backup", desc: "Never miss a class with our high-quality recorded library." }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-xl transition-all group"
              >
                <div className="bg-orange-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  <feature.icon className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Student Reviews Section */}
      <section className="py-20 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-orange-600 mb-4">What Our Students Say</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Real success stories from students who mastered physics with our guidance.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* We'll fetch these from the reviews collection */}
            <StudentReviewsList />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-orange-600 to-red-600 rounded-3xl p-12 text-center text-white shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="relative z-10 max-w-2xl mx-auto space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold">Start Your Journey Today</h2>
              <p className="text-xl text-orange-100">
                Join thousands of successful students and master physics with expert guidance.
              </p>
              <Link 
                to="/contact" 
                className="inline-flex items-center gap-2 bg-white text-orange-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-orange-50 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Contact Us <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
