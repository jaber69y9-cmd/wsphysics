import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout';
import DashboardLayout from './components/DashboardLayout';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import ChatWidget from './components/ChatWidget';
import BackgroundAnimation from './components/BackgroundAnimation';
import FloatingElements from './components/FloatingElements';
// import WelcomeOverlay from './components/WelcomeOverlay';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminLiveClassLogin = lazy(() => import('./pages/AdminLiveClassLogin'));
const AdminLiveClassStudio = lazy(() => import('./pages/AdminLiveClassStudio'));
const Courses = lazy(() => import('./pages/Courses'));
const About = lazy(() => import('./pages/About'));
const Resources = lazy(() => import('./pages/Resources'));
const Contact = lazy(() => import('./pages/Contact'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Schedule = lazy(() => import('./pages/Schedule'));
const OnlineCourses = lazy(() => import('./pages/OnlineCourses'));
const Results = lazy(() => import('./pages/Results'));
const PublicNotices = lazy(() => import('./pages/Notices'));
const PublicVideoLibrary = lazy(() => import('./pages/PublicVideoLibrary'));
const Programs = lazy(() => import('./pages/Programs'));
const Slide = lazy(() => import('./pages/Slide'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Developer = lazy(() => import('./pages/Developer'));
const Reviews = lazy(() => import('./pages/Reviews'));

// Dashboard Pages
import Profile from './pages/dashboard/Profile';
import Notices from './pages/dashboard/Notices';
import StudentResources from './pages/dashboard/Resources';
import AllResources from './pages/dashboard/AllResources';
import Routines from './pages/dashboard/Routine';
import ZoomClasses from './pages/dashboard/ZoomClasses';
import LiveClassViewer from './pages/dashboard/LiveClassViewer';
import Chapters from './pages/dashboard/Chapters';
import Attendance from './pages/dashboard/Attendance';
import ResultsDashboard from './pages/dashboard/Results';
import Exams from './pages/dashboard/Exams';
import Fees from './pages/dashboard/Fees';
import IDCard from './pages/dashboard/IDCard';
import LiveClasses from './pages/dashboard/LiveClasses';
import MyEnrollments from './pages/dashboard/MyEnrollments';
import VideoLibrary from './pages/dashboard/VideoLibrary';

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <Routes location={location}>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="courses" element={<Courses />} />
        <Route path="online-courses" element={<OnlineCourses />} />
        <Route path="schedule" element={<Schedule />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="notices" element={<PublicNotices />} />
        <Route path="results" element={<Results />} />
        <Route path="video-library" element={<PublicVideoLibrary />} />
        <Route path="about" element={<About />} />
        <Route path="resources" element={<Resources />} />
        <Route path="contact" element={<Contact />} />
        <Route path="terms" element={<Terms />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="developer" element={<Developer />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="slide" element={<Slide />} />
      </Route>

      <Route path="/admin" element={
        <ProtectedRoute role="admin">
          <AdminDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/live-class-login" element={
        <ProtectedRoute role={['admin', 'moderator']}>
          <AdminLiveClassLogin />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/live-class-studio" element={
        <ProtectedRoute role={['admin', 'moderator']}>
          <AdminLiveClassStudio />
        </ProtectedRoute>
      } />

      <Route path="/moderator" element={
        <ProtectedRoute role="moderator">
          <AdminDashboard />
        </ProtectedRoute>
      } />

      <Route path="/dashboard" element={
        <ProtectedRoute role="student">
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="notices" element={<Notices />} />
        <Route path="classes" element={<StudentResources type="video" />} />
        <Route path="materials" element={<StudentResources type="pdf" />} />
        <Route path="all-resources" element={<AllResources />} />
        <Route path="zoom" element={<ZoomClasses />} />
        <Route path="zoom/:id" element={<LiveClassViewer />} />
        <Route path="live-classes" element={<LiveClasses />} />
        <Route path="routines" element={<Routines />} />
        <Route path="programs" element={<Programs />} />
        <Route path="chapters" element={<Chapters />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="results" element={<ResultsDashboard />} />
        <Route path="exams" element={<Exams />} />
        <Route path="view-results" element={<ResultsDashboard />} />
        <Route path="fees" element={<Fees />} />
        <Route path="enrollments" element={<MyEnrollments />} />
        <Route path="video-library" element={<VideoLibrary />} />
        <Route path="id-card" element={<IDCard />} />
        
        <Route path="*" element={<Dashboard />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <ToastProvider>
          <Router>
            <ScrollToTop />
            <ChatWidget />
            <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><LoadingSpinner /></div>}>
              <AnimatedRoutes />
            </Suspense>
          </Router>
        </ToastProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
