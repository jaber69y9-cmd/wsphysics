import { showAlert, showConfirm } from '../../utils/alert';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, MapPin, Calendar, BookOpen, Camera, Star, Send, Save, Edit, TrendingUp, GraduationCap, Hash, RefreshCw, CheckCircle } from 'lucide-react';
import { doc, getDoc, updateDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { motion } from 'motion/react';

const Profile = () => {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [hasSubmittedReview, setHasSubmittedReview] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [editData, setEditData] = useState({ 
    name: '', 
    phone: '', 
    address: '', 
    guardian_phone: '',
    school_name: '',
    college_name: '',
    current_class: '',
    gender: '',
    blood_group: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', user.id));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          // Fetch batch and program info if IDs exist
          let batchData = null;
          let programData = null;
          if (userData.batch_id) {
            const batchDoc = await getDoc(doc(db, 'batches', userData.batch_id.toString()));
            if (batchDoc.exists()) {
              batchData = batchDoc.data();
            }
          }
          if (userData.program_id) {
            const programDoc = await getDoc(doc(db, 'programs', userData.program_id.toString()));
            if (programDoc.exists()) {
              programData = programDoc.data();
            }
          }
          setProfile({ user: { ...userData, id: user.id }, batch: batchData, program: programData });
        }
      } catch (e) { console.error(e); }
    };

    const checkReview = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, 'reviews'), where('student_id', '==', user.id));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setHasSubmittedReview(true);
        }
      } catch (e) { console.error(e); }
    };

    fetchProfile();
    checkReview();
  }, [user]);

  useEffect(() => {
    if (profile) {
      setEditData({
        name: profile.user.name || '',
        phone: profile.user.phone || '',
        address: profile.user.address || '',
        guardian_phone: profile.user.guardian_phone || '',
        school_name: profile.user.school_name || '',
        college_name: profile.user.college_name || '',
        current_class: profile.user.current_class || '',
        gender: profile.user.gender || '',
        blood_group: profile.user.blood_group || ''
      });
    }
  }, [profile]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.id), editData);
      setProfile({ ...profile, user: { ...profile.user, ...editData } });
      setIsEditing(false);
      showAlert('Profile updated successfully');
    } catch (e) { console.error(e); }
  };

  const handleUpdateProfilePic = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        await updateDoc(doc(db, 'users', user.id), { profile_pic: base64String });
        setProfile({ ...profile, user: { ...profile.user, profile_pic: base64String } });
        showAlert('Profile picture updated successfully');
      } catch (e) { console.error(e); }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitReview = async () => {
    if (!user || !review.comment.trim()) return;
    setIsSubmittingReview(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        student_id: user.id,
        student_name: user.name,
        student_image: profile.user.profile_pic || '',
        rating: review.rating,
        comment: review.comment,
        status: 'pending',
        created_at: new Date().toISOString()
      });
      setHasSubmittedReview(true);
      showAlert('Review submitted successfully! It will be visible after admin approval.');
    } catch (e) { 
      console.error(e); 
      showAlert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <User className="h-8 w-8 text-orange-600" />
            My Profile
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Manage your personal information and academic details.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => isEditing ? handleUpdateProfile() : setIsEditing(true)}
            className="glass px-6 py-3 rounded-2xl text-orange-600 font-bold text-sm border border-white/60 shadow-xl flex items-center gap-2 hover:bg-white/60 transition-all"
          >
            {isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 space-y-8"
        >
          <div className="glass rounded-[3rem] shadow-2xl border border-white/60 overflow-hidden">
            <div className="h-32 bg-gradient-to-br from-orange-500 to-rose-500" />
            <div className="px-8 pb-10 -mt-16 text-center">
              <div className="relative inline-block group">
                <div className="w-32 h-32 bg-white rounded-[2.5rem] p-1 shadow-2xl inline-block relative overflow-hidden">
                  {profile.user.profile_pic ? (
                    <img src={profile.user.profile_pic} alt="Profile" className="w-full h-full rounded-[2.3rem] object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 rounded-[2.3rem] flex items-center justify-center text-4xl font-black text-slate-300">
                      {profile.user.name.charAt(0)}
                    </div>
                  )}
                </div>
                <label className="absolute bottom-2 right-2 p-2 bg-orange-600 text-white rounded-xl shadow-lg cursor-pointer hover:scale-110 transition-transform">
                  <Camera className="h-4 w-4" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleUpdateProfilePic} />
                </label>
              </div>
              <h2 className="mt-6 text-2xl font-black text-slate-900 tracking-tight">{profile.user.name}</h2>
              <p className="text-orange-600 font-bold text-sm uppercase tracking-widest mt-1">{profile.user.student_type} Student</p>
              
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="bg-white/40 p-4 rounded-3xl border border-white/60 shadow-sm">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter mb-1">Roll Number</p>
                  <p className="text-lg font-black text-slate-800">{profile.user.roll_number || 'N/A'}</p>
                </div>
                <div className="bg-white/40 p-4 rounded-3xl border border-white/60 shadow-sm">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter mb-1">Batch</p>
                  <p className="text-lg font-black text-slate-800">{profile.batch?.name || profile.user.batch_id || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="glass p-8 rounded-[2.5rem] shadow-2xl border border-white/60">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              Academic Progress
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-slate-500">Attendance Rate</span>
                  <span className="text-orange-600">85%</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-white/40">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-slate-500">Course Completion</span>
                  <span className="text-emerald-600">60%</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-white/40">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '60%' }} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Details Section */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-8"
        >
          <div className="glass p-8 md:p-10 rounded-[3rem] shadow-2xl border border-white/60">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                <BookOpen className="h-6 w-6 text-orange-600" />
                Personal & Academic Information
              </h3>
            </div>

            {isEditing ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Full Name</label>
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="w-full bg-white/50 border-2 border-white/60 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-bold text-slate-700 shadow-inner"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Phone Number</label>
                    <input
                      type="text"
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      className="w-full bg-white/50 border-2 border-white/60 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-bold text-slate-700 shadow-inner"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Guardian Phone</label>
                    <input
                      type="text"
                      value={editData.guardian_phone}
                      onChange={(e) => setEditData({ ...editData, guardian_phone: e.target.value })}
                      className="w-full bg-white/50 border-2 border-white/60 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-bold text-slate-700 shadow-inner"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Current Class</label>
                    <input
                      type="text"
                      value={editData.current_class}
                      onChange={(e) => setEditData({ ...editData, current_class: e.target.value })}
                      className="w-full bg-white/50 border-2 border-white/60 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-bold text-slate-700 shadow-inner"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Address</label>
                    <textarea
                      value={editData.address}
                      onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                      rows={3}
                      className="w-full bg-white/50 border-2 border-white/60 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-bold text-slate-700 shadow-inner resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">School Name</label>
                    <input
                      type="text"
                      value={editData.school_name}
                      onChange={(e) => setEditData({ ...editData, school_name: e.target.value })}
                      className="w-full bg-white/50 border-2 border-white/60 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-bold text-slate-700 shadow-inner"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">College Name</label>
                    <input
                      type="text"
                      value={editData.college_name}
                      onChange={(e) => setEditData({ ...editData, college_name: e.target.value })}
                      className="w-full bg-white/50 border-2 border-white/60 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-bold text-slate-700 shadow-inner"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-8 py-4 rounded-2xl font-black text-slate-500 hover:bg-slate-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateProfile}
                    className="bg-orange-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-orange-600/20 hover:bg-orange-700 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <Save className="h-5 w-5" />
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="bg-white/30 p-6 rounded-[2rem] border border-white/60 shadow-sm group hover:bg-white/50 transition-all">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-2 bg-orange-100 rounded-xl text-orange-600">
                      <Mail className="h-5 w-5" />
                    </div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Email Address</p>
                  </div>
                  <p className="text-lg font-black text-slate-800 ml-14">{profile.user.email}</p>
                </div>
                
                <div className="bg-white/30 p-6 rounded-[2rem] border border-white/60 shadow-sm group hover:bg-white/50 transition-all">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-2 bg-rose-100 rounded-xl text-rose-600">
                      <Phone className="h-5 w-5" />
                    </div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Phone Number</p>
                  </div>
                  <p className="text-lg font-black text-slate-800 ml-14">{profile.user.phone || 'Not provided'}</p>
                </div>

                <div className="bg-white/30 p-6 rounded-[2rem] border border-white/60 shadow-sm group hover:bg-white/50 transition-all">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Program</p>
                  </div>
                  <p className="text-lg font-black text-slate-800 ml-14">{profile.program?.title || profile.user.program_title || 'N/A'}</p>
                </div>

                <div className="bg-white/30 p-6 rounded-[2rem] border border-white/60 shadow-sm group hover:bg-white/50 transition-all">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Address</p>
                  </div>
                  <p className="text-lg font-black text-slate-800 ml-14">{profile.user.address || 'Not provided'}</p>
                </div>

                <div className="bg-white/30 p-6 rounded-[2rem] border border-white/60 shadow-sm group hover:bg-white/50 transition-all">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-2 bg-purple-100 rounded-xl text-purple-600">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Batch Schedule</p>
                  </div>
                  <p className="text-lg font-black text-slate-800 ml-14">{profile.batch?.schedule || 'N/A'}</p>
                </div>

                <div className="bg-white/30 p-6 rounded-[2rem] border border-white/60 shadow-sm group hover:bg-white/50 transition-all">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                      <Hash className="h-5 w-5" />
                    </div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Blood Group</p>
                  </div>
                  <p className="text-lg font-black text-red-600 ml-14">{profile.user.blood_group || 'N/A'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Review Section */}
          <div className="glass p-8 md:p-10 rounded-[3rem] shadow-2xl border border-white/60">
            <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
              <Star className="h-6 w-6 text-orange-600" />
              Share Your Feedback
            </h3>
            
            {hasSubmittedReview ? (
              <div className="bg-emerald-500/10 p-10 rounded-[2.5rem] text-center border border-emerald-500/20">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-10 w-10 text-emerald-600" />
                </div>
                <h4 className="text-2xl font-black text-emerald-900 mb-2">Thank you!</h4>
                <p className="text-emerald-700 font-medium">Your review has been submitted and is awaiting approval.</p>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex flex-col items-center gap-4 p-8 bg-white/30 rounded-[2.5rem] border border-white/60 shadow-inner">
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Rate your experience</p>
                  <div className="flex gap-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setReview({ ...review, rating: star })}
                        className="transition-all hover:scale-125 active:scale-90"
                      >
                        <Star
                          className={`h-10 w-10 ${
                            star <= review.rating ? 'text-orange-500 fill-orange-500' : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Your Comments</label>
                  <textarea
                    value={review.comment}
                    onChange={(e) => setReview({ ...review, comment: e.target.value })}
                    placeholder="Tell us what you think about our programs and teaching..."
                    rows={4}
                    className="w-full bg-white/50 border-2 border-white/60 rounded-[2rem] px-8 py-6 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-bold text-slate-700 shadow-inner resize-none"
                  />
                </div>

                <button
                  onClick={handleSubmitReview}
                  disabled={isSubmittingReview || !review.comment.trim()}
                  className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black shadow-2xl shadow-slate-900/20 hover:bg-slate-800 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isSubmittingReview ? <RefreshCw className="h-6 w-6 animate-spin" /> : <Send className="h-6 w-6" />}
                  Submit Review
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
