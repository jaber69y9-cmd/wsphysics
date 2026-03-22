import { db } from '../firebase';
import { 
  collection, getDocs, deleteDoc, doc, updateDoc, query, orderBy, addDoc, 
  getDoc, where, limit, startAfter, endBefore, limitToLast, Timestamp 
} from 'firebase/firestore';
import { showAlert, showConfirm } from '../utils/alert';
import { safeJson } from '../utils/api';
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Calendar, CreditCard, BookOpen, Settings, 
  Plus, Trash2, Edit, Search, CheckCircle, XCircle, ChevronRight, LogOut, Copy,
  Bell, FileText, Video, Image as ImageIcon, Award, BarChart, ArrowLeft,
  Mail, Clock, Package, Play, Menu, ExternalLink, LayoutDashboard, TrendingUp, DollarSign, UserCheck, PlayCircle, CheckCircle2
} from 'lucide-react';
import { 
  BarChart as ReBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line 
} from 'recharts';
import { format, parseISO, eachDayOfInterval, isBefore, startOfDay } from 'date-fns';
import { Link } from 'react-router-dom';


const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const AdminDashboard = () => {
  const { token, logout, user, loading: authLoading } = useAuth();
  const { refreshSettings } = useSettings();
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('adminActiveTab') || 'overview');

  useEffect(() => {
    localStorage.setItem('adminActiveTab', activeTab);
  }, [activeTab]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [batches, setBatches] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [routines, setRoutines] = useState<any[]>([]);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [moderators, setModerators] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [selectedEnrollment, setSelectedEnrollment] = useState<any | null>(null);
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  const [newLiveClass, setNewLiveClass] = useState({ title: '', zoom_link: '', batch_id: '', course_id: '', zoom_id: '', zoom_password: '', status: 'active' });
  const [chapters, setChapters] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [webRecordedClasses, setWebRecordedClasses] = useState<any[]>([]);
  const [webClassSchedules, setWebClassSchedules] = useState<any[]>([]);
  const [studyMaterials, setStudyMaterials] = useState<any[]>([]);
  const [degrees, setDegrees] = useState<any[]>([]);
  const [newDegree, setNewDegree] = useState({ title: '', description: '' });
  
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [editStudentData, setEditStudentData] = useState<any>(null);
  
  // Website Settings
  const [settings, setSettings] = useState<any>({});
  const [newSetting, setNewSetting] = useState({ key: '', value: '' });

  // Forms
  const [newBatch, setNewBatch] = useState({ name: '', class: '', live_class_link: '' });
  const [newStudent, setNewStudent] = useState({ name: '', email: '', password: '', roll_number: '', phone: '', batch_id: '', address: '', admission_month: '', paid_amount: '', guardian_phone: '', batch_days: '', admission_fee: '', current_class: '', class: '', monthly_fee: '', student_type: 'offline' });
  const [newNotice, setNewNotice] = useState({ title: '', content: '', batch_id: '', author: '', attachment_url: '', is_verified: true, target_audience: 'all' });
  const [newResource, setNewResource] = useState({ title: '', type: 'video', url: '', batch_id: '', description: '' });
  const [newRoutine, setNewRoutine] = useState({ batch_id: '', image_url: '', content: '' });
  const [newImage, setNewImage] = useState({ image_url: '', caption: '', category: 'General' });
  const [newProgram, setNewProgram] = useState({ title: '', description: '', features: '', target_audience: '', admission_fee: '', monthly_fee: '', image_url: '' });
  const [newCourse, setNewCourse] = useState({ title: '', description: '', price: '', image_url: '', zoom_id: '', zoom_password: '', duration: '', lecture_count: '' });
  const [newChapter, setNewChapter] = useState({ batch_id: '', title: '', content: '', status: 'active', description: '' });
  const [newExam, setNewExam] = useState({ batch_id: '', exam_name: '', exam_date: '', category: '' });
  const [newWebRecordedClass, setNewWebRecordedClass] = useState({ title: '', url: '', description: '', course_id: '' });
  const [newWebClassSchedule, setNewWebClassSchedule] = useState({ title: '', image_url: '' });
  const [newStudyMaterial, setNewStudyMaterial] = useState({ student_id: '', title: '', url: '', type: 'pdf', batch_id: '', course_id: '' });
  
  // Attendance State
  const [attendanceSearch, setAttendanceSearch] = useState({ batch_id: '', roll_number: '' });
  const [attendanceStudent, setAttendanceStudent] = useState<any | null>(null);
  
  // Exam Attendance State
  const [examAttendanceSearch, setExamAttendanceSearch] = useState({ batch_id: '', exam_id: '', roll_number: '' });
  const [examAttendanceStudent, setExamAttendanceStudent] = useState<any | null>(null);
  const [examAttendanceTime, setExamAttendanceTime] = useState('');
  
  // Payment State
  const [paymentSearch, setPaymentSearch] = useState({ batch_id: '', roll_number: '' });
  const [paymentStudent, setPaymentStudent] = useState<any | null>(null);
  const [paymentData, setPaymentData] = useState({ amount: '', date: format(new Date(), 'yyyy-MM-dd'), type: 'monthly', month: '' });
  const [allPayments, setAllPayments] = useState<any[]>([]);
  const [paymentSort, setPaymentSort] = useState('date'); // date, student, batch
  const [paymentLimit, setPaymentLimit] = useState(100);

  // Results State
  const [resultSearch, setResultSearch] = useState({ batch_id: '', roll_number: '' });
  const [resultStudent, setResultStudent] = useState<any | null>(null);
  const [newResult, setNewResult] = useState({ exam_id: '', correct_answers: '', wrong_answers: '', highest_marks: '', negative_marks: '' });
  const [allResults, setAllResults] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState({ student_name: '', student_photo: '', content: '', rating: 5, batch: '' });

  const fetchAllResults = async () => {
    try {
      const res = await fetch('/api/public/results');
      if (res.ok) {
        const data = await safeJson(res);
        setAllResults(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Add this to handle exam selection change
  const handleExamChange = (examId: string) => {
    const selectedExam = exams.find(e => e.id == examId);
    setNewResult({
      ...newResult,
      exam_id: examId,
      highest_marks: selectedExam ? selectedExam.highest_marks : '',
      negative_marks: selectedExam ? selectedExam.negative_marks : ''
    });
  };

  // Student Search State
  const [searchQuery, setSearchQuery] = useState({ class: '', batch_id: '', roll_number: '' });
  const [searchResult, setSearchResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [studentStatusFilter, setStudentStatusFilter] = useState('approved'); // all, approved, pending, upcoming, passed
  const [selectedBatch, setSelectedBatch] = useState<number | null>(null);
  const filteredBatches = useMemo(() => {
    if (searchQuery.class) {
      return batches.filter(b => b.class === searchQuery.class);
    }
    return batches;
  }, [searchQuery.class, batches]);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await safeJson(res);
        setSettings(data);
      }
    } catch (e) { console.error(e); }
  };

  const handleUpdateSetting = async (key: string, value: string) => {
    console.log('Updating setting:', key, value);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ key, value })
      });
      console.log('Response status:', res.status);
      if (res.ok) {
        fetchSettings();
        await refreshSettings();
        setNewSetting({ key: '', value: '' });
        showAlert('Setting updated successfully');
      } else {
        console.error('Failed to update setting:', await res.text());
        showAlert('Failed to update setting');
      }
    } catch (e) { console.error(e); }
  };

  const handleResetData = async (type: string) => {
    if (await showConfirm(`Are you sure you want to delete all ${type}? This action cannot be undone.`)) {
      try {
        const res = await fetch('/api/reset-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ type })
        });
        if (res.ok) {
          showAlert(`All ${type} deleted successfully`);
          if (type === 'students') fetchStudents();
          if (type === 'batches') fetchBatches();
          if (type === 'payments') fetchAllPayments();
          if (type === 'enrollments') fetchEnrollments();
        } else {
          showAlert(`Failed to delete ${type}`);
        }
      } catch (error) {
        console.error('Failed to reset data', error);
        showAlert('An error occurred while resetting data');
      }
    }
  };

  useEffect(() => {
    if (authLoading) return;
    fetchBatches();
    fetchStudents();
    fetchNotices();
    fetchResources();
    fetchRoutines();
    fetchEnrollments();
    fetchChapters();
    fetchExams();
    fetchSettings();
    fetchAllPayments();
    fetchLiveClasses();
  }, [authLoading]);

  useEffect(() => {
    if (authLoading) return;
    if (activeTab === 'gallery' && galleryImages.length === 0) fetchGallery();
    if (activeTab === 'reviews' && reviews.length === 0) fetchReviews();
    if ((activeTab === 'programs' || activeTab === 'program_details') && programs.length === 0) fetchPrograms();
    if (['courses', 'web_recorded', 'web_schedule', 'study_materials', 'live_classes', 'students', 'student_recorded'].includes(activeTab) && courses.length === 0) fetchCourses();
    if (activeTab === 'messages' && messages.length === 0) fetchMessages();
    if (activeTab === 'moderators' && moderators.length === 0) fetchModerators();
    if (activeTab === 'web_recorded' && webRecordedClasses.length === 0) fetchWebRecordedClasses();
    if (activeTab === 'reviews' && reviews.length === 0) fetchReviews();
    if (activeTab === 'routines' && routines.length === 0) fetchRoutines();
    if (activeTab === 'web_schedule' && webClassSchedules.length === 0) fetchWebClassSchedules();
    if (activeTab === 'study_materials' && studyMaterials.length === 0) fetchStudyMaterials();
    if ((activeTab === 'results' || activeTab === 'students') && allResults.length === 0) fetchAllResults();
  }, [activeTab, authLoading]);

  const fetchReviews = async () => {
    try {
      const q = query(collection(db, 'reviews'), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReviews(data);
    } catch (e) { console.error(e); }
  };

  const fetchRoutines = async () => {
    try {
      const res = await fetch('/api/routines');
      if (res.ok) {
        const data = await safeJson(res);
        setRoutines(Array.isArray(data) ? data : []);
      }
    } catch (e) { console.error(e); }
  };

  const handleApproveReview = async (id: string) => {
    try {
      const reviewRef = doc(db, 'reviews', id);
      await updateDoc(reviewRef, {
        status: 'approved'
      });
      showAlert('Review approved successfully');
      fetchReviews();
    } catch (e) {
      console.error(e);
      showAlert('Failed to approve review');
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'reviews'), {
        ...newReview,
        date: new Date().toISOString(),
        status: 'approved' // Admin added reviews are approved by default
      });
      fetchReviews();
      setNewReview({ student_name: '', student_photo: '', content: '', rating: 5, batch: '' });
      showAlert('Review added successfully');
    } catch (e) { console.error(e); }
  };

  const handleDeleteReview = async (id: string) => {
    if (await showConfirm('Are you sure you want to delete this review?')) {
      try {
        await deleteDoc(doc(db, 'reviews', id));
        fetchReviews();
        showAlert('Review deleted successfully');
      } catch (e) { console.error(e); }
    }
  };

  const handleAddRoutine = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/routines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newRoutine)
      });
      if (res.ok) {
        fetchRoutines();
        setNewRoutine({ batch_id: '', image_url: '', content: '' });
        showAlert('Routine added successfully');
      }
    } catch (e) { console.error(e); }
  };

  const handleDeleteRoutine = async (id: number) => {
    if (await showConfirm('Are you sure you want to delete this routine?')) {
      try {
        const res = await fetch(`/api/routines/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          fetchRoutines();
          showAlert('Routine deleted successfully');
        }
      } catch (e) { console.error(e); }
    }
  };

  const fetchStudyMaterials = async () => {
    try {
      const res = await fetch('/api/study-materials', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await safeJson(res);
        setStudyMaterials(Array.isArray(data) ? data : []);
      }
    } catch (e) { console.error(e); }
  };

  const fetchWebRecordedClasses = async () => {
    try {
      const res = await fetch('/api/web-recorded-classes');
      if (res.ok) setWebRecordedClasses(await safeJson(res));
    } catch (e) { console.error(e); }
  };

  const fetchWebClassSchedules = async () => {
    try {
      const res = await fetch('/api/web-class-schedules');
      if (res.ok) setWebClassSchedules(await safeJson(res));
    } catch (e) { console.error(e); }
  };

  const fetchEnrollments = async () => {
    try {
      const res = await fetch('/api/enrollments', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await safeJson(res);
        setEnrollments(Array.isArray(data) ? data : []);
      }
    } catch (e) { console.error(e); }
  };

  const fetchChapters = async () => {
    try {
      const res = await fetch('/api/chapters', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await safeJson(res);
        setChapters(Array.isArray(data) ? data : []);
      }
    } catch (e) { console.error(e); }
  };

  const fetchExams = async () => {
    try {
      const res = await fetch('/api/exams', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await safeJson(res);
        setExams(Array.isArray(data) ? data : []);
      }
    } catch (e) { console.error(e); }
  };

  const handleUpdateEnrollmentStatus = async (id: number, status: string) => {
    setEnrollments(prev => prev.map(e => e.id === id ? { ...e, status } : e));
    try {
      const enrollment = enrollments.find(e => e.id === id);
      const res = await fetch(`/api/enrollments/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      
      if (res.ok && status === 'approved') {
        if (enrollment?.user_id) {
          // Update existing student
          await fetch(`/api/students/${enrollment.user_id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ 
              status: 'approved',
              student_type: enrollment.course_title ? 'online' : 'offline',
              program_title: enrollment.program_title || ''
            })
          });
          // Create payment record for existing student
          await fetch('/api/payments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              student_id: enrollment.user_id,
              amount: enrollment.fee,
              date: format(new Date(), 'yyyy-MM-dd'),
              type: 'admission',
              month: enrollment.admission_month || format(new Date(), 'MMMM')
            })
          });
          showAlert('Enrollment approved and student account activated!');
        } else {
          // Create new student
          const studentRes = await fetch('/api/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              name: enrollment.name,
              email: enrollment.email,
              phone: enrollment.phone,
              batch_id: enrollment.batch_id,
              student_type: enrollment.course_title ? 'online' : 'offline',
              status: 'approved',
              password: enrollment.password,
              roll_number: enrollment.roll_number || '',
              address: enrollment.address || '',
              admission_month: enrollment.admission_month || '',
              paid_amount: enrollment.fee || '',
              guardian_phone: enrollment.guardian_phone || '',
              batch_days: enrollment.batch_days || '',
              admission_fee: enrollment.fee || '',
              current_class: enrollment.current_class || '',
              class: enrollment.class || '',
              monthly_fee: enrollment.monthly_fee || '',
              payment_number: enrollment.payment_number || '',
              transaction_id: enrollment.transaction_id || '',
              program_title: enrollment.program_title || ''
            })
          });
          if (studentRes.ok) {
            const newStudentData = await studentRes.json();
            // Create payment record
            await fetch('/api/payments', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({
                student_id: newStudentData.id,
                amount: enrollment.fee,
                date: format(new Date(), 'yyyy-MM-dd'),
                type: 'admission',
                month: enrollment.admission_month || format(new Date(), 'MMMM')
              })
            });
            showAlert('Enrollment approved and new student account created!');
          } else {
            showAlert('Enrollment approved, but failed to create student account.');
          }
        }
        fetchAllPayments();
      } else if (res.ok) {
        showAlert(`Status updated to ${status}`);
      }
      
      fetchEnrollments();
      fetchStudents();
    } catch (e) { 
      console.error(e); 
      fetchEnrollments();
    }
  };

  const handleCancelEnrollment = async (id: number) => {
    if (await showConfirm('Are you sure you want to cancel this enrollment?')) {
      setEnrollments(prev => prev.filter(e => e.id !== id));
      try {
        await fetch(`/api/enrollments/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchEnrollments();
      } catch (e) {
        console.error(e);
        fetchEnrollments();
      }
    }
  };

  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newChapter)
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to create chapter');
      }
      fetchChapters();
      setNewChapter({ batch_id: '', title: '', content: '', status: 'active', description: '' });
      showAlert('Chapter created successfully');
    } catch (e: any) { 
      console.error(e);
      showAlert(e.message || 'Failed to create chapter');
    }
  };

  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newExam)
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to create exam');
      }
      fetchExams();
      setNewExam({ batch_id: '', exam_name: '', exam_date: '', category: '' });
      showAlert('Exam created successfully');
    } catch (e: any) { 
      console.error(e);
      showAlert(e.message || 'Failed to create exam');
    }
  };

  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(profileForm)
      });
      if (res.ok) {
        showAlert('Profile updated successfully. Please log in again to see changes.');
        logout();
      } else {
        const data = await safeJson(res);
        showAlert(data.error || 'Failed to update profile');
      }
    } catch (e) { console.error(e); }
  };

  const [newModerator, setNewModerator] = useState({ name: '', email: '', password: '' });

  const handleAddModerator = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/moderators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newModerator)
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to add moderator');
      }
      showAlert('Moderator added successfully');
      setNewModerator({ name: '', email: '', password: '' });
      fetchModerators();
    } catch (e: any) { 
      console.error(e);
      showAlert(e.message || 'Failed to add moderator');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showAlert('New passwords do not match');
      return;
    }
    try {
      const res = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ oldPassword: passwordForm.oldPassword, newPassword: passwordForm.newPassword })
      });
      if (res.ok) {
        showAlert('Password changed successfully');
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const error = await safeJson(res);
        showAlert(error.error || 'Failed to change password');
      }
    } catch (e) { console.error(e); }
  };

  const handleStudentSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setSearchResult(null);
    try {
      const res = await fetch(`/api/student-search?batch_id=${searchQuery.batch_id}&roll_number=${searchQuery.roll_number}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const student = await safeJson(res);
        if (student) {
          let allAttendance = student.attendance || [];
          
          // Generate virtual absent records for past class days
          if (student.batch_days && student.created_at) {
            const startDate = startOfDay(parseISO(student.created_at));
            const endDate = startOfDay(new Date());
            
            if (isBefore(startDate, endDate) || startDate.getTime() === endDate.getTime()) {
              const days = eachDayOfInterval({ start: startDate, end: endDate });
              const dayMapping: Record<string, string> = {
                'Saturday': 'Sat', 'Sunday': 'Sun', 'Monday': 'Mon',
                'Tuesday': 'Tue', 'Wednesday': 'Wed', 'Thursday': 'Thu', 'Friday': 'Fri'
              };
              
              days.forEach(day => {
                const dayName = format(day, 'EEEE');
                const dateStr = format(day, 'yyyy-MM-dd');
                
                if (student.batch_days.includes(dayMapping[dayName])) {
                  // Check if record exists
                  const exists = allAttendance.find((a: any) => a.date === dateStr && a.type !== 'exam');
                  if (!exists) {
                    allAttendance.push({
                      id: `auto-${dateStr}`,
                      date: dateStr,
                      time: 'N/A',
                      status: 'absent',
                      type: 'class',
                      isAuto: true
                    });
                  }
                }
              });
            }
          }
          
          // Sort by date descending
          allAttendance.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
          setSearchResult({ ...student, attendance: allAttendance });
        }
      } else {
        showAlert('Student not found');
      }
    } catch (e) { console.error(e); } finally {
      setIsSearching(false);
    }
  };

  const fetchBatches = async () => {
    try {
      const res = await fetch('/api/batches', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await safeJson(res);
        setBatches(Array.isArray(data) ? data : []);
      }
    } catch (e) { console.error(e); }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/students', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await safeJson(res);
        setStudents(Array.isArray(data) ? data : []);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchNotices = async () => {
    try {
      const res = await fetch('/api/notices', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await safeJson(res);
        setNotices(Array.isArray(data) ? data : []);
      }
    } catch (e) { console.error(e); }
  };

  const fetchResources = async () => {
    try {
      const res = await fetch('/api/resources', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await safeJson(res);
        setResources(Array.isArray(data) ? data : []);
      }
    } catch (e) { console.error(e); }
  };

  const fetchGallery = async () => {
    try {
      const res = await fetch('/api/gallery', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await safeJson(res);
        setGalleryImages(Array.isArray(data) ? data : []);
      }
    } catch (e) { console.error(e); }
  };

  const fetchPrograms = async () => {
    try {
      const res = await fetch('/api/programs', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await safeJson(res);
        setPrograms(Array.isArray(data) ? data : []);
      }
    } catch (e) { console.error(e); }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await safeJson(res);
        setCourses(Array.isArray(data) ? data : []);
      }
    } catch (e) { console.error(e); }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/messages', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await safeJson(res);
        setMessages(Array.isArray(data) ? data : []);
      }
    } catch (e) { console.error(e); }
  };

  const fetchModerators = async () => {
    try {
      const res = await fetch('/api/moderators', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await safeJson(res);
        setModerators(Array.isArray(data) ? data : []);
      }
    } catch (e) { console.error(e); }
  };

  const fetchLiveClasses = async () => {
    try {
      const res = await fetch('/api/live-classes', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await safeJson(res);
        setLiveClasses(Array.isArray(data) ? data : []);
      }
    } catch (e) { console.error(e); }
  };

  const fetchAllPayments = async () => {
    try {
      const res = await fetch('/api/payments', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await safeJson(res);
        setAllPayments(Array.isArray(data) ? data : []);
      }
    } catch (e) { console.error(e); }
  };

  const [attendanceTime, setAttendanceTime] = useState('');

  const [attendanceReport, setAttendanceReport] = useState<any[]>([]);
  const [attendanceReportFilter, setAttendanceReportFilter] = useState({ batch_id: '', startDate: format(new Date(), 'yyyy-MM-dd'), endDate: format(new Date(), 'yyyy-MM-dd') });

  const fetchAttendanceReport = async () => {
    try {
      const { batch_id, startDate, endDate } = attendanceReportFilter;
      const query = new URLSearchParams({ batch_id, startDate, endDate }).toString();
      const res = await fetch(`/api/attendance/report?${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setAttendanceReport(await safeJson(res));
      }
    } catch (e) { console.error(e); }
  };

  const handleAutoAbsent = async () => {
    if (!attendanceSearch.batch_id) {
      showAlert('Please select a batch first');
      return;
    }
    if (!await showConfirm('Are you sure you want to mark all unmarked students as absent for today?')) return;
    
    try {
      const res = await fetch('/api/attendance/auto-absent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          batch_id: attendanceSearch.batch_id, 
          date: format(new Date(), 'yyyy-MM-dd') 
        })
      });
      if (res.ok) {
        const data = await safeJson(res);
        showAlert(`Successfully marked ${data.count} students as absent.`);
        if (attendanceStudent) searchAttendanceStudent();
      }
    } catch (e) { console.error(e); }
  };

  const handleUpdateStudentStatus = async (studentId: string | number, status: string) => {
    try {
      const res = await fetch(`/api/students/${studentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showAlert(`Student status updated to ${status}`);
        if (searchResult && searchResult.id === studentId) {
          setSearchResult({ ...searchResult, status });
        }
        fetchStudents();
      }
    } catch (e) { console.error(e); }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStudentData) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/students/${editStudentData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editStudentData)
      });
      if (res.ok) {
        showAlert('Student details updated successfully');
        setIsEditingStudent(false);
        setSelectedStudent(editStudentData);
        fetchStudents();
      } else {
        const error = await res.json();
        showAlert(error.message || 'Failed to update student');
      }
    } catch (e) {
      console.error(e);
      showAlert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRegistration = async (studentId: number) => {
    if (!await showConfirm('Are you sure you want to cancel this registration? This will delete the student and all their records.')) return;
    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showAlert('Registration cancelled successfully');
        setSearchResult(null);
        fetchStudents();
      } else {
        const data = await safeJson(res);
        showAlert(data.error || 'Failed to cancel registration');
      }
    } catch (e: any) { 
      console.error(e);
      showAlert(e.message || 'Error cancelling registration');
    }
  };

  const handleAddBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          name: newBatch.name, 
          class: newBatch.class,
          live_class_link: newBatch.live_class_link
        }),
      });
      if (!res.ok) {
        const data = await safeJson(res);
        throw new Error(data.error || 'Failed to create batch');
      }
      setNewBatch({ name: '', class: '', live_class_link: '' });
      fetchBatches();
      showAlert('Batch created successfully');
    } catch (error: any) {
      console.error(error);
      showAlert(error.message || 'Error creating batch');
    }
  };

  const handleAddProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newProgram),
      });
      if (!res.ok) {
        const data = await safeJson(res);
        throw new Error(data.error || 'Failed to create program');
      }
      setNewProgram({ title: '', description: '', features: '', target_audience: '', admission_fee: '', monthly_fee: '', image_url: '' });
      fetchPrograms();
      showAlert('Program created successfully');
    } catch (error: any) {
      console.error(error);
      showAlert(error.message || 'Error creating program');
    }
  };

  const handleAddWebRecordedClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/web-recorded-classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newWebRecordedClass),
      });
      if (!res.ok) {
        const data = await safeJson(res);
        throw new Error(data.error || 'Failed to create recorded class');
      }
      setNewWebRecordedClass({ title: '', url: '', description: '', course_id: '' });
      fetchWebRecordedClasses();
      showAlert('Recorded class added successfully');
    } catch (error: any) {
      console.error(error);
      showAlert(error.message || 'Error adding recorded class');
    }
  };

  const handleAddWebClassSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/web-class-schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newWebClassSchedule),
      });
      if (!res.ok) {
        const data = await safeJson(res);
        throw new Error(data.error || 'Failed to create class schedule');
      }
      setNewWebClassSchedule({ title: '', image_url: '' });
      fetchWebClassSchedules();
      showAlert('Class schedule added successfully');
    } catch (error: any) {
      console.error(error);
      showAlert(error.message || 'Error adding class schedule');
    }
  };

  const handleAddLiveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/live-classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newLiveClass),
      });
      if (!res.ok) {
        const data = await safeJson(res);
        throw new Error(data.error || 'Failed to create live class');
      }
      setNewLiveClass({ title: '', zoom_link: '', batch_id: '', course_id: '', zoom_id: '', zoom_password: '', status: 'active' });
      fetchLiveClasses();
      showAlert('Live class created successfully');
    } catch (error: any) {
      console.error(error);
      showAlert(error.message || 'Error creating live class');
    }
  };

  const handleDeleteLiveClass = async (id: number) => {
    if (!await showConfirm('Are you sure you want to delete this live class?')) return;
    try {
      const res = await fetch(`/api/live-classes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showAlert('Live class deleted successfully');
        fetchLiveClasses();
      }
    } catch (e) { console.error(e); }
  };

  const handleDeleteWebRecordedClass = async (id: number) => {
    if (!await showConfirm('Are you sure?')) return;
    try {
      const res = await fetch(`/api/web-recorded-classes/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to delete recorded class');
      fetchWebRecordedClasses();
      showAlert('Recorded class deleted successfully');
    } catch (e: any) { 
      console.error(e);
      showAlert(e.message || 'Error deleting recorded class');
    }
  };

  const handleDeleteWebClassSchedule = async (id: number) => {
    if (!await showConfirm('Are you sure?')) return;
    try {
      const res = await fetch(`/api/web-class-schedules/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to delete class schedule');
      fetchWebClassSchedules();
      showAlert('Class schedule deleted successfully');
    } catch (e: any) { 
      console.error(e);
      showAlert(e.message || 'Error deleting class schedule');
    }
  };

  const handleAddStudyMaterial = async (e: React.FormEvent, customData?: any) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/study-materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(customData || newStudyMaterial),
      });
      if (!res.ok) throw new Error('Failed to create study material');
      setNewStudyMaterial({ title: '', url: '', type: 'pdf', batch_id: '', course_id: '' });
      fetchStudyMaterials();
      showAlert('Added successfully');
    } catch (error) {
      console.error(error);
      showAlert('Error adding material');
    }
  };

  const handleDeleteStudyMaterial = async (id: number) => {
    if (!await showConfirm('Are you sure?')) return;
    try {
      const res = await fetch(`/api/study-materials/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to delete study material');
      fetchStudyMaterials();
      showAlert('Study material deleted successfully');
    } catch (e: any) { 
      console.error(e);
      showAlert(e.message || 'Error deleting study material');
    }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newCourse),
      });
      if (!res.ok) {
        const data = await safeJson(res);
        throw new Error(data.error || 'Failed to create course');
      }
      setNewCourse({ title: '', description: '', price: '', image_url: '', zoom_id: '', zoom_password: '' });
      fetchCourses();
      showAlert('Course created successfully');
    } catch (error: any) {
      console.error(error);
      showAlert(error.message || 'Error creating course');
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...newStudent,
        student_type: activeTab === 'online_students' ? 'online' : 'offline',
        status: 'approved'
      };
      
      // Optimistic update
      const tempId = Date.now().toString();
      const optimisticStudent = { ...payload, id: tempId, created_at: new Date().toISOString() };
      setStudents(prev => [optimisticStudent, ...prev]);
      setNewStudent({ name: '', email: '', password: '', roll_number: '', phone: '', batch_id: '', batch_id_2: '', address: '', admission_month: '', paid_amount: '', guardian_phone: '', batch_days: '', admission_fee: '', current_class: '', class: '', monthly_fee: '', student_type: 'offline' });
      showAlert('Student created successfully');

      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        // Revert optimistic update
        setStudents(prev => prev.filter(s => s.id !== tempId));
        const data = await safeJson(res);
        throw new Error(data.error || 'Failed to create student');
      }
      
      // Fetch actual data to get real ID
      fetchStudents();
    } catch (error: any) {
      showAlert(error.message || 'Error creating student');
    }
  };

  const handleAddNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const noticeData = {
        ...newNotice,
        date: new Date().toISOString(),
        admin_name: newNotice.author || user?.name || 'Admin'
      };
      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(noticeData),
      });
      if (!res.ok) {
        const data = await safeJson(res);
        throw new Error(data.error || 'Failed to create notice');
      }
      setNewNotice({ title: '', content: '', batch_id: '', author: '', attachment_url: '', is_verified: true });
      await fetchNotices();
      showAlert('Notice created successfully');
    } catch (error: any) {
      console.error(error);
      showAlert(error.message || 'Error creating notice');
    }
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newResource),
      });
      if (!res.ok) {
        const data = await safeJson(res);
        throw new Error(data.error || 'Failed to create resource');
      }
      setNewResource({ title: '', type: 'video', url: '', batch_id: '', description: '' });
      fetchResources();
      showAlert('Resource created successfully');
    } catch (error: any) {
      console.error(error);
      showAlert(error.message || 'Error creating resource');
    }
  };

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newImage),
      });
      if (!res.ok) {
        const data = await safeJson(res);
        throw new Error(data.error || 'Failed to add image');
      }
      setNewImage({ image_url: '', caption: '', category: 'General' });
      fetchGallery();
      showAlert('Image added successfully');
    } catch (error: any) {
      console.error(error);
      showAlert(error.message || 'Error adding image');
    }
  };

  const handleDeleteBatch = async (id: number) => {
    if (await showConfirm('Are you sure you want to delete this batch?')) {
      try {
        const res = await fetch(`/api/batches/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const data = await safeJson(res);
          throw new Error(data.error || 'Failed to delete batch');
        }
        fetchBatches();
        showAlert('Batch deleted successfully');
      } catch (error: any) {
        console.error(error);
        showAlert(error.message || 'Error deleting batch');
      }
    }
  };
  
  const handleDeleteProgram = async (id: number) => {
    if (await showConfirm('Are you sure?')) {
      try {
        const res = await fetch(`/api/programs/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to delete program');
        fetchPrograms();
        showAlert('Program deleted successfully');
      } catch (e: any) {
        console.error(e);
        showAlert(e.message || 'Error deleting program');
      }
    }
  };

  const handleDeleteCourse = async (id: number) => {
    if (await showConfirm('Are you sure?')) {
      try {
        const res = await fetch(`/api/courses/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to delete course');
        fetchCourses();
        showAlert('Course deleted successfully');
      } catch (e: any) {
        console.error(e);
        showAlert(e.message || 'Error deleting course');
      }
    }
  };

  const handleDeleteImage = async (id: number) => {
    if (await showConfirm('Are you sure?')) {
      try {
        const res = await fetch(`/api/gallery/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to delete image');
        fetchGallery();
        showAlert('Image deleted successfully');
      } catch (e: any) {
        console.error(e);
        showAlert(e.message || 'Error deleting image');
      }
    }
  };

  const handleDeleteNotice = async (id: number) => {
    if (await showConfirm('Are you sure?')) {
      try {
        const res = await fetch(`/api/notices/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to delete notice');
        fetchNotices();
        showAlert('Notice deleted successfully');
      } catch (e: any) {
        console.error(e);
        showAlert(e.message || 'Error deleting notice');
      }
    }
  };

  const handleDeleteResource = async (id: number) => {
    if (await showConfirm('Are you sure?')) {
      try {
        const res = await fetch(`/api/resources/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to delete resource');
        fetchResources();
        showAlert('Resource deleted successfully');
      } catch (e: any) {
        console.error(e);
        showAlert(e.message || 'Error deleting resource');
      }
    }
  };

  const fetchStudentDetails = async (id: number) => {
    const res = await fetch(`/api/students/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    return await safeJson(res);
  };

  // Attendance Logic
  const searchAttendanceStudent = async () => {
    if (!attendanceSearch.batch_id || !attendanceSearch.roll_number) return;
    try {
      const res = await fetch(`/api/student-search?batch_id=${attendanceSearch.batch_id}&roll_number=${attendanceSearch.roll_number}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setAttendanceStudent(await safeJson(res));
      } else {
        setAttendanceStudent(null);
        showAlert('Student not found. Status: Absent.');
      }
    } catch (e) { console.error(e); }
  };

  const searchExamAttendanceStudent = async () => {
    if (!examAttendanceSearch.batch_id || !examAttendanceSearch.roll_number || !examAttendanceSearch.exam_id) return;
    try {
      const res = await fetch(`/api/student-search?batch_id=${examAttendanceSearch.batch_id}&roll_number=${examAttendanceSearch.roll_number}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setExamAttendanceStudent(await safeJson(res));
      } else {
        setExamAttendanceStudent(null);
        showAlert('Student not found. Status: Absent.');
      }
    } catch (e) { console.error(e); }
  };

  const markSingleAttendance = async (status: 'present' | 'absent') => {
    if (!attendanceStudent || !attendanceSearch.batch_id) return;
    const date = format(new Date(), 'yyyy-MM-dd');
    const time = attendanceTime || format(new Date(), 'hh:mm a');
    
    // Optimistic update
    const previousStudent = { ...attendanceStudent };
    const newRecord = { date, time, status, type: 'class', batch_id: attendanceSearch.batch_id };
    const updatedAttendance = attendanceStudent.attendance 
      ? [...attendanceStudent.attendance.filter((r: any) => !(r.date === date && r.type !== 'exam')), newRecord]
      : [newRecord];
    setAttendanceStudent({ ...attendanceStudent, attendance: updatedAttendance });

    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          batch_id: attendanceSearch.batch_id,
          date,
          time,
          records: [{ student_id: attendanceStudent.id, status }]
        })
      });
      if (res.ok) {
        showAlert(`Marked as ${status}`);
      } else {
        setAttendanceStudent(previousStudent);
        const err = await safeJson(res);
        showAlert(err.error || 'Failed to mark attendance');
      }
    } catch (e) { 
      setAttendanceStudent(previousStudent);
      console.error(e); 
    }
  };

  const markSingleExamAttendance = async (status: 'present' | 'absent') => {
    if (!examAttendanceStudent || !examAttendanceSearch.exam_id || !examAttendanceSearch.batch_id) return;
    const date = format(new Date(), 'yyyy-MM-dd');
    const time = examAttendanceTime || format(new Date(), 'hh:mm a');

    // Optimistic update
    const previousStudent = { ...examAttendanceStudent };
    const newRecord = { date, time, status, type: 'exam', exam_id: examAttendanceSearch.exam_id, batch_id: examAttendanceSearch.batch_id };
    const updatedAttendance = examAttendanceStudent.attendance 
      ? [...examAttendanceStudent.attendance.filter((r: any) => !(r.date === date && r.type === 'exam' && r.exam_id === examAttendanceSearch.exam_id)), newRecord]
      : [newRecord];
    setExamAttendanceStudent({ ...examAttendanceStudent, attendance: updatedAttendance });

    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          batch_id: examAttendanceSearch.batch_id,
          date,
          time,
          type: 'exam',
          exam_id: examAttendanceSearch.exam_id,
          records: [{ student_id: examAttendanceStudent.id, status }]
        })
      });
      if (res.ok) {
        showAlert(`Marked as ${status} for exam`);
      } else {
        setExamAttendanceStudent(previousStudent);
        const err = await safeJson(res);
        showAlert(err.error || 'Failed to mark exam attendance');
      }
    } catch (e) { 
      setExamAttendanceStudent(previousStudent);
      console.error(e); 
    }
  };

  // Payment Logic
  const searchPaymentStudent = async () => {
    const student = students.find(s => (s.batch_id == paymentSearch.batch_id || s.batch_id_2 == paymentSearch.batch_id) && s.roll_number?.toString() === paymentSearch.roll_number.toString());
    if (student) {
      const details = await fetchStudentDetails(student.id);
      setPaymentStudent(details);
    } else {
      setPaymentStudent(null);
      showAlert('Student not found in this batch');
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentStudent) return;

    try {
      const batchName = batches.find(b => b.id == paymentSearch.batch_id)?.name || '';
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          ...paymentData, 
          student_id: paymentStudent.id,
          student_name: paymentStudent.name,
          roll_number: paymentStudent.roll_number,
          batch_name: batchName
        }),
      });
      
      showAlert('Payment recorded');
      setPaymentData({ ...paymentData, amount: '', type: 'monthly' });
      
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to record payment');
      }
      
      const details = await fetchStudentDetails(paymentStudent.id);
      setPaymentStudent(details);
    } catch (e: any) {
      console.error(e);
      showAlert(e.message || 'Failed to record payment');
    }
  };

  // Results Logic
  const searchResultStudent = async () => {
    const student = students.find(s => (s.batch_id == resultSearch.batch_id || s.batch_id_2 == resultSearch.batch_id) && s.roll_number?.toString() === resultSearch.roll_number.toString());
    if (student) {
      const details = await fetchStudentDetails(student.id);
      setResultStudent(details);
    } else {
      setResultStudent(null);
      showAlert('Student not found in this batch');
    }
  };

  const handleAddResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultStudent) return;
    
    // Find the selected exam to get its name
    const selectedExam = exams.find(e => e.id == newResult.exam_id);
    const exam_name = selectedExam ? selectedExam.exam_name : 'Unknown Exam';

    // Calculate marks
    const correct = parseFloat(newResult.correct_answers) || 0;
    const wrong = parseFloat(newResult.wrong_answers) || 0;
    const negative = parseFloat(newResult.negative_marks) || 0;
    const marks = correct - (wrong * negative);

    try {
      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...newResult, marks, student_id: resultStudent.id, batch_id: resultSearch.batch_id, exam_name }),
      });
      
      showAlert('Result added successfully');
      // Keep exam details for batch entry, only clear student-specific marks
      setNewResult(prev => ({ 
        ...prev, 
        correct_answers: '', 
        wrong_answers: '' 
      }));
      
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to add result');
      }
      
      // Refresh student details to show updated results if needed
      const details = await fetchStudentDetails(resultStudent.id);
      setResultStudent(details);
    } catch (e: any) {
      console.error(e);
      showAlert(e.message || 'Failed to add result');
    }
  };

  const filteredStudents = useMemo(() => students.filter(s => 
    (s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.roll_number?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!selectedBatch || s.batch_id == selectedBatch || s.batch_id_2 == selectedBatch) &&
    (studentStatusFilter === 'all' || s.status === studentStatusFilter) &&
    (activeTab === 'online_students' ? s.student_type === 'online' : s.student_type !== 'online')
  ), [students, searchTerm, selectedBatch, studentStatusFilter, activeTab]);

  const allStudentsByBatch = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    students.forEach(s => {
      if (s.batch_id) {
        if (!grouped[s.batch_id]) grouped[s.batch_id] = [];
        grouped[s.batch_id].push(s);
      }
    });
    return grouped;
  }, [students]);

  const chartData = useMemo(() => {
    return batches.map(b => {
      const batchStudents = allStudentsByBatch[b.id] || [];
      return {
        name: b.name,
        students: batchStudents.filter(s => s.student_type !== 'online').length
      };
    });
  }, [batches, allStudentsByBatch]);

  const sortedPayments = useMemo(() => {
    return [...allPayments].sort((a, b) => {
      if (paymentSort === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (paymentSort === 'student') return (a.student_name || '').localeCompare(b.student_name || '');
      if (paymentSort === 'batch') return (a.batch_name || '').localeCompare(b.batch_name || '');
      return 0;
    });
  }, [allPayments, paymentSort]);

  const meritPositions = useMemo(() => {
    const positions: Record<string, Record<string, number>> = {};
    const grouped: Record<string, any[]> = {};
    allResults.forEach(r => {
      const key = r.exam_id || r.exam_name;
      if (key) {
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(r);
      }
    });

    Object.keys(grouped).forEach(key => {
      const results = [...grouped[key]];
      results.sort((a, b) => parseFloat(b.marks || '0') - parseFloat(a.marks || '0'));
      positions[key] = {};
      results.forEach((r, index) => {
        positions[key][r.student_id] = index + 1;
      });
    });
    return positions;
  }, [allResults]);

  const totalOfflineStudents = useMemo(() => students.filter(s => s.student_type !== 'online').length, [students]);
  const totalRevenue = useMemo(() => {
    return allPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [allPayments]);

  const studentsByBatch = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    filteredStudents.forEach(s => {
      if (s.batch_id) {
        if (!grouped[s.batch_id]) grouped[s.batch_id] = [];
        grouped[s.batch_id].push(s);
      }
    });
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => (parseInt(a.roll_number) || 0) - (parseInt(b.roll_number) || 0));
    });
    return grouped;
  }, [filteredStudents]);

  const isClassDay = (student: any) => {
    if (!student || !student.batch_days) return true;
    const today = format(new Date(), 'EEEE');
    const dayMapping: Record<string, string> = {
      'Saturday': 'Sat',
      'Sunday': 'Sun',
      'Monday': 'Mon',
      'Tuesday': 'Tue',
      'Wednesday': 'Wed',
      'Thursday': 'Thu',
      'Friday': 'Fri'
    };
    const shortDay = dayMapping[today] || '';
    return student.batch_days.includes(shortDay);
  };

  const handleDeletePayment = async (id: number) => {
    if (!await showConfirm('Are you sure you want to delete this payment record? This will affect the total revenue.')) return;
    try {
      const res = await fetch(`/api/payments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showAlert('Payment deleted successfully');
        fetchAllPayments();
      } else {
        const data = await safeJson(res);
        showAlert(data.error || 'Failed to delete payment');
      }
    } catch (error) {
      console.error(error);
      showAlert('Error deleting payment');
    }
  };

  const handleDeleteChapter = async (id: number) => {
    if (!await showConfirm('Are you sure you want to delete this chapter?')) return;
    try {
      const res = await fetch(`/api/chapters/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showAlert('Chapter deleted successfully');
        fetchChapters();
      } else {
        const data = await safeJson(res);
        showAlert(data.error || 'Failed to delete chapter');
      }
    } catch (error) {
      console.error(error);
      showAlert('Error deleting chapter');
    }
  };

  const handleDeleteExam = async (id: number) => {
    if (await showConfirm('Are you sure you want to delete this exam?')) {
      try {
        const res = await fetch(`/api/exams/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to delete exam');
        fetchExams();
        showAlert('Exam deleted successfully');
      } catch (e: any) {
        console.error(e);
        showAlert(e.message || 'Error deleting exam');
      }
    }
  };

  const getYoutubeThumbnail = (url: string) => {
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://img.youtube.com/vi/${match[2]}/mqdefault.jpg`;
    }
    return 'https://picsum.photos/seed/video/400/225';
  };

  const clearForm = (formType: string) => {
    switch (formType) {
      case 'batch': setNewBatch({ name: '', class: '' }); break;
      case 'student': setNewStudent({ name: '', email: '', password: '', roll_number: '', phone: '', batch_id: '', address: '', admission_month: '', paid_amount: '', guardian_phone: '', batch_days: '', admission_fee: '', current_class: '', class: '', monthly_fee: '', student_type: 'offline' }); break;
      case 'notice': setNewNotice({ title: '', content: '', batch_id: '', author: '', attachment_url: '', is_verified: true, target_audience: 'all' }); break;
      case 'resource': setNewResource({ title: '', type: 'video', url: '', batch_id: '', description: '' }); break;
      case 'routine': setNewRoutine({ batch_id: '', image_url: '', content: '' }); break;
      case 'gallery': setNewImage({ image_url: '', caption: '', category: 'General' }); break;
      case 'review': setNewReview({ student_name: '', student_photo: '', content: '', rating: 5, batch: '' }); break;
      case 'web_recorded': setNewWebRecordedClass({ title: '', url: '', description: '' }); break;
      case 'web_schedule': setNewWebClassSchedule({ title: '', image_url: '' }); break;
      case 'study_materials': setNewStudyMaterial({ student_id: '', title: '', url: '', type: 'pdf', batch_id: '' }); break;
      case 'moderators': setNewModerator({ name: '', email: '', password: '' }); break;
      case 'program': setNewProgram({ title: '', description: '', features: '', target_audience: '', admission_fee: '', monthly_fee: '', image_url: '' }); break;
      case 'course': setNewCourse({ title: '', description: '', price: '', image_url: '', zoom_id: '', zoom_password: '', duration: '', lecture_count: '' }); break;
      case 'chapter': setNewChapter({ batch_id: '', title: '', content: '', status: 'active', description: '' }); break;
      case 'exam': setNewExam({ batch_id: '', exam_name: '', exam_date: '', category: '' }); break;
      case 'attendance': setAttendanceSearch({ batch_id: '', roll_number: '' }); setAttendanceStudent(null); break;
      case 'payment': setPaymentSearch({ batch_id: '', roll_number: '' }); setPaymentStudent(null); setPaymentData({ amount: '', date: format(new Date(), 'yyyy-MM-dd'), type: 'monthly' }); break;
      case 'result': setResultSearch({ batch_id: '', roll_number: '' }); setResultStudent(null); setNewResult({ exam_id: '', correct_answers: '', wrong_answers: '', highest_marks: '', negative_marks: '' }); break;
      case 'search': setSearchQuery({ class: '', batch_id: '', roll_number: '' }); setSearchResult(null); break;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/50 z-20 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 w-64 bg-slate-900 text-white flex flex-col h-full shadow-xl z-30 transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-800 space-y-4 flex-shrink-0">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">
              <ArrowLeft className="h-4 w-4" /> Go to Website
            </Link>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
              <XCircle className="h-6 w-6" />
            </button>
          </div>
          <div className="flex items-center gap-2">
             <img src="https://yt3.googleusercontent.com/yCls-kXn7hDbzhR5VDN487vOkUQfVyKXpDnh09EscXdOq6mOdDhxfkTnJ4kKQ85K4RaXwhv70A=s160-c-k-c0x00ffffff-no-rj" alt="Logo" className="h-10 w-10 rounded-full" />
             <span className="font-bold text-xl text-white">
               {user?.role === 'moderator' ? 'Moderator Panel' : 'Admin Panel'}
             </span>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto touch-pan-y scrollbar-hide">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
            { id: 'attendance', icon: CheckCircle, label: 'Class Attendance' },
            { id: 'exam_attendance', icon: CheckCircle, label: 'Exam Attendance' },
            { id: 'attendance_report', icon: FileText, label: 'Attendance Report' },
            { id: 'payments', icon: CreditCard, label: 'New Payment' },
            { id: 'payments_history', icon: FileText, label: 'Payment History' },
            { id: 'results', icon: BarChart, label: 'Results' },
            { id: 'students', icon: Users, label: 'Offline Students' },
            { id: 'online_students', icon: Users, label: 'Online Students' },
            { id: 'studentSearch', icon: Search, label: 'Search Student' },
            { id: 'enrollments', icon: FileText, label: 'Enrollments' },
            { id: 'live_classes', icon: Video, label: 'Zoom Classes' },
            { id: 'batches', icon: Calendar, label: 'Batches' },
            { id: 'chapters', icon: BookOpen, label: 'Chapters' },
            { id: 'exams', icon: Calendar, label: 'Exams' },
            { id: 'programs', icon: Award, label: 'Programs' },
            { id: 'courses', icon: Video, label: 'Online Courses' },
            { id: 'notices', icon: Bell, label: 'Notices' },
            { id: 'routines', icon: Calendar, label: 'Class Routine' },
            { id: 'web_recorded', icon: Video, label: 'Website Recorded' },
            { id: 'student_recorded', icon: PlayCircle, label: 'Student Recorded' },
            { id: 'web_schedule', icon: Calendar, label: 'Web Schedule' },
            { id: 'study_materials', icon: BookOpen, label: 'Study Materials' },
            { id: 'gallery', icon: ImageIcon, label: 'Gallery' },
            { id: 'reviews', icon: Award, label: 'Student Reviews' },
            { id: 'messages', icon: Bell, label: 'Messages' },
            { id: 'moderators', icon: Users, label: 'Moderators', hidden: user?.role !== 'admin' },
            { id: 'profile', icon: Users, label: 'Profile Settings' },
            { id: 'website_settings', icon: ImageIcon, label: 'Website Content', hidden: user?.role !== 'admin' },
          ].filter(item => !item.hidden).map((item) => (
            <button
              key={item.id}
              onClick={() => { 
                setActiveTab(item.id); 
                setSelectedStudent(null); 
                setAttendanceStudent(null); 
                setPaymentStudent(null); 
                setResultStudent(null);
                setSearchResult(null);
                setIsSidebarOpen(false);
              }}
              className={`flex items-center space-x-3 w-full px-4 py-2.5 rounded-lg transition-all ${
                activeTab === item.id ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={logout}
            className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
          <div className="mt-4 text-center text-xs text-slate-500 opacity-75">
            Developed By <a href="https://jaber2026.github.io/jaber/" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 underline decoration-slate-600 underline-offset-2 transition-all">Mohammad Jaber Bin Razzak</a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-slate-200 h-16 px-3 flex justify-between items-center shadow-sm z-20">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
            <Menu className="h-6 w-6" />
          </button>
          <div className="w-10"></div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 scrollbar-hide w-full">
          <style>{`
              .scrollbar-hide::-webkit-scrollbar {
                  display: none;
              }
              .scrollbar-hide {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
              }
              .input-field {
                @apply w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all;
              }
              .btn-primary {
                @apply px-6 py-2 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all active:scale-95 disabled:opacity-50;
              }
              .btn-secondary {
                @apply px-6 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-all active:scale-95;
              }
            `}</style>
          {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6 w-full">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-slate-800">Dashboard Overview</h2>
              <div className="text-sm text-slate-500 font-medium">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Revenue', value: `৳${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-emerald-500', trend: '+12%', type: 'payments' },
                { label: 'Offline Students', value: totalOfflineStudents, icon: Users, color: 'bg-orange-500', trend: '+5%', type: 'students' },
                { label: 'Online Students', value: students.filter(s => s.student_type === 'online').length, icon: Users, color: 'bg-blue-500', trend: '+5%', type: 'online_students' },
                { label: 'Active Batches', value: batches.length, icon: Calendar, color: 'bg-orange-500', trend: 'Stable', type: 'batches' },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative group">
                  <button 
                    onClick={() => handleResetData(stat.type)}
                    className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title={`Reset ${stat.label}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="flex justify-between items-start mb-4">
                    <div className={`${stat.color} p-3 rounded-xl text-white`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.trend.startsWith('+') ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {stat.trend}
                    </span>
                  </div>
                  <h3 className="text-slate-500 text-sm font-medium">{stat.label}</h3>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-orange-500" /> Revenue Growth
                </h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={allPayments.slice(-10).map(p => ({ name: p.date, amount: p.amount }))}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Line type="monotone" dataKey="amount" stroke="#f97316" strokeWidth={3} dot={{ r: 4, fill: '#f97316' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Student Distribution */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Users className="h-5 w-5 text-orange-500" /> Student Distribution
                </h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReBarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="students" fill="#f97316" radius={[4, 4, 0, 0]} />
                    </ReBarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Recent Enrollments</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-slate-100">
                      <th className="pb-4 font-bold text-slate-500 text-sm">Student</th>
                      <th className="pb-4 font-bold text-slate-500 text-sm">Program</th>
                      <th className="pb-4 font-bold text-slate-500 text-sm">Date</th>
                      <th className="pb-4 font-bold text-slate-500 text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {enrollments.slice(0, 5).map((en, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4">
                          <div className="font-bold text-slate-800">{en.name}</div>
                          <div className="text-xs text-slate-500">{en.phone}</div>
                        </td>
                        <td className="py-4 text-sm text-slate-600">{en.program_title}</td>
                        <td className="py-4 text-sm text-slate-600">{new Date(en.created_at).toLocaleDateString()}</td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            en.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 
                            en.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                          }`}>
                            {en.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
            <div className="space-y-6 w-full">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Mark Attendance</h2>
                <button onClick={() => clearForm('attendance')} className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-sm font-bold">
                  <XCircle className="h-4 w-4" /> Clear
                </button>
              </div>
              
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <select 
                    className="input-field"
                    value={attendanceSearch.batch_id}
                    onChange={(e) => setAttendanceSearch({...attendanceSearch, batch_id: e.target.value})}
                  >
                    <option value="">Select Batch</option>
                    {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                  <input 
                    type="text" 
                    placeholder="Roll Number" 
                    className="input-field"
                    value={attendanceSearch.roll_number}
                    onChange={(e) => setAttendanceSearch({...attendanceSearch, roll_number: e.target.value})}
                    onKeyDown={(e) => e.key === 'Enter' && searchAttendanceStudent()}
                  />
                  <button 
                    onClick={searchAttendanceStudent}
                    className="btn-primary"
                  >
                    Search Student
                  </button>
                </div>

                {attendanceStudent && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-slate-100 flex flex-col gap-6"
                  >
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                      <div className="w-32 h-32 flex-shrink-0 bg-orange-100 rounded-full flex items-center justify-center text-4xl font-bold text-orange-600 border-4 border-white shadow-md overflow-hidden">
                        {attendanceStudent.profile_pic ? (
                          <img src={attendanceStudent.profile_pic} alt={attendanceStudent.name} className="w-full h-full object-cover" />
                        ) : (
                          attendanceStudent.name.charAt(0)
                        )}
                      </div>
                      
                      <div className="flex-1 text-center md:text-left space-y-4 w-full">
                        <h3 className="text-2xl md:text-3xl font-bold text-slate-900">{attendanceStudent.name}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3 text-sm md:text-base">
                          <p className="text-slate-500">Roll: <span className="font-mono font-bold text-orange-600 text-lg">{attendanceStudent.roll_number}</span></p>
                          <p className="text-slate-500">Batch: <span className="font-bold text-slate-700">{batches.find(b => b.id == attendanceStudent.batch_id)?.name}</span></p>
                          <p className="text-slate-500">Class: <span className="font-bold text-slate-700">{attendanceStudent.current_class || 'N/A'}</span></p>
                          <p className="text-slate-500 truncate" title={attendanceStudent.phone}>Phone: <span className="font-bold text-slate-700">{attendanceStudent.phone || 'N/A'}</span></p>
                          <p className="text-slate-500 truncate" title={attendanceStudent.guardian_phone}>Guardian: <span className="font-bold text-slate-700">{attendanceStudent.guardian_phone || 'N/A'}</span></p>
                          <p className="text-slate-500 truncate" title={attendanceStudent.school_name}>School: <span className="font-bold text-slate-700">{attendanceStudent.school_name || 'N/A'}</span></p>
                        </div>
                        
                        <div className="pt-4 border-t border-slate-100 flex flex-wrap justify-center md:justify-start gap-3">
                          {attendanceStudent.attendance?.find((r: any) => r.date === format(new Date(), 'yyyy-MM-dd') && r.type !== 'exam') ? (
                            <div className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${
                              attendanceStudent.attendance.find((r: any) => r.date === format(new Date(), 'yyyy-MM-dd') && r.type !== 'exam').status === 'present' 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              <div className={`w-2 h-2 rounded-full ${attendanceStudent.attendance.find((r: any) => r.date === format(new Date(), 'yyyy-MM-dd') && r.type !== 'exam').status === 'present' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                              Today: {attendanceStudent.attendance.find((r: any) => r.date === format(new Date(), 'yyyy-MM-dd') && r.type !== 'exam').status.toUpperCase()}
                              {attendanceStudent.attendance.find((r: any) => r.date === format(new Date(), 'yyyy-MM-dd') && r.type !== 'exam').time && (
                                <span className="opacity-60 ml-1">at {attendanceStudent.attendance.find((r: any) => r.date === format(new Date(), 'yyyy-MM-dd') && r.type !== 'exam').time}</span>
                              )}
                            </div>
                          ) : (
                            isClassDay(attendanceStudent) ? (
                              <div className="px-4 py-2 rounded-full bg-red-100 text-red-700 text-sm font-bold flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500" />
                                Today: ABSENT (Auto)
                              </div>
                            ) : (
                              <div className="px-4 py-2 rounded-full bg-slate-100 text-slate-500 text-sm font-bold flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-slate-400" />
                                Not a Class Day
                              </div>
                            )
                          )}

                          {/* Exam Status for Today */}
                          {(() => {
                            const todayExam = exams.find(e => e.batch_id == attendanceStudent.batch_id && e.exam_date === format(new Date(), 'yyyy-MM-dd'));
                            if (!todayExam) return null;
                            
                            const examRecord = attendanceStudent.attendance?.find((r: any) => 
                              r.date === format(new Date(), 'yyyy-MM-dd') && 
                              r.type === 'exam' && 
                              r.exam_id == todayExam.id
                            );
                            
                            const status = examRecord ? examRecord.status : 'absent';
                            
                            return (
                              <div className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${
                                status === 'present' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                              }`}>
                                <div className={`w-2 h-2 rounded-full ${status === 'present' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                Exam ({todayExam.exam_name}): {status.toUpperCase()}
                              </div>
                            );
                          })()}

                          {attendanceStudent.payments?.some((p: any) => p.type === 'monthly' && p.date.startsWith(format(new Date(), 'yyyy-MM'))) ? (
                            <div className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-bold flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-blue-500" />
                              Fees Paid (This Month)
                            </div>
                          ) : (
                            <div className="px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-sm font-bold flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-amber-500" />
                              Fees Due (This Month)
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-4 w-full md:w-48 flex-shrink-0">
                        <div className="flex justify-center">
                          <input 
                            type="time" 
                            className="input-field w-full text-center"
                            value={attendanceTime}
                            onChange={(e) => setAttendanceTime(e.target.value)}
                          />
                        </div>
                        {(() => {
                          const todayRecord = attendanceStudent.attendance?.find((r: any) => r.date === format(new Date(), 'yyyy-MM-dd') && r.type !== 'exam');
                          const isPresent = todayRecord?.status === 'present';
                          const isAbsent = todayRecord?.status === 'absent';
                          
                          return (
                            <div className="grid grid-cols-1 gap-2 w-full">
                              <button 
                                onClick={() => markSingleAttendance(isPresent ? 'absent' : 'present')}
                                disabled={!isClassDay(attendanceStudent)}
                                className={`py-3 rounded-xl font-bold flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                                  isPresent
                                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                                    : 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                                } ${!isClassDay(attendanceStudent) ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                {isPresent ? <CheckCircle className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
                                <span className="text-sm">{isPresent ? 'Present' : 'Absent'}</span>
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {!isClassDay(attendanceStudent) && (
                      <div className="p-3 bg-yellow-50 text-yellow-700 rounded-lg text-sm text-center font-medium border border-yellow-200">
                        Note: Today is not a scheduled class day for this student. Present marking is disabled.
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          )}

        {activeTab === 'exam_attendance' && (
            <div className="space-y-6 w-full">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Mark Exam Attendance</h2>
                <button onClick={() => { setExamAttendanceSearch({ batch_id: '', exam_id: '', roll_number: '' }); setExamAttendanceStudent(null); }} className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-sm font-bold">
                  <XCircle className="h-4 w-4" /> Clear
                </button>
              </div>
              
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  <select 
                    className="input-field"
                    value={examAttendanceSearch.batch_id}
                    onChange={(e) => setExamAttendanceSearch({...examAttendanceSearch, batch_id: e.target.value})}
                  >
                    <option value="">Select Batch</option>
                    {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                  <select 
                    className="input-field"
                    value={examAttendanceSearch.exam_id}
                    onChange={(e) => setExamAttendanceSearch({...examAttendanceSearch, exam_id: e.target.value})}
                  >
                    <option value="">Select Exam</option>
                    {exams.filter(e => !examAttendanceSearch.batch_id || e.batch_id === examAttendanceSearch.batch_id).map(exam => (
                      <option key={exam.id} value={exam.id}>{exam.exam_name} ({exam.batch_name})</option>
                    ))}
                  </select>
                  <input 
                    type="text" 
                    placeholder="Roll Number" 
                    className="input-field"
                    value={examAttendanceSearch.roll_number}
                    onChange={(e) => setExamAttendanceSearch({...examAttendanceSearch, roll_number: e.target.value})}
                    onKeyDown={(e) => e.key === 'Enter' && searchExamAttendanceStudent()}
                  />
                  <button 
                    onClick={searchExamAttendanceStudent}
                    className="btn-primary"
                  >
                    Search Student
                  </button>
                </div>

                {examAttendanceStudent && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-slate-100 flex flex-col gap-6"
                  >
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                      <div className="w-32 h-32 flex-shrink-0 bg-orange-100 rounded-full flex items-center justify-center text-4xl font-bold text-orange-600 border-4 border-white shadow-md overflow-hidden">
                        {examAttendanceStudent.profile_pic ? (
                          <img src={examAttendanceStudent.profile_pic} alt={examAttendanceStudent.name} className="w-full h-full object-cover" />
                        ) : (
                          examAttendanceStudent.name.charAt(0)
                        )}
                      </div>
                      
                      <div className="flex-1 text-center md:text-left space-y-4 w-full">
                        <h3 className="text-2xl md:text-3xl font-bold text-slate-900">{examAttendanceStudent.name}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm md:text-base">
                          <p className="text-slate-500">Roll: <span className="font-mono font-bold text-orange-600 text-lg">{examAttendanceStudent.roll_number}</span></p>
                          <p className="text-slate-500">Batch: <span className="font-bold text-slate-700">{batches.find(b => b.id == examAttendanceStudent.batch_id)?.name}</span></p>
                          <p className="text-slate-500">Class: <span className="font-bold text-slate-700">{examAttendanceStudent.current_class || 'N/A'}</span></p>
                          <p className="text-slate-500 truncate" title={examAttendanceStudent.phone}>Phone: <span className="font-bold text-slate-700">{examAttendanceStudent.phone || 'N/A'}</span></p>
                        </div>
                        
                        <div className="pt-4 border-t border-slate-100 flex flex-wrap justify-center md:justify-start gap-3">
                          {examAttendanceStudent.attendance?.find((r: any) => r.date === format(new Date(), 'yyyy-MM-dd') && r.type === 'exam' && r.exam_id === examAttendanceSearch.exam_id) ? (
                            <div className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${
                              examAttendanceStudent.attendance.find((r: any) => r.date === format(new Date(), 'yyyy-MM-dd') && r.type === 'exam' && r.exam_id === examAttendanceSearch.exam_id).status === 'present' 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              <div className={`w-2 h-2 rounded-full ${examAttendanceStudent.attendance.find((r: any) => r.date === format(new Date(), 'yyyy-MM-dd') && r.type === 'exam' && r.exam_id === examAttendanceSearch.exam_id).status === 'present' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                              Today: {examAttendanceStudent.attendance.find((r: any) => r.date === format(new Date(), 'yyyy-MM-dd') && r.type === 'exam' && r.exam_id === examAttendanceSearch.exam_id).status.toUpperCase()}
                              {examAttendanceStudent.attendance.find((r: any) => r.date === format(new Date(), 'yyyy-MM-dd') && r.type === 'exam' && r.exam_id === examAttendanceSearch.exam_id).time && (
                                <span className="opacity-60 ml-1">at {examAttendanceStudent.attendance.find((r: any) => r.date === format(new Date(), 'yyyy-MM-dd') && r.type === 'exam' && r.exam_id === examAttendanceSearch.exam_id).time}</span>
                              )}
                            </div>
                          ) : (
                            <div className="px-4 py-2 rounded-full bg-red-100 text-red-700 text-sm font-bold flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-red-500" />
                              Today: ABSENT (Not Marked)
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-4 w-full md:w-48 flex-shrink-0">
                        <div className="flex justify-center">
                          <input 
                            type="time" 
                            className="input-field w-full text-center"
                            value={examAttendanceTime}
                            onChange={(e) => setExamAttendanceTime(e.target.value)}
                          />
                        </div>
                        {(() => {
                          const todayRecord = examAttendanceStudent.attendance?.find((r: any) => r.date === format(new Date(), 'yyyy-MM-dd') && r.type === 'exam' && r.exam_id === examAttendanceSearch.exam_id);
                          const isPresent = todayRecord?.status === 'present';
                          const isAbsent = todayRecord?.status === 'absent';
                          
                          return (
                            <div className="grid grid-cols-2 gap-2 w-full">
                              <button 
                                onClick={() => markSingleExamAttendance('present')}
                                className={`py-3 rounded-xl font-bold flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                                  isPresent
                                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                                    : 'bg-slate-100 text-slate-500 hover:bg-green-50 hover:text-green-600'
                                }`}
                              >
                                <CheckCircle className="h-6 w-6" />
                                <span className="text-sm">Present</span>
                              </button>
                              <button 
                                onClick={() => markSingleExamAttendance('absent')}
                                className={`py-3 rounded-xl font-bold flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                                  isAbsent
                                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                                    : 'bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600'
                                }`}
                              >
                                <XCircle className="h-6 w-6" />
                                <span className="text-sm">Absent</span>
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          )}

        {activeTab === 'attendance_report' && (
            <div className="space-y-6 w-full">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Attendance Report</h2>
              </div>
              
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  <select 
                    className="input-field"
                    value={attendanceReportFilter.batch_id}
                    onChange={(e) => setAttendanceReportFilter({...attendanceReportFilter, batch_id: e.target.value})}
                  >
                    <option value="">All Batches</option>
                    {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                  <input 
                    type="date" 
                    className="input-field"
                    value={attendanceReportFilter.startDate}
                    onChange={(e) => setAttendanceReportFilter({...attendanceReportFilter, startDate: e.target.value})}
                  />
                  <input 
                    type="date" 
                    className="input-field"
                    value={attendanceReportFilter.endDate}
                    onChange={(e) => setAttendanceReportFilter({...attendanceReportFilter, endDate: e.target.value})}
                  />
                  <button 
                    onClick={fetchAttendanceReport}
                    className="btn-primary flex items-center justify-center gap-2"
                  >
                    <FileText className="h-5 w-5" /> Generate Report
                  </button>
                </div>

                {attendanceReport.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="p-4 font-bold text-slate-700">Date</th>
                          <th className="p-4 font-bold text-slate-700">Roll</th>
                          <th className="p-4 font-bold text-slate-700">Name</th>
                          <th className="p-4 font-bold text-slate-700">Batch</th>
                          <th className="p-4 font-bold text-slate-700">Status</th>
                          <th className="p-4 font-bold text-slate-700">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceReport.map((record, idx) => (
                          <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="p-4 text-slate-600">{record.date}</td>
                            <td className="p-4 font-mono font-bold text-orange-600">{record.roll_number}</td>
                            <td className="p-4 font-medium text-slate-800">{record.student_name}</td>
                            <td className="p-4 text-slate-600">{record.batch_name}</td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                                record.status === 'present' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {record.status}
                              </span>
                            </td>
                            <td className="p-4 text-slate-500">{record.time || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No attendance records found for the selected filters.</p>
                  </div>
                )}
              </div>
            </div>
          )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-6 w-full">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-slate-800">Record Payment</h2>
              <button onClick={() => clearForm('payment')} className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-sm font-bold">
                <XCircle className="h-4 w-4" /> Clear
              </button>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <select 
                  className="input-field"
                  value={paymentSearch.batch_id}
                  onChange={(e) => setPaymentSearch({ ...paymentSearch, batch_id: e.target.value })}
                >
                  <option value="">Select Batch</option>
                  {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Roll Number" 
                    className="input-field"
                    value={paymentSearch.roll_number}
                    onChange={(e) => setPaymentSearch({ ...paymentSearch, roll_number: e.target.value })}
                  />
                  <button 
                    onClick={searchPaymentStudent}
                    className="bg-orange-600 text-white px-6 rounded-xl font-bold hover:bg-orange-700"
                  >
                    Search
                  </button>
                </div>
              </div>

              {paymentStudent && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{paymentStudent.name}</h3>
                      <p className="text-slate-500">Roll: {paymentStudent.roll_number}</p>
                      <p className="text-slate-500">Class: {paymentStudent.current_class || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-500">Current Month Status</div>
                      {paymentStudent.payments?.some((p: any) => p.type === 'monthly' && p.date.startsWith(format(new Date(), 'yyyy-MM'))) ? (
                        <span className="text-green-600 font-bold flex items-center gap-1 justify-end">
                          <CheckCircle className="h-4 w-4" /> Paid
                        </span>
                      ) : (
                        <div className="text-red-500 font-bold flex flex-col items-end gap-1">
                          <span className="flex items-center gap-1"><XCircle className="h-4 w-4" /> Unpaid</span>
                          <span className="text-xs">Due: ৳{paymentStudent.monthly_fee || 'N/A'} for {format(new Date(), 'MMMM')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <form onSubmit={handleAddPayment} className="space-y-4 bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-slate-800 mb-2">New Payment</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input 
                        type="number" 
                        placeholder="Amount"
                        className="input-field"
                        value={paymentData.amount}
                        onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                        required
                      />
                      <input 
                        type="date" 
                        className="input-field"
                        value={paymentData.date}
                        onChange={(e) => setPaymentData({ ...paymentData, date: e.target.value })}
                        required
                      />
                      <select 
                        className="input-field"
                        value={paymentData.type}
                        onChange={(e) => setPaymentData({ ...paymentData, type: e.target.value })}
                      >
                        <option value="monthly">Monthly Fee</option>
                        <option value="admission">Admission Fee</option>
                        <option value="exam">Exam Fee</option>
                      </select>
                      <select 
                        className="input-field"
                        value={paymentData.month}
                        onChange={(e) => setPaymentData({ ...paymentData, month: e.target.value })}
                      >
                        <option value="">Select Month (Optional)</option>
                        {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-600/20">
                      Confirm Payment
                    </button>
                  </form>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* Payment History Tab */}
        {activeTab === 'payments_history' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-slate-800">Payment History</h2>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => handleResetData('payments')}
                  className="bg-red-100 text-red-600 px-4 py-2 rounded-xl font-bold hover:bg-red-200 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" /> Delete All
                </button>
                <select 
                  className="input-field w-48"
                  value={paymentSort}
                  onChange={(e) => setPaymentSort(e.target.value)}
                >
                  <option value="date">Sort by Date</option>
                  <option value="student">Sort by Student</option>
                  <option value="batch">Sort by Batch</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="p-4 font-semibold">Date</th>
                    <th className="p-4 font-semibold">Student Name</th>
                    <th className="p-4 font-semibold">Roll No</th>
                    <th className="p-4 font-semibold">Batch</th>
                    <th className="p-4 font-semibold">Month</th>
                    <th className="p-4 font-semibold">Type</th>
                    <th className="p-4 font-semibold text-right">Amount</th>
                    <th className="p-4 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedPayments.slice(0, paymentLimit).map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-slate-600">{payment.date}</td>
                      <td className="p-4 font-medium text-slate-900">{payment.student_name}</td>
                      <td className="p-4 font-mono text-orange-600 font-bold">{payment.roll_number}</td>
                      <td className="p-4 text-slate-600">{payment.batch_name || '-'}</td>
                      <td className="p-4 text-slate-600 font-medium">{payment.month || '-'}</td>
                      <td className="p-4 text-slate-600 capitalize">{payment.type}</td>
                      <td className="p-4 text-right font-bold text-slate-800">৳{payment.amount}</td>
                      <td className="p-4 text-center">
                        <button onClick={() => handleDeletePayment(payment.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {allPayments.length === 0 && (
                <div className="p-8 text-center text-slate-500">No payment records found.</div>
              )}
              {sortedPayments.length > paymentLimit && (
                <div className="p-4 text-center">
                  <button 
                    onClick={() => setPaymentLimit(prev => prev + 100)}
                    className="px-6 py-2 bg-slate-100 text-slate-600 font-bold rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    Load More
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && (
          <div className="space-y-6 w-full">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-slate-800">Upload Exam Results</h2>
              <button onClick={() => clearForm('result')} className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-sm font-bold">
                <XCircle className="h-4 w-4" /> Clear
              </button>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <select 
                  className="input-field"
                  value={newResult.exam_id}
                  onChange={(e) => {
                    const examId = e.target.value;
                    const exam = exams.find(ex => ex.id == examId);
                    if (exam) {
                      setNewResult({ 
                        ...newResult, 
                        exam_id: examId,
                        highest_marks: exam.highest_marks || '',
                        negative_marks: exam.negative_marks || ''
                      });
                      // Also set batch_id for student search if needed
                      setResultSearch({ ...resultSearch, batch_id: exam.batch_id.toString() });
                    } else {
                      setNewResult({ ...newResult, exam_id: examId, highest_marks: '', negative_marks: '' });
                    }
                  }}
                >
                  <option value="">Select Exam</option>
                  {exams.map(exam => (
                    <option key={exam.id} value={exam.id}>{exam.exam_name} ({exam.batch_name})</option>
                  ))}
                </select>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input 
                    type="text" 
                    placeholder="Roll Number" 
                    className="input-field w-full"
                    value={resultSearch.roll_number}
                    onChange={(e) => setResultSearch({ ...resultSearch, roll_number: e.target.value })}
                  />
                  <button 
                    onClick={searchResultStudent}
                    disabled={!newResult.exam_id}
                    className="bg-orange-600 text-white px-6 py-3 sm:py-0 rounded-xl font-bold hover:bg-orange-700 disabled:opacity-50 whitespace-nowrap"
                  >
                    Search Student
                  </button>
                </div>
              </div>

              {newResult.exam_id && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Highest Marks</label>
                    <input 
                      type="number" 
                      className="input-field"
                      value={newResult.highest_marks}
                      onChange={(e) => setNewResult({ ...newResult, highest_marks: e.target.value })}
                      placeholder="e.g. 100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Negative Marks (per wrong answer)</label>
                    <input 
                      type="number" 
                      className="input-field"
                      value={newResult.negative_marks}
                      onChange={(e) => setNewResult({ ...newResult, negative_marks: e.target.value })}
                      placeholder="e.g. 0.25"
                      step="0.01"
                    />
                  </div>
                </div>
              )}

              {resultStudent && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-slate-50 p-4 md:p-6 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-slate-900">{resultStudent.name}</h3>
                      <p className="text-slate-500 text-sm md:text-base">Roll: {resultStudent.roll_number} | Class: {resultStudent.current_class || 'N/A'}</p>
                    </div>
                    <div className="text-left sm:text-right w-full sm:w-auto bg-white sm:bg-transparent p-3 sm:p-0 rounded-lg border sm:border-0 border-slate-100">
                      <div className="text-xs font-bold text-slate-400 uppercase">Selected Exam</div>
                      <div className="font-bold text-orange-600 truncate">{exams.find(e => e.id == newResult.exam_id)?.exam_name}</div>
                    </div>
                  </div>

                  <form onSubmit={handleAddResult} className="space-y-4 bg-slate-50 p-4 md:p-6 rounded-xl border border-slate-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500">Highest Marks</label>
                        <input 
                          type="number" 
                          className="input-field w-full"
                          value={newResult.highest_marks}
                          onChange={(e) => setNewResult({ ...newResult, highest_marks: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500">Neg. Mark</label>
                        <input 
                          type="number" 
                          className="input-field w-full"
                          value={newResult.negative_marks}
                          onChange={(e) => setNewResult({ ...newResult, negative_marks: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500">Correct Answers</label>
                        <input 
                          type="number" 
                          placeholder="Correct"
                          className="input-field w-full"
                          value={newResult.correct_answers}
                          onChange={(e) => setNewResult({ ...newResult, correct_answers: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500">Wrong Answers</label>
                        <input 
                          type="number" 
                          placeholder="Wrong"
                          className="input-field w-full"
                          value={newResult.wrong_answers}
                          onChange={(e) => setNewResult({ ...newResult, wrong_answers: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 shadow-lg shadow-orange-600/20 mt-2">
                      Save Result
                    </button>
                  </form>

                  {/* Previous Results */}
                  <div className="bg-slate-50 p-4 md:p-6 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-slate-800 mb-4">Previous Results</h4>
                    <div className="space-y-2">
                        {resultStudent.results && resultStudent.results.length > 0 ? (
                            resultStudent.results.map((res: any) => {
                                let calculatedMerit = res.merit_position;
                                if (!calculatedMerit) {
                                  const key = res.exam_id || res.exam_name;
                                  if (key && meritPositions[key]) {
                                    calculatedMerit = meritPositions[key][resultStudent.id];
                                  }
                                }
                                return (
                                <div key={res.id || Math.random()} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 bg-white border border-slate-100 rounded-lg shadow-sm gap-2 sm:gap-0">
                                    <span className="font-medium text-slate-800 text-sm sm:text-base break-words w-full sm:w-auto">{res.exam_name}</span>
                                    <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-4">
                                      {calculatedMerit && (
                                        <span className="text-xs sm:text-sm font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">Merit: {calculatedMerit}</span>
                                      )}
                                      <span className="font-bold text-orange-600 text-sm sm:text-base">{res.marks} / {res.total_marks}</span>
                                    </div>
                                </div>
                                );
                            })
                        ) : (
                            <p className="text-slate-500 text-sm text-center py-4">No results found.</p>
                        )}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* Programs Management Tab */}
        {activeTab === 'programs' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-800">Programs</h2>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Add New Program</h3>
              <form onSubmit={handleAddProgram} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Program Title"
                  className="input-field"
                  value={newProgram.title}
                  onChange={(e) => setNewProgram({ ...newProgram, title: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Target Audience (e.g. Class 9-10)"
                  className="input-field"
                  value={newProgram.target_audience}
                  onChange={(e) => setNewProgram({ ...newProgram, target_audience: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Admission Fee"
                  className="input-field"
                  value={newProgram.admission_fee}
                  onChange={(e) => setNewProgram({ ...newProgram, admission_fee: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Monthly Fee"
                  className="input-field"
                  value={newProgram.monthly_fee}
                  onChange={(e) => setNewProgram({ ...newProgram, monthly_fee: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Image URL"
                  className="input-field md:col-span-2"
                  value={newProgram.image_url}
                  onChange={(e) => setNewProgram({ ...newProgram, image_url: e.target.value })}
                />
                <textarea
                  placeholder="Description"
                  className="input-field md:col-span-2 h-24"
                  value={newProgram.description}
                  onChange={(e) => setNewProgram({ ...newProgram, description: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Features (comma separated)"
                  className="input-field md:col-span-2"
                  value={newProgram.features}
                  onChange={(e) => setNewProgram({ ...newProgram, features: e.target.value })}
                />
                <button type="submit" className="md:col-span-2 bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors">
                  Add Program
                </button>
              </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="p-4 font-semibold w-20">Serial</th>
                      <th className="p-4 font-semibold">Title</th>
                      <th className="p-4 font-semibold">Audience</th>
                      <th className="p-4 font-semibold">Admission Fee</th>
                      <th className="p-4 font-semibold">Monthly Fee</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {programs.map((prog, index) => (
                      <tr key={prog.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-slate-500">{index + 1}</td>
                        <td className="p-4 font-medium text-slate-900">{prog.title}</td>
                        <td className="p-4 text-orange-600 font-bold">{prog.target_audience}</td>
                        <td className="p-4 text-slate-600">৳{prog.admission_fee || 0}</td>
                        <td className="p-4 text-slate-600">৳{prog.monthly_fee || 0}</td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => handleDeleteProgram(prog.id)}
                            className="text-red-600 hover:text-red-800 font-medium text-sm"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {programs.length === 0 && (
                      <tr><td colSpan={6} className="p-8 text-center text-slate-500">No programs found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Program Details Tab */}
        {activeTab === 'program_details' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-800">Program Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {programs.map(prog => (
                <div key={prog.id} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                  <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-bold text-slate-900">{prog.title}</h3>
                    <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                      {prog.target_audience}
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-slate-50">
                      <span className="text-slate-500 font-medium">Admission Fee</span>
                      <span className="text-orange-600 font-bold">৳{prog.admission_fee || 0}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-slate-50">
                      <span className="text-slate-500 font-medium">Monthly Fee</span>
                      <span className="text-orange-600 font-bold">৳{prog.monthly_fee || 0}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h4>
                    <p className="text-slate-600 leading-relaxed">{prog.description}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Key Features</h4>
                    <div className="flex flex-wrap gap-2">
                      {prog.features?.split(',').map((f: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-100 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {f.trim()}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enrollments Tab */}
        {activeTab === 'enrollments' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-800">Enrollment Applications</h2>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="p-4 font-semibold">Date</th>
                      <th className="p-4 font-semibold">Name</th>
                      <th className="p-4 font-semibold">Phone</th>
                      <th className="p-4 font-semibold">Type</th>
                      <th className="p-4 font-semibold">Program/Course</th>
                      <th className="p-4 font-semibold">Fee</th>
                      <th className="p-4 font-semibold">Class</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {enrollments.map((enroll) => (
                      <tr key={enroll.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-sm text-slate-500">{new Date(enroll.created_at).toLocaleDateString()}</td>
                        <td className="p-4 font-medium text-slate-900">{enroll.name}</td>
                        <td className="p-4 text-slate-600">{enroll.phone}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            enroll.course_title ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                          }`}>
                            {enroll.course_title ? 'Online' : 'Program'}
                          </span>
                        </td>
                        <td className="p-4 text-orange-600 font-bold">{enroll.program_title || enroll.course_title}</td>
                        <td className="p-4 font-bold text-orange-600">৳{enroll.fee}</td>
                      <td className="p-4 text-slate-600">{enroll.current_class}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                          enroll.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {enroll.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2 items-center">
                          <button 
                            onClick={() => setSelectedEnrollment(enroll)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-bold"
                          >
                            View Details
                          </button>
                          <button 
                            onClick={() => handleCancelEnrollment(enroll.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-bold"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {enrollments.length === 0 && (
                    <tr><td colSpan={7} className="p-8 text-center text-slate-500">No enrollment applications found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Enrollment Details Modal */}
            {selectedEnrollment && (
              <div 
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={() => setSelectedEnrollment(null)}
              >
                <div 
                  className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 scrollbar-hide"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-slate-800">Enrollment Details</h3>
                    <button onClick={() => setSelectedEnrollment(null)} className="text-slate-400 hover:text-slate-600">
                      <XCircle className="h-8 w-8" />
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-slate-500 uppercase font-bold tracking-wider">Name</p>
                        <p className="text-lg font-medium text-slate-900">{selectedEnrollment.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 uppercase font-bold tracking-wider">Phone</p>
                        <p className="text-lg font-medium text-slate-900">{selectedEnrollment.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 uppercase font-bold tracking-wider">Email</p>
                        <p className="text-lg font-medium text-slate-900">{selectedEnrollment.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 uppercase font-bold tracking-wider">Type</p>
                        <p className="text-lg font-bold text-slate-700">{selectedEnrollment.course_title ? 'Online Course' : 'Program'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 uppercase font-bold tracking-wider">Program/Course</p>
                        <p className="text-lg font-bold text-orange-600">{selectedEnrollment.program_title || selectedEnrollment.course_title}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 uppercase font-bold tracking-wider">Class</p>
                        <p className="text-lg font-medium text-slate-900">{selectedEnrollment.current_class}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 uppercase font-bold tracking-wider">Fee Paid</p>
                        <p className="text-lg font-bold text-green-600">৳{selectedEnrollment.fee}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 uppercase font-bold tracking-wider">Payment Method</p>
                        <p className="text-lg font-bold text-orange-600">{selectedEnrollment.payment_method || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 uppercase font-bold tracking-wider">Payment Number</p>
                        <p className="text-lg font-medium text-slate-900">{selectedEnrollment.payment_number || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 uppercase font-bold tracking-wider">Password</p>
                        <p className="text-lg font-medium text-slate-900">{selectedEnrollment.password || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <p className="text-sm text-slate-500 uppercase font-bold tracking-wider mb-2">Transaction ID / Info</p>
                      <p className="font-mono text-slate-700 break-all">{selectedEnrollment.transaction_id || 'N/A'}</p>
                    </div>

                    <div className="flex gap-4">
                      {selectedEnrollment.status === 'pending' && (
                        <button 
                          onClick={() => handleUpdateEnrollmentStatus(selectedEnrollment.id, 'approved')}
                          className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="h-5 w-5" /> Approve Enrollment
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          const text = `Name: ${selectedEnrollment.name}\nPhone: ${selectedEnrollment.phone}\nEmail: ${selectedEnrollment.email}\nProgram/Course: ${selectedEnrollment.program_title || selectedEnrollment.course_title}\nClass: ${selectedEnrollment.current_class}\nFee: ${selectedEnrollment.fee}\nPayment Method: ${selectedEnrollment.payment_method || 'N/A'}\nPayment Number: ${selectedEnrollment.payment_number || 'N/A'}\nTransaction ID: ${selectedEnrollment.transaction_id || 'N/A'}`;
                          navigator.clipboard.writeText(text);
                          showAlert('Copied to clipboard!');
                        }}
                        className="flex-1 bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-900 transition-colors flex items-center justify-center gap-2"
                      >
                        <Copy className="h-5 w-5" /> Copy Information
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Live Classes Tab */}
        {activeTab === 'live_classes' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-slate-800">Zoom Classes Management</h2>
              <button onClick={() => clearForm('live_class')} className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-sm font-bold">
                <XCircle className="h-4 w-4" /> Clear
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold mb-4 text-slate-800">Start New Zoom Class</h3>
              <form onSubmit={handleAddLiveClass} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input 
                  type="text" placeholder="Class Title" className="input-field"
                  value={newLiveClass.title} onChange={(e) => setNewLiveClass({...newLiveClass, title: e.target.value})} required
                />
                <input 
                  type="text" placeholder="Zoom/Live Link" className="input-field"
                  value={newLiveClass.zoom_link} onChange={(e) => setNewLiveClass({...newLiveClass, zoom_link: e.target.value})} required
                />
                <select 
                  className="input-field"
                  value={newLiveClass.batch_id} onChange={(e) => setNewLiveClass({...newLiveClass, batch_id: e.target.value})}
                >
                  <option value="">Select Batch (Offline)</option>
                  {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                <select 
                  className="input-field"
                  value={newLiveClass.course_id} onChange={(e) => setNewLiveClass({...newLiveClass, course_id: e.target.value})}
                >
                  <option value="">Select Course (Online)</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
                <input 
                  type="text" placeholder="Zoom ID" className="input-field"
                  value={newLiveClass.zoom_id} onChange={(e) => setNewLiveClass({...newLiveClass, zoom_id: e.target.value})}
                />
                <input 
                  type="text" placeholder="Zoom Password" className="input-field"
                  value={newLiveClass.zoom_password} onChange={(e) => setNewLiveClass({...newLiveClass, zoom_password: e.target.value})}
                />
                <button type="submit" className="md:col-span-3 bg-orange-600 text-white py-2 rounded-lg font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2">
                  <Video className="h-5 w-5" /> Start Zoom Class
                </button>
              </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="p-4 font-semibold">Title</th>
                    <th className="p-4 font-semibold">Batch/Course</th>
                    <th className="p-4 font-semibold">Zoom ID/Pass</th>
                    <th className="p-4 font-semibold">Link</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {liveClasses.map((lc) => (
                    <tr key={lc.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-medium text-slate-900">{lc.title}</td>
                      <td className="p-4 text-slate-600">
                        {lc.batch_id ? batches.find(b => b.id == lc.batch_id)?.name : courses.find(c => c.id == lc.course_id)?.title || 'N/A'}
                      </td>
                      <td className="p-4 text-xs text-slate-500">
                        {lc.zoom_id && <div>ID: {lc.zoom_id}</div>}
                        {lc.zoom_password && <div>Pass: {lc.zoom_password}</div>}
                      </td>
                      <td className="p-4">
                        <a href={lc.zoom_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                          Join Link <ExternalLink className="h-3 w-3" />
                        </a>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold uppercase">
                          {lc.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleDeleteLiveClass(lc.id)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {liveClasses.length === 0 && (
                    <tr><td colSpan={5} className="p-8 text-center text-slate-500">No active live classes.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Chapters Tab */}
        {activeTab === 'chapters' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-slate-800">Chapters Management</h2>
              <button onClick={() => clearForm('chapter')} className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-sm font-bold">
                <XCircle className="h-4 w-4" /> Clear
              </button>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold mb-4 text-slate-800">Add New Chapter</h3>
              <form onSubmit={handleAddChapter} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select 
                  className="input-field"
                  value={newChapter.batch_id} onChange={(e) => setNewChapter({...newChapter, batch_id: e.target.value})}
                  required
                >
                  <option value="">Select Batch</option>
                  {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                <input 
                  type="text" placeholder="Chapter Title" className="input-field"
                  value={newChapter.title} onChange={(e) => setNewChapter({...newChapter, title: e.target.value})} required
                />
                <input 
                  type="text" placeholder="Content/Topic" className="input-field"
                  value={newChapter.content} onChange={(e) => setNewChapter({...newChapter, content: e.target.value})}
                />
                <textarea 
                  placeholder="Description" className="input-field h-24 resize-none"
                  value={newChapter.description} onChange={(e) => setNewChapter({...newChapter, description: e.target.value})}
                />
                <select 
                  className="input-field"
                  value={newChapter.status} onChange={(e) => setNewChapter({...newChapter, status: e.target.value})}
                >
                  <option value="active">Active</option>
                  <option value="coming_soon">Coming Soon</option>
                </select>
                <button type="submit" className="btn-primary flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 md:col-span-4">
                  <Plus className="h-5 w-5" /> Add Chapter
                </button>
              </form>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chapters.map(chapter => (
                <div key={chapter.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-lg text-slate-800">{chapter.title}</h4>
                        {chapter.status === 'coming_soon' && (
                          <span className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Coming Soon</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">{chapter.content}</p>
                      <span className="mt-2 inline-block bg-orange-50 text-orange-600 text-xs px-2 py-1 rounded">
                        Batch: {batches.find(b => b.id == chapter.batch_id)?.name || 'Unknown'}
                      </span>
                    </div>
                    <button onClick={() => handleDeleteChapter(chapter.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Exams Tab */}
        {activeTab === 'exams' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-slate-800">Upcoming Exams</h2>
              <button onClick={() => clearForm('exam')} className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-sm font-bold">
                <XCircle className="h-4 w-4" /> Clear
              </button>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold mb-4 text-slate-800">Schedule New Exam</h3>
              <form onSubmit={handleAddExam} className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <select 
                  className="input-field"
                  value={newExam.batch_id} onChange={(e) => setNewExam({...newExam, batch_id: e.target.value})}
                  required
                >
                  <option value="">Select Batch</option>
                  {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                <input 
                  type="text" placeholder="Exam Name" className="input-field"
                  value={newExam.exam_name} onChange={(e) => setNewExam({...newExam, exam_name: e.target.value})} required
                />
                <input 
                  type="date" className="input-field"
                  value={newExam.exam_date} onChange={(e) => setNewExam({...newExam, exam_date: e.target.value})} required
                />
                <input 
                  type="text" placeholder="Category" className="input-field"
                  value={newExam.category} onChange={(e) => setNewExam({...newExam, category: e.target.value})}
                />
                <button type="submit" className="btn-primary flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 md:col-span-6">
                  <Plus className="h-5 w-5" /> Schedule Exam
                </button>
              </form>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {exams.map(exam => (
                <div key={exam.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-lg text-slate-800">{exam.exam_name}</h4>
                      <p className="text-sm text-slate-500">Date: {exam.exam_date}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="inline-block bg-orange-50 text-orange-600 text-xs px-2 py-1 rounded">
                          Batch: {batches.find(b => b.id == exam.batch_id)?.name || 'Unknown'}
                        </span>
                        {exam.category && (
                          <span className="inline-block bg-orange-50 text-orange-600 text-xs px-2 py-1 rounded">
                            {exam.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <button onClick={() => handleDeleteExam(exam.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Student Search Tab */}
        {activeTab === 'studentSearch' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-slate-800">Student Search</h2>
              <button onClick={() => clearForm('search')} className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-sm font-bold">
                <XCircle className="h-4 w-4" /> Clear
              </button>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <form onSubmit={handleStudentSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select 
                  className="input-field"
                  value={searchQuery.class} onChange={(e) => setSearchQuery({...searchQuery, class: e.target.value})}
                >
                  <option value="">Select Class</option>
                  {Array.from(new Set(batches.map(b => b.class || b.class_name || b.batch_class).filter(Boolean))).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select 
                  className="input-field"
                  value={searchQuery.batch_id} onChange={(e) => setSearchQuery({...searchQuery, batch_id: e.target.value})}
                  required
                >
                  <option value="">Select Batch</option>
                  {batches.filter(b => !searchQuery.class || b.class === searchQuery.class || b.class_name === searchQuery.class || b.batch_class === searchQuery.class).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                <input 
                  type="text" placeholder="Roll Number" className="input-field"
                  value={searchQuery.roll_number} onChange={(e) => setSearchQuery({...searchQuery, roll_number: e.target.value})} required
                />
                <button 
                  type="submit" 
                  disabled={isSearching}
                  className="btn-primary flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
                >
                  {isSearching ? 'Searching...' : <><Search className="h-5 w-5" /> Search</>}
                </button>
              </form>
            </div>

            {searchResult && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-xl shadow-sm border border-slate-200"
              >
                <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
                  <div className="flex items-start gap-6">
                    {searchResult.profile_pic && (
                      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-orange-500 flex-shrink-0">
                        <img src={searchResult.profile_pic} alt={searchResult.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div>
                      <h2 className="text-3xl font-bold text-slate-900">{searchResult.name}</h2>
                      <p className="text-slate-500">{searchResult.email}</p>
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-600">
                        <div><span className="font-semibold">Phone:</span> {searchResult.phone}</div>
                        <div><span className="font-semibold">Guardian Phone:</span> {searchResult.guardian_phone || 'N/A'}</div>
                        <div><span className="font-semibold">Admission Month:</span> {searchResult.admission_month || 'N/A'}</div>
                        <div><span className="font-semibold">Batch Days:</span> {searchResult.batch_days || 'N/A'}</div>
                        <div><span className="font-semibold">Admission Fee:</span> ৳{searchResult.admission_fee || 0}</div>
                        <div><span className="font-semibold">Total Paid:</span> ৳{searchResult.paid_amount || 0}</div>
                        <div><span className="font-semibold">Class:</span> {searchResult.current_class || 'N/A'}</div>
                        {searchResult.initial_password && (
                          <div><span className="font-semibold text-red-600">Initial Password:</span> <span className="font-mono">{searchResult.initial_password}</span></div>
                        )}
                        <div><span className="font-semibold">Status:</span> 
                          <select 
                            className="ml-2 p-1 border rounded text-xs"
                            value={searchResult.status || 'active'}
                            onChange={(e) => handleUpdateStudentStatus(searchResult.id, e.target.value)}
                          >
                            <option value="active">Active</option>
                            <option value="dropped">Dropped Out</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-left md:text-right flex flex-col items-start md:items-end gap-2">
                    <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Roll Number</div>
                    <div className="text-3xl font-mono text-orange-600 font-bold">{searchResult.roll_number || 'N/A'}</div>
                    <div className="flex flex-col gap-2 mt-4">
                      <button 
                        onClick={() => {
                          setEditStudentData({
                            name: searchResult.name,
                            email: searchResult.email,
                            phone: searchResult.phone,
                            guardian_phone: searchResult.guardian_phone || '',
                            current_class: searchResult.current_class || '',
                            program_title: searchResult.program_title || '',
                            admission_month: searchResult.admission_month || '',
                            batch_days: searchResult.batch_days || '',
                            admission_fee: searchResult.admission_fee || 0,
                            paid_amount: searchResult.paid_amount || 0,
                            roll_number: searchResult.roll_number || '',
                            status: searchResult.status || 'active'
                          });
                          setIsEditingStudent(true);
                          setSelectedStudent(searchResult);
                        }}
                        className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded hover:bg-blue-200 font-bold flex items-center gap-1"
                      >
                        <Edit className="h-3 w-3" /> Edit Details
                      </button>
                      <button 
                        onClick={() => handleCancelRegistration(searchResult.id)}
                        className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200 font-bold flex items-center gap-1"
                      >
                        <XCircle className="h-3 w-3" /> Cancel Registration
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h3 className="font-bold mb-3 flex items-center gap-2 text-slate-800">
                      <CheckCircle className="h-4 w-4 text-green-500" /> Attendance
                    </h3>
                    <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-hide pr-1">
                      {searchResult.attendance?.map((r: any) => {
                        const dateObj = parseISO(r.date);
                        const dayName = format(dateObj, 'EEEE');
                        return (
                          <div key={r.id} className="text-xs flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm hover:border-orange-200 transition-all">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800">{r.date}</span>
                              <span className="text-slate-500 text-[10px] font-medium">{dayName} • {r.time && r.time !== 'N/A' ? r.time : 'No time record'}</span>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${
                                r.status === 'present' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                              }`}>
                                {r.status}
                              </span>
                              {r.isAuto && <span className="text-[9px] text-slate-400 font-medium italic bg-slate-50 px-2 py-0.5 rounded-md">Auto-generated</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h3 className="font-bold mb-3 flex items-center gap-2 text-slate-800">
                      <CreditCard className="h-4 w-4 text-orange-500" /> Payments
                    </h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-hide">
                      {searchResult.payments?.map((p: any) => (
                        <div key={p.id} className="text-xs flex justify-between bg-white p-2 rounded border border-slate-100">
                          <span>{p.date}</span>
                          <span className="font-bold text-orange-600">৳{p.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h3 className="font-bold mb-3 flex items-center gap-2 text-slate-800">
                      <FileText className="h-4 w-4 text-orange-500" /> Results - {searchResult.batch_name || 'N/A'} ({searchResult.current_class || 'N/A'})
                    </h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-hide">
                      {searchResult.results?.map((r: any) => (
                        <div key={r.id} className="text-xs flex justify-between bg-white p-2 rounded border border-slate-100">
                          <span>{r.exam_name}</span>
                          <span className="font-bold text-orange-600">{r.marks}/{r.total_marks}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-slate-800">Online Courses Management</h2>
              <button onClick={() => clearForm('course')} className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-sm font-bold">
                <XCircle className="h-4 w-4" /> Clear
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold mb-4 text-slate-800">Add New Course</h3>
              <form onSubmit={handleAddCourse} className="space-y-4">
                <input 
                  type="text" placeholder="Course Title" className="input-field"
                  value={newCourse.title} onChange={(e) => setNewCourse({...newCourse, title: e.target.value})} required
                />
                <textarea 
                  placeholder="Description" className="input-field h-24 resize-none"
                  value={newCourse.description} onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                />
                <input 
                  type="number" placeholder="Price" className="input-field"
                  value={newCourse.price} onChange={(e) => setNewCourse({...newCourse, price: e.target.value})}
                />
                <input 
                  type="text" placeholder="Image URL" className="input-field"
                  value={newCourse.image_url} onChange={(e) => setNewCourse({...newCourse, image_url: e.target.value})}
                />
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="text" placeholder="Duration (e.g., 3 Months)" className="input-field"
                    value={newCourse.duration} onChange={(e) => setNewCourse({...newCourse, duration: e.target.value})}
                  />
                  <input 
                    type="text" placeholder="Lecture Count (e.g., 24 Lectures)" className="input-field"
                    value={newCourse.lecture_count} onChange={(e) => setNewCourse({...newCourse, lecture_count: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="text" placeholder="Zoom ID" className="input-field"
                    value={newCourse.zoom_id} onChange={(e) => setNewCourse({...newCourse, zoom_id: e.target.value})}
                  />
                  <input 
                    type="text" placeholder="Zoom Password" className="input-field"
                    value={newCourse.zoom_password} onChange={(e) => setNewCourse({...newCourse, zoom_password: e.target.value})}
                  />
                </div>
                <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700">
                  <Plus className="h-5 w-5" /> Add Course
                </button>
              </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="p-4 font-semibold w-20">Serial</th>
                      <th className="p-4 font-semibold">Title</th>
                      <th className="p-4 font-semibold">Price</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {courses.map((course, index) => (
                      <tr key={course.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-slate-500">{index + 1}</td>
                        <td className="p-4 font-medium text-slate-900">{course.title}</td>
                        <td className="p-4 text-green-600 font-bold">৳{course.price}</td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => handleDeleteCourse(course.id)}
                            className="text-red-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                            title="Delete Course"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {courses.length === 0 && (
                      <tr><td colSpan={4} className="p-8 text-center text-slate-500">No courses found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}



        {/* Students Tab */}
        {(activeTab === 'students' || activeTab === 'online_students') && !selectedStudent && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-slate-800">{activeTab === 'online_students' ? 'Online Student Management' : 'Offline Student Management'}</h2>
              <div className="flex flex-wrap items-center gap-4">
                {selectedBatch && (
                  <button 
                    onClick={() => setSelectedBatch(null)}
                    className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-bold hover:bg-slate-200 flex items-center gap-1"
                  >
                    <XCircle className="h-4 w-4" /> Clear Batch Filter
                  </button>
                )}
                <button onClick={() => clearForm('student')} className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-sm font-bold">
                  <XCircle className="h-4 w-4" /> Clear
                </button>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <input 
                    type="text" 
                    placeholder="Search by name or roll..." 
                    className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Add Student Form */}
            {activeTab === 'students' && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-slate-800">Add New Offline Student</h3>
                </div>
                <form onSubmit={(e) => {
                  setNewStudent({...newStudent, student_type: 'offline'});
                  handleAddStudent(e);
                }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* ... offline student fields ... */}
                  <input 
                    type="text" placeholder="Full Name" className="input-field"
                    value={newStudent.name || ''} onChange={(e) => setNewStudent({...newStudent, name: e.target.value})} required
                  />
                  <input 
                    type="email" placeholder="Email Address" className="input-field"
                    value={newStudent.email || ''} onChange={(e) => setNewStudent({...newStudent, email: e.target.value})} required
                  />
                  <input 
                    type="password" placeholder="Password" className="input-field"
                    value={newStudent.password || ''} onChange={(e) => setNewStudent({...newStudent, password: e.target.value})} required
                  />
                  <input 
                    type="text" placeholder="Roll Number" className="input-field"
                    value={newStudent.roll_number || ''} onChange={(e) => setNewStudent({...newStudent, roll_number: e.target.value})} required
                  />
                  <input 
                    type="text" placeholder="Student Phone Number" className="input-field"
                    value={newStudent.phone || ''} onChange={(e) => setNewStudent({...newStudent, phone: e.target.value})} required
                  />
                  <input 
                    type="text" placeholder="Guardian Phone Number" className="input-field"
                    value={newStudent.guardian_phone || ''} onChange={(e) => setNewStudent({...newStudent, guardian_phone: e.target.value})}
                  />
                  <select 
                    className="input-field"
                    value={newStudent.batch_id || ''} 
                    onChange={(e) => {
                      const selectedBatch = batches.find(b => b.id == e.target.value);
                      setNewStudent({
                        ...newStudent, 
                        batch_id: e.target.value, 
                        class: selectedBatch ? selectedBatch.class : '',
                        current_class: selectedBatch ? selectedBatch.class : ''
                      });
                    }}
                  >
                    <option value="">Select Batch</option>
                    {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                  <input 
                    type="text" placeholder="Address" className="input-field"
                    value={newStudent.address || ''} onChange={(e) => setNewStudent({...newStudent, address: e.target.value})}
                  />
                  <select 
                    className="input-field"
                    value={newStudent.admission_month || ''} 
                    onChange={(e) => setNewStudent({...newStudent, admission_month: e.target.value})}
                  >
                    <option value="">Select Admission Month</option>
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <input 
                    type="number" placeholder="Paid Amount" className="input-field"
                    value={newStudent.paid_amount || ''} onChange={(e) => setNewStudent({...newStudent, paid_amount: e.target.value})}
                  />
                  <div className="flex flex-col justify-center space-y-2">
                    <span className="text-sm font-medium text-slate-700">Batch Days</span>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input type="radio" name="batch_days" value="Sat-Mon-Wed" checked={newStudent.batch_days === 'Sat-Mon-Wed'} onChange={(e) => setNewStudent({...newStudent, batch_days: e.target.value})} />
                        <span className="text-sm">Sat-Mon-Wed</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" name="batch_days" value="Sun-Tue-Thu" checked={newStudent.batch_days === 'Sun-Tue-Thu'} onChange={(e) => setNewStudent({...newStudent, batch_days: e.target.value})} />
                        <span className="text-sm">Sun-Tue-Thu</span>
                      </label>
                    </div>
                  </div>
                  <input 
                    type="text" placeholder="Batch Time (e.g., 4:00 PM)" className="input-field"
                    value={newStudent.batch_time || ''} onChange={(e) => setNewStudent({...newStudent, batch_time: e.target.value})}
                  />
                  <input 
                    type="number" placeholder="Admission Fee" className="input-field"
                    value={newStudent.admission_fee || ''} onChange={(e) => setNewStudent({...newStudent, admission_fee: e.target.value})}
                  />
                  <input 
                    type="number" placeholder="Monthly Fee" className="input-field"
                    value={newStudent.monthly_fee || ''} onChange={(e) => setNewStudent({...newStudent, monthly_fee: e.target.value})}
                  />
                  <button type="submit" className="col-span-1 md:col-span-2 lg:col-span-3 bg-orange-600 text-white py-2 rounded-lg font-bold hover:bg-orange-700 transition-colors">
                    Add Offline Student
                  </button>
                </form>
              </div>
            )}

            {/* Student List */}
            <div className="space-y-8">
              {activeTab === 'online_students' ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-blue-50 px-6 py-4 border-b border-blue-200 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-blue-800">All Online Students</h3>
                    <span className="text-sm text-blue-600 font-bold">{filteredStudents.length} Students</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[600px]">
                      <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="p-4 font-semibold w-20">Serial</th>
                          <th className="p-4 font-semibold">Roll No</th>
                          <th className="p-4 font-semibold">Name</th>
                          <th className="p-4 font-semibold">Phone</th>
                          <th className="p-4 font-semibold">Program/Course</th>
                          <th className="p-4 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredStudents.map((student, index) => (
                          <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 text-slate-500">{index + 1}</td>
                            <td className="p-4 font-mono text-blue-600 font-bold">{student.roll_number || '-'}</td>
                            <td className="p-4 font-medium text-slate-900">
                              <div className="flex items-center gap-2">
                                {student.name}
                                {student.status && (
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                    student.status === 'approved' ? 'bg-green-100 text-green-700' :
                                    student.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-slate-100 text-slate-700'
                                  }`}>
                                    {student.status}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-4 text-slate-600">{student.phone}</td>
                            <td className="p-4 text-slate-600">{student.program_title || student.course_title || '-'}</td>
                            <td className="p-4 text-right">
                              <button 
                                onClick={() => { setSelectedStudent(null); fetchStudentDetails(student.id).then(setSelectedStudent); }}
                                className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 font-medium text-sm"
                              >
                                View Details <ChevronRight className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {filteredStudents.length === 0 && (
                          <tr><td colSpan={6} className="p-8 text-center text-slate-500">No online students found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <>
                  {/* Students without Batch */}
                  {(() => {
                    const unassignedStudents = filteredStudents.filter(s => !s.batch_id);
                    if (unassignedStudents.length === 0) return null;
                    return (
                      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-orange-50 px-6 py-4 border-b border-orange-200 flex justify-between items-center">
                          <h3 className="text-lg font-bold text-orange-800">Unassigned / Program Students</h3>
                          <span className="text-sm text-orange-600 font-bold">{unassignedStudents.length} Students</span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left min-w-[600px]">
                            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                              <tr>
                                <th className="p-4 font-semibold w-20">Serial</th>
                                <th className="p-4 font-semibold">Roll No</th>
                                <th className="p-4 font-semibold">Name</th>
                                <th className="p-4 font-semibold">Phone</th>
                                <th className="p-4 font-semibold">Program</th>
                                <th className="p-4 font-semibold text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {unassignedStudents.map((student, index) => (
                                <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="p-4 text-slate-500">{index + 1}</td>
                                  <td className="p-4 font-mono text-orange-600 font-bold">{student.roll_number || '-'}</td>
                                  <td className="p-4 font-medium text-slate-900">
                                    <div className="flex items-center gap-2">
                                      {student.name}
                                      {student.status && (
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                          student.status === 'approved' ? 'bg-green-100 text-green-700' :
                                          student.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                          'bg-slate-100 text-slate-700'
                                        }`}>
                                          {student.status}
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-4 text-slate-600">{student.phone}</td>
                                  <td className="p-4 text-slate-600">{student.program_title || '-'}</td>
                                  <td className="p-4 text-right">
                                    <button 
                                      onClick={() => { setSelectedStudent(null); fetchStudentDetails(student.id).then(setSelectedStudent); }}
                                      className="text-orange-600 hover:text-orange-800 inline-flex items-center gap-1 font-medium text-sm"
                                    >
                                      View Details <ChevronRight className="h-4 w-4" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })()}

                  {batches.map(batch => {
                    const batchStudents = studentsByBatch[batch.id] || [];
                    if (batchStudents.length === 0) return null;

                    return (
                      <div key={batch.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                          <h3 className="text-lg font-bold text-slate-800">{batch.name}</h3>
                          <span className="text-sm text-slate-500">{batchStudents.length} Students</span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left min-w-[600px]">
                          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                            <tr>
                              <th className="p-4 font-semibold w-20">Serial</th>
                              <th className="p-4 font-semibold">Roll No</th>
                              <th className="p-4 font-semibold">Name</th>
                              <th className="p-4 font-semibold">Phone</th>
                              <th className="p-4 font-semibold">Program</th>
                              <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {batchStudents.map((student, index) => (
                              <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 text-slate-500">{index + 1}</td>
                                <td className="p-4 font-mono text-orange-600 font-bold">{student.roll_number || '-'}</td>
                                <td className="p-4 font-medium text-slate-900">
                                  <div className="flex items-center gap-2">
                                    {student.name}
                                    {student.status && (
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                        student.status === 'approved' ? 'bg-green-100 text-green-700' :
                                        student.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                        student.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                                        student.status === 'passed' ? 'bg-purple-100 text-purple-700' :
                                        'bg-slate-100 text-slate-700'
                                      }`}>
                                        {student.status}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-4 text-slate-600">{student.phone}</td>
                                <td className="p-4 text-slate-600">{student.program_title || '-'}</td>
                                <td className="p-4 text-right">
                                  <div className="flex justify-end gap-2 items-center">
                                    <button 
                                      onClick={() => { setSelectedStudent(null); fetchStudentDetails(student.id).then(setSelectedStudent); }}
                                      className="text-orange-600 hover:text-orange-800 inline-flex items-center gap-1 font-medium text-sm"
                                    >
                                      View Details <ChevronRight className="h-4 w-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                  })}
                </>
              )}
            </div>
          </div>
        )}

        {/* Student Details View */}
        {(activeTab === 'students' || activeTab === 'online_students') && selectedStudent && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <button onClick={() => { setSelectedStudent(null); setIsEditingStudent(false); }} className="text-slate-500 hover:text-orange-600 flex items-center gap-2 font-medium">
                &larr; Back to List
              </button>
              {!isEditingStudent && (
                <button 
                  onClick={() => {
                    setEditStudentData({...selectedStudent});
                    setIsEditingStudent(true);
                  }}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-orange-700 transition-colors flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" /> Edit Details
                </button>
              )}
            </div>
            
            {isEditingStudent ? (
              <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-2xl font-bold text-slate-800 mb-6">Edit Student Details</h3>
                <form onSubmit={handleUpdateStudent} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Full Name</label>
                    <input 
                      type="text" className="input-field"
                      value={editStudentData.name || ''} 
                      onChange={(e) => setEditStudentData({...editStudentData, name: e.target.value})} 
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Email</label>
                    <input 
                      type="email" className="input-field"
                      value={editStudentData.email || ''} 
                      onChange={(e) => setEditStudentData({...editStudentData, email: e.target.value})} 
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Roll Number</label>
                    <input 
                      type="text" className="input-field font-mono"
                      value={editStudentData.roll_number || ''} 
                      onChange={(e) => setEditStudentData({...editStudentData, roll_number: e.target.value})} 
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Phone</label>
                    <input 
                      type="text" className="input-field"
                      value={editStudentData.phone || ''} 
                      onChange={(e) => setEditStudentData({...editStudentData, phone: e.target.value})} 
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Guardian Phone</label>
                    <input 
                      type="text" className="input-field"
                      value={editStudentData.guardian_phone || ''} 
                      onChange={(e) => setEditStudentData({...editStudentData, guardian_phone: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Address</label>
                    <input 
                      type="text" className="input-field"
                      value={editStudentData.address || ''} 
                      onChange={(e) => setEditStudentData({...editStudentData, address: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Program Title</label>
                    <input 
                      type="text" className="input-field"
                      value={editStudentData.program_title || ''} 
                      onChange={(e) => setEditStudentData({...editStudentData, program_title: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Batch</label>
                    <select 
                      className="input-field"
                      value={editStudentData.batch_id || ''} 
                      onChange={(e) => setEditStudentData({...editStudentData, batch_id: e.target.value})}
                    >
                      <option value="">No Batch</option>
                      {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Admission Month</label>
                    <input 
                      type="text" className="input-field"
                      value={editStudentData.admission_month || ''} 
                      onChange={(e) => setEditStudentData({...editStudentData, admission_month: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Batch Days</label>
                    <select 
                      className="input-field"
                      value={editStudentData.batch_days || ''} 
                      onChange={(e) => setEditStudentData({...editStudentData, batch_days: e.target.value})}
                    >
                      <option value="">Select Days</option>
                      <option value="Sat-Mon-Wed">Sat-Mon-Wed</option>
                      <option value="Sun-Tue-Thu">Sun-Tue-Thu</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Admission Fee</label>
                    <input 
                      type="number" className="input-field"
                      value={editStudentData.admission_fee || ''} 
                      onChange={(e) => setEditStudentData({...editStudentData, admission_fee: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Monthly Fee</label>
                    <input 
                      type="number" className="input-field"
                      value={editStudentData.monthly_fee || ''} 
                      onChange={(e) => setEditStudentData({...editStudentData, monthly_fee: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Paid Amount</label>
                    <input 
                      type="number" className="input-field"
                      value={editStudentData.paid_amount || ''} 
                      onChange={(e) => setEditStudentData({...editStudentData, paid_amount: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Status</label>
                    <select 
                      className="input-field"
                      value={editStudentData.status || ''} 
                      onChange={(e) => setEditStudentData({...editStudentData, status: e.target.value})}
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="active">Active</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="passed">Passed</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Student Type</label>
                    <select 
                      className="input-field"
                      value={editStudentData.student_type || ''} 
                      onChange={(e) => setEditStudentData({...editStudentData, student_type: e.target.value})}
                    >
                      <option value="offline">Offline</option>
                      <option value="online">Online</option>
                    </select>
                  </div>

                  <div className="col-span-1 md:col-span-2 lg:col-span-3 flex gap-4 mt-4">
                    <button type="submit" className="flex-1 bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition-all">
                      Save Changes
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setIsEditingStudent(false)}
                      className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">{selectedStudent.name}</h2>
                  <p className="text-slate-500">{selectedStudent.email}</p>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-600">
                    <div><span className="font-semibold">Phone:</span> {selectedStudent.phone}</div>
                    <div><span className="font-semibold">Guardian Phone:</span> {selectedStudent.guardian_phone || 'N/A'}</div>
                    <div className="sm:col-span-2"><span className="font-semibold">Address:</span> {selectedStudent.address || 'N/A'}</div>
                    <div><span className="font-semibold">Admission Month:</span> {selectedStudent.admission_month || 'N/A'}</div>
                    <div><span className="font-semibold">Batch Days:</span> {selectedStudent.batch_days || 'N/A'}</div>
                    <div><span className="font-semibold">Admission Fee:</span> ৳{selectedStudent.admission_fee || 0}</div>
                    <div><span className="font-semibold">Monthly Fee:</span> ৳{selectedStudent.monthly_fee || 0}</div>
                    <div><span className="font-semibold">Total Paid:</span> ৳{selectedStudent.paid_amount || 0}</div>
                    <div><span className="font-semibold">Class:</span> {selectedStudent.current_class || 'N/A'}</div>
                    <div><span className="font-semibold">Program:</span> {selectedStudent.program_title || 'N/A'}</div>
                    <div><span className="font-semibold">Batch:</span> {batches.find(b => b.id == selectedStudent.batch_id)?.name || 'N/A'}</div>
                    {selectedStudent.payment_number && (
                      <div><span className="font-semibold">Payment Number:</span> {selectedStudent.payment_number}</div>
                    )}
                    {selectedStudent.transaction_id && (
                      <div className="sm:col-span-2"><span className="font-semibold">Transaction ID:</span> <span className="font-mono">{selectedStudent.transaction_id}</span></div>
                    )}
                    {selectedStudent.initial_password && (
                      <div><span className="font-semibold text-red-600">Initial Password:</span> <span className="font-mono">{selectedStudent.initial_password}</span></div>
                    )}
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Roll Number</div>
                  <div className="text-3xl font-mono text-orange-600 font-bold">{selectedStudent.roll_number || 'N/A'}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Attendance History */}
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">
                    <CheckCircle className="h-5 w-5 text-green-500" /> Attendance History
                  </h3>
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-2 scrollbar-hide">
                    {selectedStudent.attendance?.map((record: any) => (
                      <div key={record.id} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                        <span className="text-slate-600 font-medium">{record.date}</span>
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                          record.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {record.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment History */}
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">
                    <CreditCard className="h-5 w-5 text-orange-500" /> Payment History
                  </h3>
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-2 scrollbar-hide">
                    {selectedStudent.payments?.map((payment: any) => (
                      <div key={payment.id} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                        <div>
                          <div className="text-sm text-slate-800 font-medium">{payment.date}</div>
                          <div className="text-xs text-slate-500 capitalize">{payment.type} {payment.program_title ? `- ${payment.program_title}` : ''}</div>
                        </div>
                        <span className="font-mono text-orange-600 font-bold text-lg">৳{payment.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Results History */}
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 md:col-span-2">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">
                    <FileText className="h-5 w-5 text-indigo-500" /> Results History
                  </h3>
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-2 scrollbar-hide">
                    {selectedStudent.results && selectedStudent.results.length > 0 ? (
                      selectedStudent.results.map((res: any) => {
                        let calculatedMerit = res.merit_position;
                        if (!calculatedMerit) {
                          const key = res.exam_id || res.exam_name;
                          if (key && meritPositions[key]) {
                            calculatedMerit = meritPositions[key][selectedStudent.id];
                          }
                        }
                        return (
                          <div key={res.id || Math.random()} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                            <span className="font-medium text-slate-800">{res.exam_name}</span>
                            <div className="flex items-center gap-4">
                              {calculatedMerit && (
                                <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">Merit: {calculatedMerit}</span>
                              )}
                              <span className="font-bold text-orange-600">{res.marks} / {res.total_marks}</span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-slate-500 text-sm">No results found.</p>
                    )}
                  </div>
                </div>

                {/* Enrolled Courses */}
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 md:col-span-2">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">
                    <BookOpen className="h-5 w-5 text-blue-500" /> Enrolled Courses
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedStudent.enrolled_courses && selectedStudent.enrolled_courses.length > 0 ? (
                      selectedStudent.enrolled_courses.map((course: any) => (
                        <div key={course.id} className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm flex justify-between items-center">
                          <div>
                            <div className="font-bold text-slate-800">{course.title}</div>
                            <div className="text-xs text-slate-500">Enrolled on: {new Date(course.enrolled_at).toLocaleDateString()}</div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold uppercase">
                              {course.status || 'Active'}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 text-sm col-span-full">No enrolled courses found.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            )}
          </div>
        )}

        {/* Batches Tab */}
        {activeTab === 'batches' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-slate-800">Batch Management</h2>
              <button onClick={() => clearForm('batch')} className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-sm font-bold">
                <XCircle className="h-4 w-4" /> Clear
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold mb-4 text-slate-800">Add New Batch</h3>
              <form onSubmit={handleAddBatch} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input 
                  type="text" placeholder="Batch Name" className="input-field"
                  value={newBatch.name} onChange={(e) => setNewBatch({...newBatch, name: e.target.value})} required
                />
                <input 
                  type="text" placeholder="Class" className="input-field"
                  value={newBatch.class} onChange={(e) => setNewBatch({...newBatch, class: e.target.value})} required
                />
                <input 
                  type="url" placeholder="Live Class Link (Optional)" className="input-field"
                  value={newBatch.live_class_link} onChange={(e) => setNewBatch({...newBatch, live_class_link: e.target.value})}
                />
                <button type="submit" className="btn-primary flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 md:col-span-3">
                  <Plus className="h-5 w-5" /> Add Batch
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {batches.map(batch => (
                <div 
                  key={batch.id} 
                  className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative group cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    setActiveTab('students');
                    setSelectedBatch(batch.id);
                    setSearchTerm('');
                  }}
                >
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{batch.name}</h3>
                  <p className="text-slate-600 text-sm mb-1"><span className="font-bold">Class:</span> {batch.class || 'N/A'}</p>
                  {batch.live_class_link && (
                    <p className="text-orange-600 text-sm mb-4 truncate"><span className="font-bold">Live Link:</span> {batch.live_class_link}</p>
                  )}
                  <div className="flex justify-between items-center mt-4">
                    <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                      {(allStudentsByBatch[batch.id] || []).length} Students
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBatch(batch.id);
                      }}
                      className="text-red-400 hover:text-red-600 bg-slate-50 p-2 rounded-full hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notices Tab */}
        {activeTab === 'notices' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-slate-800">Notices</h2>
              <button onClick={() => clearForm('notice')} className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-sm font-bold">
                <XCircle className="h-4 w-4" /> Clear
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold mb-4 text-slate-800">Add New Notice</h3>
              <form onSubmit={handleAddNotice} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    type="text" placeholder="Title" className="input-field"
                    value={newNotice.title} onChange={(e) => setNewNotice({...newNotice, title: e.target.value})} required
                  />
                  <select 
                    className="input-field"
                    value={newNotice.target_audience}
                    onChange={(e) => setNewNotice({...newNotice, target_audience: e.target.value})}
                  >
                    <option value="all">All Students</option>
                    <option value="offline">Offline Students Only</option>
                    <option value="online">Online Students Only</option>
                  </select>
                </div>
                <input 
                  type="text" placeholder="Author" className="input-field"
                  value={newNotice.author} onChange={(e) => setNewNotice({...newNotice, author: e.target.value})}
                />
                <input 
                  type="text" placeholder="Attachment URL" className="input-field"
                  value={newNotice.attachment_url} onChange={(e) => setNewNotice({...newNotice, attachment_url: e.target.value})}
                />
                <textarea 
                  placeholder="Content" className="input-field h-24 resize-none"
                  value={newNotice.content} onChange={(e) => setNewNotice({...newNotice, content: e.target.value})} required
                />
                <select 
                  className="input-field"
                  value={newNotice.batch_id} onChange={(e) => setNewNotice({...newNotice, batch_id: e.target.value})}
                >
                  <option value="">All Batches</option>
                  {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                <div className="flex items-center gap-2 px-1">
                  <input 
                    type="checkbox" 
                    id="is_verified" 
                    checked={newNotice.is_verified} 
                    onChange={(e) => setNewNotice({...newNotice, is_verified: e.target.checked})}
                    className="w-4 h-4 text-orange-600 border-slate-300 rounded focus:ring-orange-500"
                  />
                  <label htmlFor="is_verified" className="text-sm font-medium text-slate-700 cursor-pointer flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 fill-blue-600 text-white" />
                    Show Verified Badge
                  </label>
                </div>
                <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700">
                  <Plus className="h-5 w-5" /> Post Notice
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notices.map(notice => (
                <div key={notice.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative group">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-bold text-lg text-slate-800">{notice.title}</h4>
                    <span className="text-xs text-slate-500 font-medium">{new Date(notice.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-600 text-sm line-clamp-3">{notice.content}</p>
                  <div className="mt-4 flex justify-between items-center">
                    <div className="flex flex-col gap-1">
                      <div className="flex gap-2">
                        <span className="inline-block bg-orange-50 text-orange-600 text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider w-fit">
                          Batch: {batches.find(b => b.id == notice.batch_id)?.name || 'All Batches'}
                        </span>
                        {notice.target_audience && notice.target_audience !== 'all' && (
                          <span className="inline-block bg-blue-50 text-blue-600 text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider w-fit">
                            {notice.target_audience} Only
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 font-bold">
                        By: {notice.admin_name || notice.author || 'Admin'}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleDeleteNotice(notice.id)}
                      className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-slate-800">Gallery Management</h2>
              <button onClick={() => clearForm('gallery')} className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-sm font-bold">
                <XCircle className="h-4 w-4" /> Clear
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold mb-4 text-slate-800">Add New Image</h3>
              <form onSubmit={handleAddImage} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="Image URL"
                  value={newImage.image_url}
                  onChange={(e) => setNewImage({ ...newImage, image_url: e.target.value })}
                  className="input-field"
                  required
                />
                <input
                  type="text"
                  placeholder="Caption"
                  value={newImage.caption}
                  onChange={(e) => setNewImage({ ...newImage, caption: e.target.value })}
                  className="input-field"
                />
                <select
                  className="input-field"
                  value={newImage.category}
                  onChange={(e) => setNewImage({ ...newImage, category: e.target.value })}
                >
                  <option value="General">General</option>
                  <option value="Events">Events</option>
                  <option value="Classes">Classes</option>
                  <option value="Achievements">Achievements</option>
                </select>
                <button type="submit" className="btn-primary bg-orange-600 hover:bg-orange-700">
                  Add Image
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {galleryImages.map((img) => (
                <div key={img.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden group relative">
                  <img src={img.image_url} alt={img.caption} className="w-full h-48 object-cover" />
                  <div className="p-4 flex justify-between items-center">
                    <p className="text-sm font-medium text-slate-900">{img.caption || 'No Caption'}</p>
                    <span className="text-xs font-bold bg-orange-100 text-orange-800 px-2 py-1 rounded">{img.category || 'General'}</span>
                  </div>
                  <button 
                    onClick={() => handleDeleteImage(img.id)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-slate-800">Student Reviews</h2>
              <button onClick={() => clearForm('review')} className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-sm font-bold">
                <XCircle className="h-4 w-4" /> Clear
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold mb-4 text-slate-800">Add New Review</h3>
              <form onSubmit={handleAddReview} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    type="text" placeholder="Student Name" className="input-field"
                    value={newReview.student_name} onChange={(e) => setNewReview({...newReview, student_name: e.target.value})} required
                  />
                  <input 
                    type="text" placeholder="Student Photo URL" className="input-field"
                    value={newReview.student_photo} onChange={(e) => setNewReview({...newReview, student_photo: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    type="text" placeholder="Batch (e.g., HSC 2024)" className="input-field"
                    value={newReview.batch} onChange={(e) => setNewReview({...newReview, batch: e.target.value})}
                  />
                  <select 
                    className="input-field"
                    value={newReview.rating} onChange={(e) => setNewReview({...newReview, rating: parseInt(e.target.value)})}
                  >
                    {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Stars</option>)}
                  </select>
                </div>
                <textarea 
                  placeholder="Review Content" className="input-field h-24 resize-none"
                  value={newReview.content} onChange={(e) => setNewReview({...newReview, content: e.target.value})} required
                />
                <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700">
                  <Plus className="h-5 w-5" /> Add Review
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map(review => (
                <div key={review.id} className={`bg-white p-6 rounded-xl shadow-sm border ${review.status === 'pending' ? 'border-orange-300 bg-orange-50/30' : 'border-slate-200'} relative group`}>
                  <div className="flex items-center gap-4 mb-4">
                    <img 
                      src={review.student_photo || `https://ui-avatars.com/api/?name=${review.student_name}&background=random`} 
                      alt={review.student_name} 
                      className="w-12 h-12 rounded-full object-cover border-2 border-orange-100"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-800">{review.student_name}</h4>
                        {review.status === 'pending' && (
                          <span className="bg-orange-100 text-orange-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Pending</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{review.batch} • {new Date(review.date).toLocaleDateString()}</p>
                    </div>
                    <div className="ml-auto flex text-orange-400">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm italic mb-4">"{review.content}"</p>
                  
                  <div className="flex justify-end gap-2">
                    {review.status === 'pending' && (
                      <button 
                        onClick={() => handleApproveReview(review.id)}
                        className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                      >
                        <CheckCircle className="h-3.5 w-3.5" /> Approve
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeleteReview(review.id)}
                      className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Routines Tab */}
        {activeTab === 'routines' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-slate-800">Class Routine Management</h2>
              <button onClick={() => clearForm('routine')} className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-sm font-bold">
                <XCircle className="h-4 w-4" /> Clear
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold mb-4 text-slate-800">Add New Routine</h3>
              <form onSubmit={handleAddRoutine} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select 
                    className="input-field"
                    value={newRoutine.batch_id} onChange={(e) => setNewRoutine({...newRoutine, batch_id: e.target.value})} required
                  >
                    <option value="">Select Batch</option>
                    <option value="all">All Batches</option>
                    {batches.map(b => <option key={b.id} value={b.id}>{b.name} ({b.class})</option>)}
                  </select>
                  <input 
                    type="text" placeholder="Routine Image URL" className="input-field"
                    value={newRoutine.image_url} onChange={(e) => setNewRoutine({...newRoutine, image_url: e.target.value})} required
                  />
                </div>
                <textarea 
                  placeholder="Routine Content/Description (Optional)" className="input-field h-24 resize-none"
                  value={newRoutine.content} onChange={(e) => setNewRoutine({...newRoutine, content: e.target.value})}
                />
                <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700">
                  <Plus className="h-5 w-5" /> Add Routine
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {routines.map(routine => (
                <div key={routine.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden group relative">
                  <img src={routine.image_url} alt="Routine" className="w-full h-auto object-cover" />
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold bg-orange-100 text-orange-800 px-2 py-1 rounded">
                        Batch: {routine.batch_id === 'all' ? 'All Batches' : batches.find(b => b.id == routine.batch_id)?.name || 'Unknown'}
                      </span>
                      <span className="text-xs text-slate-500">{new Date(routine.created_at).toLocaleDateString()}</span>
                    </div>
                    {routine.content && <p className="text-sm text-slate-600">{routine.content}</p>}
                  </div>
                  <button 
                    onClick={() => handleDeleteRoutine(routine.id)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-800">Messages</h2>
            
            <div className="space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={`bg-white p-10 rounded-3xl shadow-lg border ${msg.status === 'unread' ? 'border-orange-400 bg-orange-50/50' : 'border-slate-200'}`}>
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h4 className="font-bold text-2xl text-slate-900">{msg.subject || 'No Subject'}</h4>
                      <p className="text-lg text-slate-600 mt-1">From: <span className="font-semibold text-slate-800">{msg.name}</span> ({msg.email})</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-base text-slate-500">{new Date(msg.created_at).toLocaleString()}</span>
                      {msg.status === 'unread' && (
                        <button 
                          onClick={async () => {
                            await fetch(`/api/messages/${msg.id}/read`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
                            fetchMessages();
                          }}
                          className="text-base bg-orange-500 text-white px-6 py-3 rounded-xl hover:bg-orange-600 font-bold"
                        >
                          Mark Read
                        </button>
                      )}
                      <button 
                        onClick={async () => {
                          if (await showConfirm('Delete message?')) {
                            await fetch(`/api/messages/${msg.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
                            fetchMessages();
                          }
                        }}
                        className="text-red-500 hover:text-red-700 p-3"
                      >
                        <Trash2 className="h-8 w-8" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xl text-slate-800 whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-200">
                  No messages found.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Moderators Tab */}
        {activeTab === 'moderators' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-800">Moderator Management</h2>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-800">Add New Moderator</h3>
                <button onClick={() => clearForm('moderators')} className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-sm font-bold">
                  <XCircle className="h-4 w-4" /> Clear
                </button>
              </div>
              <form onSubmit={handleAddModerator} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                  <input 
                    type="text" 
                    className="input-field"
                    value={newModerator.name}
                    onChange={(e) => setNewModerator({...newModerator, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Username / Email</label>
                  <input 
                    type="text" 
                    className="input-field"
                    value={newModerator.email}
                    onChange={(e) => setNewModerator({...newModerator, email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                  <input 
                    type="password" 
                    className="input-field"
                    value={newModerator.password}
                    onChange={(e) => setNewModerator({...newModerator, password: e.target.value})}
                    required
                  />
                </div>
                <button type="submit" className="btn-primary w-full bg-orange-600 hover:bg-orange-700">
                  Add Moderator
                </button>
              </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="p-4 font-semibold w-20">Serial</th>
                      <th className="p-4 font-semibold">Name</th>
                      <th className="p-4 font-semibold">Email</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {moderators.map((mod, index) => (
                      <tr key={mod.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-slate-500">{index + 1}</td>
                        <td className="p-4 font-medium text-slate-900">{mod.name}</td>
                        <td className="p-4 text-slate-600">{mod.email}</td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={async () => {
                              if (await showConfirm('Delete moderator?')) {
                                await fetch(`/api/moderators/${mod.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
                                fetchModerators();
                              }
                            }}
                            className="text-red-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {moderators.length === 0 && (
                      <tr><td colSpan={4} className="p-8 text-center text-slate-500">No moderators found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Web Recorded Classes Tab */}
        {activeTab === 'web_recorded' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-800">Website Recorded Classes</h2>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-800">Add New Class</h3>
                <button onClick={() => clearForm('web_recorded')} className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-sm font-bold">
                  <XCircle className="h-4 w-4" /> Clear
                </button>
              </div>
              <form onSubmit={handleAddWebRecordedClass} className="space-y-4">
                <input 
                  type="text" placeholder="Title" className="input-field"
                  value={newWebRecordedClass.title} onChange={(e) => setNewWebRecordedClass({...newWebRecordedClass, title: e.target.value})} required
                />
                <input 
                  type="text" placeholder="Video URL (YouTube/Drive)" className="input-field"
                  value={newWebRecordedClass.url} onChange={(e) => setNewWebRecordedClass({...newWebRecordedClass, url: e.target.value})} required
                />
                <select 
                  className="input-field"
                  value={newWebRecordedClass.course_id} onChange={(e) => setNewWebRecordedClass({...newWebRecordedClass, course_id: e.target.value})}
                >
                  <option value="">Select Course (Optional)</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
                <textarea 
                  placeholder="Description" className="input-field h-24"
                  value={newWebRecordedClass.description} onChange={(e) => setNewWebRecordedClass({...newWebRecordedClass, description: e.target.value})}
                />
                <button type="submit" className="btn-primary bg-orange-600 hover:bg-orange-700">
                  Add Class
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {webRecordedClasses.map((cls) => (
                <div key={cls.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative group">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-slate-900">{cls.title}</h3>
                    <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-600 px-2 py-1 rounded">
                      {courses.find(c => c.id == cls.course_id)?.title || 'General'}
                    </span>
                  </div>
                  <a href={cls.url} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline mb-2 block truncate">{cls.url}</a>
                  <p className="text-slate-600 text-sm mb-4">{cls.description}</p>
                  <button 
                    onClick={() => handleDeleteWebRecordedClass(cls.id)}
                    className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Student Recorded Classes Tab */}
        {activeTab === 'student_recorded' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-800">Student Recorded Classes</h2>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-800">Add New Recorded Class</h3>
                <button onClick={() => clearForm('study_materials')} className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-sm font-bold">
                  <XCircle className="h-4 w-4" /> Clear
                </button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const videoMaterial = { ...newStudyMaterial, type: 'video' };
                handleAddStudyMaterial(e, videoMaterial);
              }} className="space-y-4">
                <input 
                  type="text" placeholder="Class Title (e.g., Physics Chapter 1 - Part 1)" className="input-field"
                  value={newStudyMaterial.title} onChange={(e) => setNewStudyMaterial({...newStudyMaterial, title: e.target.value})} required
                />
                <input 
                  type="text" placeholder="Video URL (YouTube/Drive Link)" className="input-field"
                  value={newStudyMaterial.url} onChange={(e) => setNewStudyMaterial({...newStudyMaterial, url: e.target.value})} required
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select 
                    className="input-field"
                    value={newStudyMaterial.batch_id} onChange={(e) => setNewStudyMaterial({...newStudyMaterial, batch_id: e.target.value})}
                  >
                    <option value="">Select Batch (Offline)</option>
                    {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                  <select 
                    className="input-field"
                    value={newStudyMaterial.course_id} onChange={(e) => setNewStudyMaterial({...newStudyMaterial, course_id: e.target.value})}
                  >
                    <option value="">Select Course (Online)</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
                <button type="submit" className="btn-primary bg-orange-600 hover:bg-orange-700">
                  Add Recorded Class
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {studyMaterials.filter(m => m.type === 'video').map((mat) => (
                <div key={mat.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative group">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 mb-1">{mat.title}</h3>
                      <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-1 rounded uppercase font-bold">
                        {mat.batch_id ? batches.find(b => b.id == mat.batch_id)?.name : courses.find(c => c.id == mat.course_id)?.title || 'General'}
                      </span>
                    </div>
                    <a href={mat.url} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-700">
                      <PlayCircle className="h-6 w-6" />
                    </a>
                  </div>
                  <button 
                    onClick={() => handleDeleteStudyMaterial(mat.id)}
                    className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Web Class Schedule Tab */}
        {activeTab === 'web_schedule' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-800">Web Class Schedule</h2>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-800">Add New Schedule</h3>
                <button onClick={() => clearForm('web_schedule')} className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-sm font-bold">
                  <XCircle className="h-4 w-4" /> Clear
                </button>
              </div>
              <form onSubmit={handleAddWebClassSchedule} className="space-y-4">
                <input 
                  type="text" placeholder="Title (e.g., Class 9 Schedule)" className="input-field"
                  value={newWebClassSchedule.title} onChange={(e) => setNewWebClassSchedule({...newWebClassSchedule, title: e.target.value})} required
                />
                <input 
                  type="text" placeholder="Image URL" className="input-field"
                  value={newWebClassSchedule.image_url} onChange={(e) => setNewWebClassSchedule({...newWebClassSchedule, image_url: e.target.value})} required
                />
                <button type="submit" className="btn-primary bg-orange-600 hover:bg-orange-700">
                  Add Schedule
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {webClassSchedules.map((sch) => (
                <div key={sch.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative group">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">{sch.title}</h3>
                  <img src={sch.image_url} alt={sch.title} className="w-full rounded-lg" />
                  <button 
                    onClick={() => handleDeleteWebClassSchedule(sch.id)}
                    className="absolute top-4 right-4 bg-white p-2 rounded-full text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Study Materials Tab */}
        {activeTab === 'study_materials' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-800">Study Materials</h2>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-800">Add New Material</h3>
                <button onClick={() => clearForm('study_materials')} className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-sm font-bold">
                  <XCircle className="h-4 w-4" /> Clear
                </button>
              </div>
              <form onSubmit={handleAddStudyMaterial} className="space-y-4">
                <input 
                  type="text" placeholder="Title" className="input-field"
                  value={newStudyMaterial.title} onChange={(e) => setNewStudyMaterial({...newStudyMaterial, title: e.target.value})} required
                />
                <input 
                  type="text" placeholder="URL (PDF/Drive Link)" className="input-field"
                  value={newStudyMaterial.url} onChange={(e) => setNewStudyMaterial({...newStudyMaterial, url: e.target.value})} required
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select 
                    className="input-field"
                    value={newStudyMaterial.type} onChange={(e) => setNewStudyMaterial({...newStudyMaterial, type: e.target.value})}
                  >
                    <option value="pdf">PDF</option>
                    <option value="link">Link</option>
                  </select>
                  <select 
                    className="input-field"
                    value={newStudyMaterial.batch_id} onChange={(e) => setNewStudyMaterial({...newStudyMaterial, batch_id: e.target.value})}
                  >
                    <option value="">Select Batch (Offline)</option>
                    {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                  <select 
                    className="input-field"
                    value={newStudyMaterial.course_id} onChange={(e) => setNewStudyMaterial({...newStudyMaterial, course_id: e.target.value})}
                  >
                    <option value="">Select Course (Online)</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
                <button type="submit" className="btn-primary bg-orange-600 hover:bg-orange-700">
                  Add Material
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {studyMaterials.filter(m => m.type !== 'video').map((mat) => (
                <div key={mat.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative group">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 mb-1">{mat.title}</h3>
                      <div className="flex gap-2">
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded uppercase font-bold">{mat.type}</span>
                        <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-1 rounded uppercase font-bold">
                          {mat.batch_id ? batches.find(b => b.id == mat.batch_id)?.name : courses.find(c => c.id == mat.course_id)?.title || 'General'}
                        </span>
                      </div>
                    </div>
                    <a href={mat.url} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-700">
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  </div>
                  <button 
                    onClick={() => handleDeleteStudyMaterial(mat.id)}
                    className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {/* Profile Settings Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6 max-w-2xl">
            <h2 className="text-3xl font-bold text-slate-800">Profile Settings</h2>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    className="input-field"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    className="input-field"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" className="btn-primary w-full">
                  Update Profile
                </button>
              </form>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Change Password</h3>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <input 
                  type="password" 
                  placeholder="Old Password"
                  className="input-field"
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                  required
                />
                <input 
                  type="password" 
                  placeholder="New Password"
                  className="input-field"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                />
                <input 
                  type="password" 
                  placeholder="Confirm New Password"
                  className="input-field"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  required
                />
                <button type="submit" className="btn-primary w-full">
                  Update Password
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Website Settings Tab */}
        {activeTab === 'website_settings' && (
          <div className="space-y-6 w-full">
            <h2 className="text-3xl font-bold text-slate-800">Website Content</h2>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold mb-4 text-slate-800">Social Media & Branding</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Facebook URL</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" className="input-field" placeholder="Facebook URL"
                        value={newSetting.key === 'facebook_url' ? newSetting.value : (settings.facebook_url || '')}
                        onChange={(e) => setNewSetting({ key: 'facebook_url', value: e.target.value })}
                      />
                      <button onClick={() => handleUpdateSetting('facebook_url', newSetting.value)} className="bg-orange-600 text-white px-4 rounded-xl hover:bg-orange-700">Save</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">YouTube URL</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" className="input-field" placeholder="YouTube URL"
                        value={newSetting.key === 'youtube_url' ? newSetting.value : (settings.youtube_url || '')}
                        onChange={(e) => setNewSetting({ key: 'youtube_url', value: e.target.value })}
                      />
                      <button onClick={() => handleUpdateSetting('youtube_url', newSetting.value)} className="bg-orange-600 text-white px-4 rounded-xl hover:bg-orange-700">Save</button>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Instagram URL</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" className="input-field" placeholder="Instagram URL"
                        value={newSetting.key === 'instagram_url' ? newSetting.value : (settings.instagram_url || '')}
                        onChange={(e) => setNewSetting({ key: 'instagram_url', value: e.target.value })}
                      />
                      <button onClick={() => handleUpdateSetting('instagram_url', newSetting.value)} className="bg-orange-600 text-white px-4 rounded-xl hover:bg-orange-700">Save</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Logo URL</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" className="input-field" placeholder="Logo URL"
                        value={newSetting.key === 'logo_url' ? newSetting.value : (settings.logo_url || '')}
                        onChange={(e) => setNewSetting({ key: 'logo_url', value: e.target.value })}
                      />
                      <button onClick={() => handleUpdateSetting('logo_url', newSetting.value)} className="bg-orange-600 text-white px-4 rounded-xl hover:bg-orange-700">Save</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold mb-4 text-slate-800">Hero Section Image</h3>
              <div className="space-y-4">
                <input 
                  type="text" 
                  className="input-field"
                  placeholder="Image URL"
                  value={newSetting.key === 'hero_image' ? newSetting.value : (settings.hero_image || '')}
                  onChange={(e) => setNewSetting({ key: 'hero_image', value: e.target.value })}
                />
                <button 
                  onClick={() => handleUpdateSetting('hero_image', newSetting.value)}
                  className="btn-primary"
                  disabled={newSetting.key !== 'hero_image' || !newSetting.value}
                >
                  Update Hero Image
                </button>
                {settings.hero_image && (
                  <div className="mt-4 h-48 w-full overflow-hidden rounded-xl">
                    <img src={settings.hero_image} alt="Hero" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold mb-4 text-slate-800">About Section Image</h3>
              <div className="space-y-4">
                <input 
                  type="text" 
                  className="input-field"
                  placeholder="Image URL"
                  value={newSetting.key === 'about_image' ? newSetting.value : (settings.about_image || '')}
                  onChange={(e) => setNewSetting({ key: 'about_image', value: e.target.value })}
                />
                <button 
                  onClick={() => handleUpdateSetting('about_image', newSetting.value)}
                  className="btn-primary"
                  disabled={newSetting.key !== 'about_image' || !newSetting.value}
                >
                  Update About Image
                </button>
                {settings.about_image && (
                  <div className="mt-4 h-48 w-full overflow-hidden rounded-xl">
                    <img src={settings.about_image} alt="About" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold mb-4 text-slate-800">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Contact Phone</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        className="input-field"
                        placeholder="e.g. +880 1XXX XXXXXX"
                        value={newSetting.key === 'contact_phone' ? newSetting.value : (settings.contact_phone || '')}
                        onChange={(e) => setNewSetting({ key: 'contact_phone', value: e.target.value })}
                      />
                      <button 
                        onClick={() => handleUpdateSetting('contact_phone', newSetting.value)}
                        className="bg-orange-600 text-white px-4 rounded-xl hover:bg-orange-700"
                        disabled={newSetting.key !== 'contact_phone' || !newSetting.value}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Contact Email</label>
                    <div className="flex gap-2">
                      <input 
                        type="email" 
                        className="input-field" 
                        placeholder="e.g. contact@wsphysics.com"
                        value={newSetting.key === 'contact_email' ? newSetting.value : (settings.contact_email || '')}
                        onChange={(e) => setNewSetting({ key: 'contact_email', value: e.target.value })}
                      />
                      <button 
                        onClick={() => handleUpdateSetting('contact_email', newSetting.value)}
                        className="bg-orange-600 text-white px-4 rounded-xl hover:bg-orange-700"
                        disabled={newSetting.key !== 'contact_email' || !newSetting.value}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Google Maps Embed URL 1</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        className="input-field" 
                        placeholder="Paste Google Maps link or iframe code here"
                        value={newSetting.key === 'map_embed_url' ? newSetting.value : (settings.map_embed_url || '')}
                        onChange={(e) => setNewSetting({ key: 'map_embed_url', value: e.target.value })}
                      />
                      <button 
                        onClick={() => handleUpdateSetting('map_embed_url', newSetting.value)}
                        className="bg-orange-600 text-white px-4 rounded-xl hover:bg-orange-700"
                        disabled={newSetting.key !== 'map_embed_url' || !newSetting.value}
                      >
                        Save
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Go to Google Maps &rarr; Share &rarr; Embed a map &rarr; Copy HTML and paste it here.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Google Maps Embed URL 2</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        className="input-field" 
                        placeholder="Paste Google Maps link or iframe code here"
                        value={newSetting.key === 'map_embed_url_2' ? newSetting.value : (settings.map_embed_url_2 || '')}
                        onChange={(e) => setNewSetting({ key: 'map_embed_url_2', value: e.target.value })}
                      />
                      <button 
                        onClick={() => handleUpdateSetting('map_embed_url_2', newSetting.value)}
                        className="bg-orange-600 text-white px-4 rounded-xl hover:bg-orange-700"
                        disabled={newSetting.key !== 'map_embed_url_2' || !newSetting.value}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Campus 1 Address</label>
                    <div className="flex gap-2">
                      <textarea 
                        className="input-field min-h-[80px]"
                        placeholder="Enter Campus 1 address"
                        value={newSetting.key === 'office_address' ? newSetting.value : (settings.office_address || '')}
                        onChange={(e) => setNewSetting({ key: 'office_address', value: e.target.value })}
                      />
                      <button 
                        onClick={() => handleUpdateSetting('office_address', newSetting.value)}
                        className="bg-orange-600 text-white px-4 rounded-xl hover:bg-orange-700 h-fit py-2"
                        disabled={newSetting.key !== 'office_address' || !newSetting.value}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Campus 2 Address</label>
                    <div className="flex gap-2">
                      <textarea 
                        className="input-field min-h-[80px]"
                        placeholder="Enter Campus 2 address"
                        value={newSetting.key === 'campus_2_address' ? newSetting.value : (settings.campus_2_address || '')}
                        onChange={(e) => setNewSetting({ key: 'campus_2_address', value: e.target.value })}
                      />
                      <button 
                        onClick={() => handleUpdateSetting('campus_2_address', newSetting.value)}
                        className="bg-orange-600 text-white px-4 rounded-xl hover:bg-orange-700 h-fit py-2"
                        disabled={newSetting.key !== 'campus_2_address' || !newSetting.value}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold mb-4 text-slate-800">Additional Information</h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">About Us Text</label>
                  <div className="flex gap-2">
                    <textarea 
                      className="input-field min-h-[120px]"
                      placeholder="Enter About Us text"
                      value={newSetting.key === 'about_text' ? newSetting.value : (settings.about_text || '')}
                      onChange={(e) => setNewSetting({ key: 'about_text', value: e.target.value })}
                    />
                    <button 
                      onClick={() => handleUpdateSetting('about_text', newSetting.value)}
                      className="bg-orange-600 text-white px-4 rounded-xl hover:bg-orange-700 h-fit py-2"
                      disabled={newSetting.key !== 'about_text' || !newSetting.value}
                    >
                      Save
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Payment Number (bKash/Nagad/Rocket)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      className="input-field"
                      placeholder="e.g. 017XXXXXXXX"
                      value={newSetting.key === 'payment_number' ? newSetting.value : (settings.payment_number || '')}
                      onChange={(e) => setNewSetting({ key: 'payment_number', value: e.target.value })}
                    />
                    <button 
                      onClick={() => handleUpdateSetting('payment_number', newSetting.value)}
                      className="bg-orange-600 text-white px-4 rounded-xl hover:bg-orange-700"
                      disabled={newSetting.key !== 'payment_number' || !newSetting.value}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
