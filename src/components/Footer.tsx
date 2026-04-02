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
                src={settings.logo_url || "https://yt3.ggpht.com/yCls-kXn7hDbzhR5VDN487vOkUQfVyKXpDnh09EscXdOq6mOdDhxfkTnJ4kKQ85K4RaXwhv70A=s176-c-k-c0x00ffffff-no-rj-mo"} 
                alt={`${settings.site_name || "W'S Physics"} Logo`} 
                className="w-20 h-20 rounded-2xl mb-4 border-2 border-white"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
                }}
              />
              <h3 className="text-3xl font-black tracking-tighter text-white mb-2">
                {settings.site_name || "W'S PHYSICS"}
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
                  className="glass p-3 rounded-xl text-white hover:bg-white hover:text-orange-600 transition-all shadow-xl border border-white/20"
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
                <motion.li 
                  key={i}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Link 
                    to={item.path} 
                    className="hover:text-white transition-all flex items-center justify-center md:justify-start group gap-2"
                  >
                    <ChevronRight className="h-0 w-0 group-hover:h-4 group-hover:w-4 transition-all duration-300 text-white opacity-0 group-hover:opacity-100" />
                    {item.name}
                  </Link>
                </motion.li>
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
                { name: "W'S Tube", path: '/dashboard/video-library' },
                { name: 'Rec. Class', path: '/resources' }
              ].map((item, i) => (
                <motion.li 
                  key={i}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Link 
                    to={item.path} 
                    className="hover:text-white transition-all flex items-center justify-center md:justify-start group gap-2"
                  >
                    <ChevronRight className="h-0 w-0 group-hover:h-4 group-hover:w-4 transition-all duration-300 text-white opacity-0 group-hover:opacity-100" />
                    {item.name}
                  </Link>
                </motion.li>
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
                className="glass hover:bg-white hover:text-orange-600 p-2 rounded-xl border border-white/20 transition-all text-xs font-black uppercase tracking-widest text-center shadow-xl flex items-center justify-center gap-1 group text-white"
              >
                <ChevronRight className="h-0 w-0 group-hover:h-3 group-hover:w-3 transition-all" />
                Terms & Conditions
              </Link>
              <Link 
                to="/privacy" 
                className="glass hover:bg-white hover:text-orange-600 p-2 rounded-xl border border-white/20 transition-all text-xs font-black uppercase tracking-widest text-center shadow-xl flex items-center justify-center gap-1 group mb-4 text-white"
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
                    src="data:image/jpeg;base64,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" 
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
                <span className="text-[8px] text-orange-200">{settings.site_name || "W'S Physics"} Student</span>
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
            © 2026 {settings.site_name || "W'S Physics"}. All rights reserved.
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
