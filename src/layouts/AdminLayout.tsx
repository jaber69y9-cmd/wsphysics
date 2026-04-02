import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Video, 
  FileText, 
  CreditCard, 
  Settings, 
  LogOut,
  Menu,
  X,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';

export function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const location = useLocation();
  const { user, role, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Students', path: '/admin/students', icon: Users },
    { name: 'Live Classes', path: '/admin/live-classes', icon: Video },
    { name: 'Exams & Results', path: '/admin/exams', icon: FileText },
    { name: 'Payments', path: '/admin/payments', icon: CreditCard },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 0 }}
        className="fixed inset-y-0 left-0 z-40 flex flex-col bg-white/80 backdrop-blur-xl border-r border-slate-200/60 shadow-2xl md:relative md:flex-shrink-0"
      >
        <div className="flex items-center justify-between h-20 px-6 border-b border-slate-200/60">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
              <BookOpen className="w-6 h-6" />
            </div>
            {isSidebarOpen && <span className="text-xl font-bold tracking-tight text-slate-800">Admin Panel</span>}
          </Link>
          <button className="md:hidden" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' 
                    : 'text-slate-600 hover:bg-orange-50 hover:text-orange-600'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-orange-500'}`} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-200/60">
          <div className="flex items-center gap-3 px-4 py-3 mb-4 rounded-xl bg-slate-100/50 border border-slate-200/50">
            <img src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.email}`} alt="Avatar" className="w-10 h-10 rounded-full border border-white shadow-sm" />
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold truncate text-slate-800">{user?.displayName || 'Admin'}</span>
              <span className="text-xs text-slate-500 uppercase tracking-wider">{role}</span>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start gap-3 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={logout}>
            <LogOut className="w-5 h-5" />
            Logout
          </Button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-6 bg-white/60 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-30">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-xl bg-white shadow-sm border border-slate-200 text-slate-600 hover:text-orange-600 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm" className="hidden sm:flex">View Site</Button>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
