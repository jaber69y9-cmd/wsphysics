import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Star, Users, Video, BookOpen, Clock, FileText, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { GlassCard } from '../../components/ui/GlassCard';

export function Home() {
  return (
    <div className="flex flex-col gap-24 pb-24">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 via-slate-50/95 to-slate-50" />
        
        {/* Animated Background Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl float-slow" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-orange-600/10 rounded-full blur-3xl float-slower" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <span className="inline-block py-1 px-3 rounded-full bg-orange-100 text-orange-600 text-sm font-semibold tracking-wide mb-6 border border-orange-200 pulse-orange">
              Rifat Math Care
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-tight">
              Engineers Are <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">Born Here</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed max-w-3xl mx-auto">
              Where mathematical excellence meets engineering dreams, shaping the innovators of tomorrow. Join our upcoming batches and excel in mathematics.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/schedule">
                <Button size="lg" className="w-full sm:w-auto gap-2 text-lg px-8">
                  <Clock className="w-5 h-5" /> Batch Time
                </Button>
              </Link>
              <Link to="/results">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 bg-white/50 backdrop-blur-sm gap-2">
                  <FileText className="w-5 h-5" /> Results
                </Button>
              </Link>
              <Link to="/recorded-classes">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 bg-white/50 backdrop-blur-sm gap-2">
                  <Video className="w-5 h-5" /> Rec. Class
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 bg-white/50 backdrop-blur-sm">
                  Contact
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="section-title">Why Choose Us</h2>
          <p className="section-subtitle">Discover what makes us the preferred choice for mathematics education</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Users, title: 'Expert Teachers', desc: 'Learn from highly qualified mathematics educators with years of teaching experience.' },
            { icon: BookOpen, title: 'Proven Curriculum', desc: 'Structured learning path with comprehensive study materials and practice sets.' },
            { icon: FileText, title: 'Regular Exams', desc: 'Weekly and monthly assessments to ensure continuous improvement and exam preparation.' },
            { icon: TrendingUp, title: 'Progress Tracking', desc: 'Regular assessments and detailed progress reports to monitor improvement.' },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <GlassCard className="h-full hover:-translate-y-2 transition-transform duration-300">
                <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 mb-6">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed text-sm">{feature.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <GlassCard className="bg-gradient-to-br from-orange-500 to-orange-600 border-none text-white p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Start Your Mathematical Journey Today</h2>
            <p className="text-orange-100 mb-8 max-w-2xl mx-auto text-lg">
              Join our upcoming batches and excel in mathematics. We are here to guide you every step of the way.
            </p>
            <Link to="/contact">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-slate-50 shadow-xl">
                Contact Us
              </Button>
            </Link>
          </div>
        </GlassCard>
      </section>
    </div>
  );
}
