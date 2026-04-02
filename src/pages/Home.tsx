import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, BookOpen, Users, Award, PlayCircle, Rocket, Info, Phone, LogIn, User, GraduationCap, Atom, Magnet, FlaskConical, Zap, Calendar, X, Star, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { safeJson } from '../utils/api';
import { ChevronRight } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const StudentReviewsList = () => {
  const [reviews, setReviews] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch('/api/reviews');
        if (res.ok) {
          const data = await safeJson(res);
          setReviews(Array.isArray(data) ? data.filter((r: any) => r.status === 'approved') : []);
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
      {reviews.slice(0, 3).map((review, idx) => (
        <motion.div
          key={review.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.1 }}
          className="glass p-8 rounded-[2.5rem] border border-white/60 shadow-xl bg-white/40 hover:bg-white/60 transition-all group"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-lg group-hover:scale-110 transition-transform duration-500">
              <img 
                src={review.student_image || `https://picsum.photos/seed/student${review.id}/200/200`} 
                alt={review.student_name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-900 tracking-tight">{review.student_name}</h4>
              <div className="flex gap-1 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-3 w-3 ${i < (review.rating || 5) ? 'text-orange-500 fill-orange-500' : 'text-slate-200'}`} 
                  />
                ))}
              </div>
            </div>
          </div>
          <p className="text-slate-600 font-medium leading-relaxed italic">
            "{review.comment}"
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-slate-50/50">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center pt-12 md:pt-20 pb-16 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-orange-500/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-rose-500/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-4"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-600 text-xs font-black uppercase tracking-widest border border-orange-200/50 shadow-sm">
                  <Rocket className="h-4 w-4" />
                  <span>The Future of Physics Education</span>
                </div>
                
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter text-slate-900">
                  <div className="relative inline-block text-left">
                    {settings.site_name ? (
                      <>
                        {settings.site_name.split(' ')[0]} <br />
                        <span className="relative inline-block">
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-rose-600 to-orange-600 bg-[length:200%_auto] animate-gradient">
                            {settings.site_name.split(' ').slice(1).join(' ')}
                          </span>
                        </span>
                      </>
                    ) : (
                      <>
                        W'S <br />
                        <span className="relative inline-block">
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-rose-600 to-orange-600 bg-[length:200%_auto] animate-gradient">
                            Physics
                          </span>
                        </span>
                      </>
                    )}
                    {/* Floating Rocket Icon */}
                    <motion.div 
                      animate={{ 
                        y: [0, -20, 0],
                        x: [0, 8, 0],
                        rotate: [0, 20, 0]
                      }}
                      transition={{ 
                        duration: 4, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                      className="absolute -right-12 md:-right-20 top-1/2 -translate-y-1/2 z-10"
                    >
                      <Rocket className="h-12 w-12 md:h-16 md:w-16 text-orange-500 fill-orange-500/20 drop-shadow-[0_0_20px_rgba(249,115,22,0.6)]" />
                      <motion.div 
                        animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-orange-400/40 rounded-full blur-md"
                      />
                    </motion.div>
                    {/* Always animated underline/ping element */}
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="absolute -bottom-4 left-0 h-1.5 md:h-2 bg-orange-500/30 rounded-full overflow-hidden"
                    >
                      <motion.div 
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-1/2 h-full bg-gradient-to-r from-transparent via-orange-500 to-transparent"
                      />
                    </motion.div>
                  </div>
                </h1>
                
                <p className="text-lg md:text-xl text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                  Unlock your potential with intuitive solutions. We turn complex physics problems into simple concepts for all levels.
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-4"
              >
                <Link to="/courses" className="bg-orange-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-orange-700 transition-all shadow-2xl shadow-orange-600/40 flex items-center gap-2 group active:scale-95">
                  Explore Programs
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/about" className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all shadow-xl border border-slate-200 flex items-center gap-2 active:scale-95">
                  Learn More
                  <Info className="h-5 w-5" />
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8"
              >
                {[
                  { icon: Calendar, label: "Batch Time", path: "/schedule" },
                  { icon: BarChart2, label: "Results", path: "/results" },
                  { icon: PlayCircle, label: "Rec. Class", path: "/resources" },
                  { icon: Phone, label: "Contact", path: "/contact" }
                ].map((item, i) => (
                  <Link 
                    key={i}
                    to={item.path}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/50 hover:bg-white border border-white/50 hover:border-orange-200 transition-all group shadow-sm hover:shadow-md"
                  >
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-orange-600">{item.label}</span>
                  </Link>
                ))}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, type: "spring", bounce: 0.4 }}
              className="relative"
            >
              <div className="relative z-10 glass p-3 rounded-[3rem] border border-white/60 shadow-2xl bg-white/30 backdrop-blur-2xl overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <img 
                  src={settings.hero_image || "https://yt3.googleusercontent.com/yCls-kXn7hDbzhR5VDN487vOkUQfVyKXpDnh09EscXdOq6mOdDhxfkTnJ4kKQ85K4RaXwhv70A=s160-c-k-c0x00ffffff-no-rj"} 
                  alt="Hero" 
                  className="w-full h-auto rounded-[2.2rem] shadow-2xl transform group-hover:scale-[1.02] transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              {/* Floating Stats Card */}
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-8 -left-8 z-20 glass p-6 rounded-3xl border border-white/60 shadow-2xl bg-white/80 backdrop-blur-xl hidden md:block"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <Star className="h-6 w-6 fill-current" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-900">4.9/5</div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Student Rating</div>
                  </div>
                </div>
              </motion.div>

              {/* Floating Students Card */}
              <motion.div
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -top-8 -right-8 z-20 glass p-6 rounded-3xl border border-white/60 shadow-2xl bg-white/80 backdrop-blur-xl hidden md:block"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-900">1000+</div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Students</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: "Success Rate", value: "95%", icon: Award, color: "orange" },
              { label: "Expert Mentors", value: "10+", icon: GraduationCap, color: "blue" },
              { label: "Study Materials", value: "500+", icon: BookOpen, color: "emerald" },
              { label: "Physics Labs", value: "Online", icon: FlaskConical, color: "rose" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="text-center space-y-2"
              >
                <div className={`w-12 h-12 mx-auto rounded-xl bg-${stat.color}-100 text-${stat.color}-600 flex items-center justify-center mb-4`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="text-3xl font-black text-slate-900">{stat.value}</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-2 rounded-full bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-widest"
            >
              Our Excellence
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">
              Why Choose <span className="text-orange-600">Us</span>
            </h2>
            <p className="text-slate-500 font-medium text-lg">
              We provide a comprehensive learning ecosystem designed for success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Users, title: "Expert Teachers", desc: "Learn from highly qualified educators with years of teaching experience.", color: "orange" },
              { icon: BookOpen, title: "Proven Curriculum", desc: "Structured learning path with comprehensive study materials and practice sets.", color: "blue" },
              { icon: Award, title: "Regular Exams", desc: "Weekly and monthly assessments to ensure continuous improvement.", color: "emerald" },
              { icon: BarChart2, title: "Progress Tracking", desc: "Regular assessments and detailed progress reports to monitor improvement.", color: "rose" },
              { icon: User, title: "Personal Care", desc: "Individual attention to every student's needs for better understanding.", color: "purple" },
              { icon: Zap, title: "Interactive Classes", desc: "Engaging learning environment with real-world examples and experiments.", color: "amber" },
              { icon: Info, title: "Doubt Clearing", desc: "Dedicated sessions to solve every query instantly and effectively.", color: "indigo" },
              { icon: PlayCircle, title: "Digital Resources", desc: "Access to recorded lectures and PDF notes 24/7 from anywhere.", color: "cyan" },
              { icon: Magnet, title: "Conceptual Clarity", desc: "Deep dive into physics concepts to build a strong foundation.", color: "orange" }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative p-10 rounded-[3rem] bg-slate-50 hover:bg-white border border-transparent hover:border-orange-100 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-900/5"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-500 bg-${feature.color}-100 text-${feature.color}-600`}>
                  <feature.icon className="h-8 w-8" />
                </div>
                <h4 className="text-2xl font-black text-slate-900 mb-4 tracking-tight group-hover:text-orange-600 transition-colors">{feature.title}</h4>
                <p className="text-slate-600 font-medium leading-relaxed">{feature.desc}</p>
                
                <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className={`w-2 h-2 rounded-full bg-${feature.color}-500 animate-ping`} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Reviews Section */}
      <section className="py-24 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-2 rounded-full bg-orange-100 text-orange-600 text-xs font-black uppercase tracking-widest"
            >
              Testimonials
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">
              What Our <span className="text-orange-600">Students</span> Say
            </h2>
            <p className="text-slate-500 font-medium text-lg">
              Real stories from students who have transformed their physics journey with us.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <StudentReviewsList />
          </div>

          <div className="flex justify-center">
            <Link 
              to="/reviews" 
              className="glass px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest text-slate-900 border border-white/60 shadow-xl hover:bg-white/60 transition-all flex items-center gap-3 group"
            >
              View All Reviews
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass p-12 md:p-20 rounded-[4rem] border border-white/60 shadow-[0_32px_64px_-12px_rgba(249,115,22,0.2)] bg-gradient-to-br from-orange-600 to-rose-600 text-center text-white relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
            <div className="relative z-10 max-w-3xl mx-auto space-y-10">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight">
                Ready to Master Physics? <br />
                Join Us Today!
              </h2>
              <p className="text-xl text-orange-100 font-medium">
                Join thousands of successful students and master physics with expert guidance. Start your journey towards academic excellence now.
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <Link 
                  to="/contact" 
                  className="bg-white text-orange-600 px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-orange-50 transition-all shadow-2xl hover:scale-105 active:scale-95 flex items-center gap-3"
                >
                  Contact Us Now
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link 
                  to="/courses" 
                  className="bg-black/20 backdrop-blur-md text-white border border-white/30 px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black/30 transition-all flex items-center gap-3"
                >
                  View Programs
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
