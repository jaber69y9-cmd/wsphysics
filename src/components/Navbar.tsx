import React, { useState, useEffect, memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { Menu, X, LogOut, User, LogIn, ChevronRight, Mail, Phone, Play } from 'lucide-react';

const Navbar = memo(() => {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

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

  const links: { name: string; path: string; isSpecial?: boolean; isRed?: boolean }[] = [
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
      <nav 
        className="fixed top-4 left-4 right-4 z-50 shadow-[0_8px_32px_rgba(249,115,22,0.2)] max-w-[calc(100%-2rem)] xl:max-w-[1400px] mx-auto rounded-2xl bg-orange-600/95 backdrop-blur-md border border-white/20 py-2"
      >
        <div className="px-4 sm:px-6 lg:px-6">
          <div className="flex items-center h-14 sm:h-16">
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
                <div className="h-10 w-10 sm:h-11 sm:w-11 bg-white rounded-xl flex items-center justify-center shadow-lg overflow-hidden group-hover:scale-110 transition-transform duration-300">
                  <img 
                    src={settings.logo_url || "https://yt3.googleusercontent.com/yCls-kXn7hDbzhR5VDN487vOkUQfVyKXpDnh09EscXdOq6mOdDhxfkTnJ4kKQ85K4RaXwhv70A=s160-c-k-c0x00ffffff-no-rj"} 
                    alt="Logo" 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
                    }}
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl sm:text-2xl font-black text-white leading-none tracking-tighter drop-shadow-md">
                    {settings.site_name || "W'S PHYSICS"}
                  </span>
                </div>
              </a>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex flex-1 justify-end px-2">
              <div className="flex items-center space-x-0.5">
                {links.map((link) => (
                  <div key={link.name}>
                    <Link
                      to={link.path}
                      onClick={(e) => {
                        if (location.pathname === link.path) {
                          e.preventDefault();
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                      className={`px-3 py-2 rounded-xl text-[10px] xl:text-[11px] font-black uppercase tracking-wider whitespace-nowrap flex items-center gap-1 transition-all duration-300 ${
                        link.isRed
                          ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20'
                          : link.isSpecial 
                            ? 'bg-white/20 text-white hover:bg-white/30 border border-white/20' 
                            : location.pathname === link.path
                              ? 'bg-white text-orange-600 shadow-lg scale-105'
                              : 'text-white/90 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {link.isSpecial && <Play className="h-3 w-3 fill-current" />}
                      {link.name}
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Dashboard/Logout/Login */}
            <div className="hidden lg:flex items-center gap-3 ml-4">
              {user ? (
                <>
                  <Link
                    to={user.role === 'admin' ? '/admin' : user.role === 'moderator' ? '/moderator' : '/dashboard'}
                    className="bg-white/20 hover:bg-white/30 text-white border border-white/30 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg backdrop-blur-sm"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="p-2.5 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all border border-transparent hover:border-white/20"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="bg-white text-orange-600 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-50 shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
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
                className="relative w-11 h-11 flex items-center justify-center rounded-xl text-white bg-white/20 hover:bg-white/30 focus:outline-none shadow-lg border border-white/20"
              >
                <div className="relative w-7 h-6">
                  <span 
                    className={`absolute left-0 w-full h-0.5 bg-white rounded-full ${isOpen ? 'top-[11px] rotate-45' : 'top-0'}`}
                  />
                  <span 
                    className={`absolute top-[11px] left-0 w-full h-0.5 bg-white rounded-full ${isOpen ? 'opacity-0' : 'opacity-1'}`}
                  />
                  <span 
                    className={`absolute left-0 w-full h-0.5 bg-white rounded-full ${isOpen ? 'bottom-[11px] -rotate-45' : 'bottom-0'}`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex justify-center items-start pt-24 p-4">
          <div
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <div
            className="relative w-full max-w-[320px] bg-orange-600/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl flex flex-col border border-white/20 overflow-hidden z-50 animate-in fade-in zoom-in duration-300"
          >
            <div className="flex-grow overflow-y-auto p-6 space-y-2 text-center scrollbar-hide max-h-[60vh]">
              {links.map((link) => (
                <div key={link.name}>
                  <Link
                    to={link.path}
                    onClick={(e) => {
                      setIsOpen(false);
                      if (location.pathname === link.path) {
                        e.preventDefault();
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className={`flex items-center justify-center px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all ${
                      location.pathname === link.path
                        ? 'bg-white text-orange-600 shadow-xl scale-105'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    {link.name}
                  </Link>
                </div>
              ))}
            </div>
            
            <div className="p-8 border-t border-white/10 bg-black/20 flex flex-col gap-3">
              {user ? (
                <>
                  <Link
                    to={user.role === 'admin' ? '/admin' : user.role === 'moderator' ? '/moderator' : '/dashboard'}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-3 bg-white text-orange-600 px-6 py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
                  >
                    <User className="h-4 w-4" /> Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="flex items-center justify-center gap-3 bg-orange-500/30 text-white border border-white/20 px-6 py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-orange-500/40 transition-all"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-3 bg-white text-orange-600 px-6 py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
                >
                  <LogIn className="h-4 w-4" /> Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default Navbar;
