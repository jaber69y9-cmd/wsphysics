import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import Layout from './components/Layout';
import DashboardLayout from './components/DashboardLayout';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Courses from './pages/Courses';
import About from './pages/About';
import Resources from './pages/Resources';
import Contact from './pages/Contact';
import ProtectedRoute from './components/ProtectedRoute';

import Gallery from './pages/Gallery';
import Schedule from './pages/Schedule';
import OnlineCourses from './pages/OnlineCourses';
import Results from './pages/Results';
import PublicNotices from './pages/Notices';
import Programs from './pages/Programs';
import Slide from './pages/Slide';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Developer from './pages/Developer';

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
import ChatWidget from './components/ChatWidget';
import BackgroundAnimation from './components/BackgroundAnimation';
import FloatingElements from './components/FloatingElements';

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <Router>
          <ScrollToTop />
          <ChatWidget />
          <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="courses" element={<Courses />} />
            <Route path="online-courses" element={<OnlineCourses />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="notices" element={<PublicNotices />} />
            <Route path="results" element={<Results />} />
            <Route path="about" element={<About />} />
            <Route path="resources" element={<Resources />} />
            <Route path="contact" element={<Contact />} />
            <Route path="terms" element={<Terms />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="developer" element={<Developer />} />
            <Route path="slide" element={<Slide />} />
          </Route>

          <Route path="/admin" element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
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
            <Route path="routines" element={<Routines />} />
            <Route path="programs" element={<Programs />} />
            <Route path="chapters" element={<Chapters />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="results" element={<ResultsDashboard />} />
            <Route path="exams" element={<Exams />} />
            <Route path="view-results" element={<ResultsDashboard />} />
            <Route path="fees" element={<Fees />} />
            <Route path="id-card" element={<IDCard />} />
            
            <Route path="*" element={<Dashboard />} />
          </Route>
        </Routes>
      </Router>
    </SettingsProvider>
  </AuthProvider>
);
}

export default App;
