import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { Menu, X, LogOut, User, LogIn, ChevronRight, Mail, Phone, Atom } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen]);

  const links = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Programs', path: '/courses' },
    { name: 'Online Courses', path: '/online-courses' },
    { name: 'Schedule', path: '/schedule' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Notices', path: '/notices' },
    { name: 'Results', path: '/results' },
    { name: 'Rec. Class', path: '/resources' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <>
      <motion.nav 
        animate={{ y: 0 }}
        className={`fixed top-4 left-4 right-4 z-50 transition-all duration-300 max-w-[98%] xl:max-w-[1400px] mx-auto rounded-2xl ${
          scrolled 
            ? 'bg-orange-600 shadow-2xl py-1.5' 
            : 'bg-orange-600 shadow-xl py-2'
        }`}
      >
        <div className="px-4 sm:px-6 lg:px-6">
          <div className="flex items-center h-14">
            {/* Logo */}
            <div className="flex-shrink-0 mr-auto lg:mr-8">
              <a 
                href="/" 
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = '/';
                }}
                className="flex items-center space-x-2 group"
              >
                <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center shadow-md transform group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                  <img 
                    src="https://yt3.googleusercontent.com/yCls-kXn7hDbzhR5VDN487vOkUQfVyKXpDnh09EscXdOq6mOdDhxfkTnJ4kKQ85K4RaXwhv70A=s160-c-k-c0x00ffffff-no-rj" 
                    alt="Logo" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl sm:text-2xl font-black text-white leading-none tracking-tighter drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
                    W'S <span className="text-orange-100">PHYSICS</span>
                  </span>
                </div>
              </a>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex flex-1 justify-end px-4">
              <div className="flex items-center space-x-0.5">
                {links.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`px-3 py-1.5 rounded-full text-[10px] xl:text-[11px] font-bold uppercase tracking-wider transition-all duration-200 ${
                      location.pathname === link.path
                        ? 'bg-white text-orange-600 shadow-md'
                        : 'text-white/90 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Dashboard/Logout/Login */}
            <div className="hidden lg:flex items-center gap-3">
              {user ? (
                <>
                  <Link
                    to={user.role === 'admin' ? '/admin' : user.role === 'moderator' ? '/moderator' : '/dashboard'}
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-5 py-2 rounded-md text-xs font-bold uppercase tracking-widest transition-all duration-200"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-all"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="bg-white text-orange-600 px-6 py-2.5 rounded-md text-xs font-black uppercase tracking-widest hover:bg-orange-50 transition-all duration-200 shadow-md flex items-center gap-2"
                >
                  <LogIn className="h-4 w-4" /> Login
                </Link>
              )}
            </div>

            {/* Mobile Auth Icons */}
            <div className="flex lg:hidden items-center ml-4">
              {/* Mobile menu button - Far Right */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative w-11 h-11 flex items-center justify-center rounded-xl text-white bg-white/20 hover:bg-white/30 focus:outline-none transition-all shadow-lg border border-white/20"
              >
                <div className="relative w-7 h-6">
                  <motion.span 
                    animate={isOpen ? { rotate: 45, y: 11 } : { rotate: 0, y: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="absolute top-0 left-0 w-full h-0.5 bg-white rounded-full"
                  />
                  <motion.span 
                    animate={isOpen ? { opacity: 0, scale: 0 } : { opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-[11px] left-0 w-full h-0.5 bg-white rounded-full"
                  />
                  <motion.span 
                    animate={isOpen ? { rotate: -45, y: -11 } : { rotate: 0, y: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-white rounded-full"
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu - Floating Card with Margins */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-40 lg:hidden flex justify-center items-start pt-28 p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-[260px] bg-orange-600 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.6)] flex flex-col border border-white/30 overflow-hidden"
            >
              <div className="flex-grow overflow-y-auto p-4 space-y-1.5 text-center scrollbar-hide max-h-[60vh]">
                {links.map((link, index) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03 + 0.1 }}
                  >
                    <Link
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-center px-4 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                        location.pathname === link.path
                          ? 'bg-white text-orange-600 shadow-2xl scale-105'
                          : 'text-white hover:bg-white/10'
                      }`}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
              </div>
              
              <div className="p-6 border-t border-white/10 bg-black/20 flex flex-col gap-2">
                {user ? (
                  <>
                    <Link
                      to={user.role === 'admin' ? '/admin' : user.role === 'moderator' ? '/moderator' : '/dashboard'}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center gap-3 bg-white text-orange-600 px-6 py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
                    >
                      <User className="h-4 w-4" /> Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                      className="flex items-center justify-center gap-3 bg-red-500/30 text-white border border-red-500/40 px-6 py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-red-500/40 transition-all"
                    >
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-3 bg-white text-orange-600 px-6 py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
                  >
                    <LogIn className="h-4 w-4" /> Login
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
