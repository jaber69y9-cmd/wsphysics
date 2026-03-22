import React from 'react';
import { motion } from 'motion/react';
import { Facebook, Instagram, Globe, Mail, Phone, MapPin, ChevronLeft, Atom, Github, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Developer = () => {
  const socialLinks = [
    { icon: Facebook, url: "https://www.facebook.com/jaber.bin.razzak.2026", label: "Facebook", color: "bg-blue-600" },
    { icon: Instagram, url: "https://www.instagram.com/jaber_bin_razzak/", label: "Instagram", color: "bg-pink-600" },
    { icon: Globe, url: "https://jaber2026.github.io/jaber/", label: "Portfolio", color: "bg-emerald-600" },
    { icon: Github, url: "https://github.com/jaber2026", label: "GitHub", color: "bg-slate-800" },
    { icon: Linkedin, url: "https://www.linkedin.com/in/mohammad-jaber-bin-razzak-4b1b3b2b1/", label: "LinkedIn", color: "bg-blue-700" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-orange-600 font-bold mb-8 hover:gap-3 transition-all">
          <ChevronLeft className="h-5 w-5" /> Back to Home
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200"
        >
          <div className="relative h-48 bg-gradient-to-r from-orange-500 to-orange-600">
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
              <div className="relative">
                <img 
                  src="https://jaber2026.github.io/jaber/img/profile.jpg" 
                  alt="Mohammad Jaber Bin Razzak" 
                  className="w-32 h-32 rounded-3xl border-4 border-white shadow-xl object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=Jaber+Bin+Razzak&background=ea580c&color=fff";
                  }}
                />
                <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-white"></div>
              </div>
            </div>
          </div>

          <div className="pt-20 pb-12 px-8 text-center">
            <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Mohammad Jaber Bin Razzak</h1>
            <p className="text-orange-600 font-bold uppercase tracking-widest text-sm mb-6">Full Stack Developer & W'S Physics Student</p>
            
            <div className="max-w-2xl mx-auto mb-10">
              <p className="text-slate-600 leading-relaxed">
                Assalamu Alaikum! I am Jaber, a passionate developer and a proud student of W'S Physics. 
                I specialize in building modern, high-performance web applications that provide seamless user experiences. 
                This platform was crafted with dedication to help my fellow students excel in their physics journey.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-12">
              {socialLinks.map((social, i) => (
                <motion.a
                  key={i}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -5, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`${social.color} p-4 rounded-2xl text-white shadow-lg flex flex-col items-center gap-2 transition-all`}
                >
                  <social.icon className="h-6 w-6" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{social.label}</span>
                </motion.a>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left border-t border-slate-100 pt-10">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <Mail className="h-6 w-6 text-orange-600 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</p>
                  <p className="text-sm font-bold text-slate-700">jaberbinrazzak@gmail.com</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <Phone className="h-6 w-6 text-orange-600 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone</p>
                  <p className="text-sm font-bold text-slate-700">+880 1700 000000</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <MapPin className="h-6 w-6 text-orange-600 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</p>
                  <p className="text-sm font-bold text-slate-700">Dhaka, Bangladesh</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-orange-100 rounded-full text-orange-600 font-bold text-sm">
            <Atom className="h-5 w-5 animate-spin-slow" />
            Crafted with passion for W'S Physics
          </div>
        </div>
      </div>
    </div>
  );
};

export default Developer;
