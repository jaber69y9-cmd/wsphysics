import { showAlert, showConfirm } from '../../utils/alert';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, MapPin, Calendar, BookOpen, Camera, Star, Send } from 'lucide-react';
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
          // Fetch batch info if batch_id exists
          let batchData = null;
          if (userData.batch_id) {
            const batchDoc = await getDoc(doc(db, 'batches', userData.batch_id.toString()));
            if (batchDoc.exists()) {
              batchData = batchDoc.data();
            }
          }
          setProfile({ user: { ...userData, id: user.id }, batch: batchData });
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

  if (!profile) return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-8 w-48 bg-slate-200 rounded-lg"></div>
        <div className="h-10 w-32 bg-slate-200 rounded-lg"></div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-200 h-32"></div>
        <div className="px-8 pb-8">
          <div className="relative -mt-16 mb-6">
            <div className="w-32 h-32 bg-white rounded-full p-1 shadow-lg inline-block">
              <div className="w-full h-full bg-slate-200 rounded-full"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="h-10 w-64 bg-slate-200 rounded-lg"></div>
              <div className="h-6 w-40 bg-slate-200 rounded-lg"></div>
              <div className="space-y-2">
                <div className="h-5 w-full bg-slate-100 rounded"></div>
                <div className="h-5 w-full bg-slate-100 rounded"></div>
                <div className="h-5 w-full bg-slate-100 rounded"></div>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 space-y-4">
              <div className="h-6 w-32 bg-slate-200 rounded"></div>
              <div className="space-y-3">
                <div className="h-4 w-full bg-slate-100 rounded"></div>
                <div className="h-4 w-full bg-slate-100 rounded"></div>
                <div className="h-4 w-full bg-slate-100 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
        <button onClick={() => isEditing ? handleUpdateProfile() : setIsEditing(true)} className="btn-primary bg-orange-600 hover:bg-orange-700">
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-orange-600 h-32"></div>
        <div className="px-8 pb-8">
          <div className="relative -mt-16 mb-6">
            <div className="w-32 h-32 bg-white rounded-full p-1 shadow-lg inline-block relative group">
              {profile.user.profile_pic ? (
                <img src={profile.user.profile_pic} alt="Profile" className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-200 rounded-full flex items-center justify-center text-4xl font-bold text-slate-400">
                  {profile.user.name.charAt(0)}
                </div>
              )}
              <label className="absolute bottom-0 right-0 bg-orange-600 text-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="h-4 w-4" />
                <input type="file" accept="image/*" className="hidden" onChange={handleUpdateProfilePic} />
              </label>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Full Name</label>
                    <input className="input-field" value={editData.name} onChange={(e) => setEditData({...editData, name: e.target.value})} placeholder="Name" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Phone Number</label>
                    <input className="input-field" value={editData.phone} onChange={(e) => setEditData({...editData, phone: e.target.value})} placeholder="Phone" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Guardian Phone</label>
                    <input className="input-field" value={editData.guardian_phone} onChange={(e) => setEditData({...editData, guardian_phone: e.target.value})} placeholder="Guardian Phone" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Address</label>
                    <input className="input-field" value={editData.address} onChange={(e) => setEditData({...editData, address: e.target.value})} placeholder="Address" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">School Name</label>
                    <input className="input-field" value={editData.school_name} onChange={(e) => setEditData({...editData, school_name: e.target.value})} placeholder="School Name" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">College Name</label>
                    <input className="input-field" value={editData.college_name} onChange={(e) => setEditData({...editData, college_name: e.target.value})} placeholder="College Name" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Current Class</label>
                    <input className="input-field" value={editData.current_class} onChange={(e) => setEditData({...editData, current_class: e.target.value})} placeholder="Current Class" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase ml-1">Gender</label>
                      <select className="input-field" value={editData.gender} onChange={(e) => setEditData({...editData, gender: e.target.value})}>
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase ml-1">Blood Group</label>
                      <select className="input-field" value={editData.blood_group} onChange={(e) => setEditData({...editData, blood_group: e.target.value})}>
                        <option value="">Select</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-3xl font-bold text-slate-900 mb-1">{profile.user.name}</h2>
                  <p className="text-slate-500 mb-6 font-mono font-bold">Student ID: <span className="text-orange-600">{profile.user.roll_number}</span></p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-slate-600">
                      <Mail className="h-5 w-5 text-orange-500" />
                      <span>{profile.user.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600">
                      <Phone className="h-5 w-5 text-orange-500" />
                      <span>{profile.user.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600">
                      <Phone className="h-5 w-5 text-orange-500" />
                      <span className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Guardian</span>
                        {profile.user.guardian_phone || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600">
                      <MapPin className="h-5 w-5 text-orange-500" />
                      <span>{profile.user.address || 'N/A'}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h3 className="font-bold text-lg mb-4 text-slate-800">Academic Info</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-slate-500 flex items-center gap-2"><BookOpen className="h-4 w-4" /> Batch</span>
                  <span className="font-medium text-slate-900">{profile.batch?.name || 'Not Assigned'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-slate-500 flex items-center gap-2"><Calendar className="h-4 w-4" /> Schedule</span>
                  <span className="font-medium text-slate-900">{profile.batch?.schedule || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Class</span>
                  <span className="font-medium text-slate-900">{profile.user.current_class || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-slate-500">School</span>
                  <span className="font-medium text-slate-900">{profile.user.school_name || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-slate-500">College</span>
                  <span className="font-medium text-slate-900">{profile.user.college_name || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Gender</span>
                  <span className="font-medium text-slate-900">{profile.user.gender || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Blood Group</span>
                  <span className="font-medium text-slate-900 text-red-600">{profile.user.blood_group || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Review Section */}
          <div className="mt-12 pt-12 border-t border-slate-100">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Star className="h-6 w-6 text-orange-500 fill-orange-500" />
                Share Your Experience
              </h3>
              <p className="text-slate-500 mb-8">Your feedback helps us improve and inspires other students.</p>

              {hasSubmittedReview ? (
                <div className="bg-orange-50 border border-orange-100 p-8 rounded-[2rem] text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="h-8 w-8 text-orange-600 fill-orange-600" />
                  </div>
                  <h4 className="text-lg font-bold text-orange-900 mb-2">Thank you for your review!</h4>
                  <p className="text-orange-700">Your feedback has been received and is currently being reviewed by our team.</p>
                </div>
              ) : (
                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                  <div className="flex flex-col items-center gap-4">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Rate your experience</span>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          onClick={() => setReview({ ...review, rating: num })}
                          className="p-1 transition-transform hover:scale-110 active:scale-95"
                        >
                          <Star
                            className={`h-10 w-10 ${
                              num <= review.rating
                                ? 'text-orange-500 fill-orange-500'
                                : 'text-slate-200'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Your Review</label>
                    <textarea
                      value={review.comment}
                      onChange={(e) => setReview({ ...review, comment: e.target.value })}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all min-h-[120px] text-slate-700"
                      placeholder="Tell us what you think about W'S Physics..."
                    />
                  </div>

                  <button
                    onClick={handleSubmitReview}
                    disabled={isSubmittingReview || !review.comment.trim()}
                    className="w-full btn-primary bg-orange-600 hover:bg-orange-700 py-4 rounded-2xl flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isSubmittingReview ? (
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="h-5 w-5" /> Submit Review
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
