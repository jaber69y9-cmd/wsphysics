import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, User, BookOpen, FileText, Calendar, 
  BarChart2, CheckSquare, CreditCard, PlayCircle, Bell, 
  LogOut, Menu, X, ChevronRight, Home, Video
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';


const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
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
    { name: 'Profile', path: '/dashboard/profile', icon: User },
    { name: 'Zoom Classes', path: '/dashboard/zoom', icon: Video },
    ...(user?.student_type !== 'online' ? [
      { name: 'ID Card', path: '/dashboard/id-card', icon: CreditCard },
      { name: 'Chapters', path: '/dashboard/chapters', icon: FileText },
      { name: 'Attendance', path: '/dashboard/attendance', icon: Calendar },
      { name: 'Results', path: '/dashboard/results', icon: BarChart2 },
      { name: 'Exams', path: '/dashboard/exams', icon: CheckSquare },
      { name: 'Fees', path: '/dashboard/fees', icon: CreditCard },
      { name: 'Routines', path: '/dashboard/routines', icon: Calendar },
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
        initial={{ width: isSidebarOpen ? 280 : 80 }}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-white border-r border-slate-200 flex flex-col shadow-xl z-20 relative hidden lg:flex transition-all duration-300"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <Link to="/" className={`flex items-center gap-3 ${!isSidebarOpen && 'justify-center'}`}>
            <div className="h-10 w-10 bg-orange-600 rounded-lg overflow-hidden flex items-center justify-center">
              <img 
                src="https://yt3.googleusercontent.com/yCls-kXn7hDbzhR5VDN487vOkUQfVyKXpDnh09EscXdOq6mOdDhxfkTnJ4kKQ85K4RaXwhv70A=s160-c-k-c0x00ffffff-no-rj" 
                alt="Logo" 
                className="w-full h-full object-cover" 
              />
            </div>
            {isSidebarOpen && <span className="font-bold text-xl text-slate-800">W'S Physics</span>}
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide py-4 px-3 space-y-0.5">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
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
                src="https://yt3.googleusercontent.com/yCls-kXn7hDbzhR5VDN487vOkUQfVyKXpDnh09EscXdOq6mOdDhxfkTnJ4kKQ85K4RaXwhv70A=s160-c-k-c0x00ffffff-no-rj" 
                alt="Logo" 
                className="w-full h-full object-cover" 
              />
            </div>
            <span className="font-bold text-xl text-slate-800">W'S Physics</span>
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
                onClick={() => setIsMobileSidebarOpen(false)} 
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
        
        {/* Simple Footer for Dashboard */}
        <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} W'S Physics. All rights reserved.</p>
          <p className="mt-1 opacity-75">
            Developed By <a href="https://jaber2026.github.io/jaber/" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 underline decoration-slate-300 underline-offset-2 transition-all">Mohammad Jaber Bin Razzak</a>
          </p>
        </footer>

      </div>
    </div>
  );
};

export default DashboardLayout;
