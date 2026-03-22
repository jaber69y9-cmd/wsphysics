import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, Award, GraduationCap, Star, Users, Atom, ChevronRight } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { motion } from 'motion/react';

const Footer = () => {
  const { settings } = useSettings();

  return (
    <footer className="bg-orange-600 text-white mt-auto relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-white to-orange-400"></div>
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-orange-500/30 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-orange-700/30 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 mb-6 md:mb-8 text-center md:text-left">
          {/* Brand Section */}
          <div className="md:col-span-3 space-y-4 md:space-y-6 flex flex-col items-center md:items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center md:items-start"
            >
              <img 
                src="https://yt3.ggpht.com/yCls-kXn7hDbzhR5VDN487vOkUQfVyKXpDnh09EscXdOq6mOdDhxfkTnJ4kKQ85K4RaXwhv70A=s176-c-k-c0x00ffffff-no-rj-mo" 
                alt="W'S Physics Logo" 
                className="w-20 h-20 rounded-2xl mb-4 border-2 border-white"
                referrerPolicy="no-referrer"
              />
              <h3 className="text-3xl font-black tracking-tighter text-white mb-2">
                W'S <span className="text-orange-100">PHYSICS</span>
              </h3>
              <div className="h-1 w-12 bg-white rounded-full"></div>
            </motion.div>
            
            <p className="text-orange-50 text-sm leading-relaxed max-w-sm">
              Empowering students with deep conceptual understanding of physics. Join us to master the laws of the universe with expert guidance and modern learning techniques.
            </p>
            
            <div className="flex space-x-4 pt-2">
              {[
                { icon: Facebook, url: settings.facebook_url },
                { icon: Users, url: settings.facebook_group_url },
                { icon: Youtube, url: settings.youtube_url },
                { icon: Instagram, url: settings.instagram_url }
              ].map((social, i) => (
                <motion.a
                  key={i}
                  href={social.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -5, scale: 1.1 }}
                  className="bg-orange-700 p-3 rounded-xl text-orange-100 hover:bg-white hover:text-orange-600 transition-all shadow-lg"
                >
                  <social.icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </div>
          
          {/* Quick Links Section */}
          <div className="md:col-span-3 flex flex-col items-center md:items-start">
            <h4 className="font-bold text-lg mb-4 md:mb-6 text-white">Quick Links</h4>
            <ul className="space-y-2 md:space-y-3 text-orange-50 text-sm">
              {[
                { name: 'Home', path: '/' },
                { name: 'About Us', path: '/about' },
                { name: 'Programs', path: '/courses' },
                { name: 'Contact', path: '/contact' }
              ].map((item, i) => (
                <li key={i}>
                  <Link 
                    to={item.path} 
                    className="hover:text-white transition-all flex items-center justify-center md:justify-start group gap-2"
                  >
                    <ChevronRight className="h-0 w-0 group-hover:h-4 group-hover:w-4 transition-all duration-300 text-white opacity-0 group-hover:opacity-100" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Student Corner Section */}
          <div className="md:col-span-3 flex flex-col items-center md:items-start">
            <h4 className="font-bold text-lg mb-4 md:mb-6 text-white">Student Corner</h4>
            <ul className="space-y-2 md:space-y-3 text-orange-50 text-sm mb-4 md:mb-6">
              {[
                { name: 'Online Courses', path: '/online-courses' },
                { name: 'Schedule', path: '/schedule' },
                { name: 'Notices', path: '/notices' },
                { name: 'Results', path: '/results' },
                { name: 'Rec. Class', path: '/resources' }
              ].map((item, i) => (
                <li key={i}>
                  <Link 
                    to={item.path} 
                    className="hover:text-white transition-all flex items-center justify-center md:justify-start group gap-2"
                  >
                    <ChevronRight className="h-0 w-0 group-hover:h-4 group-hover:w-4 transition-all duration-300 text-white opacity-0 group-hover:opacity-100" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
            {/* Decorative Icon for empty space */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="opacity-20 hidden md:block"
            >
              <Atom className="h-16 w-16 text-white" />
            </motion.div>
          </div>
          
          {/* Contact Section */}
          <div className="md:col-span-3 flex flex-col items-center md:items-start">
            <h4 className="font-bold text-lg mb-4 md:mb-6 text-white">Contact</h4>
            <ul className="space-y-3 md:space-y-4 text-orange-50 text-sm mb-4 md:mb-6">
              <li className="flex items-start justify-center md:justify-start space-x-3">
                <MapPin className="h-5 w-5 text-white flex-shrink-0 mt-0.5" />
                <span>{settings.office_address || 'Farmgate, Dhaka, Bangladesh'}</span>
              </li>
              <li className="flex items-center justify-center md:justify-start space-x-3">
                <Phone className="h-5 w-5 text-white flex-shrink-0" />
                <span>{settings.contact_phone || '+880 1234 567890'}</span>
              </li>
              <li className="flex items-center justify-center md:justify-start space-x-3">
                <Mail className="h-5 w-5 text-white flex-shrink-0" />
                <span>{settings.contact_email || 'contact@wsphysics.com'}</span>
              </li>
            </ul>
            
            {/* Legal Links as Cards */}
            <div className="grid grid-cols-1 gap-2 w-full max-w-[200px]">
              <Link 
                to="/terms" 
                className="bg-orange-700/50 hover:bg-white hover:text-orange-600 p-2 rounded-xl border border-white/10 transition-all text-xs font-medium text-center shadow-sm flex items-center justify-center gap-1 group"
              >
                <ChevronRight className="h-0 w-0 group-hover:h-3 group-hover:w-3 transition-all" />
                Terms & Conditions
              </Link>
              <Link 
                to="/privacy" 
                className="bg-orange-700/50 hover:bg-white hover:text-orange-600 p-2 rounded-xl border border-white/10 transition-all text-xs font-medium text-center shadow-sm flex items-center justify-center gap-1 group mb-4"
              >
                <ChevronRight className="h-0 w-0 group-hover:h-3 group-hover:w-3 transition-all" />
                Privacy Policy
              </Link>

              {/* Developer Info moved here */}
              <Link 
                to="/developer"
                className="flex flex-col items-center bg-orange-800/30 p-3 rounded-2xl border border-orange-500/30 w-full hover:bg-orange-800/50 transition-all group"
              >
                <p className="text-[9px] uppercase tracking-widest text-orange-200 mb-2 font-bold">Developer Info</p>
                <div className="flex items-center gap-2">
                  <img 
                    src="https://jaber2026.github.io/jaber/img/profile.jpg" 
                    alt="Mohammad Jaber Bin Razzak" 
                    className="w-8 h-8 rounded-full border border-orange-400 object-cover group-hover:scale-110 transition-transform"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=Jaber+Bin+Razzak&background=ea580c&color=fff";
                    }}
                  />
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-[10px] text-white group-hover:text-orange-200 transition-colors leading-tight">
                      Jaber Bin Razzak
                    </span>
                    <span className="text-[8px] text-orange-200">W'S Physics Student</span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Payment Image - Centered at the bottom of content area */}
        <div className="w-full flex justify-center pb-8 px-4 sm:px-6 lg:px-8">
          <img 
            src="https://redwansmethod.com/_next/image?url=%2Fpayment-banner.png&w=1200&q=75" 
            alt="Payment Methods" 
            className="w-full max-w-7xl rounded-3xl shadow-2xl border border-white/20"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
      
      {/* Bottom Bar - Full Width Border */}
      <div className="border-t border-white/20 bg-orange-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center gap-3 text-white">
          <p className="font-black text-white text-base sm:text-lg tracking-tight drop-shadow-sm">
            © 2026 W'S Physics. All rights reserved.
          </p>
          <div className="h-px w-12 bg-white/30"></div>
          <p className="text-[10px] sm:text-xs text-orange-100 font-bold uppercase tracking-[0.2em] opacity-90">
            Developed by Mohammad Jaber Bin Razzak
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
