import React, { useState } from 'react';
import { useOutlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { 
  LayoutDashboard, User, BookOpen, FileText, Calendar, 
  BarChart2, CheckSquare, CreditCard, PlayCircle, Bell, 
  LogOut, Menu, X, ChevronRight, Home, Video
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import LiveClassButton from './LiveClassButton';


const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const outlet = useOutlet();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  React.useEffect(() => {
    // Prevent body from scrolling when dashboard is active
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Enrollments', path: '/dashboard/enrollments', icon: FileText },
    { name: 'Live Zoom Classes', path: '/dashboard/live-classes', icon: Video },
    { name: 'Routines', path: '/dashboard/routines', icon: Calendar },
    { name: 'Profile', path: '/dashboard/profile', icon: User },
    ...(user?.student_type !== 'online' ? [
      { name: 'ID Card', path: '/dashboard/id-card', icon: CreditCard },
      { name: 'Chapters', path: '/dashboard/chapters', icon: FileText },
      { name: 'Attendance', path: '/dashboard/attendance', icon: Calendar },
      { name: 'Results', path: '/dashboard/results', icon: BarChart2 },
      { name: 'Exams', path: '/dashboard/exams', icon: CheckSquare },
      { name: 'Fees', path: '/dashboard/fees', icon: CreditCard },
    ] : []),
    { name: 'Recorded Classes', path: '/dashboard/classes', icon: PlayCircle },
    { name: 'Study Materials', path: '/dashboard/materials', icon: FileText },
    { name: 'All Resources', path: '/dashboard/all-resources', icon: FileText },
    { name: 'Notices', path: '/dashboard/notices', icon: Bell },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <motion.div 
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-white border-r border-slate-200 flex flex-col shadow-xl z-20 relative hidden lg:flex"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <Link to="/" className={`flex items-center gap-3 ${!isSidebarOpen && 'justify-center'}`}>
            <div className="h-10 w-10 bg-orange-600 rounded-lg overflow-hidden flex items-center justify-center">
              <img 
                src={settings.logo_url || "https://yt3.googleusercontent.com/yCls-kXn7hDbzhR5VDN487vOkUQfVyKXpDnh09EscXdOq6mOdDhxfkTnJ4kKQ85K4RaXwhv70A=s160-c-k-c0x00ffffff-no-rj"} referrerPolicy="no-referrer" 
                alt="Logo" 
                className="w-full h-full object-cover" 
              />
            </div>
            {isSidebarOpen && <span className="font-bold text-xl text-slate-800">{settings.site_name || "W'S Physics"}</span>}
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide py-4 px-3 space-y-0.5">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (location.pathname === item.path) {
                    const mainContent = document.querySelector('main');
                    if (mainContent) {
                      mainContent.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }
                  setIsMobileSidebarOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all group ${
                  isActive 
                    ? 'bg-orange-50 text-orange-600 font-bold shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                } ${!isSidebarOpen && 'justify-center'}`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-orange-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                {isSidebarOpen && <span>{item.name}</span>}
                {isSidebarOpen && isActive && <ChevronRight className="ml-auto h-4 w-4 opacity-50" />}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-100">
          {isSidebarOpen && <LiveClassButton className="mb-4 px-2" />}
          <button 
            onClick={logout}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors ${!isSidebarOpen && 'justify-center'}`}
          >
            <LogOut className="h-5 w-5" />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </motion.div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <motion.div
        initial={{ x: -280 }}
        animate={{ x: isMobileSidebarOpen ? 0 : -280 }}
        transition={{ type: 'tween', duration: 0.2 }}
        className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50 lg:hidden flex flex-col h-full"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-10 w-10 bg-orange-600 rounded-lg overflow-hidden flex items-center justify-center">
              <img 
                src={settings.logo_url || "https://yt3.googleusercontent.com/yCls-kXn7hDbzhR5VDN487vOkUQfVyKXpDnh09EscXdOq6mOdDhxfkTnJ4kKQ85K4RaXwhv70A=s160-c-k-c0x00ffffff-no-rj"} referrerPolicy="no-referrer" 
                alt="Logo" 
                className="w-full h-full object-cover" 
              />
            </div>
            <span className="font-bold text-xl text-slate-800">{settings.site_name || "W'S Physics"}</span>
          </Link>
          <button 
            onClick={() => setIsMobileSidebarOpen(false)} 
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide py-4 px-3 space-y-0.5 touch-pan-y">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (location.pathname === item.path) {
                    const mainContent = document.querySelector('main');
                    if (mainContent) {
                      mainContent.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }
                  setIsMobileSidebarOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all group ${
                  isActive 
                    ? 'bg-orange-50 text-orange-600 font-bold shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-orange-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <span>{item.name}</span>
                {isActive && <ChevronRight className="ml-auto h-4 w-4 opacity-50" />}
              </Link>
            );
          })}
        </div>
        <div className="p-4 border-t border-slate-100 flex-shrink-0">
          <button 
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 shadow-sm z-10">
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold text-slate-800 hidden md:block">
              Student Dashboard
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/" className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-orange-600 transition-colors bg-slate-50 px-4 py-2 rounded-full border border-slate-200 hover:border-orange-200">
              <Home className="h-4 w-4" /> Go to Website
            </Link>
            <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block min-w-[100px]">
                <div className="text-sm font-bold text-slate-800 truncate">{user?.name || 'Loading...'}</div>
                <div className="text-xs text-slate-500 capitalize">{user?.role || '...'}</div>
              </div>
              <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold border-2 border-orange-200 flex-shrink-0">
                {user?.name?.charAt(0) || '?'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide p-4 sm:p-6 lg:p-8 bg-slate-50">
          <AnimatePresence>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
            >
              {outlet}
            </motion.div>
          </AnimatePresence>
        </main>
        
        {/* Simple Footer for Dashboard */}
        <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} {settings.site_name || "W'S Physics"}. All rights reserved.</p>
          <p className="mt-1 opacity-75">
            Developed By <a href="#" className="hover:text-slate-600 underline decoration-slate-300 underline-offset-2 transition-all">Mohammad Jaber Bin Razzak</a>
          </p>
        </footer>

      </div>
    </div>
  );
};

export default DashboardLayout;
